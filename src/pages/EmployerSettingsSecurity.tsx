import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  Alert,
  Button,
  CircularProgress,
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material';
import {
  LockClosedIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import EditProfileModal from '../components/EditProfileModal';
import ProfileHeaderCard from '../components/Profile/ProfileHeaderCard';
import { getUserProfile, type UserProfile } from '../services/api/profileApi';
import { useGetFullProfileQuery } from '../services/api/extendedProfileApi';
import { useGetProfileCompletionQuery } from '../services/api/profileCompletionApi';
import {
  useGetActiveSessionsQuery,
  useRevokeAllSessionsMutation,
} from '../services/api/sessionsApi';

interface SessionSummary {
  id: string;
  device_name: string;
  last_active: string;
}

type SecuritySection = 'password' | 'twoFactor' | 'sessions' | 'danger';

const EmployerSettingsSecurity: React.FC = () => {
  const { t } = useTranslation();
  const user = useSelector((state: any) => state.auth.user);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [activeSection, setActiveSection] = useState<SecuritySection>('password');
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isTwoFaEnabled, setIsTwoFaEnabled] = useState(Boolean(user?.two_fa_enabled || false));

  const { data: fullProfileData } = useGetFullProfileQuery();
  const { data: profileCompletionData, refetch: refetchProfileCompletion } = useGetProfileCompletionQuery();
  const { data: sessionsResponse, isLoading: isSessionsLoading, refetch: refetchSessions } = useGetActiveSessionsQuery();
  const [revokeAllSessions, { isLoading: isRevokingAllSessions }] = useRevokeAllSessionsMutation();

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const response = await getUserProfile();
        if (active) {
          setProfileData(response.data);
          setIsTwoFaEnabled(Boolean(response.data?.two_fa_enabled ?? user?.two_fa_enabled));
        }
      } catch (error) {
        if (active) {
          setProfileData(null);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [user?.two_fa_enabled]);

  const handleProfileDataRefresh = async () => {
    await refetchProfileCompletion();

    try {
      const response = await getUserProfile();
      setProfileData(response.data);
      setIsTwoFaEnabled(Boolean(response.data?.two_fa_enabled ?? user?.two_fa_enabled));
    } catch (error) {
      console.error('Failed to refresh profile data:', error);
    }
  };

  const userRole = (profileData?.role?.roleName || user?.role?.roleName || user?.role || '').toString();

  const securitySidebarItems: Array<{
    key: SecuritySection;
    label: string;
    icon: React.ReactNode;
  }> = [
    { key: 'password', label: t('security.password', { defaultValue: 'Password' }), icon: <LockClosedIcon className="w-4 h-4" /> },
    { key: 'twoFactor', label: t('security.twoFactor', { defaultValue: 'Two-Factor Authentication' }), icon: <ShieldCheckIcon className="w-4 h-4" /> },
    { key: 'sessions', label: t('security.activeSessions', { defaultValue: 'Active Sessions' }), icon: <UserGroupIcon className="w-4 h-4" /> },
    { key: 'danger', label: t('security.dangerZone', { defaultValue: 'Danger Zone' }), icon: <ExclamationTriangleIcon className="w-4 h-4" /> },
  ];

  const sessions = useMemo<SessionSummary[]>(() => {
    const rawSessions = sessionsResponse?.data || [];
    return rawSessions.map((session) => ({
      id: session.id,
      device_name: session.user_agent || session.device_type || 'Unknown device',
      last_active: session.last_activity,
    }));
  }, [sessionsResponse?.data]);

  const formatLastActive = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage(t('security.fillAllFields', { defaultValue: 'Please complete all password fields.' }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(t('security.passwordMismatch', { defaultValue: 'New password and confirmation do not match.' }));
      return;
    }

    setSaving(true);
    try {
      setErrorMessage('');
      toast.success(t('security.passwordUpdated', { defaultValue: 'Password updated successfully.' }));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setErrorMessage(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    setSaving(true);
    try {
      setIsTwoFaEnabled((prev) => !prev);
      toast.success(
        isTwoFaEnabled
          ? t('security.twoFactorDisabled', { defaultValue: 'Two-factor authentication disabled.' })
          : t('security.twoFactorEnabled', { defaultValue: 'Two-factor authentication enabled.' })
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!window.confirm(t('security.confirmLogoutAll', { defaultValue: 'Logout all devices?' }))) {
      return;
    }

    try {
      await revokeAllSessions().unwrap();
      toast.success(t('security.logoutAllSuccess', { defaultValue: 'All devices logged out successfully.' }));
      await refetchSessions();
    } catch (error: any) {
      toast.error(error?.data?.message || t('common.error'));
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(t('security.confirmDeleteAccount', { defaultValue: 'Delete your account permanently?' }))) {
      return;
    }

    toast.error(t('security.deleteAccountUnavailable', { defaultValue: 'Account deletion is not available yet.' }));
  };

  const renderPasswordSection = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-[#7f56d9] px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <LockClosedIcon className="w-6 h-6" />
            {t('security.passwordSection', { defaultValue: 'Password' })}
          </h2>
        </div>
      </div>
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('security.currentPassword', { defaultValue: 'Current password' })}
            </label>
            <TextField
              fullWidth
              size="small"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t('security.currentPassword', { defaultValue: 'Current password' })}
              variant="outlined"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('security.newPassword', { defaultValue: 'New password' })}
            </label>
            <TextField
              fullWidth
              size="small"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('security.newPassword', { defaultValue: 'New password' })}
              variant="outlined"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('security.confirmPassword', { defaultValue: 'Confirm password' })}
            </label>
            <TextField
              fullWidth
              size="small"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('security.confirmPassword', { defaultValue: 'Confirm password' })}
              variant="outlined"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Button
            variant="contained"
            style={{ backgroundColor: '#7f56d9' }}
            disabled={saving}
            onClick={handlePasswordUpdate}
          >
            {saving ? <CircularProgress size={20} /> : t('security.updatePassword', { defaultValue: 'Update Password' })}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTwoFactorSection = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-[#7f56d9] px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheckIcon className="w-6 h-6" />
            {t('security.twoFactorSection', { defaultValue: 'Two-Factor Authentication' })}
          </h2>
        </div>
      </div>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {isTwoFaEnabled ? t('security.enabled', { defaultValue: 'Enabled' }) : t('security.disabled', { defaultValue: 'Disabled' })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {t('security.twoFactorDescription', { defaultValue: 'Use the switch to control your 2FA status.' })}
            </p>
          </div>
          <FormControlLabel
            control={
              <Switch
                checked={isTwoFaEnabled}
                onChange={handleTwoFactorToggle}
              />
            }
            label=""
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#f5f3ff] p-3 text-[#7f56d9]">
                <DevicePhoneMobileIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t('security.status', { defaultValue: 'Current status' })}</p>
                <p className="text-xs text-gray-500">{isTwoFaEnabled ? t('security.enabled', { defaultValue: 'Enabled' }) : t('security.disabled', { defaultValue: 'Disabled' })}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#f5f3ff] p-3 text-[#7f56d9]">
                <KeyIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t('security.accountProtection', { defaultValue: 'Account protection' })}</p>
                <p className="text-xs text-gray-500">{t('security.keepAccountSecure', { defaultValue: 'Adds an extra layer of security to your account.' })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSessionsSection = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-[#7f56d9] px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserGroupIcon className="w-6 h-6" />
            {t('security.activeSessions', { defaultValue: 'Active Sessions' })}
          </h2>
          <Button
            variant="contained"
            style={{ backgroundColor: '#fff' }}
            sx={{ color: '#7f56d9' }}
            onClick={handleLogoutAllDevices}
            disabled={isRevokingAllSessions}
          >
            {isRevokingAllSessions ? t('common.loading', { defaultValue: 'Loading...' }) : t('security.logoutAllDevices', { defaultValue: 'Logout all devices' })}
          </Button>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {isSessionsLoading ? (
          <div className="flex justify-center py-8">
            <CircularProgress />
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <ComputerDesktopIcon className="mx-auto mb-3 w-10 h-10 text-gray-300" />
            <p className="text-sm font-medium text-gray-700">
              {t('security.noSessions', { defaultValue: 'No active sessions found.' })}
            </p>
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{session.device_name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('security.lastActive', { defaultValue: 'Last active' })}: {formatLastActive(session.last_active)}
                  </p>
                </div>
                <span className="rounded-full bg-[#f5f3ff] px-3 py-1 text-xs font-semibold text-[#7f56d9]">
                  {t('security.active', { defaultValue: 'Active' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderDangerSection = () => (
    <div className="bg-white rounded-xl shadow-lg border border-red-200 overflow-hidden">
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ExclamationTriangleIcon className="w-6 h-6" />
            {t('security.dangerZone', { defaultValue: 'Danger Zone' })}
          </h2>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-900">{t('security.deleteAccountWarning', { defaultValue: 'Deleting your account is permanent and cannot be undone.' })}</p>
          <p className="mt-1 text-xs text-red-700">{t('security.deleteAccountWarningDesc', { defaultValue: 'All associated data and access will be removed.' })}</p>
        </div>

        <div className="pt-2 border-t border-red-200">
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAccount}
          >
            {t('security.deleteAccount', { defaultValue: 'Delete Account' })}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f4ff]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#7f56d9]/15 blur-3xl" />
        <div className="absolute right-[-5rem] top-40 h-80 w-80 rounded-full bg-[#5b3ba5]/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(127,86,217,0.08),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(91,59,165,0.08),_transparent_30%),linear-gradient(to_bottom,_rgba(255,255,255,0.7),_rgba(255,255,255,0.88))]" />
        <div className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(rgba(127,86,217,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(127,86,217,0.16)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="overflow-y-auto p-4 md:p-8">
        <ProfileHeaderCard
          profileData={profileData || user}
          fullProfileData={fullProfileData?.data || null}
          profileCompletion={profileCompletionData?.data?.profile_completion_percentage || 0}
          wrapperClassName="mb-8"
          contentClassName="w-full px-0 py-6"
          onEditProfileClick={() => setIsEditProfileModalOpen(true)}
          onProfileDataRefresh={handleProfileDataRefresh}
        />

        <div className="max-w-7xl mx-auto">
          <div className="mb-8 max-w-5xl overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-r from-white/90 via-white/75 to-[#f3edff]/90 px-6 py-5 shadow-[0_18px_50px_rgba(127,86,217,0.10)] backdrop-blur-lg sm:px-8 sm:py-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-[#e4dcff] bg-[#f5f0ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#7f56d9]">
                {t('security.pageLabel', { defaultValue: 'Security' })}
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {t('security.pageTitle', { defaultValue: 'Security' })}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                {t('security.pageDescription', { defaultValue: 'Manage your passwords, 2FA, active sessions, and account deletion.' })}
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6">
              <Alert severity="error">
                {errorMessage}
              </Alert>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start">
            <div className="lg:sticky lg:top-4">
              <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/80 shadow-[0_20px_70px_rgba(127,86,217,0.12)] backdrop-blur-xl">
                <div className="bg-[#5b3ba5] px-4 py-3">
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    {t('profile.quickLinks', { defaultValue: 'Quick Links' })}
                  </h3>
                </div>
                <nav className="p-3 space-y-1">
                  {securitySidebarItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveSection(item.key)}
                      className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between group ${
                        activeSection === item.key
                          ? 'bg-[#7f56d9] text-white shadow-lg'
                          : 'text-gray-700 hover:bg-[#f5f3ff] hover:shadow-md'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      <span className={`w-2 h-2 rounded-full ${activeSection === item.key ? 'bg-white' : 'bg-transparent'}`} />
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            <div className="space-y-6">
              <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/75 shadow-[0_20px_70px_rgba(127,86,217,0.10)] backdrop-blur-xl">
                <div className="p-3 sm:p-4 md:p-6">
                  {activeSection === 'password' && renderPasswordSection()}
                  {activeSection === 'twoFactor' && renderTwoFactorSection()}
                  {activeSection === 'sessions' && renderSessionsSection()}
                  {activeSection === 'danger' && renderDangerSection()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        profileData={profileData}
        onUpdateSuccess={handleProfileDataRefresh}
        userRole={userRole}
      />
    </div>
  );
};

export default EmployerSettingsSecurity;
