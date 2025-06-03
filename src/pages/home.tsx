import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import AdditionIcon from "@src/assets/additionIcon.svg";
import SubtractionIcon from "@src/assets/subtractionIcon.svg";
import MultiplicationIcon from "@src/assets/multiplicationIcon.svg";
import DivisionIcon from "@src/assets/divisionIcon.svg";
import ExitButton from "../components/exitbutton";
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

  if (loading) {
    return (
      <div className="gap-5 flex flex-col mt-20 items-center justify-center">
        <p className="text-lg text-gray-600">Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gap-5 flex flex-col mt-20 items-center justify-center">
        <p className="text-lg text-red-600">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User stats */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Learning Areas</h1>
        <div className="flex gap-4 items-center">
          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full flex items-center shadow">
            <span className="mr-2 text-xl">💎</span>
            <span className="font-semibold text-lg">{user?.gems || 0}</span>
          </div>
          <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full flex items-center shadow">
            <span className="mr-2 text-xl">🏅</span>
            <span className="font-semibold text-lg">{user?.xp || 0} XP</span>
          </div>
        </div>
      </div>
      
      {courseBatches.map((batch) => {
        const batchProgress = userProgress.find(p => p.courseBatchId === batch.courseBatchId);
        
        const orderedCoursesToShow = batch.courseList
          .map(courseIdFromList => courses[courseIdFromList]) // Get Course object from the map
          .filter(course => course !== undefined); // Filter out undefined if a courseId wasn't found

        return (
          <div key={batch.courseBatchId} className="mb-12 bg-white shadow-lg rounded-xl p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center">
                <h2 className="text-2xl font-semibold text-gray-700">
                  Stage {batch.stage}
                </h2>
                {!batch.isUnlocked && (
                  <span className="ml-4 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                    🔒 Locked
                  </span>
                )}
                {batch.isUnlocked && (
                  <span className="ml-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    🔓 Unlocked
                  </span>
                )}
              </div>
              
              {batchProgress && batch.isUnlocked && (
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-3 mr-3">
                    <div 
                      className="bg-[#374DB0] h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        width: `${batchProgress.totalCoursesInBatch > 0 ? (batchProgress.completedCoursesCount / batchProgress.totalCoursesInBatch) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {batchProgress.completedCoursesCount}/{batchProgress.totalCoursesInBatch}
                  </span>
                </div>
              )}
            </div>
            
            {!batch.isUnlocked && (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600 text-lg">
                  Complete previous stages to unlock this learning area.
                </p>
              </div>
            )}
            
            {batch.isUnlocked && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {orderedCoursesToShow.map((course) => {
                  const courseSpecificProgress = batchProgress?.courses?.find(c => c.courseId === course.courseId);
                  const isCompleted = courseSpecificProgress?.status === "completed";
                  const isInProgress = courseSpecificProgress?.status === "in_progress" && !isCompleted;
                  
                  return (
                    <div key={course.courseId} className="flex flex-col items-center text-center">
                      <NavLink
                        to={`/courses/${course.courseId}`}
                        className={`${ButtonStyle} relative`} // Added relative for potential badge positioning
                      >
                        {typeof getIconForCourse(course.courseId) === 'string' ? (
                          <span 
                            role="img" 
                            aria-label={`${course.title} icon`}
                            className="text-4xl sm:text-5xl md:text-6xl" // Increased icon size
                          >
                            {getIconForCourse(course.courseId)}
                          </span>
                        ) : (
                          <img 
                            src={getIconForCourse(course.courseId)} 
                            alt={`${course.title} icon`}
                            className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" // Increased icon size
                          />
                        )}
                         {isCompleted && (
                          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full p-1 leading-none">
                            ✓
                          </span>
                        )}
                      </NavLink>
                      
                      <p className="mt-3 font-medium text-sm md:text-base text-gray-700">
                        {course.title}
                      </p>
                      {isInProgress && (
                        <span className="mt-1 inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          In Progress
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {batch.isUnlocked && orderedCoursesToShow.length === 0 && (
              <div className="bg-yellow-50 rounded-lg p-6 text-center">
                <p className="text-yellow-700 text-lg">
                  No courses available in this learning area yet.
                </p>
              </div>
            )}
          </div>
        );
      })}
      
      {courseBatches.length === 0 && !loading && (
        <div className="bg-blue-50 rounded-lg p-10 text-center">
          <p className="text-blue-700 text-xl">
            No learning areas available yet. Check back soon!
          </p>
        </div>
      )}
      
      <ExitButton />
    </div>
  );
};

export default Home;