import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../AuthContext";

// Define interfaces for type safety
interface Exercise {
  exerciseId: string;
  courseId: string;
  courseBatchId: string;
  title: string;
  difficultyLevel: number;
  dateCreated: string;
  animType: string;
  type: string;
  question: string;
  options: string[];
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
  logo?: string;
}

interface CourseProgress {
  exerciseId: string;
  status: "not_started" | "in_progress" | "completed";
  score?: number;
  lastAttempted?: Date;
}

const Course = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exercisesByLevel, setExercisesByLevel] = useState<{[key: number]: Exercise[]}>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Fetch course details and then exercises
  useEffect(() => {
    const fetchCourseAndExercises = async () => {
      if (!courseId) return;
      
      try {
        // Step 1: Fetch course details
        const courseResponse = await fetch(
          `${API_BASE_URL}/courses/getCoursesById/${courseId}`,
          { credentials: "include" }
        );

        if (!courseResponse.ok) {
          throw new Error(`Failed to fetch course: ${courseResponse.status}`);
        }

        const courseData = await courseResponse.json();
        const fetchedCourse = courseData.course;
        setCourse(fetchedCourse);

        // Step 2: Fetch user progress for this course
        if (user) {
          const userResponse = await fetch(`${API_BASE_URL}/users/getme`, {
            credentials: "include"
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            // Fixed: userData directly contains the user object, not nested under a "user" property
            const batchProgress = userData.courseBatchesProgress?.find(
              (batch: any) => batch.courseBatchId === fetchedCourse.courseBatchId
            );
            
            const currentCourseProgress = batchProgress?.courses?.find(
              (c: any) => c.courseId === courseId
            );
            
            if (currentCourseProgress?.exercises) {
              setCourseProgress(currentCourseProgress.exercises);
            }
          }
        }

        // Step 3: Fetch exercises for this course
        const exercisePromises = fetchedCourse.exerciseBatchList.map(
          async (exerciseId: string) => {
            const exerciseResponse = await fetch(
              `${API_BASE_URL}/exercises/getExercise/${exerciseId}`,
              { credentials: "include" }
            );

            if (!exerciseResponse.ok) {
              console.warn(`Failed to fetch exercise ${exerciseId}`);
              return null;
            }

            const exerciseData = await exerciseResponse.json();
            return exerciseData.exercise;
          }
        );

        const fetchedExercises = (await Promise.all(exercisePromises)).filter(
          (exercise): exercise is Exercise => exercise !== null
        );

        // Step 4: Organize exercises by difficulty level
        setExercises(fetchedExercises);
        
        const groupedExercises: {[key: number]: Exercise[]} = {};
        fetchedExercises.forEach(exercise => {
          const level = exercise.difficultyLevel;
          if (!groupedExercises[level]) {
            groupedExercises[level] = [];
          }
          groupedExercises[level].push(exercise);
        });
        
        setExercisesByLevel(groupedExercises);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setLoading(false);
      }
    };

    fetchCourseAndExercises();
  }, [courseId, user]);

  const handleExerciseClick = (exerciseId: string) => {
    navigate(`/exercise/${exerciseId}`);
  };

  // Updated loading state with responsive styling and dark mode
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">Loading course content...</p>
      </div>
    );
  }

  // Updated error state with responsive styling and dark mode
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <p className="text-base md:text-lg text-red-600 dark:text-red-400 mb-4">Error: {error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Updated course not found state with responsive styling and dark mode
  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <p className="text-base md:text-lg text-yellow-600 dark:text-yellow-400 mb-4">Course not found</p>
        <button
          onClick={() => navigate("/")}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    // Container with width constraints and proper spacing for mobile navigation
    <div className="max-w-full md:max-w-4xl lg:max-w-5xl mx-auto px-3 sm:px-4 py-4 md:py-6 pb-24 md:pb-16 transition-colors duration-300 dark:bg-gray-900">
      <div className="mb-4 md:mb-6">
        {/* Responsive back button with dark mode support */}
        <button
        onClick={() => navigate("/home")}
        className="group flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg
          bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30
          border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600
          shadow-sm hover:shadow transition-all duration-200
          text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300
          font-medium text-sm md:text-base mb-3 md:mb-4"
        aria-label="Return to home page"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          className="w-4 h-4 md:w-5 md:h-5 transform group-hover:-translate-x-1 transition-transform duration-200"
        >
          <path 
            fillRule="evenodd" 
            d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" 
            clipRule="evenodd" 
          />
        </svg>
        Back to Home
      </button>
        
        {/* Responsive course header with proper spacing and dark mode */}
        <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6">
          {course.logo && (
            <img 
              src={course.logo} 
              alt={`${course.title} logo`} 
              className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 p-2"
            />
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{course.title}</h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Level {course.level} • {exercises.length} Exercises
            </p>
          </div>
        </div>
      </div>

      {/* Display exercises by difficulty level */}
      {Object.keys(exercisesByLevel).length === 0 ? (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-lg md:rounded-xl p-4 md:p-6 text-center">
          <p className="text-yellow-700 dark:text-yellow-400 text-sm md:text-base">
            No exercises available for this course yet.
          </p>
        </div>
      ) : (
        Object.entries(exercisesByLevel)
          .sort(([levelA], [levelB]) => Number(levelA) - Number(levelB))
          .map(([level, levelExercises]) => (
            <div key={level} className="mb-6 md:mb-10">
              {/* Level heading with dark mode support */}
              <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800 dark:text-white">
                Level {level} Exercises
              </h2>
              
              {/* Responsive grid with fewer columns on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {levelExercises.map(exercise => {
                  // Find exercise progress
                  const exerciseProgress = courseProgress.find(
                    p => p.exerciseId === exercise.exerciseId
                  );
                  
                  const isCompleted = exerciseProgress?.status === "completed";
                  
                  return (
                    <div 
                      key={exercise.exerciseId}
                      onClick={() => handleExerciseClick(exercise.exerciseId)}
                      className={`
                        p-3 md:p-4 rounded-lg border-2 cursor-pointer
                        ${isCompleted 
                          ? "border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20" 
                          : "border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-500"}
                        transition-all duration-200
                      `}
                    >
                      {/* Exercise header with completion status */}
                      <div className="flex justify-between items-start mb-1 md:mb-2">
                        <h3 className="font-medium text-sm md:text-base text-gray-800 dark:text-white">{exercise.title}</h3>
                        {isCompleted && (
                          <span className="text-green-500 dark:text-green-400 text-lg md:text-xl">✓</span>
                        )}
                      </div>
                      
                      {/* Exercise metadata with responsive text */}
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1 md:mb-2">
                        {exercise.type} • {exercise.animType}
                      </p>
                      
                      {/* Question preview with responsive sizing and dark mode */}
                      <div className="text-xs bg-gray-100 dark:bg-gray-700 p-1.5 md:p-2 rounded">
                        <p className="line-clamp-2 text-gray-800 dark:text-gray-200">{exercise.question}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
      )}
    </div>
  );
};

export default Course;