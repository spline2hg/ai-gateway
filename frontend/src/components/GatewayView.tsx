import React, { useState } from 'react';
import { Gateway, LogEntry } from '../types';
import { Settings, LayoutDashboard, ScrollText, BarChart3, Terminal } from 'lucide-react';
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
      
      {/* Header & Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/50 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-6">
           <div className="pt-8 pb-1">
              {/* Tab Navigation */}
               <div className="flex gap-6 overflow-x-auto no-scrollbar">
                {tabs.map(tab => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        relative pb-3 text-sm font-medium transition-colors
                        ${isActive 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}
                      `}
                    >
                      {tab.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 dark:bg-white rounded-t-full"></span>
                      )}
                    </button>
                  )
                })}
               </div>
            </div>
         </div>
       </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto p-6 h-full animate-fade-in">
          {activeTab === 'overview' && <GatewayOverview gateway={gateway} logs={filteredLogs} />}
          {activeTab === 'logs' && <GatewayLogs gatewayId={gateway.id} initialLogs={[]} />}
          {activeTab === 'analytics' && <GatewayAnalytics gatewayId={gateway.id} logs={[]} />}
          {activeTab === 'playground' && <GatewayPlayground gateway={gateway} onNewLog={onNewLog} />}
          {activeTab === 'settings' && <GatewaySettings gateway={gateway} />}
        </div>
      </div>

    </div>
  );
};

export default GatewayView;
