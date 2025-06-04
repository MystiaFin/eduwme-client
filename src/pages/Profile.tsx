import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import { useAuth } from "../AuthContext";
import AvatarPlaceholder from "../assets/avatar_placeholder.jpg";

interface UserProfile {
  _id: string;
  username: string;
  nickname: string;
  biodata: string;
  xp: number;
  level: number;
  profilePicture?: string;
}

const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedNickname, setEditedNickname] = useState<string>("");
  const [editedBiodata, setEditedBiodata] = useState<string>("");
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { user } = useAuth();
  
  // State for profile picture
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = 
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Check if the current user is viewing their own profile
  const isOwnProfile = user && userId === user._id;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError("User ID is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/users/getprofile/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          },
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Network response was not ok" }));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`,
          );
        }

        const data = await response.json();

        if (data && data.user) {
          setUserProfile(data.user);
          // Initialize edit fields with current values
          setEditedNickname(data.user.nickname || "");
          setEditedBiodata(data.user.biodata || "");
          
          // Set preview image if user has profile picture
          if (data.user.profilePicture) {
            setPreviewImage(data.user.profilePicture);
          }
        } else {
          throw new Error("User data not found in API response.");
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred.",
        );
        setUserProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, API_BASE_URL]);

  // Add cleanup for object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup function to revoke any object URLs when component unmounts
      if (previewImage && previewImage.startsWith('blob:') && userProfile?.profilePicture !== previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage, userProfile]);

  const handleEditToggle = () => {
    if (isEditing) {
      // If canceling edit, reset form values
      setEditedNickname(userProfile?.nickname || "");
      setEditedBiodata(userProfile?.biodata || "");
      
      // Revoke previous object URL if it exists to prevent memory leaks
      if (previewImage && previewImage.startsWith('blob:') && userProfile?.profilePicture !== previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      
      // Reset image selection if canceled
      if (userProfile?.profilePicture) {
        setPreviewImage(userProfile.profilePicture);
      } else {
        setPreviewImage(null);
      }
      setBase64Image(null);
      
      // Reset the file input value
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      setUpdateError(null);
    }
    setIsEditing(!isEditing);
    setUpdateSuccess(false);
  };

  // Convert image file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Function to compress images before uploading
  const compressImage = (file: File, maxWidth = 800, quality = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas to Blob conversion failed'));
              }
            },
            file.type,
            quality
          );
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    });
  };

  // Convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

    // Updated handleImageChange function
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setUpdateError("Please select a valid image file (JPEG, PNG, GIF, WEBP)");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      
      // Validate file size (5MB max before compression)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setUpdateError("Image size should be less than 5MB");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      
      try {
        // Show processing message
        setUpdateError("Processing image, please wait...");
        
        // Revoke previous object URL if it exists
        if (previewImage && previewImage.startsWith('blob:')) {
          URL.revokeObjectURL(previewImage);
        }
        
        // Create a preview URL (this is just for display)
        const previewURL = URL.createObjectURL(file);
        setPreviewImage(previewURL);
        
        // Use more aggressive compression for larger images
        let quality = 0.8;
        let maxWidth = 800;
        
        if (file.size > 1 * 1024 * 1024) { // > 1MB
          quality = 0.6;
          maxWidth = 600;
        }
        
        if (file.size > 3 * 1024 * 1024) { // > 3MB
          quality = 0.4;
          maxWidth = 400;
        }
        
        // Compress the image before converting to base64
        const compressedBlob = await compressImage(file, maxWidth, quality);
        console.log(`Original size: ${file.size / 1024}KB, Compressed size: ${compressedBlob.size / 1024}KB`);
        
        // Convert compressed image to base64 for sending to the server
        const base64 = await blobToBase64(compressedBlob);
        
        // Ensure the base64 string is not too large (3MB max)
        if (base64.length > 3 * 1024 * 1024) {
          throw new Error("Image is still too large after compression. Please select a smaller image.");
        }
        
        setBase64Image(base64);
        
        // Clear any previous errors
        setUpdateError(null);
      } catch (err) {
        console.error("Error processing image:", err);
        setUpdateError(
          err instanceof Error ? err.message : "Failed to process the image. Please try another one."
        );
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  // Trigger file input click
  const handleImageClick = () => {
    if (isEditing && isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

    // Updated handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !isOwnProfile) return;

    setIsSaving(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      // Check if base64Image is too large (3MB max in base64)
      if (base64Image && base64Image.length > 3 * 1024 * 1024) {
        throw new Error("Image is too large. Please select a smaller image.");
      }
      
      // Prepare update data without image first
      const updateData = {
        userId: userProfile._id,
        nickname: editedNickname,
        biodata: editedBiodata,
      };
      
      // If we have an image, add it separately (to help with debugging)
      const dataWithImage = base64Image 
        ? { ...updateData, profilePicture: base64Image }
        : updateData;

      // Log the data size being sent
      if (base64Image) {
        console.log(`Sending image data of size: ${Math.round(base64Image.length / 1024)}KB`);
      }

      const response = await fetch(`${API_BASE_URL}/users/updateProfile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(dataWithImage),
      });

      // Try to parse the response, but handle it gracefully if it fails
      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (error) {
        console.error("Failed to parse response:", error);
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}. The image may be too large.`);
        }
      }
      
      if (!response.ok) {
        throw new Error(
          (data && (data.error || data.message)) || 
          `Server error: ${response.status}. The image may be too large or in an invalid format.`
        );
      }
      
      // If we're here, the update was successful
      // Update the profile in state with the new data
      setUserProfile({
        ...userProfile,
        nickname: editedNickname,
        biodata: editedBiodata,
        // Only update profile picture if we actually changed it
        ...(base64Image && previewImage ? { profilePicture: previewImage } : {})
      });
      
      setUpdateSuccess(true);
      setIsEditing(false);
      
      // Reset file input after successful submission
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      setUpdateError(
        err instanceof Error ? err.message : "Failed to update profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

   // Loading state with responsive styling and dark mode support
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300">Loading profile...</p>
      </div>
    );
  }

  // Error state with responsive styling and dark mode support
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] p-4">
        <p className="text-lg sm:text-xl text-red-600 dark:text-red-400">Error loading profile:</p>
        <p className="text-sm sm:text-md text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/20 p-3 rounded-md mt-2 max-w-md">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Not found state with responsive styling and dark mode support
  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300">User profile not found.</p>
      </div>
    );
  }

  return (
    // Container with width constraints and proper spacing for mobile navigation
    <div className="max-w-full sm:max-w-xl md:max-w-2xl mx-auto px-4 py-6 md:py-8 pb-24 md:pb-16 shadow-md md:shadow-lg rounded-lg mt-4 sm:mt-6 md:mt-10 dark:bg-gray-800/40">
      {/* Success message with responsive text and dark mode */}
      {updateSuccess && (
        <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md text-center text-sm sm:text-base">
          Profile updated successfully!
        </div>
      )}
      
      {/* Error message with responsive text and dark mode */}
      {updateError && (
        <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-center text-sm sm:text-base">
          Error: {updateError}
        </div>
      )}
      
      {/* Header section with responsive layout and dark mode */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
          Profile
        </h1>
        
        {/* Edit button with responsive text and dark mode */}
        {isOwnProfile && (
          <button
            onClick={handleEditToggle}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md transition-colors text-sm sm:text-base ${
              isEditing 
                ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600" 
                : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            }`}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        )}
      </div>
      
      {/* Profile image section with responsive sizing */}
      <div className="flex flex-col items-center mb-5 sm:mb-6 md:mb-8">
        {/* Hidden file input */}
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
        
        {/* Profile image with responsive size and dark mode border */}
        <div 
          className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-2 sm:mb-3 md:mb-4 ${isEditing && isOwnProfile ? 'cursor-pointer' : ''}`}
          onClick={handleImageClick}
        >
          <img
            src={previewImage || userProfile.profilePicture || AvatarPlaceholder}
            alt="User Avatar"
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
          />
          
          {/* Overlay with camera icon when editing */}
          {isEditing && isOwnProfile && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full">
              <span className="text-white text-xl sm:text-2xl md:text-3xl">📷</span>
            </div>
          )}
        </div>
        
        {/* Image upload button with responsive text */}
        {isEditing && isOwnProfile && (
          <button
            type="button"
            onClick={handleImageClick}
            className="mb-2 sm:mb-3 md:mb-4 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs sm:text-sm"
          >
            Change Profile Picture
          </button>
        )}
        
        {/* Username with responsive text and dark mode */}
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white">
          {userProfile.username}
        </h2>
      </div>
      
      {isEditing ? (
        /* Edit Form - Responsive and dark mode */
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-1 sm:space-y-2">
            <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">Nickname</label>
            <input
              type="text"
              value={editedNickname}
              onChange={(e) => setEditedNickname(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
              placeholder="Enter a nickname"
            />
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">Bio</label>
            <textarea
              value={editedBiodata}
              onChange={(e) => setEditedBiodata(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] sm:min-h-[120px] dark:bg-gray-700 dark:text-white text-sm sm:text-base"
              placeholder="Tell us about yourself"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className={`px-4 sm:px-6 py-1.5 sm:py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm sm:text-base ${
                isSaving ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        /* Display Profile Info - Responsive and dark mode */
        <div className="space-y-3 sm:space-y-4">
          <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md shadow-sm">
            <strong className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Nickname:</strong>
            <p className="text-gray-800 dark:text-gray-200 text-base sm:text-lg">
              {userProfile.nickname || "No nickname set"}
            </p>
          </div>
          
          <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md shadow-sm">
            <strong className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Bio:</strong>
            <p className="text-gray-800 dark:text-gray-200 text-base sm:text-lg whitespace-pre-wrap">
              {userProfile.biodata || "No bio provided."}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md shadow-sm text-center">
              <strong className="text-blue-600 dark:text-blue-400 block text-xs sm:text-sm">XP</strong>
              <p className="text-blue-800 dark:text-blue-300 text-xl sm:text-2xl font-semibold">
                {userProfile.xp}
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-md shadow-sm text-center">
              <strong className="text-green-600 dark:text-green-400 block text-xs sm:text-sm">Level</strong>
              <p className="text-green-800 dark:text-green-300 text-xl sm:text-2xl font-semibold">
                {userProfile.level}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;