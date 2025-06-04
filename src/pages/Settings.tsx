import { useTheme } from "@src/ThemeContext";
import ExitButton from "@src/components/exitbutton";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    // Container with width constraints and proper spacing for mobile navigation
    <div className="max-w-full sm:max-w-xl md:max-w-2xl mx-auto px-3 sm:px-4 py-4 md:py-6 pb-24 md:pb-16 transition-colors duration-300 dark:bg-gray-900">
      {/* Reduced heading margins for more compact mobile view */}
      <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Settings</h1>
      </div>

      {/* Appearance section - smaller padding and margins */}
      <div className="bg-white dark:bg-gray-800 shadow-md md:shadow-lg rounded-lg md:rounded-xl p-3 sm:p-4 md:p-5 mb-3 sm:mb-4 md:mb-6 transition-colors duration-300">
        <h2 className="text-lg md:text-xl font-semibold text-gray-700 dark:text-white mb-2 sm:mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          Appearance
        </h2>

        <div className="flex items-center justify-between py-2 md:py-3">
          <div className="flex items-center">
            {/* Smaller icon container for mobile */}
            <div className="mr-3 md:mr-4 p-1.5 md:p-2 rounded-full bg-[#374DB0]/10 dark:bg-[#374DB0]/30">
              {theme === 'dark' ? (
                // Moon icon - smaller on mobile
                <svg className="w-5 h-5 md:w-6 md:h-6 text-[#374DB0] dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                // Sun icon - smaller on mobile
                <svg className="w-5 h-5 md:w-6 md:h-6 text-[#374DB0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </div>
            <div>
              {/* Responsive text sizes */}
              <p className="font-medium text-sm md:text-base text-gray-700 dark:text-white">Theme</p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </p>
            </div>
          </div>
          
          {/* Toggle Switch - smaller on mobile */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              value="" 
              className="sr-only peer" 
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
            <div className="w-9 h-5 md:w-11 md:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 md:after:h-5 md:after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#374DB0]"></div>
          </label>
        </div>
      </div>

      {/* Account Settings section - smaller padding and margins */}
      <div className="bg-white dark:bg-gray-800 shadow-md md:shadow-lg rounded-lg md:rounded-xl p-3 sm:p-4 md:p-5 mb-3 sm:mb-4 md:mb-6 transition-colors duration-300">
        <h2 className="text-lg md:text-xl font-semibold text-gray-700 dark:text-white mb-2 sm:mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          Account Settings
        </h2>
        <p className="text-gray-500 dark:text-gray-400 py-2 md:py-3 text-sm md:text-base italic">
          More settings will be available in future updates.
        </p>
      </div>

      {/* Notifications section - smaller padding and margins */}
      <div className="bg-white dark:bg-gray-800 shadow-md md:shadow-lg rounded-lg md:rounded-xl p-3 sm:p-4 md:p-5 transition-colors duration-300">
        <h2 className="text-lg md:text-xl font-semibold text-gray-700 dark:text-white mb-2 sm:mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          Notifications
        </h2>
        <p className="text-gray-500 dark:text-gray-400 py-2 md:py-3 text-sm md:text-base italic">
          Notification settings will be available in future updates.
        </p>
      </div>

      <ExitButton />
    </div>
  );
};

export default Settings;