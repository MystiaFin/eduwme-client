import React, { useState } from 'react';
// Import useNavigate
import { Link, useNavigate } from 'react-router-dom';
import LeaderboardSection from '../components/LeaderboardSection';

// Sample data
const sampleCourses = [
  { id: 1, title: 'Course 1: Basic Operations', lessons: 5, completed: 5, icon: '🍎' },
  { id: 2, title: 'Course 2: Number Systems', lessons: 4, completed: 2, icon: '🗣️' },
  { id: 3, title: 'Course 3: Fraction, Decimal, Percentage Operations', lessons: 6, completed: 0, icon: '🍕' },
  { id: 4, title: 'Course 4: Exponentiation ', lessons: 5, completed: 0, icon: '🐘' },
];

// Updated sampleLeaderboard to be consistent with the top entries from LeaderboardPage
const sampleLeaderboard = [
  { rank: 1, name: 'Alex J.', xp: 1450, avatar: '👨‍🎓', league: 'Diamond' },
  { rank: 2, name: 'Taylor S.', xp: 1380, avatar: '👩‍🎓', league: 'Diamond' },
  { rank: 3, name: 'Jordan P.', xp: 1320, avatar: '👨‍🎓', league: 'Diamond' },
];

const Home = () => {
  const [streak, setStreak] = useState(5); // Example streak
  const dailyGoal = 50;
  const currentXP = 15; // Example current XP
  // Get the navigate function
  const navigate = useNavigate();

  // Function to handle button click
  const handleCourseClick = (courseId: number) => {
    navigate(`/course/${courseId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar/Navigation (Duolingo style)*/}

      
      <nav className="w-full lg:w-64 bg-white border-r border-gray-200 p-4 flex flex-col items-center lg:items-start">
        <div className="flex items-center flex-row mb-6 ml-3">
          <img src="./src/assets/GogoMathLogo.png" alt="GogoMath" className="h-10 w-auto mt-3" />
          <span className="text-xl font-bold text-red-600 ml-2">Gogo</span>
          <span className="text-xl font-bold text-yellow-400">Math</span>
        </div>
      
        {/* --- Start of restored nav links --- */}
        <ul className="space-y-4 w-full">
          <li>
            <Link to="/dashboard" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded font-semibold">
              <span className="mr-3 text-xl">🏠</span> Learn
            </Link>
          </li>
          <li>
            <Link to="/profile" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
              <span className="mr-3 text-xl">👤</span> Profile
            </Link>
          </li>
          <li>
            <Link to="/leaderboard" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
              <span className="mr-3 text-xl">🏆</span> Leaderboards
            </Link>
          </li>
          <li>
            <Link to="/shop" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
              <span className="mr-3 text-xl">🛒</span> Shop
            </Link>
          </li>
          {/* Add more links as needed */}
        </ul>
        {/* --- End of restored nav links --- */}
        <div className="mt-auto w-full pt-4 border-t border-gray-200">
           <button
             onClick={handleLogout}
             className="w-full text-left p-2 text-gray-700 hover:bg-gray-100 rounded flex items-center"
           >
             <span className="mr-3 text-xl">🚪</span> Logout
           </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 bg-gray-50 overflow-y-auto">
        {/* Top Bar with Streak/Gems */}
        <div className="flex justify-end items-center space-x-4 mb-8">
          <div className="flex items-center bg-white p-2 rounded-lg border border-gray-200">
            <span className="text-xl mr-1">🔥</span>
            <span className="font-bold text-orange-500">{streak}</span>
          </div>
          <div className="flex items-center bg-white p-2 rounded-lg border border-gray-200">
            <span className="text-xl mr-1 text-red-500">💎</span>
            <span className="font-bold text-gray-700">500</span> {/* Example Gems */}
          </div>
        </div>

       {/* Course/Skill Tree - 3 Column Grid */}
       <div className="flex items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Learning Courses</h1>
       </div>
        {/* Use Tailwind Grid */}
        <div className="grid grid-cols-3 gap-x-8 gap-y-12 justify-items-center">
          {sampleCourses.map((course) => (
            // Each item in the grid
            <div key={course.id} className="flex flex-col items-center text-center">
              {/* Skill Icon Button - Add onClick */}
              <button
                onClick={() => handleCourseClick(course.id)} // Add onClick handler
                className={`relative w-24 h-24 rounded-full flex items-center justify-center text-4xl
                           ${course.completed === course.lessons ? 'bg-yellow-400 border-4 border-yellow-500' : 'bg-blue-500 border-4 border-blue-600'}
                           text-white shadow-md mb-2 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {course.icon}
                {/* Progress Ring (Simplified) - Optional */}
                {course.completed > 0 && course.completed < course.lessons && (
                   <div className="absolute inset-0 rounded-full border-4 border-green-400" style={{ clipPath: `inset(0 ${100 - (course.completed / course.lessons) * 100}% 0 0)` }}></div>
                )}
                 {/* Checkmark for completed - Optional */}
                 {course.completed === course.lessons && (
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-0.5 shadow">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                 )}
              </button>
              {/* Skill Title */}
              <span className="font-semibold text-gray-700 mt-1 max-w-[100px] break-words">{course.title}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Right Sidebar (Leaderboard, Daily Goal) */}
      <aside className="w-full lg:w-80 bg-white border-l border-gray-200 p-6 hidden xl:block">
        {/* --- Start of restored sidebar content --- */}
        {/* Daily Goal */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Daily Goal</h2>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-1">
            <div
              className="bg-blue-500 h-4 rounded-full"
              style={{ width: `${Math.min((currentXP / dailyGoal) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 text-center">{currentXP} / {dailyGoal} XP</p>
        </div>

        {/* Leaderboard Preview */}
        <LeaderboardSection />
        {/* --- End of restored sidebar content --- */}
      </aside>
    </div>
  );
};

export default Home;