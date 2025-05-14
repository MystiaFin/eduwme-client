import React from 'react';
import { useParams, Link } from 'react-router-dom';

const CourseDetail = () => {
  // Get the courseId from the URL parameters
  const { courseId } = useParams<{ courseId: string }>();


  return (
    <div className="p-6 md:p-10">
      <Link to="/dashboard" className="text-blue-500 hover:underline mb-4 inline-block">
        &larr; Back to Learning Path
      </Link>
      <h1 className="text-3xl font-bold mb-6">
        Inner Skill Tree for Course ID: {courseId}
      </h1>
      <p className="text-gray-600">
        This is where the detailed lessons and structure for course "{courseId}" would be displayed.
      </p>
      {/* Add placeholder for lesson structure */}
      <div className="mt-8 space-y-4">
        <div className="p-4 border rounded bg-gray-100">Lesson 1 Placeholder</div>
        <div className="p-4 border rounded bg-gray-100">Lesson 2 Placeholder</div>
        <div className="p-4 border rounded bg-gray-100">Lesson 3 Placeholder</div>
      </div>
    </div>
  );
};

export default CourseDetail;