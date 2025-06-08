import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

// Define types for shop items and inventory
interface ShopItem {
  itemId: string;
  name: string;
  description: string;
  imageUrl?: string;
  price: number;
  category: "avatar" | "background" | "badge" | "theme" | "powerup";
  isAvailable: boolean;
}

interface InventoryItem {
  itemId: string;
  dateAcquired: Date;
  isEquipped: boolean;
  details: ShopItem;
}

// Define types for API responses
interface ShopItemsResponse {
  message: string;
  shopItems: ShopItem[];
}

interface InventoryResponse {
  message: string;
  inventory: InventoryItem[];
}

interface PurchaseResponse {
  message: string;
  item: ShopItem;
  remainingGems: number;
}

// Tab options for the shop
type ShopTab = "shop" | "inventory";

const Shop = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ShopTab>("shop");
  const [purchaseStatus, setPurchaseStatus] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Fetch shop items and user inventory
  useEffect(() => {
    const fetchShopData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch shop items
        const shopResponse = await fetch(`${API_BASE_URL}/shop/getShopItems`, {
          credentials: "include"
        });
        
        if (!shopResponse.ok) {
          throw new Error(`Failed to fetch shop items: ${shopResponse.status}`);
        }
        
        const shopData: ShopItemsResponse = await shopResponse.json();
        setShopItems(shopData.shopItems);
        
        // Fetch user inventory if user is logged in
        if (user?._id) {
          const inventoryResponse = await fetch(
            `${API_BASE_URL}/shop/userInventory/${user._id}`,
            { credentials: "include" }
          );
          
          if (inventoryResponse.ok) {
            const inventoryData: InventoryResponse = await inventoryResponse.json();
            setInventory(inventoryData.inventory || []);
          } else {
            console.warn("Could not fetch user inventory", await inventoryResponse.text());
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load shop data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchShopData();
  }, [user]);

  // Handle purchase of an item
  const handlePurchase = async (itemId: string) => {
    if (!user?._id) {
      setPurchaseStatus({
        status: "error",
        message: "You need to be logged in to make purchases"
      });
      return;
    }
    
    // Check if user already owns this item
    const alreadyOwns = inventory.some(item => item.itemId === itemId);
    if (alreadyOwns) {
      setPurchaseStatus({
        status: "error",
        message: "You already own this item"
      });
      return;
    }
    
    // Check if user has enough gems
    const item = shopItems.find(item => item.itemId === itemId);
    if (!item) {
      setPurchaseStatus({
        status: "error",
        message: "Item not found"
      });
      return;
    }
    
    if ((user.gems || 0) < item.price) {
      setPurchaseStatus({
        status: "error",
        message: "Not enough gems to purchase this item"
      });
      return;
    }
    
    // Proceed with purchase
    setPurchaseStatus({ status: "loading", message: "Processing purchase..." });
    
    try {
      const purchaseResponse = await fetch(`${API_BASE_URL}/shop/purchaseItem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: user._id,
          itemId: itemId
        })
      });
      
      if (!purchaseResponse.ok) {
        const errorData = await purchaseResponse.json();
        throw new Error(errorData.message || "Purchase failed");
      }
      
      const purchaseData: PurchaseResponse = await purchaseResponse.json();
      
      // Update user's gems
      if (setUser && user) {
        setUser({ ...user, gems: purchaseData.remainingGems });
      }
      
      // Update inventory
      setInventory(prev => [
        ...prev,
        {
          itemId: purchaseData.item.itemId,
          dateAcquired: new Date(),
          isEquipped: false,
          details: purchaseData.item
        }
      ]);
      
      setPurchaseStatus({
        status: "success",
        message: purchaseData.message
      });
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setPurchaseStatus({ status: "idle", message: "" });
      }, 3000);
      
    } catch (err) {
      setPurchaseStatus({
        status: "error",
        message: err instanceof Error ? err.message : "Purchase failed"
      });
      
      // Reset error status after 3 seconds
      setTimeout(() => {
        setPurchaseStatus({ status: "idle", message: "" });
      }, 3000);
    }
  };

  // Handle equipping/unequipping items
  const handleEquipToggle = async (itemId: string, currentlyEquipped: boolean) => {
    if (!user?._id) return;
    
    try {
      const equipResponse = await fetch(`${API_BASE_URL}/shop/equipItem`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: user._id,
          itemId: itemId,
          equip: !currentlyEquipped
        })
      });
      
      if (!equipResponse.ok) {
        const errorData = await equipResponse.json();
        throw new Error(errorData.message || "Failed to update item");
      }
      
      // Update inventory to reflect changes
      setInventory(prev => {
        // Get the category of the item being equipped
        const itemToToggle = prev.find(item => item.itemId === itemId);
        if (!itemToToggle) return prev;
        
        const category = itemToToggle.details.category;
        
        return prev.map(item => {
          // If this is the item being toggled, update its equipped state
          if (item.itemId === itemId) {
            return { ...item, isEquipped: !currentlyEquipped };
          }
          
          // If equipping an item, unequip other items of the same category
          if (!currentlyEquipped && 
              item.details.category === category && 
              item.isEquipped && 
              item.itemId !== itemId) {
            return { ...item, isEquipped: false };
          }
          
          return item;
        });
      });
      
    } catch (err) {
      console.error("Failed to equip/unequip item:", err);
    }
  };
  
  // Group shop items by category
  const shopItemsByCategory = shopItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShopItem[]>);
  
  // Group inventory items by category
  const inventoryByCategory = inventory.reduce((acc, item) => {
    const category = item.details.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Loading shop items...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-3 sm:px-4">
        <p className="text-sm sm:text-base text-red-600 dark:text-red-400 mb-3 sm:mb-4">Error: {error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-2 py-1 sm:px-3 sm:py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-full md:max-w-5xl lg:max-w-6xl mx-auto px-2 sm:px-3 py-2 sm:py-4 pb-20 sm:pb-16">
      {/* Header section */}
      <div className="flex justify-between items-center gap-2 mb-3 sm:mb-5">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Shop</h1>
        
        {/* User gems badge */}
        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full flex items-center shadow text-xs sm:text-sm">
          <span className="mr-1 text-sm sm:text-base">💎</span>
          <span className="font-semibold">{user?.gems || 0}</span>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-3 sm:mb-4">
        <button
          onClick={() => setActiveTab("shop")}
          className={`py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium border-b-2 ${
            activeTab === "shop"
              ? "border-[#374DB0] dark:border-[#5a6fd1] text-[#374DB0] dark:text-[#5a6fd1]"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Shop
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium border-b-2 ${
            activeTab === "inventory"
              ? "border-[#374DB0] dark:border-[#5a6fd1] text-[#374DB0] dark:text-[#5a6fd1]"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          My Items
        </button>
      </div>

      {/* Purchase status message */}
      {purchaseStatus.status !== "idle" && (
        <div 
          className={`mb-3 p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
            purchaseStatus.status === "success" 
              ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300" 
              : purchaseStatus.status === "error"
              ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
              : "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
          }`}
        >
          {purchaseStatus.message}
        </div>
      )}

      {/* Shop tab content */}
      {activeTab === "shop" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Organize shop items by category */}
          {["background", "badge", "avatar", "theme", "powerup"].map(category => {
            const categoryItems = shopItemsByCategory[category] || [];
            const categoryLabel = category === "background" ? "Banners" : 
                                  category.charAt(0).toUpperCase() + category.slice(1) + "s";
            
            return (
              <div key={category} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-2 sm:p-3">
                <h2 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-white capitalize mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">
                  {categoryLabel}
                </h2>
                
                {categoryItems.length === 0 ? (
                  <div className="bg-yellow-50 dark:bg-yellow-800/20 rounded-md p-3 text-center">
                    <p className="text-yellow-700 dark:text-yellow-300 text-xs sm:text-sm">
                      No {category} items available yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                    {categoryItems.map(item => {
                      const isOwned = inventory.some(i => i.itemId === item.itemId);
                      
                      return (
                        <div 
                          key={item.itemId}
                          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col"
                        >
                          {/* Item image */}
                          <div className="h-20 sm:h-28 bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-2 sm:p-3">
                            {item.imageUrl ? (
                              <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                className="max-h-full max-w-full object-contain" 
                              />
                            ) : (
                              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#374DB0]/20 dark:bg-[#5a6fd1]/20 flex items-center justify-center text-xl sm:text-2xl">
                                {item.category === "avatar" && "👤"}
                                {item.category === "background" && "🏞️"}
                                {item.category === "badge" && "🏅"}
                                {item.category === "theme" && "🎨"}
                                {item.category === "powerup" && "⚡"}
                              </div>
                            )}
                          </div>
                          
                          {/* Item details */}
                          <div className="p-2 sm:p-3 flex-grow">
                            <h3 className="font-medium text-xs sm:text-sm text-gray-800 dark:text-white line-clamp-1 mb-1">{item.name}</h3>
                            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-1 sm:mb-2 line-clamp-2">{item.description}</p>
                          </div>
                          
                          {/* Price and purchase button */}
                          <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                            <div className="flex items-center">
                              <span className="text-sm sm:text-base mr-1">💎</span>
                              <span className="font-medium text-xs sm:text-sm text-gray-800 dark:text-white">{item.price}</span>
                            </div>
                            
                            <button
                              onClick={() => !isOwned && handlePurchase(item.itemId)}
                              disabled={isOwned || (user?.gems || 0) < item.price || purchaseStatus.status === "loading"}
                              className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-medium rounded-md ${
                                isOwned 
                                  ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 cursor-default"
                                  : (user?.gems || 0) < item.price
                                  ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                  : "bg-[#374DB0] dark:bg-[#5a6fd1] text-white hover:bg-[#293a8c] dark:hover:bg-[#4a5eb3] transition-colors"
                              }`}
                            >
                              {isOwned ? "Owned" : (user?.gems || 0) < item.price ? "Not enough" : "Buy"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Inventory tab content */}
      {activeTab === "inventory" && (
        <div>
          {/* No items message */}
          {inventory.length === 0 ? (
            <div className="bg-blue-50 dark:bg-blue-800/20 rounded-md p-3 text-center">
              <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm mb-2 sm:mb-3">
                You don't have any items yet.
              </p>
              <button
                onClick={() => setActiveTab("shop")}
                className="px-2 py-0.5 sm:px-3 sm:py-1 bg-[#374DB0] dark:bg-[#5a6fd1] text-white rounded-md hover:bg-[#293a8c] dark:hover:bg-[#4a5eb3] transition-colors text-xs sm:text-sm"
              >
                Go to Shop
              </button>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {Object.entries(inventoryByCategory).map(([category, items]) => (
                <div key={category} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-2 sm:p-3">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-white capitalize mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">
                    {category === "background" ? "Banners" : 
                     category.charAt(0).toUpperCase() + category.slice(1) + "s"}
                  </h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {items.map(item => (
                      <div 
                        key={item.itemId}
                        className={`p-2 rounded-md border ${
                          item.isEquipped 
                            ? "border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20" 
                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        }`}
                      >
                        {/* Item header with equip status */}
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium text-xs text-gray-800 dark:text-white line-clamp-1">{item.details.name}</h3>
                          {item.isEquipped && (
                            <span className="text-green-500 dark:text-green-400 text-sm sm:text-base">✓</span>
                          )}
                        </div>
                        
                        {/* Item image */}
                        <div className="h-14 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center mb-1 sm:mb-2">
                          {item.details.imageUrl ? (
                            <img 
                              src={item.details.imageUrl} 
                              alt={item.details.name} 
                              className="max-h-full max-w-full object-contain" 
                            />
                          ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#374DB0]/20 dark:bg-[#5a6fd1]/20 flex items-center justify-center text-lg sm:text-xl">
                              {item.details.category === "background" && "🏞️"}
                              {item.details.category === "badge" && "🏅"}
                              {item.details.category === "theme" && "🎨"}
                              {item.details.category === "powerup" && "⚡"}
                              {item.details.category === "avatar" && "👤"}
                            </div>
                          )}
                        </div>
                        
                        {/* Item description */}
                        <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2 line-clamp-2">{item.details.description}</p>
                        
                        {/* Equip/unequip button */}
                        <button
                          onClick={() => handleEquipToggle(item.itemId, item.isEquipped)}
                          className={`w-full px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-medium rounded-md ${
                            item.isEquipped 
                              ? "bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-700"
                              : "bg-[#374DB0] dark:bg-[#5a6fd1] text-white hover:bg-[#293a8c] dark:hover:bg-[#4a5eb3]"
                          } transition-colors`}
                        >
                          {item.isEquipped ? "Unequip" : "Equip"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Shop;