import { useParams } from "react-router-dom";

const Courses = () => {
  const { categoryId } = useParams();

  // Dynamic content based on categoryId
  const getCategoryData = (category: string) => {
    const categoryMap = {
      addition: { title: "Addition", color: "#FF6B6B" },
      subtraction: { title: "Subtraction", color: "#4ECDC4" },
      multiplication: { title: "Multiplication", color: "#45B7D1" },
      division: { title: "Division", color: "#96CEB4" },
    };
    return categoryMap[category] || { title: "Unknown", color: "#999" };
  };

  const categoryData = getCategoryData(categoryId);

  return (
    <div>
      <h1>{categoryData.title} Course</h1>
      {/* Dynamic content based on categoryId */}
      <p>Welcome to the {categoryData.title} course!</p>
    </div>
  );
};

export default Courses;
