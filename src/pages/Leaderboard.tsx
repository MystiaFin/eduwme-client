// filepath: c:\Users\Univ_and_Work_files\Programming\mix-language-files\eduwme-project\eduwme-client\src\component\LeaderboardPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

// Sample data - replace with actual data fetching later
const sampleLeaderboardData = [
  { rank: 1, name: 'Alex J.', xp: 1450, avatar: '👨‍🎓', league: 'Diamond' },
  { rank: 2, name: 'Taylor S.', xp: 1380, avatar: '👩‍🎓', league: 'Diamond' },
  { rank: 3, name: 'Jordan P.', xp: 1320, avatar: '👨‍🎓', league: 'Diamond' },
  { rank: 4, name: 'Casey M.', xp: 1250, avatar: '🧑‍🏫', league: 'Diamond' },
  { rank: 5, name: 'Morgan K.', xp: 1180, avatar: '👩‍🏫', league: 'Diamond' },
  { rank: 6, name: 'Riley B.', xp: 1100, avatar: '👨‍🎓', league: 'Ruby' },
  { rank: 7, name: 'Jamie L.', xp: 1050, avatar: '👩‍🎓', league: 'Ruby' },
  { rank: 8, name: 'Skyler W.', xp: 980, avatar: '🧑‍🎓', league: 'Ruby' },
  { rank: 9, name: 'Drew N.', xp: 920, avatar: '👨‍🏫', league: 'Emerald' },
  { rank: 10, name: 'Chris G.', xp: 850, avatar: '👩‍🏫', league: 'Emerald' },
  // Add more users as needed
];

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

const LeaderboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
                &larr; Back to Dashboard
            </Link>
        </div>

        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Leaderboard
        </h1>

        {/* You can add tabs for different leaderboards (e.g., Global, Friends, Weekly) here */}
        {/* <div className="mb-6 flex justify-center space-x-2">
          <button className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold">Global</button>
          <button className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">Friends</button>
        </div> */}

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Player</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden sm:table-cell">League</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sampleLeaderboardData.map((user, index) => (
                <tr key={user.rank} className={`${index < 3 ? 'bg-yellow-50' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50')} hover:bg-gray-100`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-lg font-bold ${index < 3 ? 'text-yellow-600' : 'text-gray-700'}`}>
                      {user.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 text-2xl flex items-center justify-center bg-gray-200 rounded-full">
                        {user.avatar}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500 sm:hidden">{user.league}</div> {/* Show league on small screens here */}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLeagueColor(user.league)} text-white`}>
                      {user.league}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-semibold text-gray-900">{user.xp} XP</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination can be added here if the list is long */}
        {/* <div className="mt-8 flex justify-center">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Previous
          </button>
          <button className="ml-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Next
          </button>
        </div> */}

      </div>
    </div>
  );
};

export default LeaderboardPage;