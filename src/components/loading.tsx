import MainLogo from "../assets/logo.svg";

interface LoadingPageProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingPage = ({ message = "Loading...", fullScreen = true }: LoadingPageProps) => {
  return (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-screen' : 'py-8'}`}>
      <div className="relative">
        <img 
          src={MainLogo} 
          alt="Logo" 
          className="w-32 sm:w-40 md:w-48 mx-auto animate-pulse" 
        />
        <div className="absolute inset-0 border-t-4 border-blue-500 border-opacity-50 rounded-full animate-spin" 
          style={{ animationDuration: '1.5s' }} />
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 font-medium">{message}</p>
        <div className="mt-3 flex justify-center space-x-1">
          {[0, 1, 2].map((dot) => (
            <div 
              key={dot}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ 
                animationDelay: `${dot * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;