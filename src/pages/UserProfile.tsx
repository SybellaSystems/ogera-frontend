import React from "react";

interface UserProfileProps {
  profileData: any;
  user: any;
  userRole: string;
  loading: boolean;
  [key: string]: any;
}

const UserProfile: React.FC<UserProfileProps> = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">User Profile</h2>
        <p className="text-gray-600 mb-6">Regular user profile page - To be implemented</p>
        <p className="text-sm text-gray-500">Receiving all controller props and handlers in profile mode</p>
      </div>
    </div>
  );
};

export default UserProfile;
