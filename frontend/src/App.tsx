import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Gateway, LogEntry } from './types';
import Dashboard from './components/Dashboard';
import GatewayView from './components/GatewayView';
import Profile from './components/Profile';
import ModelsPage from './components/ModelsPage';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import { analyticsApi } from './services/apiService';
import { Loader2, Copy, Check, Activity, Zap, BarChart3 } from 'lucide-react';
import { useAuth } from './context/AuthContext';

const LOADING_FACTS = [
  { icon: Activity, text: 'LLM observability tracks token usage, latency, and cost per request' },
  { icon: BarChart3, text: 'Streaming responses reduce time-to-first-token by up to 80%' },
  { icon: Activity, text: 'Prompt caching can reduce costs by 50-90% for repeated queries' },
  { icon: Zap, text: 'The average LLM API call takes 1-3 seconds end-to-end' },
  { icon: BarChart3, text: 'Token-level billing means every character in your prompt has a cost' },
];

function ProtectedRoute({ children, loading, error }: { children: React.ReactNode; loading: boolean; error: string | null }) {
  const { backendReady, loading: authLoading } = useAuth();

  if (!backendReady) {
    const factIndex = Math.floor(Date.now() / 5000) % LOADING_FACTS.length;
    const fact = LOADING_FACTS[factIndex];
    const FactIcon = fact.icon;
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 max-w-md text-center px-6">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
            <Loader2 size={24} className="text-gray-400 dark:text-gray-600 animate-spin" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Connecting to backend</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Starting up AI Gateway services...</p>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 w-full">
            <FactIcon size={18} className="text-gray-400 dark:text-gray-500 shrink-0" />
            <span className="text-xs text-gray-600 dark:text-gray-400 text-left">{fact.text}</span>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-gray-400 dark:text-gray-600 animate-spin" />
          <span className="text-gray-500 dark:text-gray-400 text-sm">Setting up your identity...</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-gray-400 dark:text-gray-600 animate-spin" />
          <span className="text-gray-500 dark:text-gray-400 text-sm">Loading gateways...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <span className="text-red-500 dark:text-red-400 text-lg">!</span>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Something went wrong</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-md text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans selection:bg-gray-200 dark:selection:bg-gray-800 selection:text-gray-900 dark:selection:text-white">
      <Navbar />
      <main className="pt-20">{children}</main>
    </div>
  );
}

function App() {
  const { user, loading: authLoading, backendReady } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedGatewayId, setSelectedGatewayId] = useState<string | null>(null);

  const [newGatewayCredentials, setNewGatewayCredentials] = useState<{id: string, secret: string} | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    const fetchGateways = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const gateways = await analyticsApi.fetchAllGateways();

        const transformedGateways = await Promise.all(
          gateways.map(async (gw: any) => {
            try {
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
        setGateways([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGateways();
  }, [user]);

  const handleSelectGateway = (id: string) => {
    setSelectedGatewayId(id);
    navigate(`/gateway/${id}`);
  };

  const handleBackToDashboard = () => {
    setSelectedGatewayId(null);
    navigate('/dashboard');
  };

  const handleEnterDashboard = () => {
    navigate('/dashboard');
  };

  const handleCreateGateway = async (name: string) => {
    try {
      const result = await analyticsApi.createGateway(name);

      setNewGatewayCredentials({
        id: result.id,
        secret: result.secret
      });
      setShowCredentialsModal(true);

      const gateways = await analyticsApi.fetchAllGateways();
      const transformedGateways = await Promise.all(
        gateways.map(async (gw: any) => {
          try {
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

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage onEnter={handleEnterDashboard} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute loading={loading} error={error}>
              <AppLayout>
                <Dashboard
                  gateways={gateways}
                  onSelectGateway={handleSelectGateway}
                  onCreateGateway={handleCreateGateway}
                />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/gateway/:id"
          element={
            <ProtectedRoute loading={loading} error={error}>
              <AppLayout>
                {selectedGateway ? (
                  <GatewayView
                    gateway={selectedGateway}
                    logs={[]}
                    onBack={handleBackToDashboard}
                    onNewLog={handleNewLog}
                  />
                ) : (
                  <Navigate to="/dashboard" replace />
                )}
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute loading={loading} error={error}>
              <AppLayout>
                <Profile />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/models"
          element={
            <ProtectedRoute loading={loading} error={error}>
              <AppLayout>
                <ModelsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

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
    </>
  );
}

export default App;
