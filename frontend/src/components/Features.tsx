import React from 'react';
import { Network, Lock, Cpu, BarChart3, Server, Code2 } from 'lucide-react';

const features = [
  { icon: Network, title: 'Multi-Provider Support', description: 'Route requests across 100+ LLM models from OpenAI, Anthropic, Mistral, Google, Qwen, and more.' },
  { icon: BarChart3, title: 'Real-Time Analytics', description: 'Track every request with detailed metrics: token usage, costs, latency, and error rates.' },
  { icon: Cpu, title: 'Unified API', description: 'Single OpenAI-compatible interface for all providers. Switch models without changing code.' },
  { icon: Server, title: 'Gateway Management', description: 'Create and manage multiple gateways with unique credentials and secret keys for different applications.' },
  { icon: Lock, title: 'Secure Credentials', description: 'Keep your API keys safe. Gateway-based authentication and secret key rotation.' },
  { icon: Code2, title: 'Streaming & Non-Streaming', description: 'Full support for both streaming responses and non-streaming completions with complete observability.' },
];

const Features: React.FC = () => {
  return (
    <section id="features" className="relative py-24 px-6 bg-[#040506] border-t border-[#1b1c1e]">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-16">
          <h2 className="text-[32px] font-semibold tracking-tight text-white mb-4">
            Powerful Features for AI Integration
          </h2>
          <p className="text-[#6a6b6c] max-w-lg text-[16px]">
            Everything you need to manage LLM costs, monitor performance, and route requests efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="key-card key-card-hover p-6 group">
                <div className="mb-4 w-10 h-10 rounded-[99999px] bg-[#111214] border border-[#363739] flex items-center justify-center text-[#e6e6e6] group-hover:border-[#454647] transition-colors">
                  <Icon size={20} />
                </div>
                <h3 className="text-[18px] font-medium mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-[14px] text-[#6a6b6c] leading-[1.5] group-hover:text-[#9c9c9d] transition-colors">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
