import { useState, useEffect } from "react";
import { Currency, WeekDay, DateFormat, UserPreferences } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import Alert from "@/components/Alert";
import { Dialog } from "@/components/Dialog";
import { Pencil, Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ErrorState from "@/components/ErrorState";
import PageLoader from "@/components/PageLoader";
import { CURRENCY } from "@/constants";
import { useUser } from "@/contexts/UserContext";
import { formatDate } from "@/lib/utils";
import { initiateEmailChange } from "@/services/EmailChangeService";
import { DeleteAccountDialog } from "./DeleteAccountDialog";
import { deleteUserAccount } from "@/services/DeleteUserService";
import { useNavigate } from "react-router-dom";
import { FirebaseErrorHandler } from "@/lib/firebase-error-handler";

const ProfileComponent = () => {
  const { user: authUser, firebaseUser } = useAuth();
  const navigate = useNavigate();
  const { updateProfile, updatePreferences, isUpdating } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [emailChangeForm, setEmailChangeForm] = useState({
    newEmail: "",
    currentPassword: "",
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Profile edit state
  const [editedProfile, setEditedProfile] = useState({
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    if (authUser) {
      setEditedProfile({
        firstName: authUser.firstName,
        lastName: authUser.lastName,
      });
    }
  }, [authUser]);

  const handleUpdatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!authUser) return;

    try {
      const response = await updatePreferences(updates);
      if (response.status === 200) {
        setSuccess("Preferences updated successfully");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Failed to update preferences");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update preferences",
      );
    }
  };

  const handleSaveProfile = async () => {
    if (!authUser) return;

    try {
      const response = await updateProfile(editedProfile);
      if (response.status === 200) {
        setSuccess("Profile updated successfully");
        setIsEditingProfile(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Failed to update profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  const handleInitiateEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

    try {
      const response = await initiateEmailChange(
        emailChangeForm.newEmail,
        emailChangeForm.currentPassword,
      );

      if (response.status === 200) {
        setSuccess("Verification email sent. Please check your inbox.");
        setIsChangingEmail(false);
        setEmailChangeForm({ newEmail: "", currentPassword: "" });
      } else {
        setError(
          FirebaseErrorHandler.auth(response.error, "initiate email change")
            .message,
        );
      }
    } catch (err) {
      setError(FirebaseErrorHandler.auth(err, "initiate email change").message);
    }
  };

  const handleDeleteAccount = async (password?: string) => {
    if (!authUser) return;

    setIsDeleting(true);
    try {
      const response = await deleteUserAccount(authUser.id, password);
      if (response.status === 200) {
        // User will be automatically logged out by Firebase
        navigate("/login");
      } else {
        setError(
          FirebaseErrorHandler.auth(response.error, "delete account").message,
        );
      }
    } catch (err) {
      setError(FirebaseErrorHandler.auth(err, "delete account").message);
      setIsDeleting(false);
    }
  };

  if (isUpdating) {
    return <PageLoader text="Loading profile..." />;
  }

  if (!authUser) {
    return (
      <ErrorState
        message={"Failed to load profile"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="bg-gradient-to-br p-4">
      <div className="mx-auto">
        {success && <Alert variant="success">{success}</Alert>}

        {error && (
          <Alert variant="error" title="An error occurred">
            {error}
          </Alert>
        )}

        {/* Header with Edit */}
        <div className="bg-white rounded-xl p-6 sm:p-4 shadow-lg">
          <div className="flex justify-end">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEditingProfile(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Profile Picture & Details */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {authUser.firstName[0]}
                  {authUser.lastName[0]}
                </span>
              </div>

              {/* Editable Fields or User Info */}
              {isEditingProfile ? (
                <div className="w-full sm:w-auto space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="First Name"
                      value={editedProfile.firstName}
                      onChange={(e) =>
                        setEditedProfile((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      className="w-full"
                    />
                    <Input
                      placeholder="Last Name"
                      value={editedProfile.lastName}
                      onChange={(e) =>
                        setEditedProfile((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsEditingProfile(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} variant="primary">
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center sm:text-left">
                  {/* Name with Edit Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {authUser.firstName} {authUser.lastName}
                    </h1>
                  </div>
                  {/* Email with Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <p className="text-gray-500">{authUser.email}</p>
                    {firebaseUser &&
                      firebaseUser.providerData.find(
                        (provider) => provider.providerId === "password",
                      ) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsChangingEmail(true)}
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          Change email
                        </Button>
                      )}
                  </div>
                  {/* Member Since */}
                  <p className="text-sm text-gray-400 mt-1">
                    Member since{" "}
                    {formatDate(authUser.stats.signupDate, {
                      useRelative: false,
                      shortFormat: true,
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings/Preferences */}
        <div className="bg-white rounded-xl p-4 shadow-lg mt-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Account Preferences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Select
              value={authUser.preferences.currency}
              onValueChange={(value: Currency) =>
                handleUpdatePreferences({ currency: value })
              }
            >
              <SelectTrigger label="Currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={authUser.preferences.dateFormat}
              onValueChange={(value: DateFormat) =>
                handleUpdatePreferences({ dateFormat: value })
              }
            >
              <SelectTrigger label="Date Format">
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={authUser.preferences.weekStartDay}
              onValueChange={(value: WeekDay) =>
                handleUpdatePreferences({ weekStartDay: value })
              }
            >
              <SelectTrigger label="Week Starts On">
                <SelectValue placeholder="Select start day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sunday">Sunday</SelectItem>
                <SelectItem value="monday">Monday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Email Change Dialog */}
      <Dialog
        isOpen={isChangingEmail}
        onClose={() => {
          setIsChangingEmail(false);
          setEmailChangeForm({ newEmail: "", currentPassword: "" });
        }}
        title="Change Email Address"
      >
        <form onSubmit={handleInitiateEmailChange} className="space-y-4">
          <Input
            label="New Email Address"
            type="email"
            required
            value={emailChangeForm.newEmail}
            onChange={(e) =>
              setEmailChangeForm((prev) => ({
                ...prev,
                newEmail: e.target.value,
              }))
            }
            icon={<Mail className="h-5 w-5" />}
            placeholder="Enter new email address"
          />
          <Input
            label="Current Password"
            type="password"
            required
            value={emailChangeForm.currentPassword}
            onChange={(e) =>
              setEmailChangeForm((prev) => ({
                ...prev,
                currentPassword: e.target.value,
              }))
            }
            icon={<Lock className="h-5 w-5" />}
            placeholder="Enter your current password"
          />
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsChangingEmail(false);
                setEmailChangeForm({ newEmail: "", currentPassword: "" });
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send Verification Email
            </Button>
          </div>
        </form>
      </Dialog>

      <div className="bg-white rounded-xl p-4 shadow-lg mt-4 mx-auto flex flex-col">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Danger Zone
        </h2>
        <div className="border rounded-lg border-red-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <p className="text-md text-gray-600 mt-1">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button
              variant="danger"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ProfileComponent;
