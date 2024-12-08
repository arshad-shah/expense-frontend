import React, { useState, useEffect } from "react";
import { User, UserInput } from "@/types";
import { AccountOverview } from "./Components/AccountsOverview";
import { ProfileForm } from "./Components/ProfileForm";
import { getUser, updateUser } from "@/services/userService"; // Import your user service
import { Button } from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";
import PageLoader from "@/components/PageLoader";
import ErrorState from "@/components/ErrorState";

const Profile: React.FC = () => {
  const { user: authUser } = useAuth(); // Assuming you're using Firebase Auth
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!authUser) {
        setError("User is not authenticated.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const profileData = await getUser(authUser.id, true); // Fetch user with relations
        setUser(profileData);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authUser]);

  const handleProfileUpdate = async (data: UserInput) => {
    if (!authUser) {
      setError("User is not authenticated.");
      return;
    }

    try {
      setLoading(true);
      await updateUser(authUser.id, data); // Update user data
      const updatedUser = await getUser(authUser.id); // Refresh user data
      setUser(updatedUser);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLoader text="Loading profile..." />
    );
  }

  if (error) {
    return (
      <ErrorState message="Failed to load profile" onRetry={() => window.location.reload()} />
    );
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-600">No user data available.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Profile</h1>

      <div className="space-y-8">
        <AccountOverview user={user} />

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">
            Personal Information
          </h2>
          <ProfileForm user={user} onSave={handleProfileUpdate} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
