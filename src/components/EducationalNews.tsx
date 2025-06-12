import { useState, useEffect } from 'react';

interface NewsItem {
  title: string;
  description: string;
  url: string;
  image_url?: string;
  source: string;
  type: 'space';
  explanation?: string; // Added for detailed explanation
  media_type?: 'image' | 'video'; // Added for media type
  date?: string; // Added for the date of the news
  article_url?: string; // Added for linking to the full article
}

const EducationalNews = () => {
  const [news, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpaceNews = async () => {
      setLoading(true);

      const cachedData = localStorage.getItem('nasaAPOD');
      const cachedTime = localStorage.getItem('nasaAPODTime');
      const now = new Date().getTime();

      // Extra safety check for displaying cached data
      // If we have cached data that's less than 6 hours old, set the item from cache
      if (cachedData && cachedTime && (now - parseInt(cachedTime) < 6 * 60 * 60 * 1000)) {
        try {
          const data = JSON.parse(cachedData);
          setNewsItem({
            title: data.title,
            description: data.explanation.substring(0, 150) + '...',
            explanation: data.explanation,
            url: data.url,
            image_url: data.url, // Set image_url to the media URL
            media_type: data.media_type,
            date: data.date,
            source: 'NASA',
            type: 'space',
            article_url: 'https://apod.nasa.gov/apod/' // Default APOD page
          });
          setLoading(false);
          return;
        } catch (err) {
          console.error("Error parsing cached data:", err);
          // Continue with API call if cache parsing fails
        }
      }

      
      // NASA FREE API 
      const API_KEY = import.meta.env.VITE_NASA_API_KEY || 'HKaauhzFPjstNB0fCgf3ySJF0HyMeImt0Pfi4vOJ'

      let newResponse: Response | undefined;
      
      try {
        const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`);
        if (!response.ok) {
          try {
            newResponse = await fetch(`https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY`);

          } catch (err) {
            throw new Error(`Failed to fetch demo API: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
          throw new Error(`Failed to fetch space news: ${response.status}`);
        }
        let data = await response.json();
        if (!data || !data.url || !data.title || !data.explanation) {
          data = await newResponse?.json();
        }

        // Save to cache
        localStorage.setItem('nasaAPOD', JSON.stringify(data));
        localStorage.setItem('nasaAPODTime', now.toString());
        
        setNewsItem({
          title: data.title,
          description: data.explanation.substring(0, 150) + '...',
          explanation: data.explanation,
          url: data.url,
          image_url: data.url, // Set image_url to the media URL
          media_type: data.media_type,
          date: data.date,
          source: 'NASA',
          type: 'space',
          article_url: 'https://apod.nasa.gov/apod/' // Link to NASA APOD page
        });
      } catch (err) {
        console.error("Error fetching space news:", err);
        setError(err instanceof Error ? err.message : "Failed to load space news");
      } finally {
        setLoading(false);
      }
    };

    fetchSpaceNews();
  }, []);

  if (loading) {
    return (
      <div className="mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 md:p-5 bg-white dark:bg-gray-800 shadow-md md:shadow-lg rounded-lg md:rounded-xl">
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 dark:text-white mb-2 sm:mb-3 pb-1 sm:pb-2 border-b border-gray-200 dark:border-gray-700">
          Space Discovery
        </h3>
        <div className="animate-pulse flex flex-row gap-3">
          <div className="h-20 w-20 sm:w-24 md:w-28 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0"></div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 md:p-5 bg-white dark:bg-gray-800 shadow-md md:shadow-lg rounded-lg md:rounded-xl">
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 dark:text-white mb-2 sm:mb-3 pb-1 sm:pb-2 border-b border-gray-200 dark:border-gray-700">
          Space Discovery
        </h3>
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="mb-4 sm:mb-6 md:mb-8 bg-white dark:bg-gray-800 shadow-md md:shadow-lg rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 transition-colors duration-300">
      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 dark:text-white mb-2 sm:mb-3 pb-1 sm:pb-2 border-b border-gray-200 dark:border-gray-700">
        Space Discovery
      </h3>
      
      {news ? (
        <div className="flex flex-row gap-3">
          {/* Image on the left - smaller size for mobile too */}
          {news.media_type === 'image' && (
            <div className="w-20 sm:w-24 md:w-28 h-20 sm:h-24 md:h-28 overflow-hidden rounded-md flex-shrink-0">
              <img 
                src={news.url} 
                alt={news.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          
          {/* Text content on the right */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <h4 className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200">
                {news.title}
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded ml-2 flex-shrink-0">
                {news.source}
              </span>
            </div>
            
            {news.date && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(news.date).toLocaleDateString('en-US', {
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric'
                })}
              </p>
            )}
            
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {news.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-auto pt-1">
              <button 
                onClick={() => window.open('https://apod.nasa.gov/apod/', '_blank')}
                className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded transition-colors duration-200 font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                Visit APOD
              </button>
              
              <button 
                onClick={() => window.open(news.url, '_blank')}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors duration-200 font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                Full Image
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          No space content available right now. Please check back later!
        </p>
      )}
    </div>
  );
};

export default EducationalNews;