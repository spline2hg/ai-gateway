import React, { useState } from 'react';
import { Gateway } from '../types';
import { Plus, Search, ShieldCheck, Activity, Database, Zap, X, CreditCard, ChevronRight, Hexagon } from 'lucide-react';
import { formatNumber, formatCurrency } from '../utils';

interface DashboardProps {
  gateways: Gateway[];
  onSelectGateway: (id: string) => void;
  onCreateGateway: (name: string) => Promise<void>;
}

const Dashboard: React.FC<DashboardProps> = ({ gateways, onSelectGateway, onCreateGateway }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGatewayName, setNewGatewayName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGatewayName) return;
    setIsCreating(true);
    try {
      await onCreateGateway(newGatewayName);
      setNewGatewayName('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create gateway:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const stats = [
    { label: 'Total Requests', value: formatNumber(gateways.reduce((acc, g) => acc + g.requestCount, 0)), icon: Zap },
    { label: 'Active Gateways', value: String(gateways.length), sub: 'All systems operational', icon: ShieldCheck },
    { label: 'Total Cost', value: formatCurrency(gateways.reduce((acc, g) => acc + g.cost, 0)), sub: 'Current billing period', icon: CreditCard },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 animate-fade-in">

      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-[32px] font-semibold text-white tracking-tight mb-2">Overview</h1>
          <p className="text-[#9c9c9d] text-[16px]">Manage and monitor your AI application gateways.</p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-[13px] font-medium text-[#6a6b6c] mb-1">Total Cost</div>
          <div className="text-[24px] font-mono text-white">{formatCurrency(gateways.reduce((acc, g) => acc + g.cost, 0))}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="key-card key-card-hover p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] font-medium text-[#6a6b6c]">{stat.label}</span>
                <Icon size={16} className="text-[#454647]" />
              </div>
              <div className="text-[24px] font-bold text-white tracking-tight font-mono">{stat.value}</div>
              {stat.sub && <div className="text-[12px] text-[#6a6b6c] mt-1">{stat.sub}</div>}
            </div>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6a6b6c]" size={14} />
          <input
            type="text"
            placeholder="Search gateways..."
            className="w-full inset-input py-2 pl-9 pr-4 text-[14px]"
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto btn-fill px-4 py-2 text-[13px] flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Create Gateway
        </button>
      </div>

      {/* Gateways List */}
      <div className="key-card overflow-hidden">
        <div className="divide-y divide-[#1b1c1e]">
          {gateways.map(gw => (
            <div
              key={gw.id}
              onClick={() => onSelectGateway(gw.id)}
              className="group flex items-center justify-between p-4 sm:p-5 hover:bg-white/[0.02] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[8px] bg-[#111214] border border-[#363739] flex items-center justify-center text-[#9c9c9d] group-hover:text-white group-hover:border-[#454647] transition-all">
                  <Hexagon size={18} />
                </div>
                <div>
                  <h3 className="font-medium text-white text-[14px] group-hover:text-white transition-colors">{gw.name}</h3>
                  <p className="text-[12px] text-[#6a6b6c] font-mono mt-0.5">{gw.slug}</p>
                </div>
              </div>

              <div className="flex items-center gap-8 sm:gap-12">
                <div className="hidden sm:block text-right">
                  <p className="text-[10px] uppercase text-[#6a6b6c] font-medium tracking-[0.073em] mb-1">Requests</p>
                  <p className="text-[14px] font-mono text-[#e6e6e6]">{formatNumber(gw.requestCount)}</p>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-[10px] uppercase text-[#6a6b6c] font-medium tracking-[0.073em] mb-1">Tokens</p>
                  <p className="text-[14px] font-mono text-[#e6e6e6]">{formatNumber(gw.tokens)}</p>
                </div>
                <div className="hidden sm:block text-right w-20">
                  <p className="text-[10px] uppercase text-[#6a6b6c] font-medium tracking-[0.073em] mb-1">Cost</p>
                  <p className="text-[14px] font-mono text-[#e6e6e6]">{formatCurrency(gw.cost)}</p>
                </div>
                <ChevronRight size={16} className="text-[#454647] group-hover:text-[#9c9c9d] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="key-card w-full max-w-md shadow-2xl animate-slide-up">
            <div className="px-6 py-4 border-b border-[#1b1c1e] flex justify-between items-center">
              <h2 className="text-[14px] font-semibold text-white">Create New Gateway</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-[#6a6b6c] hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6">
              <div className="mb-6">
                <label className="block text-[12px] font-medium text-[#9c9c9d] mb-2">Name</label>
                <input
                  autoFocus
                  type="text"
                  required
                  value={newGatewayName}
                  onChange={e => setNewGatewayName(e.target.value)}
                  className="w-full inset-input p-2.5 text-[14px]"
                  placeholder="e.g. Production API"
                />
                <p className="text-[11px] text-[#6a6b6c] mt-2">This will generate a unique slug for your gateway endpoint.</p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 text-[13px] font-medium text-[#9c9c9d] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newGatewayName.trim()}
                  className="btn-fill px-4 py-2 text-[13px] flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="w-3 h-3 border border-[#454647] border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Gateway'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
