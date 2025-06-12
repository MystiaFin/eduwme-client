import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import AdditionIcon from "@src/assets/additionIcon.svg";
import { useAuth } from "../AuthContext";
import EducationalNews from "@src/components/EducationalNews";
import LoadingPage from "@src/components/loading";

// Define types for course batches
interface CourseBatch {
  courseBatchId: string;
  dateCreated: string;
  courseList: string[]; // Array of courseId strings
  stage: number;
  coursesLength: number; // Total number of courses defined in this batch's courseList
  isUnlocked?: boolean;
}

// Define types for courses
interface Course {
  courseBatchId: string; // The batch this course primarily belongs to (can be in multiple)
  courseId: string;
  title: string;
  level: number;
  dateCreated: string;
  exerciseBatchList: string[];
  exercisesLength: number;
  logo: string;
}

interface CourseIcon {
  icon: string | typeof AdditionIcon; // Can be string emoji or imported SVG
  size?: {
    xs?: string; // Custom size for extra small screens
    sm?: string; // Custom size for small screens
    md?: string; // Custom size for medium screens
    lg?: string; // Custom size for large screens
  };
}

// Define types for API responses
interface CourseBatchResponse {
  message: string;
  courseBatchList: CourseBatch[];
}

interface CourseResponse {
  message: string;
  courseList: Course[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  previousPage: number | null;
}

// Define types for user progress
// This interface should match the structure of your user's progress data
interface CourseProgressDetail {
  courseId: string;
  status: "not_started" | "in_progress" | "completed";
  completionPercentage?: number; // Added for progress tracking
  // Add other course-specific progress details if needed
}

interface UserProgress {
  courseBatchId: string;
  status: "not_started" | "in_progress" | "completed";
  completedCoursesCount: number;
  totalCoursesInBatch: number; // This should ideally match batch.coursesLength
  courses?: CourseProgressDetail[]; // Array of progress for individual courses within the batch
}

// Updated ButtonStyle with responsive properties
// - Different sizes for different screen widths
// - Responsive padding scales with screen size
// - Responsive border width for better visual weight on large screens
// - Responsive text sizes for balanced appearance
// Update ButtonStyle for smaller mobile sizes
const ButtonStyle = `
  w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 lg:w-24 lg:h-24
  p-1.5 sm:p-2 md:p-3 
  bg-white/20 
  flex flex-col justify-center items-center 
  rounded-xl sm:rounded-2xl 
  border border-[#374DB0] sm:border-2 md:border-3 lg:border-4
  text-base sm:text-lg md:text-xl lg:text-2xl 
  gap-0.5 sm:gap-1
  transition-all duration-200
  hover:scale-105 hover:shadow-lg
  dark:bg-gray-800/20 dark:border-[#5a6fd1]
`;



const getIconForCourse = (title: string): CourseIcon => {
  // Normalize the title to lowercase for more reliable matching
  const normalizedTitle = title.toLowerCase().trim();
  
  if (normalizedTitle.includes('addition')) {
    return { 
      icon: "➕",
      size: { xs: "text-2xl", sm: "text-3xl", md: "text-4xl", lg: "text-5xl" }
    };
  } else if (normalizedTitle.includes('subtraction')) {
    return { 
      icon: "➖",
      size: { xs: "text-2xl", sm: "text-3xl", md: "text-4xl", lg: "text-5xl" }
    };
  } else if (normalizedTitle.includes('multiplication')) {
    return { 
      icon: "✖️",
      size: { xs: "text-2xl", sm: "text-3xl", md: "text-4xl", lg: "text-5xl" }
    };
  } else if (normalizedTitle.includes('division')) {
    return { 
      icon: "➗",
      size: { xs: "text-2xl", sm: "text-3xl", md: "text-4xl", lg: "text-5xl" }
    };
  } else if (normalizedTitle.includes('fraction')) {
    return { 
      icon: "🧮",
      size: { xs: "text-xl", sm: "text-2xl", md: "text-3xl", lg: "text-4xl" }
    };
  } else if (normalizedTitle.includes('number') || normalizedTitle.includes('counting')) {
    return { 
      icon: "🔢",
      size: { xs: "text-2xl", sm: "text-3xl", md: "text-3xl", lg: "text-4xl" }
    };
  } else if (normalizedTitle.includes('geometry')) {
    return { 
      icon: "📐",
      size: { xs: "text-2xl", sm: "text-3xl", md: "text-3xl", lg: "text-4xl" }
    };
  } else if (normalizedTitle.includes('graph')) {
    return { 
      icon: "📊",
      size: { xs: "text-xl", sm: "text-2xl", md: "text-3xl", lg: "text-4xl" }
    };
  } else if (normalizedTitle.includes('algebra')) {
    return { 
      icon: "🔣",
      size: { xs: "text-2xl", sm: "text-3xl", md: "text-4xl", lg: "text-5xl" }
    };
  } else {
    return { 
      icon: "📚", 
      size: { xs: "text-2xl", sm: "text-3xl", md: "text-4xl", lg: "text-5xl" }
    };
  }
};

const Home = () => {
  const [courseBatches, setCourseBatches] = useState<CourseBatch[]>([]);
  const [courses, setCourses] = useState<{ [courseId: string]: Course }>({}); // Store all fetched courses by their ID for easy lookup
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        let currentUserProgress: UserProgress[] = [];
        console.log("User data fetched successfully:", user);

        if (user) {
          const userResponse = await fetch(`${API_BASE_URL}/users/getme`, {
            credentials: "include"
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            // Fixed: userData directly contains the user object, not nested under a "user" property
            if (userData.courseBatchesProgress) {
              currentUserProgress = userData.courseBatchesProgress;
              setUserProgress(currentUserProgress);
            }
          } else {
            console.error("Failed to fetch user data, status:", userResponse.status);
            // Potentially set an error or handle anonymous users differently
          }
        }

        const courseBatchesResponse = await fetch(
          `${API_BASE_URL}/courses/getCourseBatches`,
          {
            credentials: "include"
          }
        );

        if (!courseBatchesResponse.ok) {
          throw new Error(`HTTP error fetching course batches! status: ${courseBatchesResponse.status}`);
        }

        const courseBatchesData: CourseBatchResponse = await courseBatchesResponse.json();
        const sortedBatches = courseBatchesData.courseBatchList.sort((a, b) => a.stage - b.stage);

        const batchesWithUnlockState = sortedBatches.map((batch, index) => {
          if (index === 0) {
            return { ...batch, isUnlocked: true };
          }
          const previousBatch = sortedBatches[index - 1];
          const previousBatchProgress = currentUserProgress.find(
            p => p.courseBatchId === previousBatch.courseBatchId
          );
          const isUnlocked = previousBatchProgress?.status === "completed";
          return { ...batch, isUnlocked };
        });

        setCourseBatches(batchesWithUnlockState);

        // Fetch all courses referenced in any batch's courseList
        const allReferencedCourseIds = new Set<string>();
        batchesWithUnlockState.forEach(batch => {
          batch.courseList.forEach(courseId => allReferencedCourseIds.add(courseId));
        });

        const fetchedCoursesMap: { [courseId: string]: Course } = {};
        if (allReferencedCourseIds.size > 0) {
          // Assuming an endpoint that can fetch multiple courses by IDs,
          // or fetching them one by one if necessary.
          // For simplicity, if /getCourses can take a list of IDs or if we fetch all and filter:
          // This example assumes /getCourses without params fetches ALL courses.
          // Adjust if your API behaves differently.
          const allCoursesResponse = await fetch(
            `${API_BASE_URL}/courses/getCourses`, // Potentially add query params if API supports fetching specific IDs
            { credentials: "include" }
          );
          if (!allCoursesResponse.ok) {
            throw new Error(`Failed to fetch all courses: ${allCoursesResponse.status}`);
          }
          const allCoursesData: CourseResponse = await allCoursesResponse.json();
          allCoursesData.courseList.forEach(course => {
            fetchedCoursesMap[course.courseId] = course;
          });
        }
        setCourses(fetchedCoursesMap);

      } catch (err) {
        console.error("Error in fetchAllData:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  // Updated loading state with responsive spacing and text size
  if (loading) {
    return <LoadingPage message="Loading courses..." fullScreen={false} />;
  }

  // Updated error state with responsive layout and dark mode support
  if (error) {
    return (
      <div className="gap-4 md:gap-5 flex flex-col mt-12 md:mt-20 items-center justify-center">
        <p className="text-base md:text-lg text-red-600 dark:text-red-400">Error: {error}</p>
        {/* Enhanced button with better responsive padding and dark mode */}
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    // Smaller padding and narrower max-width on mobile
    <div className="max-w-[92%] sm:max-w-[85%] md:max-w-5xl lg:max-w-6xl mx-auto px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-8 pb-20 md:pb-16">

      {/* User stats section with better mobile layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-8">
        {/* Smaller heading text on mobile */}
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">Learning Areas</h1>
  
        {/* Smaller user stats badges on mobile */}
        <div className="flex gap-1.5 sm:gap-2 md:gap-3 items-center">
          {/* Smaller gems badge */}
          <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-4 md:py-2 rounded-full flex items-center shadow-sm sm:shadow text-xs sm:text-sm md:text-base">
            <span className="mr-0.5 sm:mr-1 md:mr-2 text-sm sm:text-base md:text-lg">💎</span>
            <span className="font-semibold">{user?.gems || 0}</span>
          </div>
          
          {/* Smaller XP badge */}
          <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-4 md:py-2 rounded-full flex items-center shadow-sm sm:shadow text-xs sm:text-sm md:text-base">
            <span className="mr-0.5 sm:mr-1 md:mr-2 text-sm sm:text-base md:text-lg">🏅</span>
            <span className="font-semibold">{user?.xp || 0} XP</span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <EducationalNews />
      </div>
      
      {/* Map through course batches with tighter spacing on mobile */}
      {courseBatches.map((batch) => {
        const batchProgress = userProgress.find(p => p.courseBatchId === batch.courseBatchId);
        
        const orderedCoursesToShow = batch.courseList
          .map(courseIdFromList => courses[courseIdFromList])
          .filter(course => course !== undefined);

        return (
          // More compact container on mobile
          <div key={batch.courseBatchId} className="mb-4 sm:mb-6 md:mb-10 bg-white dark:bg-gray-800 shadow-md md:shadow-lg rounded-lg md:rounded-xl p-2 sm:p-3 md:p-6 transition-colors duration-300">
            {/* More compact batch header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-2 sm:mb-3 md:mb-5 pb-1 sm:pb-2 md:pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                {/* Smaller heading text */}
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-700 dark:text-white">
                  Stage {batch.stage}
                </h2>
                
                {/* Smaller lock badge */}
                {!batch.isUnlocked && (
                  <span className="ml-1.5 sm:ml-2 md:ml-3 px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-3 md:py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-[10px] sm:text-xs md:text-sm font-medium">
                    🔒 Locked
                  </span>
                )}
                
                {/* Smaller unlock badge */}
                {batch.isUnlocked && (
                  <span className="ml-1.5 sm:ml-2 md:ml-3 px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-3 md:py-1 bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-300 rounded-full text-[10px] sm:text-xs md:text-sm font-medium">
                    🔓 Unlocked
                  </span>
                )}
              </div>
              
              {/* Smaller progress bar */}
              {batchProgress && batch.isUnlocked && (
                <div className="flex items-center mt-0.5 sm:mt-0">
                  <div className="w-20 sm:w-24 md:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-1 sm:h-1.5 md:h-3 mr-1.5 sm:mr-2 md:mr-3">
                    <div 
                      className="bg-[#374DB0] dark:bg-[#5a6fd1] h-1 sm:h-1.5 md:h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        // Use batch.coursesLength as the source of truth for total courses
                        width: `${batch.coursesLength > 0 ? (batchProgress.completedCoursesCount / batch.coursesLength) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium">
                    {/* Also update the displayed count to match */}
                    {batchProgress.completedCoursesCount}/{batch.coursesLength}
                  </span>
                </div>
              )}
            </div>
            
            {/* Smaller locked message */}
            {!batch.isUnlocked && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md md:rounded-lg p-2 sm:p-3 md:p-5 text-center">
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-400">
                  Complete previous stages to unlock this learning area.
                </p>
              </div>
            )}
            
            {/* Tighter grid layout for courses */}
            {batch.isUnlocked && (
              <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 xs:gap-1.5 sm:gap-3 md:gap-6">
                {orderedCoursesToShow.map((course) => {
                  const courseSpecificProgress = batchProgress?.courses?.find(c => c.courseId === course.courseId);
                  const isCompleted = courseSpecificProgress?.status === "completed";
                  const isInProgress = courseSpecificProgress?.status === "in_progress" && !isCompleted;
                  
                  return (
                    <div key={course.courseId} className="flex flex-col items-center text-center">
                      {/* Smaller course button */}
                      <NavLink
                        to={`/courses/${course.courseId}`}
                        className={`${ButtonStyle} relative`}
                      >
                        {/* Circle progress indicator */}
                        <div className="absolute inset-0 w-full h-full">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            {(isInProgress || isCompleted) && (
                              <>
                                {/* Background circle */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="46"
                                  fill="none"
                                  stroke="#e5e7eb"
                                  strokeWidth="4"
                                  className="dark:opacity-20"
                                />
                                {/* Progress circle */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="46"
                                  fill="none"
                                  stroke={isCompleted ? "#10b981" : "#3b82f6"}
                                  strokeWidth="4"
                                  strokeDasharray="289.5"
                                  strokeDashoffset={
                                    isCompleted 
                                      ? "0" 
                                      : courseSpecificProgress?.completionPercentage
                                        ? `${289.5 * (1 - courseSpecificProgress.completionPercentage / 100)}`
                                        : "144.75" // Default to 50% if no percentage available
                                  }
                                  transform="rotate(-90 50 50)"
                                  strokeLinecap="round"
                                  className="transition-all duration-700 ease-out"
                                />
                              </>
                            )}
                          </svg>
                        </div>


                        {/* Course icon - keep the existing code */}
                        {typeof getIconForCourse(course.title).icon === 'string' ? (
                          <span 
                            role="img" 
                            aria-label={`${course.title} icon`}
                            className={`
                              ${getIconForCourse(course.title).size?.xs || 'text-xl'} 
                              sm:${getIconForCourse(course.title).size?.sm || 'text-2xl'} 
                              md:${getIconForCourse(course.title).size?.md || 'text-3xl'} 
                              lg:${getIconForCourse(course.title).size?.lg || 'text-4xl'} 
                              dark:text-white
                              z-10 relative
                            `}
                          >
                            {getIconForCourse(course.title).icon}
                          </span>
                        ) : (
                          <img 
                            src={getIconForCourse(course.title).icon} 
                            alt={`${course.title} icon`}
                            className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 z-10 relative"
                          />
                        )}
                        
                        {/* Keep the completion checkmark badge */}
                        {isCompleted && (
                          <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 md:-top-2 md:-right-2 bg-green-500 text-white text-[8px] sm:text-xs rounded-full p-0.5 sm:p-1 leading-none flex items-center justify-center w-3 h-3 sm:w-auto sm:h-auto z-20">
                            ✓
                          </span>
                        )}
                      </NavLink>
                      
                      {/* Smaller course title */}
                      <p className="mt-1 sm:mt-2 md:mt-3 font-medium text-[10px] xs:text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-200 line-clamp-1 w-full">
                        {course.title}
                      </p>
                      
                      {/* Smaller in progress badge */}
                      {isInProgress && (
                        <span className="mt-0.5 sm:mt-1 inline-block px-1 py-0.5 bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 rounded-full text-[8px] xs:text-[10px] sm:text-xs font-medium">
                          In Progress
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Smaller empty message */}
            {batch.isUnlocked && orderedCoursesToShow.length === 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-800/20 rounded-md md:rounded-lg p-2 sm:p-3 md:p-5 text-center">
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-yellow-700 dark:text-yellow-400">
                  No courses available in this learning area yet.
                </p>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Empty state message */}
      {courseBatches.length === 0 && !loading && (
        <div className="bg-blue-50 dark:bg-blue-800/20 rounded-md md:rounded-lg p-3 sm:p-4 md:p-6 lg:p-10 text-center">
          <p className="text-xs sm:text-sm md:text-lg lg:text-xl text-blue-700 dark:text-blue-300">
            No learning areas available yet. Check back soon!
          </p>
        </div>
      )}

    </div>
  );
};

export default Home;