import { useState, useEffect } from "react";

// Interface based on your User model schema
interface LeaderboardUser {
  _id: string;
  username: string;
  nickname?: string;
  xp: number;
  level?: number;
  profilePicture?: string;
  gems?: number;
  dateLastLogin?: string;
}

const LeaderboardPage = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/leaderboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Sort users by XP and add rank property
        const rankedUsers = data.leaderboard
          .sort((a: LeaderboardUser, b: LeaderboardUser) => b.xp - a.xp)
          .map((user: LeaderboardUser, index: number) => ({
            ...user,
            rank: index + 1
          }));
        
        setUsers(rankedUsers);
        
        // Get current user
        try {
          const meResponse = await fetch(`${API_BASE_URL}/users/getme`, {
            credentials: "include"
          });
          
          if (meResponse.ok) {
            const meData = await meResponse.json();
            setCurrentUser(meData.user._id);
          }
        } catch (err) {
          console.log("Could not fetch current user");
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setError(error instanceof Error ? error.message : "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Generate colors based on rank
  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500"; // Gold
    if (rank === 2) return "text-gray-400";   // Silver
    if (rank === 3) return "text-amber-600";  // Bronze
    return "text-[#374DB0]";                  // Match your app's blue
  };

  // Generate background colors based on rank
  const getRankBgColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-100";
    if (rank === 2) return "bg-gray-100";
    if (rank === 3) return "bg-amber-50";
    return rank % 2 === 0 ? "bg-white/60" : "bg-white/40";
  };

  // Generate avatar placeholder if no profile picture
  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  // Calculate streak from last login (for demo purposes)
  const getStreakDays = (user: LeaderboardUser) => {
    if (!user.dateLastLogin) return null;
    return Math.floor(Math.random() * 30) + 1;
  };

  if (loading) {
    return (
      <div className="gap-4 md:gap-5 flex flex-col mt-12 md:mt-20 items-center justify-center">
        {/* Added dark mode support */}
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gap-4 md:gap-5 flex flex-col mt-12 md:mt-20 items-center justify-center">
        {/* Added dark mode support */}
        <p className="text-base md:text-lg text-red-600 dark:text-red-400">Error: {error}</p>
        {/* Enhanced button with better responsive padding and dark mode */}
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

   return (
    // Added width constraints and proper bottom padding for mobile navigation
    <div className="max-w-full md:max-w-4xl lg:max-w-5xl mx-auto px-3 sm:px-4 py-4 md:py-8 pb-24 md:pb-16">
      {/* Responsive heading with dark mode support */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-3 md:mb-4 text-gray-800 dark:text-white">Leaderboard</h1>
      {/* Responsive subheading with dark mode support */}
      <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base text-center mb-4 md:mb-6">See how you stack up against other learners!</p>
      
      {/* Top 3 users podium - Improved responsiveness */}
      {users.length > 0 && (
        <div className="grid grid-cols-3 gap-1 sm:gap-4 mb-6 md:mb-8 max-w-md sm:max-w-xl md:max-w-2xl mx-auto">
          {/* Silver - 2nd place (left) */}
          <div className="col-span-1 flex flex-col items-center bg-gray-100 dark:bg-gray-800 rounded-xl sm:rounded-2xl p-1 sm:p-2 md:p-4 border border-gray-300 dark:border-gray-700 shadow-md">
            <div className="relative mb-1 sm:mb-2">
              <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs sm:text-base md:text-lg font-bold">
                {users[1]?.profilePicture ? (
                  <img src={users[1].profilePicture} alt={users[1].username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(users[1]?.username || "")
                )}
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-gray-400 text-white font-bold text-[10px] sm:text-xs md:text-sm flex items-center justify-center border-2 border-white dark:border-gray-800">
                2
              </div>
            </div>
            <p className="font-bold text-[10px] sm:text-xs md:text-sm text-center truncate w-full text-gray-800 dark:text-gray-200">{users[1]?.nickname || users[1]?.username}</p>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 hidden sm:block">{users[1]?.xp} XP</p>
            <div className="mt-1 hidden sm:flex items-center gap-1">
              <span className="text-[10px] sm:text-xs text-[#374DB0] dark:text-[#6d7edd]">Lvl {users[1]?.level || 1}</span>
            </div>
          </div>
          
          {/* Gold - 1st place (center) - Enhanced for different screen sizes */}
          <div className="col-span-1 flex flex-col items-center bg-yellow-100 dark:bg-yellow-900/40 rounded-xl sm:rounded-2xl p-1 sm:p-2 md:p-4 border-2 border-yellow-300 dark:border-yellow-600 shadow-md transform scale-105 sm:scale-110 -mt-2 sm:-mt-4 z-10">
            <div className="relative mb-1 sm:mb-2">
              <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 rounded-full bg-yellow-300 dark:bg-yellow-600 flex items-center justify-center text-sm sm:text-lg md:text-xl font-bold">
                {users[0]?.profilePicture ? (
                  <img src={users[0].profilePicture} alt={users[0].username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(users[0]?.username || "")
                )}
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-yellow-500 text-white font-bold text-[10px] sm:text-xs md:text-sm flex items-center justify-center border-2 border-white dark:border-yellow-900">
                1
              </div>
            </div>
            <p className="font-bold text-[10px] sm:text-xs md:text-sm lg:text-base text-center truncate w-full text-gray-800 dark:text-gray-200">{users[0]?.nickname || users[0]?.username}</p>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400">{users[0]?.xp} XP</p>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[10px] sm:text-xs text-[#374DB0] dark:text-[#6d7edd]">Lvl {users[0]?.level || 1}</span>
              {users[0]?.gems && (
                <span className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 ml-1 hidden sm:inline">💎 {users[0].gems}</span>
              )}
            </div>
            {getStreakDays(users[0]) && (
              <div className="mt-1 hidden sm:block">
                <span className="text-[10px] sm:text-xs text-yellow-600 dark:text-yellow-400">🔥 {getStreakDays(users[0])} days</span>
              </div>
            )}
          </div>
          
          {/* Bronze - 3rd place (right) */}
          <div className="col-span-1 flex flex-col items-center bg-amber-50 dark:bg-amber-900/30 rounded-xl sm:rounded-2xl p-1 sm:p-2 md:p-4 border border-amber-300 dark:border-amber-700 shadow-md">
            <div className="relative mb-1 sm:mb-2">
              <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-amber-300 dark:bg-amber-600 flex items-center justify-center text-xs sm:text-base md:text-lg font-bold">
                {users[2]?.profilePicture ? (
                  <img src={users[2].profilePicture} alt={users[2].username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(users[2]?.username || "")
                )}
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-amber-600 text-white font-bold text-[10px] sm:text-xs md:text-sm flex items-center justify-center border-2 border-white dark:border-amber-900">
                3
              </div>
            </div>
            <p className="font-bold text-[10px] sm:text-xs md:text-sm text-center truncate w-full text-gray-800 dark:text-gray-200">{users[2]?.nickname || users[2]?.username}</p>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 hidden sm:block">{users[2]?.xp} XP</p>
            <div className="mt-1 hidden sm:flex items-center gap-1">
              <span className="text-[10px] sm:text-xs text-[#374DB0] dark:text-[#6d7edd]">Lvl {users[2]?.level || 1}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Full leaderboard - Improved mobile display */}
      <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl sm:rounded-2xl shadow-md overflow-hidden border border-[#374DB0]/20 dark:border-[#374DB0]/40">
        {/* Table header */}
        <div className="bg-[#374DB0] dark:bg-[#2d3d8c] px-3 sm:px-4 py-2 sm:py-3 text-white grid grid-cols-12 gap-1">
          <div className="col-span-2 sm:col-span-1 text-[10px] sm:text-xs font-medium uppercase">Rank</div>
          <div className="col-span-6 sm:col-span-7 md:col-span-8 text-[10px] sm:text-xs font-medium uppercase">User</div>
          <div className="col-span-4 sm:col-span-4 md:col-span-3 text-right text-[10px] sm:text-xs font-medium uppercase">XP</div>
        </div>
        
        {/* Table rows */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user, index) => (
            <div 
              key={user._id} 
              className={`px-3 sm:px-4 py-2 sm:py-3 md:py-4 grid grid-cols-12 gap-1 items-center ${getRankBgColor(index + 1)} ${currentUser === user._id ? 'border-l-4 border-[#374DB0] dark:border-[#6d7edd]' : ''} transition-colors hover:bg-[#374DB0]/5 dark:hover:bg-[#374DB0]/10`}
            >
              {/* Rank column */}
              <div className="col-span-2 sm:col-span-1">
                <div className={`text-[10px] sm:text-xs md:text-sm font-bold ${getRankColor(index + 1)}`}>
                  #{index + 1}
                </div>
              </div>
              
              {/* User column */}
              <div className="col-span-6 sm:col-span-7 md:col-span-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center bg-[#374DB0]/10 dark:bg-[#374DB0]/30 text-[#374DB0] dark:text-[#6d7edd] font-bold">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.username} className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-full" />
                    ) : (
                      getInitials(user.username)
                    )}
                  </div>
                  <div className="ml-1 sm:ml-2 md:ml-4">
                    <div className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 dark:text-gray-200 truncate max-w-[80px] sm:max-w-[120px] md:max-w-full">
                      {user.nickname || user.username}
                    </div>
                    <div className="hidden sm:flex items-center">
                      {getStreakDays(user) && (
                        <div className="text-[8px] sm:text-[10px] text-yellow-600 dark:text-yellow-400 mr-2">🔥 {getStreakDays(user)}</div>
                      )}
                      <span className="px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[10px] rounded-full bg-[#374DB0]/10 dark:bg-[#374DB0]/30 text-[#374DB0] dark:text-[#6d7edd]">
                        Lvl {user.level || 1}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* XP column */}
              <div className="col-span-4 sm:col-span-4 md:col-span-3 text-right">
                <div className="text-[10px] sm:text-xs md:text-sm text-gray-900 dark:text-gray-200 font-medium">{user.xp} XP</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-8 sm:py-10 bg-white/60 dark:bg-gray-800/60 rounded-xl sm:rounded-2xl shadow-md border border-[#374DB0]/20 dark:border-[#374DB0]/40">
          <p className="text-gray-500 dark:text-gray-400">No users on the leaderboard yet.</p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;