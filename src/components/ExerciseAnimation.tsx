import React, { useState, useEffect, useCallback } from 'react';

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

  // Animation trigger effect
  useEffect(() => {
  if ((animType === 'blocks' || animType === 'numbers') && question) {
    // Small delay to ensure component is mounted
    const timer = setTimeout(() => {
      setAnimationState({ isAnimating: true, currentStep: 0, answer: null });
      startAnimation();
    }, 500);
    return () => clearTimeout(timer);
  }
}, [animType, question]);

const startAnimation = useCallback(() => {
  if (animType === 'blocks') {
    const questionLower = question.toLowerCase().trim();

    if (questionLower.includes('value of') && questionLower.includes('digit')) {
      animatePlaceValue(questionLower);
    } else if (questionLower.includes('show') && questionLower.includes('number')) {
      const match = questionLower.match(/\d+/);
        if (match) {
            animateNumber(parseInt(match[0]));
        }
        } else if (questionLower.includes('+')) {
        animateAddition(questionLower);
        } else if (questionLower.includes('-')) {
        animateSubtraction(questionLower);
        } else {
        // Try to extract any number and show it
        const match = questionLower.match(/\d+/);
        if (match) {
            animateNumber(parseInt(match[0]));
        }
        }
    } else if (animType === 'numbers') {
        // For numbers animation type, we just need to set that we're ready to animate
        setAnimationState(prev => ({
        ...prev,
        isAnimating: true
        }));
    }
    }, [animType, question]);
// Add a new component for digit animation
const DigitAnimation: React.FC<{ digit: string, index: number }> = ({ digit, index }) => {
  return (
    <div 
      className="inline-flex items-center justify-center text-4xl font-bold rounded-lg 
                 bg-gradient-to-r from-blue-500 to-purple-600 text-white 
                 shadow-lg w-14 h-14 mx-1 animate-pop"
      style={{ 
        animationDelay: `${index * 200}ms`,
        opacity: 0, // Start hidden, animation will show it
      }}
    >
      {digit}
    </div>
  );
};

    // Function to extract all digits from a question
    const extractDigitsFromQuestion = (question: string): string[] => {
    // Match all individual digits in the question
    const digits = question.match(/\d/g) || [];
    return [...new Set(digits)]; // Remove duplicates
    };

  const animatePlaceValue = (problem: string) => {
    const matches = problem.match(/digit (\d) in (\d+)/);
    if (!matches) return;
    
    const digit = parseInt(matches[1]);
    const number = matches[2];
    const digitIndex = number.indexOf(digit.toString());
    
    if (digitIndex === -1) {
      setAnimationState(prev => ({ ...prev, answer: `The digit ${digit} is not in ${number}` }));
      return;
    }
    
    const position = number.length - digitIndex - 1;
    const placeValue = digit * Math.pow(10, position);
    
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
    const matches = question.match(/digit (\d) in (\d+)/);
    if (!matches) return null;
    
    const targetDigit = parseInt(matches[1]);
    const number = matches[2];
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

  const createArithmeticBlocks = (question: string, operation: '+' | '-') => {
    const regex = operation === '+' ? /(\d+)\s*\+\s*(\d+)/ : /(\d+)\s*-\s*(\d+)/;
    const match = question.match(regex);
    if (!match) return null;
    
    const num1 = parseInt(match[1]);
    const num2 = parseInt(match[2]);
    const result = operation === '+' ? num1 + num2 : num1 - num2;
    
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          {num1} {operation} {num2} = ?
        </div>
        
        <div className="flex gap-8 items-center">
          <BlockGroup count={num1} color="bg-blue-500" label={num1.toString()} />
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
            {operation}
          </div>
          <BlockGroup count={num2} color="bg-green-500" label={num2.toString()} />
        </div>
        
        {animationState.answer && (
          <div className="mt-4 text-2xl font-bold text-purple-600 dark:text-purple-400 animate-bounce">
            = {result}
          </div>
        )}
      </div>
    );
  };

  // Don't render anything if not blocks animation type
  if (animType !== 'blocks' && animType !== 'numbers') {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        Animation type "{animType}" not implemented
      </div>
    );
  }

  const questionLower = question.toLowerCase().trim();
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg">
       {animType === 'numbers' && (
        <div className="flex flex-col items-center gap-6">
          <div className="text-xl md:text-2xl font-medium text-gray-700 dark:text-gray-200 mb-4 text-center">
            {question}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {extractDigitsFromQuestion(question).map((digit, index) => (
              <DigitAnimation key={index} digit={digit} index={index} />
            ))}
          </div>
        </div>
      )}
      <div className="w-full max-w-4xl">
        {animType === 'blocks' && questionLower.includes('value of') && questionLower.includes('digit') && 
            createPlaceValueBlocks(questionLower)}
        
        {animType === 'blocks' && questionLower.includes('show') && questionLower.includes('number') && 
            createNumberBlocks(questionLower)}
        
        {animType === 'blocks' && questionLower.includes('+') && 
            createArithmeticBlocks(questionLower, '+')}
        
        {animType === 'blocks' && questionLower.includes('-') && 
            createArithmeticBlocks(questionLower, '-')}
        
        {animType === 'blocks' && !questionLower.includes('value of') && 
        !questionLower.includes('show') && 
        !questionLower.includes('+') && 
        !questionLower.includes('-') && 
        questionLower.match(/\d+/) &&
            createNumberBlocks(questionLower)}
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
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="font-semibold text-sm text-gray-700 dark:text-gray-300">
        {getPlaceName(position)}
      </div>
      <div className="flex flex-col gap-1">
        {Array.from({ length: digit }, (_, i) => (
          <div
            key={i}
            className={`
              ${getBlockColor(position)}
              ${isHighlighted ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''}
              ${isVisible ? 'animate-drop-in' : 'opacity-0'}
              transition-all duration-500 rounded-md shadow-lg
              flex items-center justify-center text-white font-bold text-xs
              ${position === 0 ? 'w-6 h-6' : position === 1 ? 'w-16 h-6' : 'w-16 h-16'}
            `}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {position === 0 ? '' : position === 1 ? '10' : '100'}
          </div>
        ))}
      </div>
    </div>
  );
};

interface BlockGroupProps {
  count: number;
  color: string;
  label: string;
}

const BlockGroup: React.FC<BlockGroupProps> = ({ count, color, label }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="font-semibold text-gray-700 dark:text-gray-300">{label}</div>
      <div className="grid grid-cols-5 gap-1 max-w-[150px]">
        {Array.from({ length: Math.min(count, 25) }, (_, i) => (
          <div
            key={i}
            className={`
              w-6 h-6 ${color} rounded-md shadow-sm animate-drop-in
              flex items-center justify-center text-white text-xs font-bold
            `}
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
        {count > 25 && (
          <div className="col-span-5 text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
            +{count - 25} more
          </div>
        )}
      </div>
    </div>
  );
};

// Add CSS animations via inline styles since we can't modify external CSS
const style = document.createElement('style');
style.textContent = `
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
  }
  
  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
  }

  .animate-pop {
    animation: pop 1s ease-in-out forwards;
    animation-iteration-count: 1;
  }
`;

// Only add the style once
if (!document.querySelector('#exercise-animation-styles')) {
  style.id = 'exercise-animation-styles';
  document.head.appendChild(style);
}

export default ExerciseAnimation;