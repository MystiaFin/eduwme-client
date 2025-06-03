import { useEffect, useState } from "react";
import { useParams } from "react-router";
import AvatarPlaceholder from "@src/assets/avatar_placeholder.jpg";

interface UserProfile {
  username: string;
  nickname: string;
  biodata: string;
  xp: number;
  level: number;
}

const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError("User ID is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/users/getprofile/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          },
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Network response was not ok" }));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`,
          );
        }

        const data = await response.json();

        if (data && data.user) {
          setUserProfile(data.user);
        } else {
          throw new Error("User data not found in API response.");
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred.",
        );
        setUserProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, API_BASE_URL]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen p-4">
        <p className="text-xl text-red-600">Error loading profile:</p>
        <p className="text-md text-red-500 bg-red-100 p-3 rounded-md mt-2">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-700">User profile not found.</p>
      </div>
    );
  }

  return (
    <div className="container pb-36 mx-auto p-4 md:p-8 shadow-lg rounded-lg mt-10 max-w-2xl">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
        <img
          src={AvatarPlaceholder}
          alt="User Avatar"
          className="w-24 h-24 rounded-full mx-auto mb-4"
        />
      </h1>
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-md shadow-sm">
          <strong className="text-gray-600">Username:</strong>
          <p className="text-gray-800 text-lg">{userProfile.username}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-md shadow-sm">
          <strong className="text-gray-600">Nickname:</strong>
          <p className="text-gray-800 text-lg">{userProfile.nickname}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-md shadow-sm">
          <strong className="text-gray-600">Bio:</strong>
          <p className="text-gray-800 text-lg whitespace-pre-wrap">
            {userProfile.biodata || "No bio provided."}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-md shadow-sm text-center">
            <strong className="text-blue-600 block text-sm">XP</strong>
            <p className="text-blue-800 text-2xl font-semibold">
              {userProfile.xp}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-md shadow-sm text-center">
            <strong className="text-green-600 block text-sm">Level</strong>
            <p className="text-green-800 text-2xl font-semibold">
              {userProfile.level}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
