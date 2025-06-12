import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../AuthContext";
import ExerciseAnimation from "@src/components/ExerciseAnimation";
import LoadingPage from "@src/components/loading";

// Define interfaces for our data
interface ExerciseData {
  _id: string;
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

interface CompletionResult {
  message: string;
  awardedXp: number;
  currentXp: number;
  level: number;
  gems?: number;
  alreadyCompleted: boolean;
  exerciseStatus: {
    courseBatchId: string;
    courseId: string;
    exerciseId: string;
    status: string;
  };
  courseProgress: number;
}

const AutoExercise = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [allExercises, setAllExercises] = useState<ExerciseData[]>([]);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [currentExercise, setCurrentExercise] = useState<ExerciseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(10); // 10 seconds timer
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null);
  const [completionData, setCompletionData] = useState<CompletionResult | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [allCompleted, setAllCompleted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const MAX_TIME: number = 50;
  
  // Timer configuration - dynamic based on difficulty
  const timeLimit = useMemo(() => {
    // Base time: 60 seconds for level 1, decreasing by 10 seconds per level
    // Min time: 20 seconds for hardest exercises
    return Math.max(MAX_TIME - ((currentExercise?.difficultyLevel || 1) - 1) * 10, 20);
  }, [currentExercise?.difficultyLevel]);
  
  const timerRef = useRef<number | null>(null);
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Fetch all exercises for the course
  const fetchCourseExercises = useCallback(async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      
      // Step 1: Fetch course details to get exerciseBatchList
      const courseResponse = await fetch(
        `${API_BASE_URL}/courses/getCoursesById/${courseId}`,
        { credentials: "include" }
      );

      if (!courseResponse.ok) {
        throw new Error(`Failed to fetch course: ${courseResponse.status}`);
      }

      const courseData = await courseResponse.json();
      const course = courseData.course;
      
      // Step 2: Fetch exercises from the batch list
      const exercisePromises = course.exerciseBatchList.map(
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
        (exercise): exercise is ExerciseData => exercise !== null
      );
      
      setAllExercises(fetchedExercises);
      
      // Step 3: Get user progress to identify completed exercises
      if (user) {
        const userResponse = await fetch(`${API_BASE_URL}/users/getme`, {
          credentials: "include"
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const batchProgress = userData.courseBatchesProgress?.find(
            (batch: any) => batch.courseBatchId === course.courseBatchId
          );
          
          const currentCourseProgress = batchProgress?.courses?.find(
            (c: any) => c.courseId === courseId
          );
          
          if (currentCourseProgress?.exercises) {
            const completedExerciseIds = new Set<string>(
              currentCourseProgress.exercises
                .filter((ex: any) => ex.status === "completed")
                .map((ex: any) => ex.exerciseId as string)
            );
            setCompletedExercises(completedExerciseIds);
            
            // Update progress
            setProgress(completedExerciseIds.size / fetchedExercises.length);
          }
        }
      }
      
      setError(null);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setLoading(false);
    }
  }, [courseId, user, API_BASE_URL]);

  // Select a random uncompleted exercise
  const selectNextExercise = useCallback(() => {
    // Filter out completed exercises
    const remainingExercises = allExercises.filter(
      exercise => !completedExercises.has(exercise.exerciseId)
    );
    
    if (remainingExercises.length === 0) {
      // All exercises completed
      setAllCompleted(true);
      setCurrentExercise(null);
      return;
    }
    
    // Select a random exercise from remaining ones
    const randomIndex = Math.floor(Math.random() * remainingExercises.length);
    const selectedExercise = remainingExercises[randomIndex];
    
    // Reset exercise-specific state
    setCurrentExercise(selectedExercise);
    setSelectedOption(null);
    setTextAnswer("");
    setResult(null);
    setCompletionData(null);
    setShowResult(false);
    setTimeLeft(timeLimit);
    setIsTimerRunning(true);
  }, [allExercises, completedExercises, timeLimit]);

  // Initial fetch and setup
  useEffect(() => {
    fetchCourseExercises();
    
    return () => {
      // Clean up timer when component unmounts
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchCourseExercises]);

  // Select first exercise when data is loaded
  useEffect(() => {
    if (!loading && allExercises.length > 0 && !currentExercise) {
      selectNextExercise();
    }
  }, [loading, allExercises, currentExercise, selectNextExercise]);

  // Handle option selection
  const handleOptionSelect = useCallback((option: string) => {
    if (!isTimerRunning || result) return;
    setSelectedOption(option);
  }, [isTimerRunning, result]);

  // Handle text input for fill-in exercises
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isTimerRunning || result) return;
    setTextAnswer(e.target.value);
  }, [isTimerRunning, result]);

  // Timer logic
  useEffect(() => {
    if (loading || !isTimerRunning || !currentExercise) return;
    
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current!);
          setIsTimerRunning(false);
          
          // Time's up logic
          if (!result) {
            setResult({
              correct: false,
              message: "Time's up! You didn't answer in time."
            });
            setShowResult(true);
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, isTimerRunning, result, currentExercise]);

  // Submit answer
  const handleSubmitAnswer = useCallback(() => {
    if (!currentExercise || !isTimerRunning) return;
    
    // For multiple-choice, we need selectedOption. For fill-in, we need textAnswer
    if (currentExercise.type === 'multiple-choice' && !selectedOption) return;
    if (currentExercise.type === 'fill-in' && !textAnswer.trim()) return;
    
    // Stop the timer immediately to prevent multiple submissions
    setIsTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    const submitFn = async () => {
      const isCorrect = currentExercise.type === 'multiple-choice'
        ? selectedOption === currentExercise.answer
        : textAnswer.trim().toLowerCase() === currentExercise.answer.toLowerCase(); // Case insensitive comparison
      
      if (isCorrect) {
        // Correct answer within time limit
        try {
          if (!user) throw new Error("User not authenticated");
          
          const response = await fetch(
            `${API_BASE_URL}/courses/complete/${user._id}/${currentExercise.courseBatchId}/${currentExercise.courseId}/${currentExercise.exerciseId}`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json"
              }
            }
          );
          
          if (response.status === 429) {
            setResult({
              correct: true,
              message: "Correct! But we're experiencing high traffic. Your progress will be saved later."
            });
            setShowResult(true);
            return;
          }
          
          if (!response.ok) {
            throw new Error(`Failed to record completion: ${response.status}`);
          }
          
          const completionResult = await response.json();
          setCompletionData(completionResult);
          
          // Add to completed exercises
          setCompletedExercises(prev => {
            const updated = new Set(prev);
            updated.add(currentExercise.exerciseId);
            return updated;
          });
          
          // Update progress
          setProgress(prev => {
            const newProgress = (completedExercises.size + 1) / allExercises.length;
            return Math.min(newProgress, 1);
          });
          
          setResult({
            correct: true,
            message: `Correct! ${completionResult.alreadyCompleted 
              ? "You've already completed this exercise before." 
              : `You earned ${completionResult.awardedXp} XP!`}`
          });
        } catch (err) {
          setResult({
            correct: true,
            message: "Correct! But there was an error recording your progress."
          });
          console.error("Error recording completion:", err);
        }
      } else {
        // Incorrect answer
        setResult({
          correct: false,
          message: "Incorrect answer. Let's try another exercise!"
        });
      }
      
      setShowResult(true);
    };
    
    // Execute immediately
    submitFn();
    
  }, [currentExercise, selectedOption, textAnswer, isTimerRunning, user, API_BASE_URL, allExercises.length, completedExercises]);

  // Auto-move to next exercise after showing result
  useEffect(() => {
    if (showResult) {
      const nextExerciseTimer = setTimeout(() => {
        selectNextExercise();
      }, 2000); // Go to next exercise after 2 seconds
      
      return () => clearTimeout(nextExerciseTimer);
    }
  }, [showResult, selectNextExercise]);

  // Return to course page
  const handleReturn = useCallback(() => {
    if (courseId) {
      navigate(`/courses/${courseId}`);
    } else {
      navigate("/home");
    }
  }, [courseId, navigate]);

  // Loading state
  if (loading) {
    return <LoadingPage message="Loading auto exercise mode..." fullScreen={false} />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-3">
        <p className="text-sm md:text-base text-red-600 dark:text-red-400 mb-2 md:mb-3 text-center">
          Error: {error}
        </p>
        <button
          onClick={handleReturn}
          className="px-2 py-1 md:px-3 md:py-1.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-xs md:text-sm transition-colors"
        >
          Return to Course
        </button>
      </div>
    );
  }

  // All exercises completed state
  if (allCompleted) {
    return (
      <div className="max-w-full md:max-w-3xl mx-auto px-2 sm:px-3 py-1 md:py-3 transition-colors duration-300 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-3 text-center gap-4">
          <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-xl">
            <h2 className="text-xl md:text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
              🎉 Congratulations! 🎉
            </h2>
            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
              You've completed all exercises in this course!
            </p>
            <button
              onClick={handleReturn}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg text-sm md:text-base transition-colors"
            >
              Return to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No exercises available
  if (allExercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-3">
        <p className="text-sm md:text-base text-yellow-600 dark:text-yellow-400 mb-2 md:mb-3 text-center">
          No exercises available for this course
        </p>
        <button
          onClick={handleReturn}
          className="px-2 py-1 md:px-3 md:py-1.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-xs md:text-sm transition-colors"
        >
          Return to Course
        </button>
      </div>
    );
  }

  // Current exercise not found (shouldn't happen, but as a safeguard)
  if (!currentExercise) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-3">
        <p className="text-sm md:text-base text-yellow-600 dark:text-yellow-400 mb-2 md:mb-3 text-center">
          No exercise available to display
        </p>
        <button
          onClick={handleReturn}
          className="px-2 py-1 md:px-3 md:py-1.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-xs md:text-sm transition-colors"
        >
          Return to Course
        </button>
      </div>
    );
  }

  return (
    // Main container with centered content
    <div className="max-w-full md:max-w-3xl mx-auto px-2 sm:px-3 py-1 md:py-3 transition-colors duration-300 dark:bg-gray-900">
      {/* Reduced gap and min-height */}
      <div className="flex flex-col gap-1 sm:gap-2 min-h-[calc(100vh-100px)]">
        {/* Header with smaller buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleReturn}
            className="group flex items-center gap-1 px-2 py-1 md:px-4 md:py-2 rounded-lg
              bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30
              border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600
              shadow-sm hover:shadow transition-all duration-200
              text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300
              font-medium text-xs md:text-base"
            aria-label="Return to course page"
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
            Back to Course
          </button>
          
          {/* Progress indicator */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {Math.round(progress * 100)}% Complete
              </span>
              <div className="py-0.5 sm:py-1 px-2 sm:px-4 rounded-full font-medium sm:font-bold text-white text-xs sm:text-sm md:text-base
                ${timeLeft > 5 ? 'bg-green-500 dark:bg-green-600' : 
                  timeLeft > 2 ? 'bg-yellow-500 dark:bg-yellow-600' : 
                  'bg-red-500 dark:bg-red-600 animate-pulse'}">
                {timeLeft}s
              </div>
            </div>
            <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
              <div 
                className="h-full bg-blue-500 dark:bg-blue-600 rounded-full"
                style={{ width: `${progress * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Main content with reduced spacing */}
        <div className="text-center">
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white">
            {currentExercise.title}
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {currentExercise.type} • Difficulty: {currentExercise.difficultyLevel}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-1.5 sm:p-3 transition-colors">
          <p className="text-xs sm:text-sm md:text-base text-gray-800 dark:text-white">
            {currentExercise.question}
          </p>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-1.5 sm:p-3 min-h-[6rem] sm:min-h-[8rem] md:min-h-[10rem] flex flex-col items-center justify-center overflow-auto">
          {currentExercise.animType ? (
            <ExerciseAnimation 
              animType={currentExercise.animType} 
              question={currentExercise.question} 
            />
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">No animation for this exercise</p>
          )}
        </div>
          
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {currentExercise.type === 'multiple-choice' ? (
            currentExercise.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option)}
                disabled={!isTimerRunning || showResult}
                className={`
                  p-2 sm:p-2.5 rounded-lg border text-left transition-all duration-150 text-xs sm:text-sm
                  flex items-center min-h-[2.75rem] sm:min-h-[3rem]
                  ${selectedOption === option 
                    ? 'bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-700' 
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'}
                  ${!isTimerRunning || showResult ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {option}
              </button>
            ))
          ) : (
            <div className="col-span-2">
              <input
                type="text"
                value={textAnswer}
                onChange={handleTextChange}
                disabled={!isTimerRunning || showResult}
                placeholder="Type your answer here..."
                className={`
                  w-full p-2 sm:p-2.5 rounded-lg border text-xs sm:text-sm
                  min-h-[2.75rem] sm:min-h-[3rem]
                  bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 
                  focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800
                  ${!isTimerRunning || showResult ? 'opacity-70 cursor-not-allowed' : ''}
                `}
              />
            </div>
          )}
        </div>
        
        {/* Submit button right after options with fixed spacing */}
        {!showResult ? (
           <button
            onClick={handleSubmitAnswer}
            disabled={
              (currentExercise.type === 'multiple-choice' && !selectedOption) || 
              (currentExercise.type === 'fill-in' && !textAnswer.trim()) || 
              !isTimerRunning || 
              showResult
            }
            className={`
              w-full py-1.5 sm:py-2 text-xs sm:text-sm md:text-base font-medium rounded-lg transition-colors mt-1.5 sm:mt-2
              ${((currentExercise.type === 'multiple-choice' && !selectedOption) || 
                (currentExercise.type === 'fill-in' && !textAnswer.trim()) || 
                !isTimerRunning || 
                showResult)
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-white dark:text-gray-300'
                : 'bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700'}
            `}
          >
            Submit Answer
          </button>
        ) : (
          <div className={`p-1.5 sm:p-2.5 text-center rounded-lg mt-1.5 sm:mt-2 ${
            result?.correct 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
          }`}>
            <p className="font-bold text-xs sm:text-sm">
              {result?.correct ? '✓ Correct!' : '✗ Incorrect!'}
            </p>
            <p className="text-[10px] sm:text-xs">{result?.message}</p>
            
            {/* XP and rewards - even more compact */}
            {completionData && !completionData.alreadyCompleted && (
              <div className="mt-0.5 sm:mt-1 font-semibold text-[10px] sm:text-xs flex flex-wrap justify-center gap-1 sm:gap-2">
                <span>XP: +{completionData.awardedXp}</span>
                {completionData.gems && <span>Gems: +{completionData.gems}</span>}
                <span>Total: {completionData.currentXp} XP</span>
                <span>Level: {completionData.level}</span>
              </div>
            )}
            
            <p className="text-[10px] mt-0.5 sm:mt-1 text-gray-600 dark:text-gray-400">
              Loading next exercise...
            </p>
          </div>
        )}
        
        {/* Optional spacer div to push content up from bottom */}
        <div className="flex-grow"></div>
      </div>
    </div>
  );
};

export default AutoExercise;