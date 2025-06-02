import { useState, useEffect } from "react";
import { NavLink } from "react-router";
import AdditionIcon from "@src/assets/additionIcon.svg";
import SubtractionIcon from "@src/assets/subtractionIcon.svg";
import MultiplicationIcon from "@src/assets/multiplicationIcon.svg";
import DivisionIcon from "@src/assets/divisionIcon.svg";

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

const ButtonStyle: string =
  "w-32 h-32 p-2 bg-[#CFB6FF] flex flex-col justify-center items-center rounded-2xl border-4 border-[#374DB0] text-white font-bold text-lg gap-1";

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
      return AdditionIcon; // Default fallback
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

  // Group courses into rows of 2
  const courseRows = [];
  for (let i = 0; i < courses.length; i += 2) {
    courseRows.push(courses.slice(i, i + 2));
  }

  return (
    <div className="gap-5 flex flex-col mt-20">
      {courseRows.map((row, rowIndex) => (
        <section
          key={rowIndex}
          className="flex items-center justify-center gap-5"
        >
          {row.map((course) => (
            <NavLink
              key={course.courseId}
              to={`/courses/${course.courseId}`}
              className={ButtonStyle}
            >
              <img
                src={getIconForCourse(course.courseId)}
                alt={`${course.title} icon`}
              />
              <p className={course.title.length > 10 ? "text-md" : ""}>
                {course.title}
              </p>
            </NavLink>
          ))}
        </section>
      ))}
    </div>
  );
};

export default Home;
