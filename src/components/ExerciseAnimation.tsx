import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


interface ExerciseAnimationProps {
  animType: string;
  question: string;
}

interface AnimationState {
  isAnimating: boolean;
  currentStep: number;
  answer: string | null;
}

const ExerciseAnimation: React.FC<ExerciseAnimationProps> = ({ animType, question }) => {
  const [animationState, setAnimationState] = useState<AnimationState>({
    isAnimating: false,
    currentStep: 0,
    answer: null
  });
  const hasInitialized = useRef(false);

    // Update useEffect to only run once
    useEffect(() => {
      if (!hasInitialized.current && (animType === 'blocks' || animType === 'numbers' || animType === 'numLine' || animType === 'storyAdd' || animType === 'storyMinus' || animType === 'storyMultiply' || 
       animType === 'storyDiv') && question) {
        hasInitialized.current = true;
        // Small delay to ensure component is mounted
        const timer = setTimeout(() => {
          setAnimationState({ isAnimating: true, currentStep: 0, answer: null });
          startAnimation();
        }, 500);
        return () => clearTimeout(timer);
      }
    }, [animType, question]);

  const startAnimation = useCallback(() => {
    // For numbers/numLine animation type, just set that we're ready to animate
    if (animType === 'numbers' || animType === 'numLine' || animType === 'storyAdd' || 
      animType === 'storyMinus' || animType === 'storyMultiply' ||
      animType === 'storyDiv') {
      setAnimationState(prev => ({
        ...prev,
        isAnimating: true
      }));
      return;
    }
    
    // Below here is only for 'blocks' animation
    const questionLower = question.toLowerCase().trim();
    
    // Handle addition and subtraction
    if (questionLower.includes('+')) {
      animateAddition(questionLower);
      return;
    }
    
    if (questionLower.includes('-')) {
      animateSubtraction(questionLower);
      return;
    }
    
    // Handle "show number" commands
    if (questionLower.includes('show') && questionLower.includes('number')) {
      const match = questionLower.match(/\d+/);
      if (match) {
        animateNumber(parseInt(match[0]));
        return;
      }
    }
    
    // Handle place value as default for other cases
    animatePlaceValue(questionLower);
    
  }, [animType, question]);

  const animatePlaceValue = (problem: string) => {
    // More flexible regex that captures a single digit and any number
    // This will work with various phrasings like:
    // - "digit 5 in 123"
    // - "5 is the tens digit of 123"
    // - "what is the value of 5 in 123"
    const matches = problem.match(/(\d).*?(\d{2,})/);
    if (!matches) return;

    const digit: number = parseInt(matches[1]);
    const number = matches[2];
    
    // Check all occurrences of the digit in the number
    let digitFound = false;
    let position = -1;
    let placeValue = 0;
    
    // Loop through the number to find the digit
    for (let i = 0; i < number.length; i++) {
      if (number[i] === digit.toString()) {
        digitFound = true;
        position = number.length - i - 1;
        placeValue = digit * Math.pow(10, position);
        break; // Use the first occurrence by default
      }
    }
    
    if (!digitFound) {
      setAnimationState(prev => ({ ...prev, answer: `The digit ${digit} is not in ${number}` }));
      return;
    }
    
    setAnimationState(prev => ({ 
      ...prev, 
      answer: `The digit ${digit} is in the ${getPlaceName(position)} place and has a value of ${placeValue}` 
    }));
  };

  const animateNumber = (number: number) => {
    setAnimationState(prev => ({ 
      ...prev, 
      answer: `Showing the number ${number}` 
    }));
  };

  const animateAddition = (problem: string) => {
    const match = problem.match(/(\d+)\s*\+\s*(\d+)/);
    if (!match) return;
    
    const num1 = parseInt(match[1]);
    const num2 = parseInt(match[2]);
    const sum = num1 + num2;
    
    setAnimationState(prev => ({ 
      ...prev, 
      answer: `${num1} + ${num2} = ${sum}` 
    }));
  };

  const animateSubtraction = (problem: string) => {
    const match = problem.match(/(\d+)\s*-\s*(\d+)/);
    if (!match) return;
    
    const num1 = parseInt(match[1]);
    const num2 = parseInt(match[2]);
    const diff = num1 - num2;
    
    setAnimationState(prev => ({ 
      ...prev, 
      answer: `${num1} - ${num2} = ${diff}` 
    }));
  };

  const getPlaceName = (position: number): string => {
    const names = ['ones', 'tens', 'hundreds', 'thousands'];
    return names[position] || `10^${position}`;
  };

  const createPlaceValueBlocks = (question: string) => {
    // Simplified regex that finds any two numbers in the question
    const matches = question.match(/(\d+).*?(\d+)/);
    if (!matches) return null;
    
    // Extract the two numbers
    const firstNum = matches[1];
    const secondNum = matches[2];
    
    // Determine which is the digit and which is the full number
    let targetDigit: number;
    let number: string;
    
    if (firstNum.length === 1 && secondNum.length > 1) {
      targetDigit = parseInt(firstNum);
      number = secondNum;
    } else if (secondNum.length === 1 && firstNum.length > 1) {
      targetDigit = parseInt(secondNum);
      number = firstNum;
    } else {
      targetDigit = parseInt(firstNum);
      number = secondNum;
    }
    
    const digits = number.split('').reverse();
    
    return (
      <div className="flex flex-col items-center gap-4">
        {/* Number display */}
        <div className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
          {number}
        </div>
        
        {/* Place value sections */}
        <div className="flex flex-wrap gap-6 justify-center items-end">
          {digits.map((digit, position) => {
            const digitValue = parseInt(digit);
            if (digitValue === 0) return null;
            
            const isTarget = digitValue === targetDigit && 
              number.split('').findIndex(d => d === digit.toString()) === number.length - position - 1;
            
            return (
              <PlaceValueSection
                key={position}
                digit={digitValue}
                position={position}
                isHighlighted={isTarget}
                delay={position * 300}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const createNumberBlocks = (question: string) => {
    const match = question.match(/\d+/);
    if (!match) return null;
    
    const number = match[0];
    const digits = number.split('').reverse();
    
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
          {number}
        </div>
        
        <div className="flex flex-wrap gap-6 justify-center items-end">
          {digits.map((digit, position) => {
            const digitValue = parseInt(digit);
            if (digitValue === 0) return null;
            
            return (
              <PlaceValueSection
                key={position}
                digit={digitValue}
                position={position}
                isHighlighted={false}
                delay={position * 400}
              />
            );
          })}
        </div>
      </div>
    );
  };

  
  if (animType !== 'blocks' && animType !== 'numbers' && animType !== 'numLine' && animType !== 'storyAdd' && 
    animType !== 'storyMinus' && animType !== 'storyMultiply' && animType !== 'storyDiv') {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        Animation type "{animType}" not implemented
      </div>
    );
  }

  const questionLower = question.toLowerCase().trim();
  
  function extractDigitsFromQuestion(question: string): string[] {
    // Extract all digit characters from the question
    const allDigits = question.match(/\d+/g)?.join('') || '';
    
    // If we found digits, convert to array of individual characters
    if (allDigits) {
      return allDigits.split('');
    }
    
    // If no digits found, try to extract spelled-out numbers
    const spelledOutNumbers: Record<string, string> = {
      'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4', 
      'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
    };
    
    const result: string[] = [];
    const lowerQuestion = question.toLowerCase();
    
    // Check for spelled-out numbers
    Object.entries(spelledOutNumbers).forEach(([word, digit]) => {
      if (lowerQuestion.includes(word)) {
        result.push(digit);
      }
    });
    
    return result.length > 0 ? result : ['0']; // Default to '0' if nothing found
  }

  return (
      <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg">
        <div className="w-full max-w-4xl">
          {animType === 'numbers' && (
            <div className="flex flex-col items-center gap-2 sm:gap-6">
              <div className="text-lg sm:text-xl md:text-2xl font-medium text-gray-700 dark:text-gray-200 mb-2 sm:mb-4 text-center">
                {question}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {extractDigitsFromQuestion(question).map((digit, index) => (
                  <StaticDigit key={`digit-${index}`} digit={digit} />
                ))}
              </div>
            </div>
          )}
         {animType === 'storyAdd' && (
            <StoryProblemBlocks question={question} operation="add" />
          )}
          
          {animType === 'storyMinus' && (
            <StoryProblemBlocks question={question} operation="minus" />
          )}

           {animType === 'storyMultiply' && (
            <StoryProblemBlocks question={question} operation="multiply" />
          )}
      
          {animType === 'storyDiv' && (
            <StoryProblemBlocks question={question} operation="div" />
          )}

          {animType === 'numLine' && (
          <NumberLineAnimation question={questionLower} />
          )}

          {animType === 'blocks' && questionLower.match(/\d+.*?\d+/)&& 
          !questionLower.includes('+') && 
          !questionLower.includes('-') && 
          !questionLower.includes('*') && 
          !questionLower.includes('/') && 
          !questionLower.includes('×') && 
          !questionLower.includes('÷') && 
          createPlaceValueBlocks(questionLower)}

        {animType === 'blocks' && questionLower.includes('show') && questionLower.includes('number') && 
            createNumberBlocks(questionLower)}
        
       {animType === 'blocks' && questionLower.includes('+') && 
      <ArithmeticBlocks question={questionLower} operation="+" />}

      {animType === 'blocks' && questionLower.includes('-') && 
      <ArithmeticBlocks question={questionLower} operation="-" />}

      {animType === 'blocks' && (questionLower.includes('*') || questionLower.includes('×')) && 
      <ArithmeticBlocks question={questionLower} operation="*" />}

      {animType === 'blocks' && (questionLower.includes('/') || questionLower.includes('÷')) && (
        <ArithmeticBlocks question={questionLower} operation="/" />
      )}
    </div>
  </div>
  );
};

interface PlaceValueSectionProps {
  digit: number;
  position: number;
  isHighlighted: boolean;
  delay: number;
}

const PlaceValueSection: React.FC<PlaceValueSectionProps> = ({ 
  digit, 
  position, 
  isHighlighted, 
  delay 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  const getPlaceName = (pos: number): string => {
    const names = ['Ones', 'Tens', 'Hundreds', 'Thousands'];
    return names[pos] || `10^${pos}`;
  };
  
  const getBlockColor = (pos: number): string => {
    const colors = [
      'bg-blue-500 dark:bg-blue-600', // ones
      'bg-green-500 dark:bg-green-600', // tens  
      'bg-orange-500 dark:bg-orange-600', // hundreds
      'bg-purple-500 dark:bg-purple-600' // thousands
    ];
    return colors[pos] || 'bg-gray-500 dark:bg-gray-600';
  };
  
  // For place value, arrange horizontally to save vertical space
  const getLayoutStyle = (pos: number, index: number) => {
    if (pos === 0) {
      return {
        display: 'inline-block',
        marginRight: index < digit - 1 ? '2px' : '0'
      };
    }
    return {};
  };
  
  return (
    <div className="flex flex-col items-center gap-1 sm:gap-2">
      <div className="font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-300">
        {getPlaceName(position)}
      </div>
      <div className={`flex ${position === 0 ? 'flex-row flex-wrap' : 'flex-col'} gap-1`}>
        {Array.from({ length: digit }, (_, i) => (
          <div
            key={i}
            className={`
              ${getBlockColor(position)}
              ${isHighlighted ? 'ring-2 sm:ring-4 ring-yellow-400 ring-opacity-75' : ''}
              ${isVisible ? 'animate-drop-in' : 'opacity-0'}
              transition-all duration-500 rounded-md shadow-lg
              flex items-center justify-center text-white font-bold text-xs
              ${position === 0 ? 'w-4 h-4 sm:w-6 sm:h-6' : position === 1 ? 'w-10 h-4 sm:w-16 sm:h-6' : 'w-10 h-10 sm:w-16 sm:h-16'}
            `}
            style={{ 
              animationDelay: `${i * 100}ms`,
              ...getLayoutStyle(position, i)
            }}
          >
            {position === 0 ? '' : position === 1 ? '10' : '100'}
          </div>
        ))}
      </div>
    </div>
  );
};

const StaticDigit: React.FC<{ digit: string }> = ({ digit }) => {
  return (
    <div 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'clamp(1.25rem, 3vw, 2.5rem)',
        fontWeight: 'bold',
        borderRadius: '0.5rem',
        background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
        color: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        width: 'clamp(2.5rem, 5vw, 3.5rem)',
        height: 'clamp(2.5rem, 5vw, 3.5rem)',
        margin: '0 0.25rem',
        animation: 'pop 1s ease-in forwards',
      }}
    >
      {digit}
    </div>
  );
};

const NumberLineAnimation: React.FC<{ question: string }> = ({ question }) => {
  const [currentPosition, setCurrentPosition] = useState<number | null>(null);
  const [initialPosition, setInitialPosition] = useState<number | null>(null);
  const [targetPosition, setTargetPosition] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [stepCounter, setStepCounter] = useState(0);
  
  // Parse the question to determine what operation to perform
  useEffect(() => {
    // Reset state when question changes
    setShowResult(false);
    setIsAnimating(false);
    setStepCounter(0);
    
    // Addition: find pattern like "1+2" or "1 + 2"
    const addMatch = question.match(/(\d+)\s*\+\s*(\d+)/);
    if (addMatch) {
      const num1 = parseInt(addMatch[1]);
      const num2 = parseInt(addMatch[2]);
      
      // Set initial position
      setInitialPosition(num1);
      setCurrentPosition(num1);
      
      // Set the target position
      setTargetPosition(num1 + num2);
      
      // Start animation after a delay
      setTimeout(() => {
        setIsAnimating(true);
      }, 1000);
      
      return;
    }
    
    // Subtraction: find pattern like "5-3" or "5 - 3"
    const subMatch = question.match(/(\d+)\s*-\s*(\d+)/);
    if (subMatch) {
      const num1 = parseInt(subMatch[1]);
      const num2 = parseInt(subMatch[2]);
      
      // Set initial position
      setInitialPosition(num1);
      setCurrentPosition(num1);
      
      // Set the target position
      setTargetPosition(num1 - num2);
      
      // Start animation after a delay
      setTimeout(() => {
        setIsAnimating(true);
      }, 1000);
      
      return;
    }
    
    // If no operation found, just show the number
    const numMatch = question.match(/\d+/);
    if (numMatch) {
      const num = parseInt(numMatch[0]);
      setCurrentPosition(num);
      setShowResult(true);
    }
  }, [question]);
  
  // Step-by-step animation effect
  useEffect(() => {
    if (!isAnimating || currentPosition === null || targetPosition === null) return;
    
    // If we've reached the target, stop animating and show result
    if (currentPosition === targetPosition) {
      setIsAnimating(false);
      setShowResult(true);
      return;
    }
    
    // For addition, increment by 1
    if (targetPosition > currentPosition) {
      const timer = setTimeout(() => {
        setCurrentPosition(prev => (prev !== null ? prev + 1 : null));
        setStepCounter(prev => prev + 1);
      }, 500); // 500ms delay between jumps
      
      return () => clearTimeout(timer);
    }
    
    // For subtraction, decrement by 1
    if (targetPosition < currentPosition) {
      const timer = setTimeout(() => {
        setCurrentPosition(prev => (prev !== null ? prev - 1 : null));
        setStepCounter(prev => prev + 1);
      }, 500); // 500ms delay between jumps
      
      return () => clearTimeout(timer);
    }
  }, [isAnimating, currentPosition, targetPosition, stepCounter]);
  
  // Determine range of number line to show
  const getNumberLineRange = () => {
    if (initialPosition === null && targetPosition === null) {
      return { min: 0, max: 10 }; // Default range
    }
    
    const start = initialPosition ?? 0;
    const end = targetPosition ?? start;
    
    // Create a range that includes both positions plus some padding
    const min = Math.min(start, end) - 2;
    const max = Math.max(start, end) + 2;
    
    return { min: Math.max(0, min), max: Math.max(10, max) };
  };
  
  const { min, max } = getNumberLineRange();
  
  // Determine if we're adding or subtracting
  const isAddition = question.includes('+');
  const isSubtraction = question.includes('-');
  
  // Operation text description
  const getOperationText = () => {
    if (!isAnimating && !showResult) return '';
    
    if (isAddition && initialPosition !== null && targetPosition !== null) {
      if (currentPosition === targetPosition) {
        return `Result: ${targetPosition}`;
      }
      return `Moving right: ${initialPosition} → ${currentPosition}`;
    }
    
    if (isSubtraction && initialPosition !== null && targetPosition !== null) {
      if (currentPosition === targetPosition) {
        return `Result: ${targetPosition}`;
      }
      return `Moving left: ${initialPosition} → ${currentPosition}`;
    }
    
    return '';
  };
  
  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full">
      <motion.div 
        className="text-lg sm:text-xl md:text-2xl font-medium text-gray-700 dark:text-gray-200 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {question}
      </motion.div>
      
      
      {/* Number line */}
      <div className="relative w-full max-w-2xl h-20 mt-4">
        {/* Horizontal line */}
        <motion.div 
          className="absolute top-10 left-0 right-0 h-1 bg-gray-400 dark:bg-gray-600"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        ></motion.div>
        
        {/* Tick marks and numbers */}
        <div className="absolute top-0 left-0 right-0 flex justify-between">
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((num, index) => (
            <motion.div 
              key={num} 
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              {/* Tick mark */}
              <div className="h-3 w-0.5 bg-gray-400 dark:bg-gray-600 mt-7"></div>
              
              {/* Number label */}
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                {num}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Marker (circle) */}
        <AnimatePresence mode="wait">
          {currentPosition !== null && (
            <motion.div 
              key={`marker`}
              className="absolute w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-500 border-2 border-white 
                flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg z-10"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                // This is the corrected position calculation
                left: `calc(${(currentPosition - min) / (max - min) * 100}% - 1rem)`,
                top: '0.5rem',
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30,
                // Slower animation to make jumps more visible
                duration: 0.4
              }}
            >
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Result display */}
      <AnimatePresence>
        {showResult && targetPosition !== null && (
          <motion.div 
            className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
  

// Update ArithmeticBlocks component to support multiplication and division
const ArithmeticBlocks: React.FC<{ 
  question: string, 
  operation: '+' | '-' | '*' | '/' 
}> = ({ 
  question, 
  operation 
}) => {
  const [showSecondGroup, setShowSecondGroup] = useState(false);
  const [showResult, setShowResult] = useState(false);
  
  // Parse the question based on operation
  let regex;
  if (operation === '+') {
    regex = /(\d+)\s*\+\s*(\d+)/;
  } else if (operation === '-') {
    regex = /(\d+)\s*-\s*(\d+)/;
  } else if (operation === '*') {
    regex = /(\d+)\s*[*×]\s*(\d+)/; // Support both * and × for multiplication
  } else { // Division
    regex = /(\d+)\s*[\/÷]\s*(\d+)/; // Support both / and ÷ for division
  }
  
  const match = question.match(regex);
  if (!match) return null;
  
  const num1 = parseInt(match[1]);
  const num2 = parseInt(match[2]);
  let result;
  
  switch(operation) {
    case '+': result = num1 + num2; break;
    case '-': result = num1 - num2; break;
    case '*': result = num1 * num2; break;
    case '/': result = num1 / num2; break;
  }
  
  // Animation sequence
  useEffect(() => {
    const timer1 = setTimeout(() => setShowSecondGroup(true), 1500);
    const timer2 = setTimeout(() => setShowResult(true), 3000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center gap-2 sm:gap-4">
      <div className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white mb-2 sm:mb-4">
        {num1} {operation === '*' ? '×' : operation === '/' ? '÷' : operation} {num2} = ?
      </div>

      {operation === '+' && (
        <div className="flex flex-row items-center flex-wrap justify-center gap-2 sm:gap-4">
          {/* First number */}
          <div className="mr-0 sm:mr-2">
            <BlockGroup 
              count={num1} 
              color="bg-blue-500" 
              label={`${num1}`} 
              layout="grid"
            />
          </div>
          
          {/* Operation symbol */}
          <div className="text-xl sm:text-2xl font-bold text-gray-600 dark:text-gray-300 mx-1 sm:mx-2">
            +
          </div>
          
          {/* Second number (appears after delay) */}
          <div className={`transition-opacity duration-500 mr-0 sm:mr-2 ${showSecondGroup ? 'opacity-100' : 'opacity-0'}`}>
            <BlockGroup 
              count={num2} 
              color="bg-green-500" 
              label={`${num2}`} 
              layout="grid"
            />
          </div>
          
          {/* Result */}
          {showResult && (
            <>
              <div className="text-xl sm:text-2xl font-bold text-gray-600 dark:text-gray-300 mx-1 sm:mx-2">
                =
              </div>
              <div className="animate-drop-in">
                <BlockGroup 
                  count={result} 
                  color="bg-purple-500" 
                  label="?" 
                  layout="grid"
                />
              </div>
            </>
          )}
        </div>
      )}
      
      {operation === '-' && (
        <div className="flex flex-row items-center flex-wrap justify-center gap-2 sm:gap-4">
          {/* First number */}
          <div className="mr-0 sm:mr-2">
            <SubtractionBlockGroup 
              total={num1} 
              toRemove={num2} 
              showRemoval={showSecondGroup}
              showResult={showResult}
            />
          </div>
          
          {/* Result explanation - now to the right */}
          {showSecondGroup && (
            <div className="ml-2 sm:ml-4 text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 transition-opacity duration-300">
              {!showResult && `Removing ${num2}...`}
              {showResult && `= ?`}
            </div>
          )}
        </div>
      )}

      {operation === '*' && (
        <div className="flex flex-col items-center">
          <div className="flex flex-row flex-wrap justify-center gap-4 sm:gap-6">
            {/* Show num1 groups of num2 blocks each */}
            {Array.from({ length: Math.min(num1, 10) }, (_, groupIndex) => (
              <div 
                key={`group-${groupIndex}`} 
                className={`border-2 border-dashed p-2 sm:p-3 rounded-md 
                  ${showSecondGroup ? 'border-green-500 dark:border-green-400' : 'border-transparent'} 
                  transition-all duration-500`}
                style={{ animationDelay: `${groupIndex * 200}ms` }}
              >
                <div className="text-center text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 sm:mb-2">
                  Group {groupIndex + 1}
                </div>
                <BlockGroup
                  count={num2}
                  color="bg-green-500"
                  label=""
                  layout="grid"
                />
              </div>
            ))}
          </div>
          
          {/* Result */}
          {showResult && (
            <div className="mt-4 sm:mt-6 animate-fade-in">
              <div className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-300 mb-2 sm:mb-3 text-center">
                {num1} groups of {num2} = ?
              </div>
              <div className="animate-drop-in">
                <BlockGroup 
                  count={result} 
                  color="bg-purple-500" 
                  label="?" 
                  layout="grid"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {operation === '/' && (
        <div className="flex flex-col items-center">
          {/* Initial blocks */}
          <div className="mb-4 relative">
            <div className="text-center text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 sm:mb-2">
              Starting with {num1} blocks
            </div>
            <BlockGroup 
              count={num1} 
              color="bg-blue-500" 
              label="" 
              layout="grid"
            />
            
            {/* Division instructions */}
            {showSecondGroup && (
              <div className="mt-2 text-center text-sm sm:text-base font-medium text-gray-600 dark:text-gray-300 animate-fade-in">
                Divide into groups of {num2}
              </div>
            )}
          </div>
          
          {/* Groups */}
          {showSecondGroup && (
            <div className="flex flex-row flex-wrap justify-center gap-3 sm:gap-4 animate-fade-in">
              {Array.from({ length: Math.floor(num1 / num2) }, (_, groupIndex) => (
                <div 
                  key={`group-${groupIndex}`} 
                  className="border-2 border-dashed border-blue-500 dark:border-blue-400 p-2 sm:p-3 rounded-md"
                  style={{ animationDelay: `${groupIndex * 200 + 500}ms` }}
                >
                  <div className="text-center text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 sm:mb-2">
                    Group {groupIndex + 1}
                  </div>
                  <BlockGroup
                    count={num2}
                    color="bg-green-500"
                    label=""
                    layout="grid"
                  />
                </div>
              ))}
              
              {/* Remainder */}
              {num1 % num2 > 0 && (
                <div 
                  className="border-2 border-dashed border-yellow-500 dark:border-yellow-400 p-2 sm:p-3 rounded-md"
                >
                  <div className="text-center text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 sm:mb-2">
                    Remainder
                  </div>
                  <BlockGroup
                    count={num1 % num2}
                    color="bg-yellow-500"
                    label=""
                    layout="grid"
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Result */}
          {showResult && (
            <div className="mt-4 sm:mt-6 animate-fade-in">
              <div className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-300 mb-2 sm:mb-3 text-center">
                {num1} ÷ {num2} = {Math.floor(num1 / num2)}
                {num1 % num2 > 0 && ` with remainder ${num1 % num2}`}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400 text-center">
                ?
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};



// Add a specialized component for subtraction visualization
const SubtractionBlockGroup: React.FC<{ 
  total: number; 
  toRemove: number;
  showRemoval: boolean;
  showResult: boolean;
}> = ({ total, toRemove, showRemoval, showResult }) => {
  // Ensure we don't try to remove more than the total
  const actualRemove = Math.min(toRemove, total);
  const remaining = total - actualRemove;
  
  // Determine optimal grid columns based on number of blocks
  const getGridCols = () => {
    const totalBlocks = Math.min(total, 50);
    if (totalBlocks <= 9) return 'grid-cols-5';
    if (totalBlocks <= 16) return 'grid-cols-5';
    if (totalBlocks <= 25) return 'grid-cols-5';
    if (totalBlocks <= 36) return 'grid-cols-6';
    return 'grid-cols-8';
  };
  
  // Get total blocks for ordering
  const totalBlocksToShow = Math.min(total, 50);
  
  return (
    <div className="flex flex-col items-center">
      <div className="font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">{total}</div>
      <div className={`grid ${getGridCols()} gap-0.5 sm:gap-1 max-w-[180px] sm:max-w-[240px]`}>
        {/* Blocks that will remain (shown in blue) */}
        {Array.from({ length: Math.min(remaining, 50) }, (_, i) => (
          <div
            key={`remain-${i}`}
            className={`
              w-4 h-4 sm:w-6 sm:h-6 bg-blue-500 rounded-sm sm:rounded-md shadow-sm animate-drop-in
              flex items-center justify-center text-white text-[8px] sm:text-xs font-bold
              transition-all duration-500
            `}
            style={{ 
              order: totalBlocksToShow - i - 1, // Reverse order for top-first layout
              animationDelay: `${i * 30}ms` 
            }}
          />
        ))}
        
        {/* Blocks that will be removed (shown in red when showRemoval is true) */}
        {Array.from({ length: Math.min(actualRemove, 50 - remaining) }, (_, i) => (
          <div
            key={`remove-${i}`}
            className={`
              w-4 h-4 sm:w-6 sm:h-6 rounded-sm sm:rounded-md shadow-sm 
              flex items-center justify-center text-white text-[8px] sm:text-xs font-bold
              transition-all duration-500
              ${showRemoval 
                ? (showResult ? 'opacity-0 scale-0' : 'bg-red-500 scale-110') 
                : 'bg-blue-500'}
            `}
            style={{ 
              order: totalBlocksToShow - (remaining + i) - 1, // Maintain reverse order
              animationDelay: `${(remaining + i) * 30}ms`,
              transitionDelay: `${i * 70}ms`
            }}
          />
        ))}
      </div>
    </div>
  );
};


// Update the BlockGroup component to support different layouts
interface BlockGroupProps {
  count: number;
  color: string;
  label: string;
  layout?: 'horizontal' | 'vertical' | 'grid';
}

const BlockGroup: React.FC<BlockGroupProps> = ({ count, color, label, layout = 'grid' }) => {
  // Determine the appropriate grid columns based on count and layout
  const getOptimalColumns = () => {
    if (layout === 'horizontal') return 10;
    if (layout === 'vertical') return 1;
    
    // For grid layout, determine best column count
    const totalBlocks = Math.min(count, 120);
    if (totalBlocks <= 9) return 3;
    if (totalBlocks <= 25) return 5;
    if (totalBlocks <= 36) return 6;
    if (totalBlocks <= 64) return 8;
    return 10;
  };
  
  const cols = getOptimalColumns();
  
  // Calculate full rows and remainder
  const totalBlocks = Math.min(count, 120);
  const fullRows = Math.floor(totalBlocks / cols);
  const remainderCount = totalBlocks % cols;
  
  // Generate CSS class for grid columns
  const gridColsClass = `grid-cols-${cols}`;
  
  return (
    <div className="flex flex-col items-center gap-1 sm:gap-2">
      <div className="font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {label}
      </div>
      
      <div className="flex flex-col gap-0.5 sm:gap-1 max-w-[180px] sm:max-w-[250px]">
        {/* Remainder row (if any) - displayed at the top */}
        {remainderCount > 0 && (
          <div className={`grid grid-cols-${cols} gap-0.5 sm:gap-1`}>
            {Array.from({ length: remainderCount }, (_, i) => (
              <div
                key={`remainder-${i}`}
                className={`
                  w-4 h-4 sm:w-6 sm:h-6 ${color} rounded-sm sm:rounded-md shadow-sm animate-drop-in
                  flex items-center justify-center text-white text-[8px] sm:text-xs font-bold
                `}
                style={{ animationDelay: `${i * 30}ms` }}
              />
            ))}
          </div>
        )}
        
        {/* Full rows - displayed below the remainder */}
        {fullRows > 0 && (
          <div className={`grid ${gridColsClass} gap-0.5 sm:gap-1`}>
            {Array.from({ length: fullRows * cols }, (_, i) => (
              <div
                key={`full-${i}`}
                className={`
                  w-4 h-4 sm:w-6 sm:h-6 ${color} rounded-sm sm:rounded-md shadow-sm animate-drop-in
                  flex items-center justify-center text-white text-[8px] sm:text-xs font-bold
                `}
                style={{ animationDelay: `${(remainderCount + i) * 30}ms` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Updated StoryProblemBlocks component
const StoryProblemBlocks: React.FC<{ 
    question: string, 
    operation: 'add' | 'minus' | 'multiply' | 'div' 
  }> = ({ 
    question, 
    operation 
  }) => {
    const [showSecondGroup, setShowSecondGroup] = useState(false);
    const [showResult, setShowResult] = useState(false);
    
    // Extract numbers from story problem text
    const extractNumbers = (text: string): number[] => {
      const matches = text.match(/\d+/g);
      if (!matches || matches.length < 2) return [0, 0];
      
      // Return the first two numbers found
      return [parseInt(matches[0]), parseInt(matches[1])];
    };
    
    const [num1, num2] = extractNumbers(question);
    const result = operation === 'add' ? num1 + num2 : 
                  operation === 'minus' ? num1 - num2 : 
                  operation === 'multiply' ? num1 * num2 : 
                  Math.floor(num1 / num2);
    
    // Animation sequence
    useEffect(() => {
      const timer1 = setTimeout(() => setShowSecondGroup(true), 1500);
      const timer2 = setTimeout(() => setShowResult(true), 3000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }, []);

    // Color schemes
    const firstGroupColor = operation === 'add' ? 'bg-red-500' : 
                          operation === 'minus' ? 'bg-blue-500' :
                          operation === 'multiply' ? 'bg-green-500' : 'bg-purple-500';
    const secondGroupColor = operation === 'add' ? 'bg-blue-500' : 
                            operation === 'minus' ? 'bg-red-500' :
                            operation === 'multiply' ? 'bg-yellow-500' : 'bg-blue-500';
    
    // For multiplication and division
    const getMultiplicationDisplay = () => {
      return (
        <div className="flex flex-col items-center">
          <div className="flex flex-row flex-wrap justify-center gap-4 sm:gap-6">
            {/* Show num1 groups of num2 blocks each */}
            {Array.from({ length: num1 }, (_, groupIndex) => (
              <div 
                key={`group-${groupIndex}`} 
                className={`border-2 border-dashed p-2 sm:p-3 rounded-md 
                  ${showSecondGroup ? 'border-green-500 dark:border-green-400' : 'border-transparent'} 
                  transition-all duration-500`}
                style={{ animationDelay: `${groupIndex * 200}ms` }}
              >
                <div className="text-center text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 sm:mb-2">
                  Group {groupIndex + 1}
                </div>
                <BlockGroup
                  count={num2}
                  color={secondGroupColor}
                  label=""
                  layout="grid"
                />
              </div>
            ))}
          </div>
          
          {/* Result */}
          {showResult && (
            <div className="mt-4 sm:mt-6 animate-fade-in">
              <div className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-300 mb-2 sm:mb-3 text-center">
                {num1} groups of {num2} = ?
              </div>
              <div className="animate-drop-in">
                <BlockGroup 
                  count={result} 
                  color="bg-purple-500" 
                  label="?" 
                  layout="grid"
                />
              </div>
            </div>
          )}
        </div>
      );
    };
    
    const getDivisionDisplay = () => {
      // Calculate the groups and remainder
      const quotient = Math.floor(num1 / num2);
      const remainder = num1 % num2;
      
      return (
        <div className="flex flex-col items-center">
          {/* Initial blocks */}
          <div className="mb-4 relative">
            <div className="text-center text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 sm:mb-2">
              Starting with {num1} blocks
            </div>
            <BlockGroup 
              count={num1} 
              color={firstGroupColor} 
              label="" 
              layout="grid"
            />
            
            {/* Division instructions */}
            {showSecondGroup && (
              <div className="mt-2 text-center text-sm sm:text-base font-medium text-gray-600 dark:text-gray-300 animate-fade-in">
                Divide into groups of {num2}
              </div>
            )}
          </div>
          
          {/* Groups */}
          {showSecondGroup && (
            <div className="flex flex-row flex-wrap justify-center gap-3 sm:gap-4 animate-fade-in">
              {Array.from({ length: quotient }, (_, groupIndex) => (
                <div 
                  key={`group-${groupIndex}`} 
                  className="border-2 border-dashed border-blue-500 dark:border-blue-400 p-2 sm:p-3 rounded-md"
                  style={{ animationDelay: `${groupIndex * 200 + 500}ms` }}
                >
                  <div className="text-center text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 sm:mb-2">
                    Group {groupIndex + 1}
                  </div>
                  <BlockGroup
                    count={num2}
                    color={secondGroupColor}
                    label=""
                    layout="grid"
                  />
                </div>
              ))}
              
              {/* Remainder */}
              {remainder > 0 && (
                <div 
                  className="border-2 border-dashed border-yellow-500 dark:border-yellow-400 p-2 sm:p-3 rounded-md"
                >
                  <div className="text-center text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 sm:mb-2">
                    Remainder
                  </div>
                  <BlockGroup
                    count={remainder}
                    color="bg-yellow-500"
                    label=""
                    layout="grid"
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Result */}
          {showResult && (
            <div className="mt-4 sm:mt-6 animate-fade-in">
              <div className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-300 mb-2 sm:mb-3 text-center">
                {num1} ÷ {num2} = ?
                {remainder > 0 && ` with remainder ${remainder}`}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400 text-center">
                ?
              </div>
            </div>
          )}
        </div>
      );
    };
    
    // Conditional rendering based on operation
    if (operation === 'multiply') {
      return (
        <div className="flex flex-col items-center gap-2 sm:gap-4">
          <div className="text-lg sm:text-xl font-medium text-gray-800 dark:text-white mb-2 sm:mb-4 text-center max-w-md">
            {question}
          </div>
          {getMultiplicationDisplay()}
        </div>
      );
    }
    
    if (operation === 'div') {
      return (
        <div className="flex flex-col items-center gap-2 sm:gap-4">
          <div className="text-lg sm:text-xl font-medium text-gray-800 dark:text-white mb-2 sm:mb-4 text-center max-w-md">
            {question}
          </div>
          {getDivisionDisplay()}
        </div>
      );
    }
    
    // Original add/minus rendering
    return (
      <div className="flex flex-col items-center gap-2 sm:gap-4">
        <div className="text-lg sm:text-xl font-medium text-gray-800 dark:text-white mb-2 sm:mb-4 text-center max-w-md">
          {question}
        </div>

        {/* All blocks in one row */}
        <div className="flex flex-row items-center flex-wrap justify-center gap-2 sm:gap-4">
          {/* First number */}
          <div className="mr-0 sm:mr-2">
            <BlockGroup 
              count={num1} 
              color={firstGroupColor} 
              label={operation === 'add' ? 'First group' : 'Total'} 
              layout="grid"
            />
          </div>
          
          {/* Connecting text */}
          <div className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-300 mx-1 sm:mx-2">
            {operation === 'add' ? 'and' : 'remove'}
          </div>
          
          {/* Second number (appears after delay) */}
          <div className={`transition-opacity duration-500 mr-0 sm:mr-2 ${showSecondGroup ? 'opacity-100' : 'opacity-0'}`}>
            <BlockGroup 
              count={num2} 
              color={secondGroupColor} 
              label={operation === 'add' ? 'Second group' : 'Remove'} 
              layout="grid"
            />
          </div>
          
          {/* Result - now in the same row */}
          {showResult && (
            <>
              <div className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-300 mx-1 sm:mx-2 animate-fade-in">
                {operation === 'add' ? 'altogether' : 'remaining'}
              </div>
              <div className="animate-slide-in-right">
                <BlockGroup 
                  count={result} 
                  color="bg-purple-500" 
                  label="?" 
                  layout="grid"
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  };


// Add CSS animations via inline styles since we can't modify external CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slide-in-right {
    0% {
      opacity: 0;
      transform: translateX(-30px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .animate-slide-in-right {
    animation: slide-in-right 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
  }

  @keyframes drop-in {
    0% {
      opacity: 0;
      transform: translateY(-20px) scale(0.8);
    }
    50% {
      transform: translateY(5px) scale(1.1);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes fade-in {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pop {
    0% {
      opacity: 0;
      transform: scale(0.5);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .animate-drop-in {
    animation: drop-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
  }
  
  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
  }

  .animate-pop {
    animation: pop 1s ease-in forwards;
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
  }
`;

// Only add the style once
if (!document.querySelector('#exercise-animation-styles')) {
  style.id = 'exercise-animation-styles';
  document.head.appendChild(style);
}

export default ExerciseAnimation;