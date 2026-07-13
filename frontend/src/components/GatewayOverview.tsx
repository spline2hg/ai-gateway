import React, { useState, useEffect } from 'react';
import { Gateway, LogEntry } from '../types';
import { formatNumber, formatCurrency } from '../utils';
import { analyticsApi } from '../services/apiService';
import { BACKEND_URL } from '../services/config';
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

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
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

  const totalRequests = analyticsData?.total_requests || 0;
  const totalTokens = analyticsData?.total_tokens || 0;
  const totalCost = analyticsData?.total_cost || 0;
  const errorCount = analyticsData?.error_count || 0;

  const codeExamples = {
    python: `<span class="text-coral-400">from</span> openai <span class="text-coral-400">import</span> OpenAI
<span class="text-[#6a6b6c]"># Configure with your AI Gateway URL and authentication</span>
client = OpenAI(
    api_key=<span class="text-[#59d499]">"your-provider-api-key"</span>,
    base_url=<span class="text-[#59d499]">"${BACKEND_URL}/v1"</span>,
    default_headers={
        <span class="text-[#59d499]">"X-Gateway-Authorization"</span>: <span class="text-[#59d499]">"YOUR_GATEWAY_SECRET"</span>,
        <span class="text-[#59d499]">"X-Gateway-ID"</span>: <span class="text-[#59d499]">"YOUR_GATEWAY_ID"</span>,
    }
)
<span class="text-[#6a6b6c]"># All requests are automatically tracked</span>
response = client.chat.completions.create(
    model=<span class="text-[#59d499]">"gpt-4"</span>,
    messages=[
        {"role": "system", "content": <span class="text-[#59d499]">"You are a helpful assistant."</span>},
        {"role": "user", "content": <span class="text-[#59d499]">"Explain quantum computing"</span>}
    ]
)
print(response.choices[0].message.content)`,
    curl: `curl -X POST <span class="text-[#59d499]">"${BACKEND_URL}/v1/chat/completions"</span> \\
  -H <span class="text-[#59d499]">"Content-Type: application/json"</span> \\
  -H <span class="text-[#59d499]">"Authorization: Bearer your-provider-api-key"</span> \\
  -H <span class="text-[#59d499]">"X-Gateway-Authorization: YOUR_GATEWAY_SECRET"</span> \\
  -H <span class="text-[#59d499]">"X-Gateway-ID: YOUR_GATEWAY_ID"</span> \\
  -d <span class="text-[#56c2ff]">'{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello world!"}
    ]
  }'</span>`
  };

  const metrics = [
    { label: 'Requests', value: formatNumber(totalRequests), sub: 'Last 30 days', exactValue: totalRequests.toLocaleString() },
    { label: 'Tokens', value: formatNumber(totalTokens), sub: 'In + Out', exactValue: totalTokens.toLocaleString() },
    { label: 'Cost', value: formatCurrency(totalCost), sub: 'Estimated' },
    { label: 'Error Rate', value: totalRequests > 0 ? ((errorCount / totalRequests) * 100).toFixed(1) + '%' : '0%', sub: 'Avg' },
  ];

  return (
    <div className="space-y-8 pb-10">

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="key-card p-5">
              <div className="text-[#6a6b6c] text-[10px] font-bold uppercase tracking-[0.073em] mb-2">Loading...</div>
              <div className="flex items-center justify-center h-8">
                <Loader2 size={20} className="text-[#454647] animate-spin" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="col-span-2 lg:col-span-4 key-card border-coral-400/30 p-4">
            <div className="text-coral-400 text-[14px]">{error}</div>
          </div>
        ) : (
          metrics.map((stat, i) => (
            <div key={i} className="key-card key-card-hover p-5">
              <div className="text-[#6a6b6c] text-[10px] font-bold uppercase tracking-[0.073em] mb-2">{stat.label}</div>
              <div className="text-[24px] font-bold tracking-tight font-mono text-white">{stat.value}</div>
              <div className="text-[10px] text-[#6a6b6c] mt-1 font-medium">{stat.sub}</div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Quick Start */}
        <div className="lg:col-span-2">
          <div className="key-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1b1c1e]">
              <h3 className="text-[14px] font-semibold text-white">Quick Start</h3>
              <div className="flex items-center gap-2">
                {[
                  { id: 'python', label: 'Python' },
                  { id: 'curl', label: 'cURL' }
                ].map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLanguage(lang.id as any)}
                    className={`text-[12px] px-3 py-1.5 rounded-[6px] transition-all duration-200 ${
                      selectedLanguage === lang.id
                        ? 'bg-white/[0.08] text-white'
                        : 'text-[#9c9c9d] hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Gateway URL */}
              <div className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="text-[#6a6b6c]">Gateway URL:</span>
                  <code className="font-mono text-white">
                    {BACKEND_URL}/v1
                  </code>
                </div>
                <span className="text-[#6a6b6c]">Get credentials in Settings</span>
              </div>

              {/* Code Block */}
              <div className="bg-[#040506] rounded-[12px] overflow-hidden relative border border-[#1b1c1e]">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      selectedLanguage === 'python' ? codeExamples.python.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"') :
                      codeExamples.curl.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"')
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="absolute top-2 right-2 z-10 text-[#6a6b6c] hover:text-white transition-colors p-2 rounded-[6px] hover:bg-white/[0.06] bg-black/40 border border-[#1b1c1e]"
                  title="Copy Code"
                >
                  {copied ? (
                    <Check size={14} className="text-[#59d499]" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>

                <div className="p-4 h-64 overflow-y-auto">
                  <pre className="font-mono text-[12px] leading-[1.6] text-[#e6e6e6] whitespace-pre">
                    <code dangerouslySetInnerHTML={{ __html: codeExamples[selectedLanguage] }} />
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Checklist */}
        <div className="space-y-4">
          <h3 className="text-[14px] font-semibold text-white">Configuration</h3>

          <div className="key-card divide-y divide-[#1b1c1e] overflow-hidden">
            {[
              { icon: Activity, title: 'Test Endpoint', desc: 'Verify connectivity via the playground.' },
              { icon: Lock, title: 'Provider Keys', desc: 'Securely store your LLM API keys.' },
              { icon: Server, title: 'Rate Limiting', desc: 'Protect your budget with limits.' },
              { icon: ShieldAlert, title: 'PII Redaction', desc: 'Automatically remove sensitive data.' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer flex gap-3">
                  <div className="mt-0.5 text-[#9c9c9d]"><Icon size={16} /></div>
                  <div>
                    <h4 className="text-[13px] font-medium text-white">{item.title}</h4>
                    <p className="text-[11px] text-[#6a6b6c] mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GatewayOverview;
