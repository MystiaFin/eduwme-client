import { Link } from "react-router";
import { useEffect, useState } from "react";

import Logo from "@src/assets/logo.svg";
import StreakMilestone from "./components/StreakMilestone";
import { useAuth } from "./AuthContext";



const LandingPage: React.FC = () => {
    const { user, isAuthenticated, updateUserStreak } = useAuth();
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneStreak, setMilestoneStreak] = useState(0);
  
  // Check for streak on app load
  useEffect(() => {
    if (isAuthenticated) {
      const checkStreak = async () => {
        await updateUserStreak();
        
        // Check if streak is a milestone (divisible by 5)
        if (user?.streak && user.streak > 0 && user.streak % 5 === 0) {
          // Show milestone notification
          setMilestoneStreak(user.streak);
          setShowMilestone(true);
          
          // Store that we've shown this milestone
          localStorage.setItem(`milestone-${user.streak}`, 'shown');
        }
      };
      
      checkStreak();
    }
  }, [isAuthenticated]);
  
  return (
    <main className="pl-4 relative flex flex-col items-start md:items-center justify-center h-screen overflow-hidden">
      <div className="z-10 flex flex-col px-6 md:px-0 md:items-center text-left md:text-center">
        <h3 className="text-3xl md:text-4xl text-header-blue font-bold text-stroke">
          Welcome to
        </h3>
        <h2 className="text-4xl md:text-6xl font-black text-header-blue text-stroke">
          EduWMe <br className="block md:hidden" /> Project
        </h2>
        <img src={Logo} alt="GoGo Math" className="mb-10 w-40 mt-10 md:w-64" />
        <Link to="/register">
          <button className="w-36 py-2 bg-confirm-blue text-white rounded-full text-lg">
            Get Started
          </button>
        </Link>
      </div>
      {showMilestone && (
        <StreakMilestone 
          streak={milestoneStreak} 
          onClose={() => setShowMilestone(false)} 
        />
      )}
    </main>
  );
};

export default LandingPage;