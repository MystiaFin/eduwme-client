import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import ExitButton from "../components/exitbutton";

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

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Loading course content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-red-600 mb-4">Error: {error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-yellow-600 mb-4">Course not found</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <button
          onClick={() => navigate("/home")}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <span className="mr-2">←</span> Back to Courses
        </button>
        
        <div className="flex items-center gap-4 mb-6">
          {course.logo && (
            <img 
              src={course.logo} 
              alt={`${course.title} logo`} 
              className="w-16 h-16 rounded-full bg-blue-100 p-2"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="text-gray-600">
              Level {course.level} • {exercises.length} Exercises
            </p>
          </div>
        </div>
      </div>

      {/* Display exercises by difficulty level */}
      {Object.keys(exercisesByLevel).length === 0 ? (
        <div className="bg-yellow-100 rounded-xl p-6 text-center">
          <p className="text-yellow-700">
            No exercises available for this course yet.
          </p>
        </div>
      ) : (
        Object.entries(exercisesByLevel)
          .sort(([levelA], [levelB]) => Number(levelA) - Number(levelB))
          .map(([level, levelExercises]) => (
            <div key={level} className="mb-10">
              <h2 className="text-xl font-bold mb-4">
                Level {level} Exercises
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                        p-4 rounded-lg border-2 cursor-pointer
                        ${isCompleted 
                          ? "border-green-400 bg-green-50" 
                          : "border-blue-300 bg-white hover:border-blue-500"}
                        transition-all duration-200
                      `}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{exercise.title}</h3>
                        {isCompleted && (
                          <span className="text-green-500 text-xl">✓</span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {exercise.type} • {exercise.animType}
                      </p>
                      
                      <div className="text-xs bg-gray-100 p-2 rounded">
                        <p className="line-clamp-2">{exercise.question}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
      )}
      <ExitButton />
    </div>
  );
};

export default Course;