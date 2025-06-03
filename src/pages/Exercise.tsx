import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import ExitButton from "../components/exitbutton";

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
  const TIME_LIMIT = 10; // seconds - can be adjusted
  const timerRef = useRef<number | null>(null);
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Debounced option selection
  const debouncedSelect = useCallback(
    debounce((option: string) => {
      if (!isTimerRunning || result) return;
      setSelectedOption(option);
    }, 300),
    [isTimerRunning, result]
  );

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

  // Handle option selection
  const handleOptionSelect = useCallback((option: string) => {
    debouncedSelect(option);
  }, [debouncedSelect]);

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

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Loading exercise...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-red-600 mb-4">Error: {error}</p>
        
        {error.includes("Too many requests") && (
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg mb-4"
          >
            Retry in a moment
          </button>
        )}
        
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-yellow-600 mb-4">Exercise not found</p>
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
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header with title and timer */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(`/courses/${exercise.courseId}`)}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <span className="mr-2">←</span> Back to Course
        </button>
        
        <div className={`py-1 px-4 rounded-full font-bold text-white 
          ${timeLeft > 5 ? 'bg-green-500' : timeLeft > 2 ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}>
          {timeLeft}s
        </div>
      </div>
      
      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">{exercise.title}</h1>
        <p className="text-gray-600">
          {exercise.type} • Difficulty: {exercise.difficultyLevel}
        </p>
      </div>
      
      {/* Question */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <p className="text-xl">{exercise.question}</p>
      </div>
      
      {/* Animation Area (Placeholder) */}
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 mb-8 h-64 flex flex-col items-center justify-center">
        <p className="text-gray-500">Animation Area</p>
        <p className="text-sm text-gray-400">Type: {exercise.animType}</p>
      </div>
      
      {/* Options */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exercise.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              disabled={!isTimerRunning || showResult}
              className={`
                p-4 rounded-lg border-2 text-left transition-all duration-150
                ${selectedOption === option 
                  ? 'bg-blue-500 text-white border-blue-600' 
                  : 'bg-white border-gray-300 hover:border-blue-400'}
                ${!isTimerRunning || showResult ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      {/* Result message */}
      {showResult && (
        <div className={`p-4 mb-6 text-center rounded-lg ${
          result?.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <p className="font-bold text-lg mb-1">
            {result?.correct ? '✓ Correct!' : '✗ Incorrect!'}
          </p>
          <p>{result?.message}</p>
          
          {/* Show XP and rewards if available */}
          {completionData && !completionData.alreadyCompleted && (
            <div className="mt-2 font-semibold">
              <p>XP earned: +{completionData.awardedXp}</p>
              {completionData.gems && <p>Gems earned: +{completionData.gems}</p>}
              <p>Total XP: {completionData.currentXp}</p>
              <p>Level: {completionData.level}</p>
            </div>
          )}
          
          <p className="text-sm mt-2">Returning to course page...</p>
        </div>
      )}
      
      {/* Submit Button */}
      {!showResult && (
        <button
          onClick={handleSubmitAnswer}
          disabled={!selectedOption || !isTimerRunning || showResult}
          className={`
            w-full py-3 bg-green-500 text-white font-bold rounded-lg transition-colors
            ${(!selectedOption || !isTimerRunning || showResult)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'hover:bg-green-600'}
          `}
        >
          Submit Answer
        </button>
      )}
      
      <ExitButton />
    </div>
  );
};

export default Exercise;