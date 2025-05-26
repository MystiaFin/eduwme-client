import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import gsap from 'gsap';

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

const Exercise: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);
  const [gemsAwarded, setGemsAwarded] = useState<number | null>(null);
  
  // Animation references
  const animationRef = useRef<HTMLDivElement>(null);
  const animationTimelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // Get userId from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setUserId(decodedToken.id);
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchExercise = async () => {
      if (!exerciseId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`http://localhost:3000/getExercise/${exerciseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch exercise: ${response.status}`);
        }

        const data = await response.json();
        setExercise(data.exercise);
      } catch (err) {
        console.error('Error fetching exercise:', err);
        setError('Failed to load exercise. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId, navigate]);

  // Parse question for animation
  const parseQuestion = (question: string) => {
    // This is a simple parser - enhance based on your question format
    // For example, if questions have the format "What is 5 + 3?"
    const mathRegex = /(\d+)\s*([+\-×÷])\s*(\d+)/;
    const match = question.match(mathRegex);
    
    if (match) {
      return {
        num1: parseInt(match[1]),
        operator: match[2],
        num2: parseInt(match[3])
      };
    }
    
    return { question };
  };

  // Run animations when exercise data is loaded
  useEffect(() => {
    if (!exercise || !animationRef.current) return;

    // Clear any existing animation
    if (animationTimelineRef.current) {
      animationTimelineRef.current.kill();
    }

    const timeline = gsap.timeline();
    animationTimelineRef.current = timeline;
    
    const parsedQuestion = parseQuestion(exercise.question);
    
    // Different animations based on animType
    switch (exercise.animType) {
      case 'addition':
        createAdditionAnimation(timeline, parsedQuestion);
        break;
      case 'subtraction':
        createSubtractionAnimation(timeline, parsedQuestion);
        break;
      case 'multiplication':
        createMultiplicationAnimation(timeline, parsedQuestion);
        break;
      case 'division':
        createDivisionAnimation(timeline, parsedQuestion);
        break;
      default:
        createDefaultAnimation(timeline, exercise.question);
        break;
    }
  }, [exercise]);

  // Animation functions - these will be customized based on your needs
  const createAdditionAnimation = (timeline: gsap.core.Timeline, parsedQuestion: any) => {
    if (!animationRef.current) return;
    
    // Clear animation container
    animationRef.current.innerHTML = '';
    
    // Create elements for animation
    const num1El = document.createElement('div');
    num1El.className = 'text-5xl font-bold';
    num1El.textContent = parsedQuestion.num1.toString();
    
    const operatorEl = document.createElement('div');
    operatorEl.className = 'text-5xl font-bold mx-4';
    operatorEl.textContent = '+';
    
    const num2El = document.createElement('div');
    num2El.className = 'text-5xl font-bold';
    num2El.textContent = parsedQuestion.num2.toString();
    
    const equalsEl = document.createElement('div');
    equalsEl.className = 'text-5xl font-bold mx-4';
    equalsEl.textContent = '=';
    
    const resultEl = document.createElement('div');
    resultEl.className = 'text-5xl font-bold';
    resultEl.textContent = '?';
    
    // Create a container for the equation
    const container = document.createElement('div');
    container.className = 'flex items-center justify-center';
    container.appendChild(num1El);
    container.appendChild(operatorEl);
    container.appendChild(num2El);
    container.appendChild(equalsEl);
    container.appendChild(resultEl);
    
    animationRef.current.appendChild(container);
    
    // Create visual elements for the animation
    const visualContainer = document.createElement('div');
    visualContainer.className = 'flex items-center justify-center mt-8 flex-wrap';
    
    // Create first group of objects
    for (let i = 0; i < parsedQuestion.num1; i++) {
      const obj = document.createElement('div');
      obj.className = 'w-8 h-8 rounded-full bg-blue-500 m-2';
      obj.dataset.group = '1';
      visualContainer.appendChild(obj);
    }
    
    // Create second group of objects
    for (let i = 0; i < parsedQuestion.num2; i++) {
      const obj = document.createElement('div');
      obj.className = 'w-8 h-8 rounded-full bg-green-500 m-2';
      obj.dataset.group = '2';
      obj.style.opacity = '0';
      visualContainer.appendChild(obj);
    }
    
    animationRef.current.appendChild(visualContainer);
    
    // Animate the objects
    timeline
      .from(num1El, { opacity: 0, x: -50, duration: 0.5 })
      .from(operatorEl, { opacity: 0, y: -20, duration: 0.3 })
      .from(num2El, { opacity: 0, x: 50, duration: 0.5 })
      .from(equalsEl, { opacity: 0, y: 20, duration: 0.3 })
      .from(resultEl, { opacity: 0, x: 50, duration: 0.5 })
      .from('[data-group="1"]', { scale: 0, stagger: 0.05, duration: 0.3 })
      .to('[data-group="2"]', { opacity: 1, stagger: 0.05, duration: 0.3 });
  };

  const createSubtractionAnimation = (timeline: gsap.core.Timeline, parsedQuestion: any) => {
    if (!animationRef.current) return;
    
    // Similar structure as addition but with different visual representation
    animationRef.current.innerHTML = '';
    
    // Create equation elements
    const equationContainer = document.createElement('div');
    equationContainer.className = 'flex items-center justify-center';
    
    const num1El = document.createElement('div');
    num1El.className = 'text-5xl font-bold';
    num1El.textContent = parsedQuestion.num1.toString();
    
    const operatorEl = document.createElement('div');
    operatorEl.className = 'text-5xl font-bold mx-4';
    operatorEl.textContent = '-';
    
    const num2El = document.createElement('div');
    num2El.className = 'text-5xl font-bold';
    num2El.textContent = parsedQuestion.num2.toString();
    
    const equalsEl = document.createElement('div');
    equalsEl.className = 'text-5xl font-bold mx-4';
    equalsEl.textContent = '=';
    
    const resultEl = document.createElement('div');
    resultEl.className = 'text-5xl font-bold';
    resultEl.textContent = '?';
    
    equationContainer.appendChild(num1El);
    equationContainer.appendChild(operatorEl);
    equationContainer.appendChild(num2El);
    equationContainer.appendChild(equalsEl);
    equationContainer.appendChild(resultEl);
    
    animationRef.current.appendChild(equationContainer);
    
    // Create visual elements
    const visualContainer = document.createElement('div');
    visualContainer.className = 'flex items-center justify-center mt-8 flex-wrap';
    
    // Create all objects (num1 total)
    for (let i = 0; i < parsedQuestion.num1; i++) {
      const obj = document.createElement('div');
      obj.className = 'w-8 h-8 rounded-full bg-blue-500 m-2';
      obj.dataset.remove = i < parsedQuestion.num2 ? 'yes' : 'no';
      visualContainer.appendChild(obj);
    }
    
    animationRef.current.appendChild(visualContainer);
    
    // Animate
    timeline
      .from(num1El, { opacity: 0, x: -50, duration: 0.5 })
      .from(operatorEl, { opacity: 0, y: -20, duration: 0.3 })
      .from(num2El, { opacity: 0, x: 50, duration: 0.5 })
      .from(equalsEl, { opacity: 0, y: 20, duration: 0.3 })
      .from(resultEl, { opacity: 0, x: 50, duration: 0.5 })
      .from('[data-remove]', { scale: 0, stagger: 0.05, duration: 0.3 })
      .to('[data-remove="yes"]', { 
        opacity: 0.3, 
        backgroundColor: '#EF4444', 
        stagger: 0.05, 
        duration: 0.3,
        delay: 1 
      });
  };

  const createMultiplicationAnimation = (timeline: gsap.core.Timeline, parsedQuestion: any) => {
    if (!animationRef.current) return;
    
    animationRef.current.innerHTML = '';
    
    // Create equation display
    const equationContainer = document.createElement('div');
    equationContainer.className = 'flex items-center justify-center';
    
    const num1El = document.createElement('div');
    num1El.className = 'text-5xl font-bold';
    num1El.textContent = parsedQuestion.num1.toString();
    
    const operatorEl = document.createElement('div');
    operatorEl.className = 'text-5xl font-bold mx-4';
    operatorEl.textContent = '×';
    
    const num2El = document.createElement('div');
    num2El.className = 'text-5xl font-bold';
    num2El.textContent = parsedQuestion.num2.toString();
    
    const equalsEl = document.createElement('div');
    equalsEl.className = 'text-5xl font-bold mx-4';
    equalsEl.textContent = '=';
    
    const resultEl = document.createElement('div');
    resultEl.className = 'text-5xl font-bold';
    resultEl.textContent = '?';
    
    equationContainer.appendChild(num1El);
    equationContainer.appendChild(operatorEl);
    equationContainer.appendChild(num2El);
    equationContainer.appendChild(equalsEl);
    equationContainer.appendChild(resultEl);
    
    animationRef.current.appendChild(equationContainer);
    
    // Create a grid visualization for multiplication
    const gridContainer = document.createElement('div');
    gridContainer.className = 'mt-8 inline-grid gap-2';
    gridContainer.style.gridTemplateColumns = `repeat(${parsedQuestion.num2}, minmax(0, 1fr))`;
    
    // Create grid of objects
    for (let i = 0; i < parsedQuestion.num1 * parsedQuestion.num2; i++) {
      const obj = document.createElement('div');
      obj.className = 'w-8 h-8 rounded-full bg-purple-500';
      obj.style.opacity = '0';
      gridContainer.appendChild(obj);
    }
    
    const gridWrapper = document.createElement('div');
    gridWrapper.className = 'flex justify-center';
    gridWrapper.appendChild(gridContainer);
    
    animationRef.current.appendChild(gridWrapper);
    
    // Animate
    timeline
      .from(num1El, { opacity: 0, x: -50, duration: 0.5 })
      .from(operatorEl, { opacity: 0, y: -20, duration: 0.3 })
      .from(num2El, { opacity: 0, x: 50, duration: 0.5 })
      .from(equalsEl, { opacity: 0, y: 20, duration: 0.3 })
      .from(resultEl, { opacity: 0, x: 50, duration: 0.5 })
      .to(gridContainer.children, { 
        opacity: 1, 
        stagger: { 
          each: 0.05,
          grid: [parsedQuestion.num1, parsedQuestion.num2],
          from: "start"
        }, 
        duration: 0.2
      });
  };

  const createDivisionAnimation = (timeline: gsap.core.Timeline, parsedQuestion: any) => {
    if (!animationRef.current) return;
    
    animationRef.current.innerHTML = '';
    
    // Create equation display
    const equationContainer = document.createElement('div');
    equationContainer.className = 'flex items-center justify-center';
    
    const num1El = document.createElement('div');
    num1El.className = 'text-5xl font-bold';
    num1El.textContent = parsedQuestion.num1.toString();
    
    const operatorEl = document.createElement('div');
    operatorEl.className = 'text-5xl font-bold mx-4';
    operatorEl.textContent = '÷';
    
    const num2El = document.createElement('div');
    num2El.className = 'text-5xl font-bold';
    num2El.textContent = parsedQuestion.num2.toString();
    
    const equalsEl = document.createElement('div');
    equalsEl.className = 'text-5xl font-bold mx-4';
    equalsEl.textContent = '=';
    
    const resultEl = document.createElement('div');
    resultEl.className = 'text-5xl font-bold';
    resultEl.textContent = '?';
    
    equationContainer.appendChild(num1El);
    equationContainer.appendChild(operatorEl);
    equationContainer.appendChild(num2El);
    equationContainer.appendChild(equalsEl);
    equationContainer.appendChild(resultEl);
    
    animationRef.current.appendChild(equationContainer);
    
    // Create visual elements showing groups
    const visualContainer = document.createElement('div');
    visualContainer.className = 'mt-8 flex flex-wrap justify-center';
    
    // Calculate how many full groups and remainder
    const quotient = Math.floor(parsedQuestion.num1 / parsedQuestion.num2);
    const total = parsedQuestion.num1;
    
    // Create total number of objects
    for (let i = 0; i < total; i++) {
      const obj = document.createElement('div');
      obj.className = 'w-8 h-8 rounded-full bg-blue-500 m-2';
      // Assign group number
      const groupNum = Math.floor(i / parsedQuestion.num2);
      obj.dataset.group = groupNum.toString();
      visualContainer.appendChild(obj);
    }
    
    animationRef.current.appendChild(visualContainer);
    
    // Animate
    timeline
      .from(num1El, { opacity: 0, x: -50, duration: 0.5 })
      .from(operatorEl, { opacity: 0, y: -20, duration: 0.3 })
      .from(num2El, { opacity: 0, x: 50, duration: 0.5 })
      .from(equalsEl, { opacity: 0, y: 20, duration: 0.3 })
      .from(resultEl, { opacity: 0, x: 50, duration: 0.5 })
      .from('[data-group]', { scale: 0, stagger: 0.03, duration: 0.3 })
      // Highlight different groups with different colors
      .to('[data-group="0"]', { backgroundColor: '#EC4899', stagger: 0.05, delay: 0.5 })
      .to('[data-group="1"]', { backgroundColor: '#8B5CF6', stagger: 0.05 })
      .to('[data-group="2"]', { backgroundColor: '#3B82F6', stagger: 0.05 })
      .to('[data-group="3"]', { backgroundColor: '#10B981', stagger: 0.05 })
      .to('[data-group="4"]', { backgroundColor: '#F59E0B', stagger: 0.05 });
  };

  const createDefaultAnimation = (timeline: gsap.core.Timeline, question: string) => {
    if (!animationRef.current) return;
    
    animationRef.current.innerHTML = '';
    
    const textEl = document.createElement('div');
    textEl.className = 'text-3xl text-center font-bold';
    textEl.textContent = question;
    
    animationRef.current.appendChild(textEl);
    
    timeline.from(textEl, { y: 50, opacity: 0, duration: 0.8, ease: "back.out(1.7)" });
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setFeedback(null);
  };

  const handleSubmit = async () => {
    if (!selectedOption || !exercise || isSubmitting) return;
    
    setIsSubmitting(true);
    
    const isCorrect = selectedOption === exercise.answer;
    
    if (isCorrect) {
      setFeedback({
        isCorrect: true,
        message: 'Correct answer! Well done!'
      });
      
      try {
        const token = localStorage.getItem('token');
        if (!token || !userId) {
          setError('Authentication error. Please log in again.');
          setIsSubmitting(false);
          return;
        }
        
        const response = await fetch(
          `http://localhost:3000/complete/${userId}/${exercise.courseBatchId}/${exercise.courseId}/${exercise.exerciseId}`, 
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update UI with rewards
        setXpAwarded(data.awardedXp);
        setGemsAwarded(data.awardedGems);
        
      } catch (err) {
        console.error('Error updating progress:', err);
        setError('Failed to update progress. Your answer was correct, but we could not save your progress.');
      }
    } else {
      setFeedback({
        isCorrect: false,
        message: 'Incorrect answer. Try again!'
      });
    }
    
    setIsSubmitting(false);
  };

  const handleContinue = () => {
    if (feedback?.isCorrect) {
      // Navigate back to the course page
      navigate(`/course/${exercise?.courseId}`);
    } else {
      // Reset feedback and allow trying again
      setFeedback(null);
      setSelectedOption(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-gray-700 hover:text-gray-900"
            >
              <HiArrowLeft className="h-5 w-5 mr-1" />
              Back
            </button>
            {exercise && (
              <h1 className="text-lg font-medium text-gray-900">
                Exercise: {exercise.title}
              </h1>
            )}
            <div></div> {/* Empty div for flex spacing */}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-grow flex flex-col items-center justify-between p-4 md:p-8">
        {loading ? (
          <div className="flex-grow flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex-grow flex justify-center items-center">
            <div className="bg-red-50 p-6 rounded-lg text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : exercise ? (
          <>
            {/* Question section */}
            <div className="w-full max-w-3xl">
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl text-center font-semibold text-gray-800 mb-2">
                  {exercise.question}
                </h2>
                <p className="text-sm text-center text-gray-500">
                  {exercise.type} • Difficulty: {exercise.difficultyLevel}
                </p>
              </div>
            </div>
            
            {/* Animation section */}
            <div 
              ref={animationRef} 
              className="flex-grow w-full max-w-3xl flex justify-center items-center bg-white rounded-lg shadow-md p-6 mb-8"
              style={{ minHeight: '240px' }}
            >
              {/* Animation will be rendered here by GSAP */}
            </div>
            
            {/* Answer options section */}
            <div className="w-full max-w-3xl">
              {feedback ? (
                <div 
                  className={`p-6 rounded-lg shadow-md text-center mb-8 ${
                    feedback.isCorrect ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex justify-center mb-4">
                    {feedback.isCorrect ? (
                      <HiCheckCircle className="h-12 w-12 text-green-500" />
                    ) : (
                      <HiXCircle className="h-12 w-12 text-red-500" />
                    )}
                  </div>
                  <p className={`text-lg font-medium ${feedback.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {feedback.message}
                  </p>
                  
                  {feedback.isCorrect && xpAwarded !== null && (
                    <div className="mt-4 p-3 bg-blue-100 rounded-md inline-block">
                      <p className="text-blue-800 font-medium">Rewards:</p>
                      <div className="flex justify-center space-x-4 mt-2">
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">⭐</span>
                          <span className="font-bold">{xpAwarded} XP</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-red-500 mr-1">💎</span>
                          <span className="font-bold">{gemsAwarded} Gems</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleContinue}
                    className={`mt-4 px-6 py-2 rounded-md text-white font-medium ${
                      feedback.isCorrect ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {feedback.isCorrect ? 'Continue' : 'Try Again'}
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Select the correct answer:
                  </h3>
                  
                  <div className="space-y-3">
                    {exercise.options?.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleOptionSelect(option)}
                        className={`w-full p-4 text-left rounded-lg transition-colors ${
                          selectedOption === option
                            ? 'bg-blue-100 border-2 border-blue-500'
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        <span className="font-medium">{option}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSubmit}
                      disabled={!selectedOption || isSubmitting}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Checking...' : 'Submit Answer'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Exercise;