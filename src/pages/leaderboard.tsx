import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';

interface LeaderboardUser {
  _id: string;
  username: string;
  nickname?: string;
  profilePicture?: string;
  xp: number;
  level: number;
}

// Helper function to determine user league based on XP
const getUserLeague = (xp: number): string => {
  if (xp >= 1200) return 'Diamond';
  if (xp >= 900) return 'Ruby';
  if (xp >= 600) return 'Emerald';
  if (xp >= 300) return 'Sapphire';
  return 'Bronze';
};

// Helper to get league color
const getLeagueColor = (league: string) => {
  switch (league.toLowerCase()) {
    case 'diamond': return 'bg-blue-500';
    case 'ruby': return 'bg-red-500';
    case 'emerald': return 'bg-green-500';
    case 'sapphire': return 'bg-indigo-500';
    default: return 'bg-gray-500';
  }
};

const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('User not authenticated.');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:3000/leaderboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.leaderboard) {
          setLeaderboard(data.leaderboard);
        } else {
          setLeaderboard([]);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Modern Back Button */}
        <div className="mb-8">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300"
          >
            <HiArrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white">
            <h1 className="text-4xl font-bold text-center">
              Leaderboard
            </h1>
            <p className="text-center mt-2 text-blue-100">Top performers in the community</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center p-12 text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Player</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden sm:table-cell">League</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaderboard.map((user, index) => {
                    const league = getUserLeague(user.xp);
                    return (
                      <tr key={user._id} className={`${index < 3 ? 'bg-yellow-50' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50')} hover:bg-gray-100 transition-colors duration-150`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {index < 3 ? (
                            <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                 style={{ background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32' }}>
                              {index + 1}
                            </div>
                          ) : (
                            <span className="text-lg font-semibold text-gray-700">
                              {index + 1}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-full overflow-hidden">
                              <img 
                                src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.nickname || user.username}&background=random`} 
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.nickname || user.username}</div>
                              <div className="text-xs text-gray-500">Level {user.level}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getLeagueColor(league)} text-white`}>
                            {league}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-bold text-indigo-600">{user.xp.toLocaleString()} XP</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {leaderboard.length === 0 && !loading && !error && (
                <div className="py-12 text-center text-gray-500">
                  No users on the leaderboard yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;