import React, { useState, useEffect } from 'react';
import { Gateway } from '../types';
import { Copy, Check, Key, RefreshCw, AlertTriangle, Shield, Eye, EyeOff } from 'lucide-react';
import { analyticsApi } from '../services/apiService';

interface GatewaySettingsProps {
  gateway: Gateway;
}

const GatewaySettings: React.FC<GatewaySettingsProps> = ({ gateway }) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [credentials, setCredentials] = useState<{gatewayId: string, name: string, secret: string} | null>(null);
  const [loadingCredentials, setLoadingCredentials] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        setLoadingCredentials(true);
        const creds = await analyticsApi.getGatewayCredentials(gateway.id);
        setCredentials(creds);
      } catch (error) {
        console.error('Failed to fetch credentials:', error);
      } finally {
        setLoadingCredentials(false);
      }
    };

    fetchCredentials();
  }, [gateway.id]);

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

  const handleRegenerateSecret = async () => {
    try {
      setRegenerating(true);
      const newCredentials = await analyticsApi.regenerateGatewaySecret(gateway.id);
      setCredentials(newCredentials);
      setShowRegenerateConfirm(false);
      setShowSecret(false);
    } catch (error) {
      console.error('Failed to regenerate secret:', error);
      alert('Failed to regenerate secret key. Please try again.');
    } finally {
      setRegenerating(false);
    }
  };

  const maskSecret = (secret: string) => {
    if (!secret || secret === 'undefined' || secret === 'null' || secret.includes('NaN')) {
      return '*****';
    }
    if (secret.length <= 8) return secret;
    return secret.substring(0, 8) + '*'.repeat(secret.length - 8);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Gateway Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your gateway credentials and configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gateway Information */}
        <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-800/30 flex items-center justify-center">
              <Shield size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gateway Information</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Basic gateway details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Name</label>
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-gray-900 dark:text-white">
                {gateway.name}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Gateway ID</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white font-mono whitespace-nowrap overflow-hidden text-ellipsis">
                  {gateway.id}
                </code>
                <button
                  onClick={() => copyToClipboard(gateway.id, 'id')}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-300 dark:border-gray-700 rounded-md hover:border-gray-400 dark:hover:border-gray-600"
                  title="Copy Gateway ID"
                >
                  {copiedId ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Created</label>
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-gray-900 dark:text-white">
                {gateway.createdAt ? new Date(gateway.createdAt).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          </div>
        </div>

        {/* API Credentials */}
        <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800/30 flex items-center justify-center">
              <Key size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Credentials</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Secret key for authentication</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Secret Key</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white font-mono whitespace-nowrap overflow-hidden text-ellipsis">
                  {loadingCredentials ? (
                    'Loading...'
                  ) : credentials ? (
                    showSecret ? credentials.secret : maskSecret(credentials.secret)
                  ) : (
                    'Failed to load'
                  )}
                </code>
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-300 dark:border-gray-700 rounded-md hover:border-gray-400 dark:hover:border-gray-600"
                  title={showSecret ? "Hide Secret Key" : "Show Secret Key"}
                  disabled={!credentials || loadingCredentials}
                >
                  {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={() => copyToClipboard(credentials?.secret || '', 'secret')}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-300 dark:border-gray-700 rounded-md hover:border-gray-400 dark:hover:border-gray-600"
                  title="Copy Secret Key"
                  disabled={!credentials || loadingCredentials}
                >
                  {copiedSecret ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-500 mt-2">
                Click the eye icon to reveal the full secret key. Keep this key secure.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-300 dark:border-gray-800">
              <button
                onClick={() => setShowRegenerateConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
              >
                <RefreshCw size={14} />
                Regenerate Secret Key
              </button>
              <p className="text-xs text-gray-600 dark:text-gray-500 mt-2">
                Regenerating will invalidate the current secret key.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-800/30 flex items-center justify-center">
            <AlertTriangle size={20} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Usage Instructions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">How to use your gateway credentials</p>
          </div>
        </div>

        {loadingCredentials ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center text-gray-600 dark:text-gray-400">
            Loading credentials...
          </div>
        ) : credentials ? (
          <>
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 font-mono text-sm text-gray-800 dark:text-gray-300">
              <div className="mb-4">
                <div className="text-blue-600 dark:text-blue-400 mb-2">client = OpenAI(</div>
                <div className="ml-4">
                  <div>api_key=<span className="text-green-600 dark:text-green-400">"PROVIDER_API_KEY"</span>,</div>
                  <div>base_url=<span className="text-green-600 dark:text-green-400">"http://localhost:8000"</span>,  <span className="text-gray-600 dark:text-gray-500"># change the base url if needed</span></div>
                  <div>default_headers=<span className="text-blue-600 dark:text-blue-400">{'{'}</span></div>
                  <div className="ml-4">
                    <div>"X-Gateway-Authorization": <span className="text-green-600 dark:text-green-400">"{credentials.secret}"</span>,</div>
                    <div>"X-Gateway-ID": <span className="text-green-600 dark:text-green-400">"{gateway.id}"</span>,</div>
                  </div>
                  <div><span className="text-blue-600 dark:text-blue-400">{'}'}</span></div>
                </div>
                <div className="text-blue-600 dark:text-blue-400">)</div>
              </div>


              <div className="mb-2">
                <div className="text-blue-600 dark:text-blue-400">chat_completion = client.chat.completions.create(</div>
                <div className="ml-4">
                  <div>messages=[<span className="text-green-600 dark:text-green-400">{`{"role": "user", "content": "whats the meaning of life ?"}`}</span>],</div>
                  <div>model=<span className="text-green-600 dark:text-green-400">"cerebras/zai-glm-4.6"</span>,  <span className="text-gray-600 dark:text-gray-500"># Replace with your model name</span></div>
                  <div># stream=True,</div>
                </div>
                <div className="text-blue-600 dark:text-blue-400">)</div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-700 dark:text-gray-400">
              <p className="mb-2"><strong>Headers to include in your API requests:</strong></p>
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded p-2 space-y-1 text-xs">
                <div><span className="text-blue-600 dark:text-blue-400">X-Gateway-ID:</span> {gateway.id}</div>
                <div><span className="text-blue-600 dark:text-blue-400">X-Gateway-Authorization:</span> {credentials.secret}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center text-gray-600 dark:text-gray-400">
            Failed to load credentials
          </div>
        )}
      </div>

      {/* Regenerate Confirmation Modal */}
      {showRegenerateConfirm && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Regenerate Secret Key</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 dark:text-gray-400 mb-6">
                Are you sure you want to regenerate the secret key? This action will invalidate the current key and any applications using it will stop working.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowRegenerateConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegenerateSecret}
                  disabled={regenerating}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {regenerating ? 'Regenerating...' : 'Regenerate Key'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GatewaySettings;
