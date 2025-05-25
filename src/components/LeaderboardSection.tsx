import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface LeaderboardUser {
  _id: string;
  username: string;
  nickname?: string;
  profilePicture?: string;
  xp: number;
  level: number;
}

const LeaderboardSection: React.FC = () => {
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

  if (loading) {
    return <div className="text-center p-4">Loading leaderboard...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Leaderboard</h2>
      {leaderboard.length === 0 ? (
        <p className="text-gray-600">No users on the leaderboard yet.</p>
      ) : (
        <ul className="space-y-3">
          {leaderboard.map((user, index) => (
            <li key={user._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
              <div className="flex items-center">
                <span className="font-semibold mr-2 text-gray-600">{index + 1}.</span>
                <img
                  src={user.profilePicture || 'https://via.placeholder.com/40'} // Placeholder image
                  alt={user.nickname || user.username}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-700">{user.nickname || user.username}</p>
                  <p className="text-xs text-gray-500">Level: {user.level}</p>
                </div>
              </div>
              <span className="font-bold text-blue-500">{user.xp} XP</span>
            </li>
          ))}
        </ul>
      )}
      <Link to="/leaderboard" className="block text-center mt-4 text-blue-600 hover:underline font-semibold">
        View Full Leaderboard
      </Link>
    </div>
  );
};

export default LeaderboardSection;