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
    <div className="max-w-full md:max-w-4xl lg:max-w-5xl mx-auto px-3 sm:px-4 py-4 md:py-8 pb-24 md:pb-16">
      {/* Heading with dark mode outline */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-3 md:mb-4 text-gray-800 dark:text-gray-100 dark:text-outline">Leaderboard</h1>
      {/* Subheading with dark mode outline */}
      <p className="text-gray-600 dark:text-gray-300 dark:text-outline text-sm md:text-base text-center mb-4 md:mb-6">See how you stack up against other learners!</p>
      
      {/* Top 3 users podium */}
      {users.length > 0 && (
        <div className="grid grid-cols-3 gap-1 sm:gap-4 mb-6 md:mb-8 max-w-md sm:max-w-xl md:max-w-2xl mx-auto">
          {/* Silver - 2nd place (left) */}
          <div className="col-span-1 flex flex-col items-center bg-gray-100 dark:bg-gray-800 rounded-xl sm:rounded-2xl p-1 sm:p-2 md:p-4 border border-gray-300 dark:border-gray-700 shadow-md">
            {/* ...existing image code... */}
            <p className="font-bold text-[10px] sm:text-xs md:text-sm text-center truncate w-full text-gray-800 dark:text-gray-100 dark:text-outline">
              {users[1]?.nickname || users[1]?.username || ""}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-200 dark:text-outline">
              {users[1]?.xp || 0} XP
            </p>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[10px] sm:text-xs text-[#374DB0] dark:text-[#8e9ce7] dark:text-outline">
                Lvl {users[1]?.level || 1}
              </span>
            </div>
          </div>
          
          {/* Gold - 1st place (center) */}
          <div className="col-span-1 flex flex-col items-center bg-yellow-100 dark:bg-yellow-900/40 rounded-xl sm:rounded-2xl p-1 sm:p-2 md:p-4 border-2 border-yellow-300 dark:border-yellow-600 shadow-md transform scale-105 sm:scale-110 -mt-2 sm:-mt-4 z-10">
            {/* ...existing image code... */}
            <p className="font-bold text-[10px] sm:text-xs md:text-sm lg:text-base text-center truncate w-full text-gray-800 dark:text-gray-100 dark:text-outline">
              {users[0]?.nickname || users[0]?.username || ""}
            </p>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-200 dark:text-outline">
              {users[0]?.xp || 0} XP
            </p>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[10px] sm:text-xs text-[#374DB0] dark:text-[#8e9ce7] dark:text-outline">
                Lvl {users[0]?.level || 1}
              </span>
            </div>
          </div>
          
          {/* Bronze - 3rd place (right) */}
          <div className="col-span-1 flex flex-col items-center bg-amber-50 dark:bg-amber-900/30 rounded-xl sm:rounded-2xl p-1 sm:p-2 md:p-4 border border-amber-300 dark:border-amber-700 shadow-md">
            {/* ...existing image code... */}
            <p className="font-bold text-[10px] sm:text-xs md:text-sm text-center truncate w-full text-gray-800 dark:text-gray-100 dark:text-outline">
              {users[2]?.nickname || users[2]?.username || ""}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-200 dark:text-outline">
              {users[2]?.xp || 0} XP
            </p>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[10px] sm:text-xs text-[#374DB0] dark:text-[#8e9ce7] dark:text-outline">
                Lvl {users[2]?.level || 1}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Full leaderboard table */}
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl sm:rounded-2xl shadow-md overflow-hidden border border-[#374DB0]/20 dark:border-[#374DB0]/40">
          {/* Table header - Changed to purple text in dark mode */}
          <div className="bg-[#374DB0] dark:bg-[#2d3d8c] px-3 sm:px-4 py-2 sm:py-3 text-white grid grid-cols-12 gap-1">
            <div className="col-span-2 sm:col-span-1 text-[10px] sm:text-xs font-medium uppercase dark:text-purple-600">Rank</div>
            <div className="col-span-6 sm:col-span-7 md:col-span-8 text-[10px] sm:text-xs font-medium uppercase dark:text-purple-600">User</div>
            <div className="col-span-4 sm:col-span-4 md:col-span-3 text-right text-[10px] sm:text-xs font-medium uppercase dark:text-purple-600">XP</div>
          </div>
          
          {/* Table rows */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user, index) => (
              <div 
                key={user._id} 
                className={`px-3 sm:px-4 py-2 sm:py-3 md:py-4 grid grid-cols-12 gap-1 items-center ${getRankBgColor(index + 1)} ${currentUser === user._id ? 'border-l-4 border-[#374DB0] dark:border-purple-500' : ''} transition-colors hover:bg-[#374DB0]/5 dark:hover:bg-purple-900/10`}
              >
                {/* Rank column - Purple text in dark mode */}
                <div className="col-span-2 sm:col-span-1">
                  <div className={`text-[10px] sm:text-xs md:text-sm font-bold ${getRankColor(index + 1)} dark:text-purple-600`}>
                    #{index + 1}
                  </div>
                </div>
                
                {/* User column */}
                <div className="col-span-6 sm:col-span-7 md:col-span-8">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center bg-[#374DB0]/10 dark:bg-purple-900/30 text-[#374DB0] dark:text-purple-800 font-bold">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.username} className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-full" />
                      ) : (
                        getInitials(user.username)
                      )}
                    </div>
                    <div className="ml-1 sm:ml-2 md:ml-4">
                      {/* Username - Purple text in dark mode */}
                      <div className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 dark:text-purple-200 truncate max-w-[80px] sm:max-w-[120px] md:max-w-full">
                        {user.nickname || user.username}
                      </div>
                      <div className="hidden sm:flex items-center">
                        {getStreakDays(user) && (
                          <div className="text-[8px] sm:text-[10px] text-yellow-600 dark:text-yellow-300 mr-2">🔥 {getStreakDays(user)}</div>
                        )}
                        {/* Level badge - Purple in dark mode */}
                        <span className="px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[10px] rounded-full bg-[#374DB0]/10 dark:bg-purple-900/30 text-[#374DB0] dark:text-purple-800">
                          Lvl {user.level || 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* XP column - Purple text in dark mode */}
                <div className="col-span-4 sm:col-span-4 md:col-span-3 text-right">
                  <div className="text-[10px] sm:text-xs md:text-sm text-gray-900 dark:text-purple-200 font-medium">{user.xp} XP</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {users.length === 0 && (
          <div className="text-center py-8 sm:py-10 bg-white/60 dark:bg-gray-800/60 rounded-xl sm:rounded-2xl shadow-md border border-[#374DB0]/20 dark:border-[#374DB0]/40">
            <p className="text-gray-500 dark:text-purple-200">No users on the leaderboard yet.</p>
          </div>
        )}
    </div>
  );
};



export default LeaderboardPage;