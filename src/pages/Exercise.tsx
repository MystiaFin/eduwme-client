import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../AuthContext";

// Debounce utility function - define it before using it
const debounce = <T extends (...args: any[]) => any>(fn: T, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

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

const Exercise = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [exercise, setExercise] = useState<ExerciseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(10); // 10 seconds timer
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null);
  const [completionData, setCompletionData] = useState<CompletionResult | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  
  // Timer configuration
  const TIME_LIMIT = 15; // seconds - can be adjusted
  const timerRef = useRef<number | null>(null);
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Debounced option selection
  // Replace with direct selection instead of using debounce
  const handleOptionSelect = useCallback((option: string) => {
    if (!isTimerRunning || result) return;
    setSelectedOption(option);
  }, [isTimerRunning, result]);

  // Fetch exercise data with rate limit handling
  const fetchExercise = useCallback(async () => {
    if (!exerciseId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/exercises/getExercise/${exerciseId}`, {
        credentials: "include"
      });
      
      if (response.status === 429) {
        setError("Too many requests. Please wait a moment before trying again.");
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch exercise: ${response.status}`);
      }
      
      const data = await response.json();
      setExercise(data.exercise);
      setTimeLeft(TIME_LIMIT); // Reset timer when new exercise loads
      setIsTimerRunning(true);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [exerciseId, API_BASE_URL]);

  // Debounced fetch to prevent rapid API calls
  const debouncedFetch = useCallback(
    debounce(() => {
      fetchExercise();
    }, 500),
    [fetchExercise]
  );

  // Start timer
  useEffect(() => {
    if (loading || !isTimerRunning) return;
    
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
  }, [loading, isTimerRunning, result]);

  // Initial fetch
  useEffect(() => {
    // Use the debounced version if there have been retries
    if (retryCount > 0) {
      debouncedFetch();
    } else {
      fetchExercise();
    }
    
    return () => {
      // Clean up timer when component unmounts
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchExercise, debouncedFetch, retryCount]);


  // Debounced submit function
  const debouncedSubmit = useCallback(() => {
    const submitFn = async () => {
      if (!exercise || !selectedOption || !isTimerRunning) return;
      
      // Stop the timer
      setIsTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      
      const isCorrect = selectedOption === exercise.answer;
      
      if (isCorrect) {
        // Correct answer within time limit
        try {
          if (!user) throw new Error("User not authenticated");
          
          const response = await fetch(
            `${API_BASE_URL}/courses/complete/${user._id}/${exercise.courseBatchId}/${exercise.courseId}/${exercise.exerciseId}`,
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
          message: "Incorrect answer. Try again next time!"
        });
      }
      
      setShowResult(true);
    };
    
    debounce(submitFn, 500)();
  }, [exercise, selectedOption, isTimerRunning, user, API_BASE_URL]);

  // Submit answer handler
  const handleSubmitAnswer = useCallback(() => {
    debouncedSubmit();
  }, [debouncedSubmit]);

  // Return to course page
  const handleReturn = useCallback(() => {
    if (exercise?.courseId) {
      navigate(`/courses/${exercise.courseId}`);
    } else {
      console.log("No courseId found in exercise data, navigating to home.");
    }
  }, [exercise, navigate]);

  // Retry fetch with debounce
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setError(null);
  }, []);

  // Auto-return after showing result
  useEffect(() => {
    if (showResult) {
      const returnTimer = setTimeout(() => {
        handleReturn();
      }, 3000); // Return after 3 seconds of showing result
      
      return () => clearTimeout(returnTimer);
    }
  }, [showResult, handleReturn]);

    // Loading state with responsive sizing and dark mode
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[70vh]">
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">Loading exercise...</p>
        </div>
      );
    }

 // Error state with responsive styling and dark mode
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <p className="text-base md:text-lg text-red-600 dark:text-red-400 mb-3 md:mb-4 text-center">
          Error: {error}
        </p>
        
        {error.includes("Too many requests") && (
          <button
            onClick={handleRetry}
            className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg mb-3 md:mb-4 text-sm md:text-base transition-colors"
          >
            Retry in a moment
          </button>
        )}
        
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-sm md:text-base transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Exercise not found state with responsive styling and dark mode
  if (!exercise) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <p className="text-base md:text-lg text-yellow-600 dark:text-yellow-400 mb-3 md:mb-4 text-center">
          Exercise not found
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-sm md:text-base transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
      // Main container with centered content
    <div className="max-w-full md:max-w-4xl mx-auto px-3 sm:px-4 py-2 md:py-4 transition-colors duration-300 dark:bg-gray-900">
      {/* Use flex with gap instead of justify-between */}
      <div className="flex flex-col gap-2 min-h-[calc(100vh-120px)]">
        {/* Header remains the same */}
        <div className="flex justify-between items-center">
         <button
          onClick={() => navigate(`/courses/${exercise.courseId}`)}
          className="group flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg
            bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30
            border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600
            shadow-sm hover:shadow transition-all duration-200
            text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300
            font-medium text-sm md:text-base"
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
          
          {/* Timer with responsive colors and animation */}
          <div className={`py-0.5 sm:py-1 px-2 sm:px-4 rounded-full font-medium sm:font-bold text-white text-xs sm:text-sm md:text-base
            ${timeLeft > 5 ? 'bg-green-500 dark:bg-green-600' : 
              timeLeft > 2 ? 'bg-yellow-500 dark:bg-yellow-600' : 
              'bg-red-500 dark:bg-red-600 animate-pulse'}`}>
            {timeLeft}s
          </div>
        </div>
        
        {/* Main content with consistent spacing */}
        <div className="text-center">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
            {exercise.title}
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {exercise.type} • Difficulty: {exercise.difficultyLevel}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-2 sm:p-3 transition-colors">
          <p className="text-sm sm:text-base md:text-lg text-gray-800 dark:text-white">
            {exercise.question}
          </p>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-2 sm:p-3 h-24 sm:h-32 md:h-40 flex flex-col items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Animation Area</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Type: {exercise.animType}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {exercise.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              disabled={!isTimerRunning || showResult}
              className={`
                p-2 sm:p-3 rounded-lg border-2 text-left transition-all duration-150 text-sm
                ${selectedOption === option 
                  ? 'bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-700' 
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'}
                ${!isTimerRunning || showResult ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {option}
            </button>
          ))}
        </div>
        
        {/* Submit button right after options with fixed spacing */}
        {!showResult ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedOption || !isTimerRunning || showResult}
            className={`
              w-full py-2 text-sm md:text-base font-medium sm:font-bold rounded-lg transition-colors mt-2
              ${(!selectedOption || !isTimerRunning || showResult)
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-white dark:text-gray-300'
                : 'bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700'}
            `}
          >
            Submit Answer
          </button>
        ) : (
          <div className={`p-2 sm:p-3 text-center rounded-lg mt-2 ${
            result?.correct 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
          }`}>
            <p className="font-bold text-sm sm:text-base">
              {result?.correct ? '✓ Correct!' : '✗ Incorrect!'}
            </p>
            <p className="text-xs sm:text-sm">{result?.message}</p>
            
            {/* XP and rewards - compact display */}
            {completionData && !completionData.alreadyCompleted && (
              <div className="mt-1 font-semibold text-xs flex flex-wrap justify-center gap-2">
                <span>XP: +{completionData.awardedXp}</span>
                {completionData.gems && <span>Gems: +{completionData.gems}</span>}
                <span>Total: {completionData.currentXp} XP</span>
                <span>Level: {completionData.level}</span>
              </div>
            )}
            
            <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
              Returning to course page...
            </p>
          </div>
        )}
        
        {/* Optional spacer div to push content up from bottom */}
        <div className="flex-grow"></div>
      </div>
    </div>
    );
};

export default Exercise;