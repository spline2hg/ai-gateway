import React, { useState, useEffect } from 'react';
import { Gateway, LogEntry } from './types';
import Dashboard from './components/Dashboard';
import GatewayView from './components/GatewayView';
import Profile from './components/Profile';
import LandingPage from './pages/LandingPage';
import { analyticsApi } from './services/apiService';
import { Command, ChevronRight, Book, Loader2, Copy, Check, Sun, Moon } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading: authLoading, join } = useAuth();

  // Auto-join on first visit if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      join().catch(err => console.error('Auto-join failed:', err));
    }
  }, [authLoading, user, join]);

  // Application State - NO INITIAL SAMPLE DATA
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simple State-based Router
  const [view, setView] = useState<'landing' | 'dashboard' | 'gateway' | 'profile'>('landing');
  const [selectedGatewayId, setSelectedGatewayId] = useState<string | null>(null);

  // State for storing newly created gateway credentials
  const [newGatewayCredentials, setNewGatewayCredentials] = useState<{id: string, secret: string} | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Fetch real gateways from database on mount
  useEffect(() => {
    const fetchGateways = async () => {
      if (!user) return; // Don't fetch if not authenticated

      try {
        setLoading(true);
        setError(null);

        const gateways = await analyticsApi.fetchAllGateways();

        // Fetch analytics for each gateway to get real stats
        const transformedGateways = await Promise.all(
          gateways.map(async (gw: any) => {
            try {
              // Fetch summary analytics for each gateway
              const summary = await analyticsApi.getGatewaySummary(gw.id, 30);
              return {
                id: gw.id,
                name: gw.name,
                slug: gw.name.toLowerCase().replace(/\s+/g, '-'),
                description: `Gateway created at ${gw.created_at}`,
                requestCount: summary.total_requests || 0,
                tokens: (summary.tokens_in || 0) + (summary.tokens_out || 0),
                cost: summary.total_cost || 0,
                createdAt: gw.created_at
              };
            } catch (error) {
              console.error(`Failed to fetch analytics for gateway ${gw.id}:`, error);
              return {
                id: gw.id,
                name: gw.name,
                slug: gw.name.toLowerCase().replace(/\s+/g, '-'),
                description: `Gateway created at ${gw.created_at}`,
                requestCount: 0,
                tokens: 0,
                cost: 0,
                createdAt: gw.created_at
              };
            }
          })
        );

        setGateways(transformedGateways);
      } catch (err) {
        console.error('Failed to fetch gateways:', err);
        setError('Failed to load gateways from database');
        setGateways([]);  // NO SAMPLE DATA
      } finally {
        setLoading(false);
      }
    };

    fetchGateways();
  }, [user]); // Fetch when user changes

  // Handlers
  const handleSelectGateway = (id: string) => {
    setSelectedGatewayId(id);
    setView('gateway');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setSelectedGatewayId(null);
  };

  const handleEnterDashboard = () => {
    setView('dashboard');
  };

  const handleGoToProfile = () => {
    // First enter dashboard (which handles auth), then go to profile
    setView('dashboard');
    // Schedule profile view after a tick to ensure auth is ready
    setTimeout(() => setView('profile'), 0);
  };

  const handleCreateGateway = async (name: string) => {
    try {
      const result = await analyticsApi.createGateway(name);

      // Store credentials to show to user
      setNewGatewayCredentials({
        id: result.id,
        secret: result.secret
      });
      setShowCredentialsModal(true);

      // Refresh the gateways list with analytics data
      const gateways = await analyticsApi.fetchAllGateways();
      const transformedGateways = await Promise.all(
        gateways.map(async (gw: any) => {
          try {
            // Fetch summary analytics for each gateway
            const summary = await analyticsApi.getGatewaySummary(gw.id, 30);
            return {
              id: gw.id,
              name: gw.name,
              slug: gw.name.toLowerCase().replace(/\s+/g, '-'),
              description: `Gateway created at ${gw.created_at}`,
              requestCount: summary.total_requests || 0,
              tokens: (summary.tokens_in || 0) + (summary.tokens_out || 0),
              cost: summary.total_cost || 0,
              createdAt: gw.created_at
            };
          } catch (error) {
            console.error(`Failed to fetch analytics for gateway ${gw.id}:`, error);
            return {
              id: gw.id,
              name: gw.name,
              slug: gw.name.toLowerCase().replace(/\s+/g, '-'),
              description: `Gateway created at ${gw.created_at}`,
              requestCount: 0,
              tokens: 0,
              cost: 0,
              createdAt: gw.created_at
            };
          }
        })
      );
      setGateways(transformedGateways);
    } catch (err) {
      console.error('Failed to create gateway:', err);
      setError('Failed to create gateway');
    }
  };

  const copyToClipboard = async (text: string, type: 'id' | 'secret') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'id') {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } else {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNewLog = (newLog: LogEntry) => {
    setLogs(prev => [newLog, ...prev]);

    // Also update user/gateway stats
    setGateways(prev => prev.map(gw => {
        if (gw.id === newLog.gatewayId) {
            return {
                ...gw,
                requestCount: gw.requestCount + 1,
                tokens: gw.tokens + newLog.tokensIn + newLog.tokensOut,
                cost: gw.cost + newLog.cost
            }
        }
        return gw;
    }));
  };

  const selectedGateway = gateways.find(gw => gw.id === selectedGatewayId);

  // Show landing page if on landing view
  if (view === 'landing') {
    return <LandingPage onEnter={handleEnterDashboard} onProfile={handleGoToProfile} />;
  }

  // Show loading state while checking authentication or fetching gateways
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-gray-400 dark:text-gray-600 animate-spin" />
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {authLoading ? 'Setting up your identity...' : 'Loading gateways...'}
          </span>
        </div>
      </div>
    );
  }

  // Show error state if failed to fetch gateways
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans flex items-center justify-center">
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800/30 rounded-lg p-6 text-center max-w-md">
          <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 dark:bg-red-800 text-white rounded text-sm hover:bg-red-700 dark:hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans selection:bg-gray-200 dark:selection:bg-gray-800 selection:text-gray-900 dark:selection:text-white">

      {/* Top Bar Navigation (Global) */}
      <nav className="sticky top-0 z-50 h-14 glass-panel flex items-center px-4 sm:px-6 justify-between">
           <div className="flex items-center gap-4">
              <div
                 className="flex items-center gap-2 cursor-pointer group transition-opacity"
                 onClick={handleBackToDashboard}
               >
                   <div className="w-6 h-6 bg-gray-900 dark:bg-white rounded flex items-center justify-center text-white dark:text-black shadow-sm">
                       <Command size={12} strokeWidth={3} />
                   </div>

                   <div className="flex items-center text-sm">
                     <span className="font-semibold tracking-tight text-gray-900 dark:text-white">AI Analytics</span>
                   </div>
               </div>

               {view === 'gateway' && selectedGateway && (
                   <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 animate-fade-in">
                      <span className="mx-2 text-gray-300 dark:text-gray-700">/</span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">{selectedGateway.name}</span>
                   </div>
               )}
               {view === 'profile' && (
                   <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 animate-fade-in">
                      <span className="mx-2 text-gray-300 dark:text-gray-700">/</span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">Profile</span>
                   </div>
               )}
           </div>

           <div className="flex items-center gap-4">
               <button
                 onClick={toggleTheme}
                 className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                 aria-label="Toggle theme"
               >
                 {theme === 'light' ? (
                   <Moon size={16} />
                 ) : (
                   <Sun size={16} />
                 )}
               </button>
               {user && (
                 <div className="flex items-center gap-3">
                   <button
                     onClick={() => setView('profile')}
                     className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                   >
                     Profile
                   </button>
                   <button
                     onClick={() => setView('profile')}
                     className="w-7 h-7 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-medium text-gray-900 dark:text-white shadow-inner hover:scale-105 transition-transform cursor-pointer"
                     title={user.username}
                   >
                     {user.username.charAt(0).toUpperCase()}
                   </button>
                 </div>
               )}
           </div>
       </nav>

      <main>
        {view === 'dashboard' && (
          <Dashboard
            gateways={gateways}
            onSelectGateway={handleSelectGateway}
            onCreateGateway={handleCreateGateway}
          />
        )}

        {view === 'gateway' && selectedGateway && (
          <GatewayView
            gateway={selectedGateway}
            logs={[]}  // Empty logs - will be fetched per user
            onBack={handleBackToDashboard}
            onNewLog={handleNewLog}
          />
        )}

        {view === 'profile' && <Profile />}
      </main>

      {/* Gateway Credentials Modal */}
      {showCredentialsModal && newGatewayCredentials && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg w-full max-w-md shadow-2xl animate-slide-up">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Gateway Created Successfully!</h2>
            </div>

            <div className="p-6">
              <div className="mb-6">
                 <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                   Save these credentials securely. You'll need them to make API requests.
                 </p>

                 <div className="space-y-4">
                   <div>
                     <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-2">Gateway ID</label>
                     <div className="flex items-center gap-2">
                       <code className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-md p-2.5 text-xs text-gray-900 dark:text-white font-mono break-all">
                         {newGatewayCredentials.id}
                       </code>
                       <button
                         onClick={() => copyToClipboard(newGatewayCredentials.id, 'id')}
                         className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-300 dark:border-gray-800 rounded-md hover:border-gray-400 dark:hover:border-gray-600"
                       >
                         {copiedId ? <Check size={14} /> : <Copy size={14} />}
                       </button>
                     </div>
                   </div>

                   <div>
                     <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-2">Secret Key</label>
                     <div className="flex items-center gap-2">
                       <code className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-md p-2.5 text-xs text-gray-900 dark:text-white font-mono break-all">
                         {newGatewayCredentials.secret}
                       </code>
                       <button
                         onClick={() => copyToClipboard(newGatewayCredentials.secret, 'secret')}
                         className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-300 dark:border-gray-800 rounded-md hover:border-gray-400 dark:hover:border-gray-600"
                       >
                         {copiedSecret ? <Check size={14} /> : <Copy size={14} />}
                       </button>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="flex justify-end">
                 <button
                   onClick={() => {
                     setShowCredentialsModal(false);
                     setNewGatewayCredentials(null);
                     setCopiedId(false);
                     setCopiedSecret(false);
                   }}
                   className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 rounded-md text-xs font-medium transition-colors"
                 >
                   I've Saved My Credentials
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}

    </div>
  );
}

export default App;