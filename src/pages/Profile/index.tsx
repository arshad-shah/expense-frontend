import React, { useState, useEffect } from 'react';
import {UserStats, Currency, WeekDay, DateFormat, UserPreferences } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import Alert from '@/components/Alert';
import { 
  CreditCard, 
  DollarSign, 
  PiggyBank, 
  Settings, 
  TrendingUp, 
  TrendingDown,
  Pencil,
  X,
  Check 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ErrorState from '@/components/ErrorState';
import PageLoader from '@/components/PageLoader';
import { CURRENCY } from '@/constants';
import { useUser } from '@/contexts/UserContext';
import { formatCurrency, formatDate } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color: string;
  onEdit?: () => void;
  isEditing?: boolean;
  editValue?: string | number;
  onEditChange?: (value: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  hasEditButton?: boolean;
}

const ProfileComponent = () => {
  const { user: authUser } = useAuth();
  const { updateProfile, updatePreferences, updateStats, isUpdating } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedStats, setEditedStats] = useState<Partial<UserStats>>({});
  const [editingStatKey, setEditingStatKey] = useState<string | null>(null);
  
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
      setEditedStats({
        monthlyIncome: authUser.stats.monthlyIncome,
        monthlySpending: authUser.stats.monthlySpending,
        savingsRate: authUser.stats.savingsRate,
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

  const handleSaveStat = async (key: string) => {
    if (!authUser) return;

    try {
      const response = await updateStats({ [key]: Number(editedStats[key as keyof UserStats]) });
      if (response.status === 200) {
        setSuccess('Stats updated successfully');
        setEditingStatKey(null);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to update stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stats');
    }
  };

  const StatCard: React.FC<StatCardProps> = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    color,
    isEditing,
    editValue,
    onEdit,
    onEditChange,
    onSave,
    onCancel,
    hasEditButton = true
  }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${color}`} />
          <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        </div>
        {hasEditButton && (<div className="flex items-center gap-2">

          {!isEditing ? (
            <Button size='icon' variant='ghost' onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button size='icon' variant='success' onClick={onSave}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size='icon' variant='danger' onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>)}
      </div>
      <div className="space-y-2">
        {isEditing ? (
          <Input
            type="number"
            value={editValue}
            onChange={(e) => onEditChange?.(e.target.value)}
            className="text-lg"
          />
        ) : (
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        )}
        {trend && !isEditing && (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend.direction === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {trend.direction === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value}%
            </div>
            <span className="text-sm text-gray-500">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );

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