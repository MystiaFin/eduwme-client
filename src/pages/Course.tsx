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

  // Loading state - more compact
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300">Loading course content...</p>
      </div>
    );
  }

  // Error state - more compact
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-2 sm:px-4">
        <p className="text-xs sm:text-sm md:text-base text-red-600 dark:text-red-400 mb-2 sm:mb-4">Error: {error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md sm:rounded-lg dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Course not found state - more compact
  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-2 sm:px-4">
        <p className="text-xs sm:text-sm md:text-base text-yellow-600 dark:text-yellow-400 mb-2 sm:mb-4">Course not found</p>
        <button
          onClick={() => navigate("/")}
          className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md sm:rounded-lg dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    // Narrower container with less padding on mobile
    <div className="max-w-[100%] sm:max-w-[100%] md:max-w-4xl lg:max-w-5xl mx-auto px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-6 pb-20 sm:pb-24 md:pb-16 transition-colors duration-300 dark:bg-gray-900">
      <div className="mb-2 sm:mb-3 md:mb-6">
        {/* More compact back button */}
        <button
          onClick={() => navigate("/home")}
          className="group flex items-center gap-0.5 sm:gap-1 md:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-md sm:rounded-lg
            bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30
            border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600
            shadow-sm hover:shadow transition-all duration-200
            text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300
            font-medium text-xs sm:text-sm md:text-base mb-2 sm:mb-3 md:mb-4"
          aria-label="Return to home page"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 transform group-hover:-translate-x-1 transition-transform duration-200"
          >
            <path 
              fillRule="evenodd" 
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" 
              clipRule="evenodd" 
            />
          </svg>
          <span className="text-[10px] sm:text-xs md:text-sm">Back to Home</span>
        </button>
        
        {/* More compact course header */}
        <div className="flex justify-between items-start gap-1.5 sm:gap-2 md:gap-4 mb-2 sm:mb-3 md:mb-6">
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center overflow-hidden bg-blue-100 dark:bg-blue-900/30 p-1 sm:p-1.5 md:p-2">
                 {course.logo ? (
                    <img 
                      src={course.logo} 
                      alt={`${course.title} logo`} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center rounded-full relative overflow-hidden">
                      {/* Stylized background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 dark:from-blue-500 dark:to-purple-600"></div>
                      
                      {/* Pattern overlay */}
                      <div className="absolute inset-0 opacity-20 dark:opacity-30">
                        <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="1"/>
                            </pattern>
                          </defs>
                          <rect width="100" height="100" fill="url(#grid)" />
                        </svg>
                      </div>
                      
                      {/* Central icon */}
                      <svg 
                        className="relative w-2/3 h-2/3 text-white" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                    </div>
                  )}
              </div>
              <div>
                <h1 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800 dark:text-white">{course.title}</h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  Level {course.level} • {exercises.length} Exercises • {courseProgress.filter(p => p.status === "completed").length} completed
                </p>
              </div>
          </div>
          
          {/* Compact progress indicator in header */}
          <div className="flex flex-col items-end bg-amber-200 dark:bg-amber-900/20 p-1 sm:p-2 md:p-3 rounded-md sm:rounded-lg md:rounded-xl shadow-sm">
            <p className="text-[9px] xs:text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {Math.round((courseProgress.filter(p => p.status === "completed").length / exercises.length) * 100)}% complete
            </p>
            <div className="w-16 xs:w-20 sm:w-24 md:w-32 h-1 sm:h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 rounded-full transition-all duration-500"
                style={{ 
                  width: `${exercises.length > 0 
                    ? (courseProgress.filter(p => p.status === "completed").length / exercises.length) * 100 
                    : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {Object.keys(exercisesByLevel).length === 0 ? (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-md sm:rounded-lg md:rounded-xl p-2 sm:p-3 md:p-6 text-center">
          <p className="text-yellow-700 dark:text-yellow-400 text-xs sm:text-sm md:text-base">
            No exercises available for this course yet.
          </p>
        </div>
      ) : (
        // Exercise levels with tighter spacing
        Object.entries(exercisesByLevel)
          .sort(([levelA], [levelB]) => Number(levelA) - Number(levelB))
          .map(([level, levelExercises]) => (
            <div key={level} className="mb-3 sm:mb-4 md:mb-10">
              {/* Smaller level heading */}
              <h2 className="text-sm sm:text-base md:text-xl font-bold mb-1.5 sm:mb-2 md:mb-4 text-gray-800 dark:text-white">
                Level {level} Exercises
              </h2>
              
              {/* Changed to single column stack */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-4">
                {levelExercises.map((exercise, index) => {
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
                        p-1.5 sm:p-2 md:p-3 rounded-md sm:rounded-lg border cursor-pointer flex flex-col
                        ${isCompleted 
                          ? "border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20" 
                          : "border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-500"}
                        transition-all duration-200 hover:shadow-sm
                      `}
                    >
                      {/* Add exercise number and header in a flex row */}
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {/* Exercise number */}
                        <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 
                          flex items-center justify-center text-[9px] xs:text-[10px] sm:text-xs md:text-sm 
                          font-medium text-blue-700 dark:text-blue-300">
                          {index + 1}
                        </div>
                        
                        {/* Exercise title with completion indicator */}
                        <div className="flex flex-1 justify-between items-center">
                          <h3 className="font-medium text-[10px] xs:text-xs sm:text-sm md:text-base text-gray-800 dark:text-white line-clamp-1">
                            {exercise.title}
                          </h3>
                          {isCompleted && (
                            <span className="text-green-500 dark:text-green-400 text-xs sm:text-sm md:text-base ml-0.5 sm:ml-1">✓</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Metadata with slightly increased left margin to align with title */}
                      <p className="text-[8px] xs:text-[9px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 ml-5 sm:ml-7">
                        {exercise.type} • {exercise.animType}
                      </p>
                      
                      {/* Question preview with increased left margin to align with title */}
                      <div className="text-[8px] xs:text-[9px] sm:text-xs bg-gray-100 dark:bg-gray-700 p-0.5 sm:p-1 mt-0.5 sm:mt-1 rounded ml-5 sm:ml-7">
                        <p className="line-clamp-1 text-gray-800 dark:text-gray-200">{exercise.question}</p>
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