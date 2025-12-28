import React, { useState } from 'react';
import { Gateway } from '../types';
import { Plus, Search, ShieldCheck, Activity, Database, Zap, X, CreditCard, ChevronRight } from 'lucide-react';
import { formatNumber, formatCurrency, generateId } from '../utils';

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Overview</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and monitor your AI application gateways.</p>
        </div>
        <div className="text-right hidden sm:block">
           <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Balance</div>
           <div className="text-2xl font-mono text-gray-900 dark:text-white">$15.00</div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
         <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</span>
              <Zap size={16} className="text-gray-500 dark:text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {formatNumber(gateways.reduce((acc, g) => acc + g.requestCount, 0))}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">+12% from last month</div>
         </div>
         
         <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Gateways</span>
              <ShieldCheck size={16} className="text-gray-500 dark:text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
               {gateways.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">All systems operational</div>
         </div>

         <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</span>
              <CreditCard size={16} className="text-gray-500 dark:text-gray-500" />
            </div>
             <div className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {formatCurrency(gateways.reduce((acc, g) => acc + g.cost, 0))}
             </div>
             <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Current billing period</div>
         </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={14} />
          <input 
            type="text" 
            placeholder="Search gateways..." 
            className="w-full bg-white dark:bg-transparent border border-gray-300 dark:border-gray-800 rounded-md py-2 pl-9 pr-4 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-600"
          />
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Create Gateway
        </button>
      </div>

      {/* Gateways List */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900/20">
            {gateways.map(gw => (
              <div 
                key={gw.id} 
                onClick={() => onSelectGateway(gw.id)}
                className="group flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-900/40 cursor-pointer transition-colors"
              >
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white group-hover:border-gray-400 dark:group-hover:border-gray-700 transition-all">
                          <Zap size={18} />
                      </div>
                      <div>
                          <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{gw.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-500 font-mono mt-0.5">{gw.slug}</p>
                      </div>
                  </div>

                  <div className="flex items-center gap-8 sm:gap-12">
                      <div className="hidden sm:block text-right">
                          <p className="text-[10px] uppercase text-gray-500 dark:text-gray-500 font-medium mb-1">Requests</p>
                          <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{formatNumber(gw.requestCount)}</p>
                      </div>
                      <div className="hidden sm:block text-right">
                          <p className="text-[10px] uppercase text-gray-500 dark:text-gray-500 font-medium mb-1">Tokens</p>
                          <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{formatNumber(gw.tokens)}</p>
                      </div>
                      <div className="hidden sm:block text-right w-20">
                          <p className="text-[10px] uppercase text-gray-500 dark:text-gray-500 font-medium mb-1">Cost</p>
                          <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{formatCurrency(gw.cost)}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 dark:text-gray-700 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
                  </div>
              </div>
            ))}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg w-full max-w-md shadow-2xl animate-slide-up">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Create New Gateway</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <X size={16} />
                </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6">
              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-2">Name</label>
                <input 
                  autoFocus
                  type="text" 
                  required
                  value={newGatewayName}
                  onChange={e => setNewGatewayName(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-md p-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-700"
                  placeholder="e.g. Production API"
                />
                <p className="text-[10px] text-gray-600 dark:text-gray-500 mt-2">This will generate a unique slug for your gateway endpoint.</p>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newGatewayName.trim()}
                  className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:text-gray-600 dark:disabled:text-gray-400 rounded-md text-xs font-medium transition-colors flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="w-3 h-3 border border-gray-800 dark:border-gray-400 border-t-transparent rounded-full animate-spin"></div>
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
