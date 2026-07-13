import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  const formatUserId = (id: string) => {
    return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}...`;
  };

  const getUserInitials = (username: string) => {
    return username
      .split('_')
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  };

  return (
    <div className="min-h-screen bg-[#040506] text-white font-sans">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="key-card p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#ff6363]/30 to-[#56c2ff]/30 border-4 border-[#1b1c1e] shadow-lg overflow-hidden">
                <img
                  src={avatarUrl}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#59d499] rounded-full border-4 border-[#07080a]" title="Online"></div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {user.username.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h1>
              <p className="text-sm text-[#9c9c9d] mb-4">
                Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>

              <div className="inline-flex items-center gap-2 bg-[#1b1c1e] border border-[#363739] rounded-md px-3 py-2 text-xs font-mono text-[#9c9c9d]">
                <User size={14} />
                <span>{formatUserId(user.id)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="key-card p-6 text-center">
            <div className="text-3xl font-bold text-white mb-1">0</div>
            <div className="text-sm text-[#9c9c9d]">Gateways</div>
          </div>
          <div className="key-card p-6 text-center">
            <div className="text-3xl font-bold text-white mb-1">0</div>
            <div className="text-sm text-[#9c9c9d]">API Requests</div>
          </div>
          <div className="key-card p-6 text-center">
            <div className="text-3xl font-bold text-white mb-1">$0.00</div>
            <div className="text-sm text-[#9c9c9d]">Total Cost</div>
          </div>
        </div>

        <div className="key-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Account Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-[#1b1c1e]">
              <span className="text-sm text-[#9c9c9d]">Username</span>
              <span className="text-sm font-medium text-white">{user.username}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#1b1c1e]">
              <span className="text-sm text-[#9c9c9d]">User ID</span>
              <span className="text-sm font-mono text-white">{user.id}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-[#9c9c9d]">Account Type</span>
              <span className="text-sm font-medium text-white">Personal</span>
            </div>
          </div>
        </div>

        <div className="key-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => {
                logout();
                window.location.reload();
              }}
              className="w-full px-4 py-3 bg-[#ff6363]/10 border border-[#ff6363]/30 text-[#ff6363] rounded-md text-sm font-medium hover:bg-[#ff6363]/20 transition-colors"
            >
              Logout
            </button>
            <p className="text-xs text-[#6a6b6c] text-center">
              Logging out will remove your identity from this browser. You can always create a new identity when you return.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
