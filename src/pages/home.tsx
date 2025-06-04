import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import AdditionIcon from "@src/assets/additionIcon.svg";
import SubtractionIcon from "@src/assets/subtractionIcon.svg";
import MultiplicationIcon from "@src/assets/multiplicationIcon.svg";
import DivisionIcon from "@src/assets/divisionIcon.svg";
import { useAuth } from "../AuthContext";

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
const ButtonStyle = `
  w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24
  p-2 md:p-3 
  bg-white/20 
  flex flex-col justify-center items-center 
  rounded-2xl 
  border-2 md:border-3 lg:border-4 border-[#374DB0] 
  text-lg md:text-xl lg:text-2xl 
  gap-1
  transition-all duration-200
  hover:scale-105 hover:shadow-lg
  dark:bg-gray-800/20 dark:border-[#5a6fd1]
`;

const getIconForCourse = (courseId: string) => {
  switch (courseId.toLowerCase()) {
    case "addition":
      return AdditionIcon;
    case "subtraction":
      return SubtractionIcon;
    case "multiplication":
      return MultiplicationIcon;
    case "division":
      return DivisionIcon;
    default:
      return "📚"; // Default fallback
  }
};

const Home = () => {
  const [courseBatches, setCourseBatches] = useState<CourseBatch[]>([]);
  const [courses, setCourses] = useState<{ [courseId: string]: Course }>({}); // Store all fetched courses by their ID for easy lookup
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

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
    return (
      <div className="gap-4 md:gap-5 flex flex-col mt-12 md:mt-20 items-center justify-center">
        {/* Added dark mode support to loading text */}
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">Loading courses...</p>
      </div>
    );
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
    // Main container with bottom padding for mobile navigation bar
    // Added responsive horizontal and vertical padding
    // Added bottom padding to account for mobile nav bar
    <div className="max-w-full md:max-w-5xl lg:max-w-6xl mx-auto px-3 sm:px-4 py-4 md:py-8 pb-24 md:pb-16">
      {/* User stats section with responsive layout */}
      {/* Changed from row to column on mobile for better space usage */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 md:mb-8">
        {/* Responsive heading text with dark mode support */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Learning Areas</h1>
        {/* User stats badges with responsive sizing and spacing */}
        <div className="flex gap-2 md:gap-3 items-center">
          {/* Gems badge with responsive text and padding */}
          <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 md:px-4 md:py-2 rounded-full flex items-center shadow">
            <span className="mr-1 md:mr-2 text-base md:text-lg">💎</span>
            <span className="font-semibold text-sm md:text-base">{user?.gems || 0}</span>
          </div>
          {/* XP badge with responsive text and padding */}
          <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 md:px-4 md:py-2 rounded-full flex items-center shadow">
            <span className="mr-1 md:mr-2 text-base md:text-lg">🏅</span>
            <span className="font-semibold text-sm md:text-base">{user?.xp || 0} XP</span>
          </div>
        </div>
      </div>
      
      {/* Map through course batches with responsive spacing between each batch */}
      {courseBatches.map((batch) => {
        const batchProgress = userProgress.find(p => p.courseBatchId === batch.courseBatchId);
        
        const orderedCoursesToShow = batch.courseList
          .map(courseIdFromList => courses[courseIdFromList])
          .filter(course => course !== undefined);

        return (
          // Batch container with responsive margins, padding and dark mode support
          <div key={batch.courseBatchId} className="mb-6 md:mb-10 bg-white dark:bg-gray-800 shadow-md md:shadow-lg rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 transition-colors duration-300">
            {/* Batch header with responsive layout that stacks on small screens */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 md:mb-5 pb-2 md:pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                {/* Responsive heading text with dark mode support */}
                <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-700 dark:text-white">
                  Stage {batch.stage}
                </h2>
                {/* Lock status badge with responsive text and padding */}
                {!batch.isUnlocked && (
                  <span className="ml-2 md:ml-3 px-2 py-0.5 md:px-3 md:py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs md:text-sm font-medium">
                    🔒 Locked
                  </span>
                )}
                {/* Unlock status badge with responsive text and padding */}
                {batch.isUnlocked && (
                  <span className="ml-2 md:ml-3 px-2 py-0.5 md:px-3 md:py-1 bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-300 rounded-full text-xs md:text-sm font-medium">
                    🔓 Unlocked
                  </span>
                )}
              </div>
              
              {/* Progress bar that has proper responsive width and styling */}
              {batchProgress && batch.isUnlocked && (
                <div className="flex items-center mt-1 sm:mt-0">
                  {/* Progress bar container with responsive width and height */}
                  <div className="w-24 sm:w-28 md:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2 md:h-3 mr-2 md:mr-3">
                    {/* Progress bar fill with responsive height and dark mode support */}
                    <div 
                      className="bg-[#374DB0] dark:bg-[#5a6fd1] h-1.5 sm:h-2 md:h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        width: `${batchProgress.totalCoursesInBatch > 0 ? (batchProgress.completedCoursesCount / batchProgress.totalCoursesInBatch) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  {/* Progress text with responsive size and dark mode support */}
                  <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium">
                    {batchProgress.completedCoursesCount}/{batchProgress.totalCoursesInBatch}
                  </span>
                </div>
              )}
            </div>
            
            {/* Locked stage message with responsive text and padding, and dark mode support */}
            {!batch.isUnlocked && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md md:rounded-lg p-3 md:p-5 text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg">
                  Complete previous stages to unlock this learning area.
                </p>
              </div>
            )}
            
            {/* Course grid with responsive columns and gap */}
            {batch.isUnlocked && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
                {orderedCoursesToShow.map((course) => {
                  const courseSpecificProgress = batchProgress?.courses?.find(c => c.courseId === course.courseId);
                  const isCompleted = courseSpecificProgress?.status === "completed";
                  const isInProgress = courseSpecificProgress?.status === "in_progress" && !isCompleted;
                  
                  return (
                    <div key={course.courseId} className="flex flex-col items-center text-center">
                      {/* Course button with relative positioning for the completion badge */}
                      <NavLink
                        to={`/courses/${course.courseId}`}
                        className={`${ButtonStyle} relative`}
                      >
                        {/* Conditionally render text emoji or SVG icon with responsive sizing */}
                        {typeof getIconForCourse(course.courseId) === 'string' ? (
                          <span 
                            role="img" 
                            aria-label={`${course.title} icon`}
                            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl dark:text-white"
                          >
                            {getIconForCourse(course.courseId)}
                          </span>
                        ) : (
                          <img 
                            src={getIconForCourse(course.courseId)} 
                            alt={`${course.title} icon`}
                            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14"
                          />
                        )}
                        {/* Completion badge with responsive positioning and size */}
                        {isCompleted && (
                          <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-green-500 text-white text-xs rounded-full p-1 leading-none">
                            ✓
                          </span>
                        )}
                      </NavLink>
                      
                      {/* Course title with responsive text size and dark mode support */}
                      <p className="mt-2 md:mt-3 font-medium text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-200">
                        {course.title}
                      </p>
                      {/* In progress badge with responsive text size and dark mode support */}
                      {isInProgress && (
                        <span className="mt-1 inline-block px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                          In Progress
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* No courses message with responsive text, padding, and dark mode support */}
            {batch.isUnlocked && orderedCoursesToShow.length === 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-800/20 rounded-md md:rounded-lg p-3 md:p-5 text-center">
                <p className="text-yellow-700 dark:text-yellow-400 text-sm md:text-base lg:text-lg">
                  No courses available in this learning area yet.
                </p>
              </div>
            )}
          </div>
        );
      })}
      
      {/* No learning areas message with responsive text, padding, and dark mode support */}
      {courseBatches.length === 0 && !loading && (
        <div className="bg-blue-50 dark:bg-blue-800/20 rounded-md md:rounded-lg p-4 md:p-6 lg:p-10 text-center">
          <p className="text-blue-700 dark:text-blue-300 text-base md:text-lg lg:text-xl">
            No learning areas available yet. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;