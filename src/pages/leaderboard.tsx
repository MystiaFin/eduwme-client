import { useState, useEffect } from "react";
import ExitButton from "../components/exitbutton";

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
      <div className="gap-5 flex flex-col mt-20 items-center justify-center">
        <p className="text-lg text-gray-600">Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gap-5 flex flex-col mt-20 items-center justify-center">
        <p className="text-lg text-red-600">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-20 md:pb-10">
      <h1 className="text-2xl font-bold text-center mb-4 md:mb-8">Leaderboard</h1>
      <p className="text-gray-600 text-sm md:text-base text-center mb-6 md:mb-8">See how you stack up against other learners!</p>
      
      {/* Top 3 users podium - Responsive just like home grid */}
      {users.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8 max-w-2xl mx-auto">
          {/* Silver - 2nd place (left) */}
          <div className="col-span-1 flex flex-col items-center bg-gray-100 rounded-2xl p-2 sm:p-4 border border-gray-300 shadow-md">
            <div className="relative mb-1 sm:mb-2">
              <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gray-300 flex items-center justify-center text-base sm:text-lg font-bold">
                {users[1]?.profilePicture ? (
                  <img src={users[1].profilePicture} alt={users[1].username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(users[1]?.username || "")
                )}
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gray-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center border-2 border-white">
                2
              </div>
            </div>
            <p className="font-bold text-xs sm:text-sm text-center truncate w-full">{users[1]?.nickname || users[1]?.username}</p>
            <p className="text-xs text-gray-600 hidden sm:block">{users[1]?.xp} XP</p>
            <div className="mt-1 hidden sm:flex items-center gap-1">
              <span className="text-xs text-[#374DB0]">Lvl {users[1]?.level || 1}</span>
            </div>
          </div>
          
          {/* Gold - 1st place (center) */}
          <div className="col-span-1 flex flex-col items-center bg-yellow-100 rounded-2xl p-2 sm:p-4 border-2 border-yellow-300 shadow-md transform scale-110 -mt-4 z-10">
            <div className="relative mb-1 sm:mb-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-yellow-300 flex items-center justify-center text-lg sm:text-xl font-bold">
                {users[0]?.profilePicture ? (
                  <img src={users[0].profilePicture} alt={users[0].username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(users[0]?.username || "")
                )}
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-yellow-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center border-2 border-white">
                1
              </div>
            </div>
            <p className="font-bold text-xs sm:text-sm md:text-base text-center truncate w-full">{users[0]?.nickname || users[0]?.username}</p>
            <p className="text-xs sm:text-sm text-gray-600">{users[0]?.xp} XP</p>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-xs text-[#374DB0]">Lvl {users[0]?.level || 1}</span>
              {users[0]?.gems && (
                <span className="text-xs text-green-600 ml-1 hidden sm:inline">💎 {users[0].gems}</span>
              )}
            </div>
            {getStreakDays(users[0]) && (
              <div className="mt-1 hidden sm:block">
                <span className="text-xs text-yellow-600">🔥 {getStreakDays(users[0])} days</span>
              </div>
            )}
          </div>
          
          {/* Bronze - 3rd place (right) */}
          <div className="col-span-1 flex flex-col items-center bg-amber-50 rounded-2xl p-2 sm:p-4 border border-amber-300 shadow-md">
            <div className="relative mb-1 sm:mb-2">
              <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-amber-300 flex items-center justify-center text-base sm:text-lg font-bold">
                {users[2]?.profilePicture ? (
                  <img src={users[2].profilePicture} alt={users[2].username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(users[2]?.username || "")
                )}
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-amber-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center border-2 border-white">
                3
              </div>
            </div>
            <p className="font-bold text-xs sm:text-sm text-center truncate w-full">{users[2]?.nickname || users[2]?.username}</p>
            <p className="text-xs text-gray-600 hidden sm:block">{users[2]?.xp} XP</p>
            <div className="mt-1 hidden sm:flex items-center gap-1">
              <span className="text-xs text-[#374DB0]">Lvl {users[2]?.level || 1}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Full leaderboard - Responsive table that becomes a list on mobile */}
      <div className="bg-white/60 rounded-2xl shadow-md overflow-hidden border-2 border-[#374DB0]/20">
        {/* Table header - Always visible */}
        <div className="bg-[#374DB0] px-4 py-3 sm:px-6 sm:py-3 text-white grid grid-cols-12 gap-1">
          <div className="col-span-1 text-xs font-medium uppercase">Rank</div>
          <div className="col-span-7 sm:col-span-8 text-xs font-medium uppercase">User</div>
          <div className="col-span-4 sm:col-span-3 text-right text-xs font-medium uppercase">XP</div>
        </div>
        
        {/* Table rows */}
        <div className="divide-y divide-gray-200">
          {users.map((user, index) => (
            <div 
              key={user._id} 
              className={`px-4 py-3 sm:px-6 sm:py-4 grid grid-cols-12 gap-1 items-center ${getRankBgColor(index + 1)} ${currentUser === user._id ? 'border-l-4 border-[#374DB0]' : ''} transition-colors hover:bg-[#374DB0]/5`}
            >
              {/* Rank column */}
              <div className="col-span-1">
                <div className={`text-xs sm:text-sm font-bold ${getRankColor(index + 1)}`}>
                  #{index + 1}
                </div>
              </div>
              
              {/* User column */}
              <div className="col-span-7 sm:col-span-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-[#374DB0]/10 text-[#374DB0] font-bold">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.username} className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                    ) : (
                      getInitials(user.username)
                    )}
                  </div>
                  <div className="ml-2 sm:ml-4">
                    <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-full">
                      {user.nickname || user.username}
                    </div>
                    <div className="hidden sm:flex items-center">
                      {getStreakDays(user) && (
                        <div className="text-xs text-yellow-600 mr-2">🔥 {getStreakDays(user)}</div>
                      )}
                      <span className="px-1.5 py-0.5 text-xs rounded-full bg-[#374DB0]/10 text-[#374DB0]">
                        Lvl {user.level || 1}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* XP column */}
              <div className="col-span-4 sm:col-span-3 text-right">
                <div className="text-xs sm:text-sm text-gray-900 font-medium">{user.xp} XP</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-10 bg-white/60 rounded-2xl shadow-md border-2 border-[#374DB0]/20">
          <p className="text-gray-500">No users on the leaderboard yet.</p>
        </div>
      )}
      <ExitButton />
    </div>
  );
};

export default LeaderboardPage;