import { useState, useEffect } from 'react';
import {Currency, WeekDay, DateFormat, UserPreferences } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import Alert from '@/components/Alert';
import {
  Pencil,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ErrorState from '@/components/ErrorState';
import PageLoader from '@/components/PageLoader';
import { CURRENCY } from '@/constants';
import { useUser } from '@/contexts/UserContext';
import { formatDate } from '@/lib/utils';

const ProfileComponent = () => {
  const { user: authUser } = useAuth();
  const { updateProfile, updatePreferences, isUpdating } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  // Profile edit state
  const [editedProfile, setEditedProfile] = useState({
    firstName: '',
    lastName: '',
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
        setSuccess('Preferences updated successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to update preferences');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    }
  };

  const handleSaveProfile = async () => {
    if (!authUser) return;

    try {
      const response = await updateProfile(editedProfile);
      if (response.status === 200) {
        setSuccess('Profile updated successfully');
        setIsEditingProfile(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  if (isUpdating) {
    return <PageLoader text='Loading profile...' />;
  }

  if (error || !authUser) {
    return <ErrorState message={error || 'Failed to load profile'} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="bg-gradient-to-br p-8">
      <div className="mx-auto space-y-8">
        {success && (
          <Alert variant="success">
              {success}
          </Alert>
        )}

        {/* Header with Edit */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {authUser.firstName[0]}{authUser.lastName[0]}
                </span>
              </div>
              {isEditingProfile ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="First Name"
                      value={editedProfile.firstName}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                    <Input
                      placeholder="Last Name"
                      value={editedProfile.lastName}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setIsEditingProfile(false)} variant="outline">Cancel</Button>
                    <Button onClick={handleSaveProfile} variant='primary'>Save</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {authUser.firstName} {authUser.lastName}
                    </h1>
                    <Button size='icon' variant='ghost' onClick={() => setIsEditingProfile(true)} className="text-gray-400 hover:text-gray-600">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-gray-500">{authUser.email}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Member since {formatDate(authUser.stats.signupDate, {
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
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Preferences</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <Select 
                  value={authUser.preferences.currency} 
                  onValueChange={(value: Currency) => handleUpdatePreferences({ currency: value })}
                >
                  <SelectTrigger>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Format
                </label>
                <Select 
                  value={authUser.preferences.dateFormat} 
                  onValueChange={(value: DateFormat) => handleUpdatePreferences({ dateFormat: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Week Starts On
                </label>
                <Select 
                  value={authUser.preferences.weekStartDay} 
                  onValueChange={(value: WeekDay) => handleUpdatePreferences({ weekStartDay: value })}
                >
                  <SelectTrigger>
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
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;