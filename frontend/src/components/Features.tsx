import React from 'react';
import { Network, Lock, Cpu, BarChart3, Server, Code2 } from 'lucide-react';

const features = [
  {
    icon: <Network className="text-white" size={20} />,
    title: "Multi-Provider Support",
    description: "Route requests across 100+ LLM models from OpenAI, Anthropic, Mistral, Google, Qwen, and more."
  },
  {
    icon: <BarChart3 className="text-white" size={20} />,
    title: "Real-Time Analytics",
    description: "Track every request with detailed metrics: token usage, costs, latency, and error rates."
  },
  {
    icon: <Cpu className="text-white" size={20} />,
    title: "Unified API",
    description: "Single OpenAI-compatible interface for all providers. Switch models without changing code."
  },
  {
    icon: <Server className="text-white" size={20} />,
    title: "Gateway Management",
    description: "Create and manage multiple gateways with unique credentials and secret keys for different applications."
  },
  {
    icon: <Lock className="text-white" size={20} />,
    title: "Secure Credentials",
    description: "Keep your API keys safe. Gateway-based authentication and secret key rotation."
  },
  {
    icon: <Code2 className="text-white" size={20} />,
    title: "Streaming & Non-Streaming",
    description: "Full support for both streaming responses and non-streaming completions with complete observability."
  }
];

const Features: React.FC = () => {
  return (
    <section id="features" className="relative py-24 px-6 bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">
                    Powerful Features for AI Integration
                </h2>
                <p className="text-white/50 max-w-lg text-lg">
                    Everything you need to manage LLM costs, monitor performance, and route requests efficiently.
                </p>
            </div>
            <button className="text-sm font-medium text-white border-b border-white/30 pb-1 hover:border-white transition-colors">
                Explore all features
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, idx) => (
            <div key={idx} className="group relative p-6 rounded-xl bg-[#080808] border border-white/5 hover:border-white/10 transition-all duration-300 hover:bg-[#0A0A0A]">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
              
              <div className="relative z-10">
                  <div className="mb-4 p-2 bg-white/5 w-fit rounded-lg border border-white/5 group-hover:border-white/20 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">
                    {feature.description}
                  </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
