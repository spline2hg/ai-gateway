import React, { useState, useEffect } from 'react';
import { Gateway } from '../types';
import { Copy, Check, Key, RefreshCw, AlertTriangle, Shield, Eye, EyeOff } from 'lucide-react';
import { analyticsApi } from '../services/apiService';
import { BACKEND_URL } from '../services/config';

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
        <h2 className="text-2xl font-bold text-white mb-2">Gateway Settings</h2>
        <p className="text-[#9c9c9d]">Manage your gateway credentials and configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="key-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={20} className="text-[#9c9c9d]" />
            <div>
              <h3 className="text-lg font-semibold text-white">Gateway Information</h3>
              <p className="text-sm text-[#9c9c9d]">Basic gateway details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#9c9c9d] mb-2">Name</label>
              <div className="inset-input px-3 py-2 text-white">
                {gateway.name}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#9c9c9d] mb-2">Gateway ID</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 inset-input px-3 py-2 text-sm text-white font-mono whitespace-nowrap overflow-hidden text-ellipsis">
                  {gateway.id}
                </code>
                <button
                  onClick={() => copyToClipboard(gateway.id, 'id')}
                  className="p-2 text-[#9c9c9d] hover:text-white transition-colors border border-[#363739] rounded-md hover:border-[#6a6b6c]"
                  title="Copy Gateway ID"
                >
                  {copiedId ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#9c9c9d] mb-2">Created</label>
              <div className="inset-input px-3 py-2 text-white">
                {gateway.createdAt ? new Date(gateway.createdAt).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          </div>
        </div>

        <div className="key-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Key size={20} className="text-[#9c9c9d]" />
            <div>
              <h3 className="text-lg font-semibold text-white">API Credentials</h3>
              <p className="text-sm text-[#9c9c9d]">Secret key for authentication</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#9c9c9d] mb-2">Secret Key</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 inset-input px-3 py-2 text-sm text-white font-mono whitespace-nowrap overflow-hidden text-ellipsis">
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
                  className="p-2 text-[#9c9c9d] hover:text-white transition-colors border border-[#363739] rounded-md hover:border-[#6a6b6c]"
                  title={showSecret ? "Hide Secret Key" : "Show Secret Key"}
                  disabled={!credentials || loadingCredentials}
                >
                  {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={() => copyToClipboard(credentials?.secret || '', 'secret')}
                  className="p-2 text-[#9c9c9d] hover:text-white transition-colors border border-[#363739] rounded-md hover:border-[#6a6b6c]"
                  title="Copy Secret Key"
                  disabled={!credentials || loadingCredentials}
                >
                  {copiedSecret ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-xs text-[#6a6b6c] mt-2">
                Click the eye icon to reveal the full secret key. Keep this key secure.
              </p>
            </div>

            <div className="pt-4 border-t border-[#1b1c1e]">
              <button
                onClick={() => setShowRegenerateConfirm(true)}
                className="flex items-center gap-2 btn-fill px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <RefreshCw size={14} />
                Regenerate Secret Key
              </button>
              <p className="text-xs text-[#6a6b6c] mt-2">
                Regenerating will invalidate the current secret key.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 key-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={20} className="text-[#9c9c9d]" />
          <div>
            <h3 className="text-lg font-semibold text-white">Usage Instructions</h3>
            <p className="text-sm text-[#9c9c9d]">How to use your gateway credentials</p>
          </div>
        </div>

        {loadingCredentials ? (
          <div className="inset-input p-4 text-center text-[#9c9c9d]">
            Loading credentials...
          </div>
        ) : credentials ? (
          <>
            <div className="bg-[#040506] border border-[#1b1c1e] rounded-lg p-4 font-mono text-sm text-[#9c9c9d]">
              <div className="mb-4">
                <div className="text-[#6a6b6c] mb-2">client = OpenAI(</div>
                <div className="ml-4">
                  <div>api_key=<span className="text-[#59d499]">"PROVIDER_API_KEY"</span>,</div>
                  <div>base_url=<span className="text-[#59d499]">"{BACKEND_URL}"</span>,</div>
                  <div>default_headers=<span className="text-[#6a6b6c]">{'{'}</span></div>
                  <div className="ml-4">
                    <div>"X-Gateway-Authorization": <span className="text-[#59d499]">"{credentials.secret}"</span>,</div>
                    <div>"X-Gateway-ID": <span className="text-[#59d499]">"{gateway.id}"</span>,</div>
                  </div>
                  <div><span className="text-[#6a6b6c]">{'}'}</span></div>
                </div>
                <div className="text-[#6a6b6c]">)</div>
              </div>


              <div className="mb-2">
                <div className="text-[#6a6b6c]">chat_completion = client.chat.completions.create(</div>
                <div className="ml-4">
                  <div>messages=[<span className="text-[#59d499]">{`{"role": "user", "content": "whats the meaning of life ?"}`}</span>],</div>
                  <div>model=<span className="text-[#59d499]">"cerebras/zai-glm-4.6"</span>,  <span className="text-[#6a6b6c]"># Replace with your model name</span></div>
                  <div># stream=True,</div>
                </div>
                <div className="text-[#6a6b6c]">)</div>
              </div>
            </div>

            <div className="mt-4 text-sm text-[#9c9c9d]">
              <p className="mb-2"><strong>Headers to include in your API requests:</strong></p>
              <div className="inset-input rounded p-2 space-y-1 text-xs">
                <div><span className="text-[#6a6b6c]">X-Gateway-ID:</span> {gateway.id}</div>
                <div><span className="text-[#6a6b6c]">X-Gateway-Authorization:</span> {credentials.secret}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="inset-input p-4 text-center text-[#9c9c9d]">
            Failed to load credentials
          </div>
        )}
      </div>

      {showRegenerateConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#07080a] border border-[#363739] rounded-lg w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-[#1b1c1e]">
              <h3 className="text-sm font-semibold text-white">Regenerate Secret Key</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#9c9c9d] mb-6">
                Are you sure you want to regenerate the secret key? This action will invalidate the current key and any applications using it will stop working.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowRegenerateConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-[#9c9c9d] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegenerateSecret}
                  disabled={regenerating}
                  className="px-4 py-2 bg-[#ff6363] text-white rounded-md text-sm font-medium hover:bg-[#ff5050] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
