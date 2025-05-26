import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LeaderboardSection from '../components/LeaderboardSection';
import { useCourseData } from '../hooks/useCourseData';

// Course icons mapping (you can expand this)
const courseIcons: Record<string, string> = {
  'basic': '🍎',
  'intermediate': '🗣️',
  'advanced': '🍕',
  'expert': '🐘',
  // Add more as needed, or use a default
};

const Home = () => {
  const [streak, setStreak] = useState(5);
  const [gems, setGems] = useState(0);
  const dailyGoal = 50;
  const currentXP = 15;
  const navigate = useNavigate();
  
  const { 
    courseBatches, 
    courses, 
    loading, 
    error, 
    isBatchUnlocked,
    getCourseCompletion 
  } = useCourseData();

  // Fetch user data for gems
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Decode the token to get userId
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = decodedToken.id;
        
        const response = await fetch(`http://localhost:3000/getProfile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setGems(data.user.gems || 0);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    
    fetchUserData();
  }, []);

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Group courses by their batch
  const coursesByBatch = courseBatches.map(batch => {
    const batchCourses = courses.filter(course => course.courseBatchId === batch.courseBatchId);
    return {
      ...batch,
      courses: batchCourses,
      isUnlocked: isBatchUnlocked(batch.courseBatchId)
    };
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar/Navigation - keep as is */}
      <nav className="w-full lg:w-64 bg-white border-r border-gray-200 p-4 flex flex-col items-center lg:items-start">
        {/* Your existing navigation code */}
        <div className="flex items-center flex-row mb-6 ml-3">
          <img src="./src/assets/GogoMathLogo.png" alt="GogoMath" className="h-10 w-auto mt-3" />
          <span className="text-xl font-bold text-red-600 ml-2">Gogo</span>
          <span className="text-xl font-bold text-yellow-400">Math</span>
        </div>
      
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
        </ul>
        
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
            <span className="font-bold text-gray-700">{gems}</span>
          </div>
        </div>

        {/* Course Batches */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="space-y-12">
            {coursesByBatch.map((batch) => (
              <div key={batch.courseBatchId} className="mb-10">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {batch.isUnlocked ? (
                    <>Course Batch: {batch.courseBatchId} (Stage {batch.stage})</>
                  ) : (
                    <>🔒 Locked: Complete previous batch to unlock</>
                  )}
                </h2>
                
                {batch.isUnlocked ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-8 justify-items-center">
                    {batch.courses.map((course) => {
                      const completion = getCourseCompletion(course.courseId);
                      const isCompleted = completion >= 1;
                      
                      // Determine icon - use mapping or default
                      const icon = courseIcons[course.courseId.toLowerCase()] || '📚';
                      
                      return (
                        <div key={course.courseId} className="flex flex-col items-center text-center">
                          <button
                            onClick={() => handleCourseClick(course.courseId)}
                            className={`relative w-24 h-24 rounded-full flex items-center justify-center text-4xl
                                      ${isCompleted ? 'bg-yellow-400 border-4 border-yellow-500' : 'bg-blue-500 border-4 border-blue-600'}
                                      text-white shadow-md mb-2 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                          >
                            {icon}
                            {/* Progress Ring */}
                            {completion > 0 && completion < 1 && (
                              <div 
                                className="absolute inset-0 rounded-full border-4 border-green-400" 
                                style={{ clipPath: `inset(0 ${100 - (completion * 100)}% 0 0)` }}
                              ></div>
                            )}
                            {/* Checkmark for completed */}
                            {isCompleted && (
                              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-0.5 shadow">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                              </div>
                            )}
                          </button>
                          <span className="font-semibold text-gray-700 mt-1 max-w-[100px] break-words">{course.title}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-gray-100 p-6 rounded-lg text-center text-gray-500">
                    Complete the previous course batch to unlock these courses.
                  </div>
                )}
              </div>
            ))}
            
            {coursesByBatch.length === 0 && (
              <div className="text-center text-gray-500">
                No course batches available. Please check back later.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Right Sidebar - keep as is */}
      <aside className="w-full lg:w-80 bg-white border-l border-gray-200 p-6 hidden xl:block">
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

        <LeaderboardSection />
      </aside>
    </div>
  );
};

export default Home;