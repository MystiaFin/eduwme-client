// src/hooks/useCourseData.tsx
import { useState, useEffect } from 'react';

interface CourseBatch {
  courseBatchId: string;
  dateCreated: string;
  courseList: string[];
  stage: number;
  coursesLength: number;
}

interface Course {
  courseBatchId: string;
  courseId: string;
  title: string;
  level: number;
  dateCreated: string;
  exerciseBatchList: string[];
  exercisesLength: number;
}

interface CourseProgress {
  courseId: string;
  status: string;
  completedExercisesCount: number;
  totalExercisesInCourse: number;
}

interface BatchProgress {
  courseBatchId: string;
  status: string;
  completedCoursesCount: number;
  totalCoursesInBatch: number;
  courses: CourseProgress[];
}

export const useCourseData = () => {
  const [courseBatches, setCourseBatches] = useState<CourseBatch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<BatchProgress[]>([]);

  // Fetch user profile to get progress data
  const fetchUserProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Decode the token to get userId (you need to install jwt-decode)
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userId = decodedToken.id;

      const response = await fetch(`http://localhost:3000/getProfile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user progress');
      }

      const data = await response.json();
      setUserProgress(data.user.courseBatchesProgress || []);
    } catch (err) {
      console.error('Error fetching user progress:', err);
    }
  };

  // Fetch all course batches
  const fetchCourseBatches = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3000/getCourseBatches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch course batches');
      }

      const data = await response.json();
      setCourseBatches(data.courseBatchList || []);
    } catch (err) {
      setError('Failed to load course batches');
      console.error('Error fetching course batches:', err);
    }
  };

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3000/getCourses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      setCourses(data.courseList || []);
    } catch (err) {
      setError('Failed to load courses');
      console.error('Error fetching courses:', err);
    }
  };

  // Fetch courses for a specific batch
  const fetchCoursesByBatchId = async (batchId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3000/getCourses?search=courseBatchId:${batchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch courses for batch ${batchId}`);
      }

      const data = await response.json();
      return data.courseList || [];
    } catch (err) {
      console.error(`Error fetching courses for batch ${batchId}:`, err);
      return [];
    }
  };

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchUserProgress(),
          fetchCourseBatches(),
          fetchCourses()
        ]);
      } catch (err) {
        setError('Failed to load course data');
        console.error('Error loading course data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Check if a batch is unlocked
  const isBatchUnlocked = (batchId: string): boolean => {
    // First batch is always unlocked
    if (courseBatches.length > 0 && courseBatches[0].courseBatchId === batchId) {
      return true;
    }

    // Find the batch's position
    const batchIndex = courseBatches.findIndex(batch => batch.courseBatchId === batchId);
    if (batchIndex <= 0) return false; // Not found or it's the first batch
    
    // Check if previous batch is completed
    const previousBatchId = courseBatches[batchIndex - 1].courseBatchId;
    const previousBatchProgress = userProgress.find(progress => progress.courseBatchId === previousBatchId);
    
    return previousBatchProgress?.status === 'completed';
  };

  // Get course completion percentage
  const getCourseCompletion = (courseId: string): number => {
    // Find course progress in user data
    for (const batchProgress of userProgress) {
      for (const courseProgress of batchProgress.courses) {
        if (courseProgress.courseId === courseId) {
          return courseProgress.completedExercisesCount / (courseProgress.totalExercisesInCourse || 1);
        }
      }
    }
    return 0;
  };

  return {
    courseBatches,
    courses,
    loading,
    error,
    fetchCoursesByBatchId,
    isBatchUnlocked,
    getCourseCompletion
  };
};