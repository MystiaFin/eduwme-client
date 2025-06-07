import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreakMilestoneProps {
  streak: number;
  onClose: () => void;
}

const StreakMilestone: React.FC<StreakMilestoneProps> = ({ streak, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500); // Allow animation to complete before removing
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-[#374DB0] to-[#5a6fd1] text-white px-6 py-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🔥</div>
              <div>
                <h3 className="font-bold text-lg">
                  {streak} Day Streak!
                </h3>
                <p className="text-sm text-white/80">
                  You're on fire! Keep coming back daily.
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 500);
                }}
                className="ml-4 text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StreakMilestone;