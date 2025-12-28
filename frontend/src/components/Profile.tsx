import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  // Generate avatar URL using DiceBear API (adventurer style)
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  // Format user ID for display
  const formatUserId = (id: string) => {
    return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}...`;
  };

  // Get user stats (could be expanded later)
  const getUserInitials = (username: string) => {
    return username
      .split('_')
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Profile Header */}
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden">
                <img
                  src={avatarUrl}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800" title="Online"></div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {user.username.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>

              {/* User ID Badge */}
              <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-xs font-mono text-gray-700 dark:text-gray-300">
                <User size={14} />
                <span>{formatUserId(user.id)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Gateways</div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">API Requests</div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">$0.00</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Cost</div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">Username</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">User ID</span>
              <span className="text-sm font-mono text-gray-900 dark:text-white">{user.id}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">Account Type</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Personal</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to logout? This will clear your local identity.')) {
                  logout();
                  window.location.reload();
                }
              }}
              className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 rounded-md text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              Logout
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Logging out will remove your identity from this browser. You can always create a new identity when you return.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
