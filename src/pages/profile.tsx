import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLeft, HiSave, HiCamera } from 'react-icons/hi';
import { jwtDecode } from 'jwt-decode';

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  nickname?: string;
  biodata?: string;
  profilePicture?: string;
  xp: number;
  level: number;
  dateCreated: string;
  dateUpdated?: string;
  dateLastLogin?: string;
}

interface DecodedToken {
  id: string;
  username: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [nickname, setNickname] = useState<string>('');
  const [biodata, setBiodata] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  
  // Add a ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user ID from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setUserId(decoded.id);
      } catch (err) {
        console.error('Error decoding token:', err);
        setError('Failed to authenticate user');
      }
    }
  }, []);

  // Fetch profile data when userId is available
  useEffect(() => {
    if (!userId) return;
    
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:3000/getProfile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProfile(data.user);
        
        // Initialize form with current values
        setNickname(data.user.nickname || '');
        setBiodata(data.user.biodata || '');
        setProfilePicture(data.user.profilePicture || '');
        
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Add a function to handle file selection (this is replaced by the enhanced version below)
  /* Removed duplicate handleFileSelect function */
  
  // Function to trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3000/addProfile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          nickname,
          biodata,
          profilePicture
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        
        try {
          // Try to parse as JSON if possible
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || errorData.error || 'Failed to update profile');
        } catch (parseError) {
          // If not JSON, use the raw text
          throw new Error(`Failed to update profile: ${errorText}`);
        }
      }

      const data = await response.json();
      setProfile(data.user);
      setSuccess('Profile updated successfully!');
      
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Function to get appropriate league based on XP
  const getUserLeague = (xp: number): string => {
    if (xp >= 1200) return 'Diamond';
    if (xp >= 900) return 'Ruby';
    if (xp >= 600) return 'Emerald';
    if (xp >= 300) return 'Sapphire';
    return 'Bronze';
  };

  const getLeagueColor = (league: string) => {
    switch (league.toLowerCase()) {
      case 'diamond': return 'bg-blue-500';
      case 'ruby': return 'bg-red-500';
      case 'emerald': return 'bg-green-500';
      case 'sapphire': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

    // Function to resize image before upload
    const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Max width/height for the image
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;
            
            // Calculate new dimensions
            if (width > height) {
            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }
            } else {
            if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
            }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Get the data URL (base64 string)
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // 0.7 quality - adjust if needed
            resolve(dataUrl);
        };
        img.onerror = reject;
        };
        reader.onerror = reject;
    });
    };

    // Then replace your handleFileSelect function with this:
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        // Check file type
        if (!file.type.match('image.*')) {
            setError('Please select an image file');
            return;
        }
        
        try {
            setLoading(true);
            // Resize and compress the image
            const compressedImage = await resizeImage(file);
            setProfilePicture(compressedImage);
            setSuccess('Image selected! Click "Save Profile" to update your profile.');
        } catch (err) {
            console.error('Error processing image:', err);
            setError('Failed to process the image');
        } finally {
            setLoading(false);
        }
    };



  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300"
          >
            <HiArrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white">
            <h1 className="text-3xl font-bold text-center">
              My Profile
            </h1>
          </div>

          {loading && !profile ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error && !profile ? (
            <div className="text-center p-12 text-red-500">{error}</div>
          ) : profile ? (
            <div className="p-6">
              {/* Profile Header with clickable image */}
              <div className="flex flex-col md:flex-row items-center mb-8">
                <div className="relative">
                  {/* Hidden file input */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  
                  {/* Clickable profile image */}
                  <div 
                    className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4 md:mb-0 cursor-pointer relative group"
                    onClick={triggerFileInput}
                  >
                    <img 
                      src={profilePicture || profile.profilePicture || `https://ui-avatars.com/api/?name=${profile.nickname || profile.username}&background=random&size=128`} 
                      alt="Profile"
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-40">
                      <HiCamera className="text-white text-3xl" />
                    </div>
                  </div>
                  
                  {/* Upload button below image */}
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="mt-2 w-full py-1 px-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md flex items-center justify-center transition-colors"
                  >
                    <HiCamera className="mr-1" />
                    Change Photo
                  </button>
                </div>
                
                <div className="text-center md:text-left md:ml-8">
                  <h2 className="text-2xl font-bold text-gray-800">{profile.nickname || profile.username}</h2>
                  <p className="text-gray-600">@{profile.username}</p>
                  <div className="flex items-center justify-center md:justify-start mt-2">
                    <span className="text-sm font-medium mr-4">Level {profile.level}</span>
                    <span className="text-sm font-medium mr-4">{profile.xp} XP</span>
                    {profile.xp > 0 && (
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLeagueColor(getUserLeague(profile.xp))} text-white`}>
                        {getUserLeague(profile.xp)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Success Message */}
              {success && (
                <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-md">
                  {success}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              {/* Profile Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                    Nickname
                  </label>
                  <input 
                    type="text" 
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter a nickname"
                  />
                </div>

                {/* Image options */}
                <div className="hidden">
                  <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Picture URL
                  </label>
                  <input 
                    type="text" 
                    id="profilePicture"
                    value={profilePicture}
                    onChange={(e) => setProfilePicture(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter image URL"
                  />
                </div>

                <div>
                  <label htmlFor="biodata" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea 
                    id="biodata"
                    value={biodata}
                    onChange={(e) => setBiodata(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell us about yourself"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <HiSave className="mr-2 h-5 w-5" />
                    {loading ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>

              {/* Account Info */}
              <div className="mt-10 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <span className="block text-sm font-medium text-gray-500">Email</span>
                    <span className="block text-gray-800">{profile.email}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <span className="block text-sm font-medium text-gray-500">Joined</span>
                    <span className="block text-gray-800">{new Date(profile.dateCreated).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Profile;