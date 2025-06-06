import { useNavigate } from "react-router";
import { useAuth } from "../AuthContext";

const ExitButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="
        fixed top-4 right-4 
        md:bottom-6 md:left-6 md:top-auto md:right-auto
        w-12 h-12 
        md:w-14 md:h-14 
        bg-white/10 
        backdrop-blur-sm 
        border border-white/20 
        rounded-full 
        flex items-center justify-center 
        text-white/80 
        hover:bg-white/20 
        hover:text-white 
        hover:border-white/30 
        hover:scale-105 
        active:scale-95 
        transition-all duration-200 
        shadow-lg 
        z-50
        group
      "
      aria-label="Exit"
    >
      {/* X Icon */}
      <svg 
        className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-200" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M6 18L18 6M6 6l12 12" 
        />
      </svg>

      {/* Log off text - shown on hover */}
      <span className="
        absolute 
        hidden group-hover:block 
        whitespace-nowrap
        bg-gray-800/80 
        text-white 
        text-xs md:text-sm
        py-1 px-2 
        rounded
        transition-opacity
        
        /* Mobile position - above button */
        -top-8 right-0
        
        /* Desktop position - to the right of button */
        md:-right-16 md:top-1/2 md:-translate-y-1/2 md:left-auto
      ">
        Log off
      </span>
    </button>
  );
};

export default ExitButton;