import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiLockClosed, HiCheck } from 'react-icons/hi';

interface Exercise {
  exerciseId: string;
  courseId: string;
  courseBatchId: string;
  title: string;
  dateCreated: string;
  difficultyLevel: number;
  type: string;
  animType: string;
  question: string;
  options?: string[];
  answer: string;
}

interface Course {
  courseBatchId: string;
  courseId: string;
  title: string;
  level: number;
  dateCreated: string;
  exerciseBatchList: string[];
  exercisesLength: number;
}

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCourseAndExercises = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch course details
        const courseResponse = await fetch(`http://localhost:3000/getCourse/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!courseResponse.ok) {
          throw new Error(`Failed to fetch course details: ${courseResponse.status}`);
        }

        const courseData = await courseResponse.json();
        setCourse(courseData.course);

        // Fetch exercises for this course
        const exercisesResponse = await fetch(`http://localhost:3000/getExercises?search=courseId:${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!exercisesResponse.ok) {
          throw new Error(`Failed to fetch exercises: ${exercisesResponse.status}`);
        }

        const exercisesData = await exercisesResponse.json();
        
        // Sort exercises by difficulty level
        const sortedExercises = [...exercisesData.exercises].sort(
          (a, b) => a.difficultyLevel - b.difficultyLevel
        );
        
        setExercises(sortedExercises);

        // Fetch user progress to determine completed exercises
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = decodedToken.id;

        const userResponse = await fetch(`http://localhost:3000/getProfile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const progress: Record<string, string> = {};
          
          // Parse user progress to find completed exercises for this course
          const userBatchProgress = userData.user.courseBatchesProgress || [];
          for (const batchProgress of userBatchProgress) {
            for (const courseProgress of batchProgress.courses) {
              if (courseProgress.courseId === courseId) {
                for (const exerciseProgress of courseProgress.exercises) {
                  progress[exerciseProgress.exerciseId] = exerciseProgress.status;
                }
              }
            }
          }
          
          setUserProgress(progress);
        }
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseAndExercises();
    }
  }, [courseId, navigate]);

  const handleExerciseClick = (exerciseId: string) => {
    navigate(`/exercise/${exerciseId}`);
  };

  // Group exercises by difficulty level
  const exercisesByDifficulty = exercises.reduce((groups, exercise) => {
    const level = exercise.difficultyLevel;
    if (!groups[level]) {
      groups[level] = [];
    }
    groups[level].push(exercise);
    return groups;
  }, {} as Record<number, Exercise[]>);

  // Get difficulty level names
  const getDifficultyName = (level: number) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Easy';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return `Level ${level}`;
    }
  };

  // Get exercise status icon
  const getExerciseStatusIcon = (exerciseId: string) => {
    const status = userProgress[exerciseId];
    if (status === 'completed') {
      return <HiCheck className="text-green-500" />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <Link 
          to="/dashboard" 
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 mb-6"
        >
          <HiArrowLeft className="mr-2 h-5 w-5" />
          Back to Learning Path
        </Link>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center p-12 text-red-500 bg-white rounded-lg shadow">
            <p className="text-xl font-semibold">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Course Header */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white">
                <h1 className="text-3xl font-bold">
                  {course?.title || `Course: ${courseId}`}
                </h1>
                <p className="mt-2 text-blue-100">
                  Level: {course?.level} • Exercises: {exercises.length}
                </p>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600">
                  This course contains {exercises.length} exercises across {Object.keys(exercisesByDifficulty).length} difficulty levels.
                  Start from the easiest exercises and work your way up!
                </p>
              </div>
            </div>

            {/* Exercise Groups by Difficulty */}
            <div className="space-y-10">
              {Object.entries(exercisesByDifficulty)
                .sort(([levelA], [levelB]) => parseInt(levelA) - parseInt(levelB))
                .map(([level, levelExercises]) => (
                  <div key={level} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className={`px-6 py-4 border-b border-gray-200 bg-gray-50`}>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {getDifficultyName(parseInt(level))} 
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          ({levelExercises.length} exercises)
                        </span>
                      </h2>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {levelExercises.map((exercise, index) => {
                        const isCompleted = userProgress[exercise.exerciseId] === 'completed';
                        // Only first exercise of first difficulty level is unlocked by default
                        // For other exercises, they're unlocked if the previous one is completed
                        const isFirstExercise = parseInt(level) === 1 && index === 0;
                        const previousExerciseId = index > 0 ? levelExercises[index - 1].exerciseId : null;
                        const isPreviousCompleted = previousExerciseId ? userProgress[previousExerciseId] === 'completed' : true;
                        const isUnlocked = isFirstExercise || isPreviousCompleted;

                        return (
                          <div 
                            key={exercise.exerciseId}
                            className={`p-4 hover:bg-gray-50 ${!isUnlocked ? 'opacity-70' : ''}`}
                          >
                            <button 
                              onClick={() => isUnlocked && handleExerciseClick(exercise.exerciseId)}
                              disabled={!isUnlocked}
                              className="w-full text-left flex items-center justify-between group"
                            >
                              <div className="flex items-center">
                                {/* Exercise number/icon */}
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4
                                                ${isCompleted ? 'bg-green-100 text-green-500' : 'bg-blue-100 text-blue-500'}`}>
                                  {isCompleted ? (
                                    <HiCheck className="h-6 w-6" />
                                  ) : (
                                    <span>{index + 1}</span>
                                  )}
                                </div>
                                
                                {/* Exercise title and type */}
                                <div>
                                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                                    {exercise.title}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {exercise.type} • {new Date(exercise.dateCreated).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Status indicator */}
                              <div>
                                {!isUnlocked ? (
                                  <HiLockClosed className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <span className="text-sm text-blue-500 group-hover:text-blue-700 group-hover:underline">
                                    {isCompleted ? 'Review' : 'Start'} →
                                  </span>
                                )}
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {Object.keys(exercisesByDifficulty).length === 0 && (
                  <div className="text-center p-12 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500">No exercises found for this course.</p>
                  </div>
                )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;