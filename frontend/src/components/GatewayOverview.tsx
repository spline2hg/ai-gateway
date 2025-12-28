import React, { useState, useEffect } from 'react';
import { Gateway, LogEntry } from '../types';
import { formatNumber, formatCurrency } from '../utils';
import { analyticsApi } from '../services/apiService';
import { Activity, Server, Copy, Check, Lock, ShieldAlert, Loader2 } from 'lucide-react';

interface Props {
  gateway: Gateway;
  logs: LogEntry[];
}

const GatewayOverview: React.FC<Props> = ({ gateway, logs }) => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'curl'>('python');
  const [copied, setCopied] = React.useState(false);
  const [hoveredMetric, setHoveredMetric] = React.useState<string | null>(null);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  // Fetch real analytics data when component mounts
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch analytics for the specific gateway
        const data = await analyticsApi.getGatewaySummary(gateway.id || 'default_gateway', 30);
        setAnalyticsData(data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError('No analytics data available');
        setAnalyticsData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [gateway.id]);

  // Only use analytics data from backend - no sample data fallbacks
  const totalRequests = analyticsData?.total_requests || 0;
  const totalTokens = analyticsData?.total_tokens || 0;
  const totalCost = analyticsData?.total_cost || 0;
  const errorCount = analyticsData?.error_count || 0;
  const avgLatency = analyticsData?.avg_latency || 0;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeExamples = {
    python: `<span class="text-purple-400">from</span> openai <span class="text-purple-400">import</span> OpenAI
<span class="text-gray-500"># Configure with your AI Gateway URL and authentication</span>
client = OpenAI(
    api_key=<span class="text-green-400">"your-provider-api-key"</span>,
    base_url=<span class="text-green-400">"http://localhost:8000/v1"</span>,
    default_headers={
        <span class="text-green-400">"X-Gateway-Authorization"</span>: <span class="text-green-400">"YOUR_GATEWAY_SECRET"</span>,
        <span class="text-green-400">"X-Gateway-ID"</span>: <span class="text-green-400">"YOUR_GATEWAY_ID"</span>,
    }
)
<span class="text-gray-500"># All requests are automatically tracked</span>
response = client.chat.completions.create(
    model=<span class="text-green-400">"gpt-4"</span>,
    messages=[
        {"role": "system", "content": <span class="text-green-400">"You are a helpful assistant."</span>},
        {"role": "user", "content": <span class="text-green-400">"Explain quantum computing"</span>}
    ]
)
print(response.choices[0].message.content)`,
    curl: `curl -X POST <span class="text-green-400">"http://localhost:8000/v1/chat/completions"</span> \\
  -H <span class="text-green-400">"Content-Type: application/json"</span> \\
  -H <span class="text-green-400">"Authorization: Bearer your-provider-api-key"</span> \\
  -H <span class="text-green-400">"X-Gateway-Authorization: YOUR_GATEWAY_SECRET"</span> \\
  -H <span class="text-green-400">"X-Gateway-ID: YOUR_GATEWAY_ID"</span> \\
  -d <span class="text-orange-400">'{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello world!"}
    ]
  }'</span>`
  };

  return (
    <div className="space-y-8 pb-10">

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          // Loading state
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
              <div className="text-gray-600 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2">Loading...</div>
              <div className="flex items-center justify-center h-8">
                <Loader2 size={20} className="text-gray-400 dark:text-gray-600 animate-spin" />
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-600 mt-1 font-medium">Fetching data</div>
            </div>
          ))
        ) : error ? (
          // Error state
          <div className="col-span-2 lg:col-span-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800/30 rounded-lg p-4">
            <div className="text-red-700 dark:text-red-400 text-sm">{error}</div>
          </div>
        ) : (
          // Normal state with real data
          [
            {
              label: 'Requests',
              value: formatNumber(totalRequests),
              sub: 'Last 30 days',
              exactValue: totalRequests.toLocaleString()
            },
            {
              label: 'Tokens',
              value: formatNumber(totalTokens),
              sub: 'In + Out',
              exactValue: totalTokens.toLocaleString()
            },
            { label: 'Cost', value: formatCurrency(totalCost), sub: 'Estimated' },
            {
              label: 'Error Rate',
              value: totalRequests > 0 ? ((errorCount / totalRequests) * 100).toFixed(1) + '%' : '0%',
              sub: analyticsData?.error_rate ? `${analyticsData.error_rate.toFixed(1)}%` : 'Avg'
            }
          ].map((stat, i) => (
            <div
              key={i}
              className={`bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-lg p-5 transition-all duration-300 relative group ${
                stat.exactValue
                  ? 'hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900/50 cursor-help'
                  : 'hover:border-gray-300 dark:hover:border-gray-700'
              }`}
              onMouseEnter={(e) => {
                if (stat.exactValue) {
                  setHoveredMetric(`${stat.label}:${stat.exactValue}`);
                  setMousePosition({ x: e.clientX, y: e.clientY });
                }
              }}
              onMouseLeave={() => setHoveredMetric(null)}
            >
               {stat.exactValue && (
                 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                   <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                 </div>
               )}
               <div className="text-gray-600 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2">{stat.label}</div>
               <div className={`text-2xl font-bold tracking-tight font-mono transition-colors duration-200 ${
                 stat.exactValue ? 'text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400' : 'text-gray-900 dark:text-white'
               }`}>{stat.value}</div>
               <div className="text-[10px] text-gray-600 dark:text-gray-600 mt-1 font-medium">
                 {stat.sub}
                 {stat.exactValue && (
                   <span className="text-gray-500 dark:text-gray-500 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">• Hover for exact</span>
                 )}
               </div>
            </div>
          ))
        )}
      </div>

      {/* Custom Tooltip */}
      {hoveredMetric && (
        <div className="fixed z-50 pointer-events-none transition-all duration-200"
             style={{
               left: mousePosition.x,
               top: mousePosition.y,
               transform: 'translate(-50%, -120%)'
             }}>
          <div className="bg-gray-950 dark:bg-gray-950 border border-blue-500/50 rounded-lg shadow-2xl px-4 py-3 min-w-[200px]">
            <div className="text-blue-400 text-xs font-medium mb-1">Exact Count</div>
            <div className="text-white dark:text-white text-lg font-bold font-mono">
              {hoveredMetric.split(':')[1]}
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-950"></div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Integration Card */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Quick Start</h3>
              <div className="flex items-center gap-2">
                {[
                  { id: 'python', label: 'Python', icon: '🐍' },
                  { id: 'curl', label: 'cURL', icon: '🌐' }
                ].map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLanguage(lang.id as any)}
                    className={`text-xs px-3 py-1.5 rounded-md border transition-all duration-200 flex items-center gap-1 ${
                      selectedLanguage === lang.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-600'
                    }`}
                  >
                    <span>{lang.icon}</span>
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Gateway URL Info */}
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-300 dark:border-blue-800/20 rounded-lg px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400 text-sm">🔗</span>
                    <span className="text-xs text-gray-700 dark:text-gray-400">Gateway URL:</span>
                    <code className="text-xs text-blue-700 dark:text-blue-400 font-mono bg-white dark:bg-black px-2 py-0.5 rounded border border-blue-300 dark:border-blue-800/30">
                      http://localhost:8000/v1
                    </code>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-500">Get credentials in Settings</span>
                </div>
              </div>

              {/* Code Section */}
              <div className="bg-gray-100 dark:bg-black rounded-lg overflow-hidden relative">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      selectedLanguage === 'python' ? codeExamples.python.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"') :
                      codeExamples.curl.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"')
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="absolute top-2 right-2 z-10 text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800/50 bg-gray-100 dark:bg-black/50 border border-gray-300 dark:border-gray-700/50"
                  title="Copy Code"
                >
                  {copied ? (
                    <Check size={14} className="text-emerald-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>

                <div className="p-4 h-64 overflow-y-auto">
                  <pre className="font-mono text-xs leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre">
                    <code dangerouslySetInnerHTML={{ __html: codeExamples[selectedLanguage] }} />
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Checklist */}
        <div className="space-y-4">
           <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Configuration</h3>
           
           <div className="border border-gray-200 dark:border-gray-800 rounded-lg divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900/10">
               <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors cursor-pointer flex gap-3">
                  <div className="mt-0.5 text-gray-600 dark:text-gray-400"><Activity size={16} /></div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Test Endpoint</h4>
                    <p className="text-[11px] text-gray-600 dark:text-gray-500 mt-0.5 leading-snug">Verify connectivity via the playground.</p>
                  </div>
               </div>

               <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors cursor-pointer flex gap-3">
                  <div className="mt-0.5 text-gray-600 dark:text-gray-400"><Lock size={16} /></div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Provider Keys</h4>
                    <p className="text-[11px] text-gray-600 dark:text-gray-500 mt-0.5 leading-snug">Securely store your LLM API keys.</p>
                  </div>
               </div>

               <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors cursor-pointer flex gap-3">
                  <div className="mt-0.5 text-gray-600 dark:text-gray-400"><Server size={16} /></div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Rate Limiting</h4>
                    <p className="text-[11px] text-gray-600 dark:text-gray-500 mt-0.5 leading-snug">Protect your budget with limits.</p>
                  </div>
               </div>
               
               <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors cursor-pointer flex gap-3">
                  <div className="mt-0.5 text-gray-600 dark:text-gray-400"><ShieldAlert size={16} /></div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">PII Redaction</h4>
                    <p className="text-[11px] text-gray-600 dark:text-gray-500 mt-0.5 leading-snug">Automatically remove sensitive data.</p>
                  </div>
               </div>
           </div>

         </div>

       </div>
     </div>
   );
};

export default GatewayOverview;
