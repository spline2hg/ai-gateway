import React, { useState } from 'react';
import { Gateway, LogEntry } from '../types';
import GatewayOverview from './GatewayOverview';
import GatewayLogs from './GatewayLogs';
import GatewayAnalytics from './GatewayAnalytics';
import GatewayPlayground from './GatewayPlayground';
import GatewaySettings from './GatewaySettings';

interface GatewayViewProps {
  gateway: Gateway;
  logs: LogEntry[];
  onBack: () => void;
  onNewLog: (log: LogEntry) => void;
}

type Tab = 'overview' | 'logs' | 'analytics' | 'settings' | 'playground';

const GatewayView: React.FC<GatewayViewProps> = ({ gateway, logs, onBack, onNewLog }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const filteredLogs = logs.filter(l => l.gatewayId === gateway.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const tabs: {id: Tab, label: string}[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'logs', label: 'Logs' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'playground', label: 'Playground' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">

      {/* Tabs */}
      <div className="border-b border-[#1b1c1e] bg-[#07080a]/80 backdrop-blur-sm z-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="pt-6 pb-0">
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-4 py-2.5 text-[13px] font-medium rounded-[8px] transition-colors ${
                      isActive
                        ? 'text-white bg-white/[0.06]'
                        : 'text-[#9c9c9d] hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1200px] mx-auto p-6 h-full animate-fade-in">
          {activeTab === 'overview' && <GatewayOverview gateway={gateway} logs={filteredLogs} />}
          {activeTab === 'logs' && <GatewayLogs gatewayId={gateway.id} />}
          {activeTab === 'analytics' && <GatewayAnalytics gatewayId={gateway.id} logs={[]} />}
          {activeTab === 'playground' && <GatewayPlayground gateway={gateway} onNewLog={onNewLog} />}
          {activeTab === 'settings' && <GatewaySettings gateway={gateway} />}
        </div>
      </div>

    </div>
  );
};

export default GatewayView;
