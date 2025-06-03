import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router";
import AdditionIcon from "@src/assets/additionIcon.svg";
import SubtractionIcon from "@src/assets/subtractionIcon.svg";
import MultiplicationIcon from "@src/assets/multiplicationIcon.svg";
import DivisionIcon from "@src/assets/divisionIcon.svg";
import { useAuth } from "../AuthContext";
import ExitButton from "../components/exitbutton";

interface Course {
  courseBatchId: string;
  courseId: string;
  title: string;
  level: number;
  dateCreated: string;
  exerciseBatchList: string[];
  exercisesLength: number;
  logo: string;
}

interface ApiResponse {
  message: string;
  courseList: Course[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  previousPage: number | null;
}

const ButtonStyle = `
  w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24
  p-2 md:p-3 
  bg-white/20 
  flex flex-col justify-center items-center 
  rounded-2xl 
  border-2 md:border-3 lg:border-4 border-[#374DB0] 
  text-lg md:text-xl lg:text-2xl 
  gap-1
  transition-all duration-200
  hover:scale-105 hover:shadow-lg
`;

const getIconForCourse = (courseId: string) => {
  switch (courseId.toLowerCase()) {
    case "addition":
      return AdditionIcon;
    case "subtraction":
      return SubtractionIcon;
    case "multiplication":
      return MultiplicationIcon;
    case "division":
      return DivisionIcon;
    default:
      return "📚"; // Default fallback
  }
};

const Home = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/courses/getcourses",
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        setCourses(data.courseList);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch courses",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="gap-5 flex flex-col mt-20 items-center justify-center">
        <p className="text-lg text-gray-600">Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gap-5 flex flex-col mt-20 items-center justify-center">
        <p className="text-lg text-red-600">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  // Group courses into rows of 3
  const courseRows = [];
  for (let i = 0; i < courses.length; i += 3) {
    courseRows.push(courses.slice(i, i + 3));
  }

  return (
  <div className="container mx-auto">
      
      
      {/* Responsive grid layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
        {courses.map((course) => (
          <div key={course.courseId} className="flex flex-col items-center">
            <NavLink
              to={`/courses/${course.courseId}`}
              className={ButtonStyle}
            >
              {typeof getIconForCourse(course.courseId) === 'string' ? (
                <span 
                  role="img" 
                  aria-label={`${course.title} icon`}
                  className="text-3xl sm:text-4xl md:text-5xl"
                >
                  {getIconForCourse(course.courseId)}
                </span>
              ) : (
                <img 
                  src={getIconForCourse(course.courseId)} 
                  alt={`${course.title} icon`}
                  className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14"
                />
              )}
            </NavLink>
            
            <p className="mt-2 text-center font-medium text-xs sm:text-sm md:text-base">
              {course.title}
            </p>
          </div>
        ))}
      </div>
      <ExitButton />
    </div>
  );
};

export default Home;


