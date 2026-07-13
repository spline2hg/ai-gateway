import React, { useState, useEffect, useCallback } from 'react';
import { LogEntry } from '../types';
import { formatDate, formatCurrency } from '../utils';
import { analyticsApi } from '../services/apiService';
import { ChevronDown, ChevronRight, Copy, Check, ChevronLeft, Loader2 } from 'lucide-react';

interface GatewayLogsProps {
  gatewayId: string;
}

const LogRow: React.FC<{ log: LogEntry }> = ({ log }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const isError = log.status >= 400;

  const handleCopyChatId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(log.responseId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy chat ID:', err);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 500) return 'text-[#ff6363] bg-[#ff6363]/10 border border-[#ff6363]/20';
    if (status >= 400) return 'text-orange-400 bg-orange-400/10 border border-orange-400/20';
    return 'text-[#59d499] bg-[#59d499]/10 border border-[#59d499]/20';
  };

  return (
    <>
      <tr
        className={`border-b border-[#1b1c1e] hover:bg-white/[0.03] cursor-pointer transition-colors group text-sm ${expanded ? 'bg-white/[0.03]' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3 whitespace-nowrap w-8">
            <div className="text-[#6a6b6c]">
                {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-[#9c9c9d] font-mono text-xs">
            {formatDate(log.timestamp)}
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <div className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-medium ${getStatusColor(log.status)}`}>
            {log.status} {log.statusText}
          </div>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-white">
           <span className="font-medium text-xs">{log.model}</span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-xs text-[#9c9c9d]">
           <span className="font-mono text-white">{log.tokensIn + log.tokensOut}</span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-white">
          {formatCurrency(log.cost)}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-xs text-[#9c9c9d] text-right font-mono">
          {log.duration.toFixed(0)}ms
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} className="px-0 py-0 border-b border-[#1b1c1e] bg-[#040506]">
            <div className="max-h-[400px] overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-xs font-semibold text-[#9c9c9d] uppercase tracking-wider">Request Details</span>
                </div>
                <div className="bg-[#07080a] border border-[#1b1c1e] rounded-md overflow-hidden">
                    <div className="grid grid-cols-3 border-b border-[#1b1c1e]">
                        <div className="p-3 border-r border-[#1b1c1e]">
                             <div className="text-[10px] text-[#6a6b6c] uppercase mb-1">Provider</div>
                             <div className="text-xs text-white">{log.provider}</div>
                        </div>
                        <div className="p-3 border-r border-[#1b1c1e]">
                             <div className="text-[10px] text-[#6a6b6c] uppercase mb-1">Chat ID</div>
                             <div className="flex items-center gap-1 group">
                                 <div className="text-[10px] font-mono text-[#9c9c9d] truncate flex-1" title={log.responseId}>{log.responseId}</div>
                                 <button onClick={handleCopyChatId} className="opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity text-[#6a6b6c] hover:text-white p-0.5 rounded">
                                     {copied ? <Check size={10} /> : <Copy size={10} />}
                                 </button>
                             </div>
                        </div>
                        <div className="p-3">
                             <div className="text-[10px] text-[#6a6b6c] uppercase mb-1">Latency</div>
                             <div className="text-xs font-mono text-white">{log.duration.toFixed(2)}ms</div>
                        </div>
                    </div>
                    <div>
                         <div className="flex items-center justify-between px-3 py-1.5 bg-[#111214] border-b border-[#1b1c1e]">
                            <span className="text-[10px] font-medium text-[#6a6b6c]">Payload</span>
                         </div>
                         <div className="p-3 overflow-x-auto max-h-[300px] overflow-y-auto">
                            <pre className="text-[11px] text-[#9c9c9d] font-mono whitespace-pre-wrap leading-relaxed">
                                {JSON.stringify(log.requestBody, null, 2)}
                            </pre>
                         </div>
                    </div>
                </div>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-xs font-semibold text-[#9c9c9d] uppercase tracking-wider">Response Details</span>
                </div>
                <div className="bg-[#07080a] border border-[#1b1c1e] rounded-md overflow-hidden h-full">
                     <div className="flex items-center justify-between px-3 py-1.5 bg-[#111214] border-b border-[#1b1c1e]">
                        <span className="text-[10px] font-medium text-[#6a6b6c]">Output</span>
                     </div>
                     <div className="p-3 overflow-auto max-h-[300px]">
                        <pre className="text-[11px] text-white font-mono whitespace-pre-wrap leading-relaxed">
                            {JSON.stringify(log.responseBody, null, 2)}
                        </pre>
                     </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const GatewayLogs: React.FC<GatewayLogsProps> = ({ gatewayId }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, page_size: 20, total_pages: 1 });
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [filterModel, setFilterModel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const pageSize = 20;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchLogs = useCallback(async () => {
    if (!gatewayId) return;
    try {
      setLoading(true);
      setError(null);
      const result = await analyticsApi.fetchGatewayLogs(gatewayId, {
        page: currentPage,
        page_size: pageSize,
        model: filterModel || undefined,
        status: filterStatus || undefined,
        search: debouncedSearch || undefined,
      });
      setLogs(result.logs);
      setPagination(result.pagination);
      setAvailableModels(result.available_models);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      setError('No logs data available');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [gatewayId, currentPage, filterModel, filterStatus, debouncedSearch]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterModel, filterStatus, debouncedSearch]);

  const startIndex = (currentPage - 1) * pageSize;
  const currentLogs = logs;

  return (
    <div className="flex flex-col h-full space-y-4 overflow-hidden">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 items-center">
            <input
                type="text"
                placeholder="Search model, ID, error..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="inset-input px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#56c2ff] w-56 transition-all placeholder:text-[#6a6b6c]"
            />
            <select
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value)}
                className="inset-input px-3 py-1.5 text-xs text-white focus:outline-none"
            >
                <option value="" className="bg-[#07080a]">All models</option>
                {availableModels.map(m => <option key={m} value={m} className="bg-[#07080a]">{m}</option>)}
            </select>
            <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="inset-input px-3 py-1.5 text-xs text-white focus:outline-none"
            >
                <option value="" className="bg-[#07080a]">All statuses</option>
                <option value="success" className="bg-[#07080a]">Success</option>
                <option value="error" className="bg-[#07080a]">Error</option>
            </select>
        </div>
        <div className="text-xs text-[#6a6b6c] font-mono">
            {pagination.total} total logs
        </div>
      </div>

      <div className="edge-card overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#1b1c1e]">
            <thead className="bg-[#07080a] sticky top-0 z-10">
              <tr>
                <th scope="col" className="w-8 px-4 py-2"></th>
                <th scope="col" className="px-4 py-2 text-left text-[10px] font-medium text-[#6a6b6c] uppercase tracking-wider">Time</th>
                <th scope="col" className="px-4 py-2 text-left text-[10px] font-medium text-[#6a6b6c] uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-2 text-left text-[10px] font-medium text-[#6a6b6c] uppercase tracking-wider">Model</th>
                <th scope="col" className="px-4 py-2 text-left text-[10px] font-medium text-[#6a6b6c] uppercase tracking-wider">Tokens</th>
                <th scope="col" className="px-4 py-2 text-left text-[10px] font-medium text-[#6a6b6c] uppercase tracking-wider">Cost</th>
                <th scope="col" className="px-4 py-2 text-right text-[10px] font-medium text-[#6a6b6c] uppercase tracking-wider">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b1c1e] bg-transparent">
              {loading ? (
                  <tr><td colSpan={7} className="text-center py-16"><Loader2 size={24} className="text-[#6a6b6c] animate-spin mx-auto" /></td></tr>
              ) : currentLogs.length === 0 ? (
                  <tr>
                      <td colSpan={7} className="text-center py-16 text-[#6a6b6c] text-sm">
                          {searchTerm || filterModel || filterStatus ? 'No logs match your filters.' : 'No logs found for this period.'}
                      </td>
                  </tr>
              ) : (
                  currentLogs.map((log) => (
                      <LogRow key={log.id} log={log} />
                  ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1b1c1e] bg-[#07080a]">
            <div className="text-xs text-[#6a6b6c]">
              Page {currentPage} of {pagination.total_pages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-xs font-medium bg-[#111214] border border-[#363739] rounded hover:bg-[#1b1c1e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[#9c9c9d]"
              >
                Previous
              </button>
              <span className="text-xs text-[#6a6b6c] px-2">
                {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.total_pages))}
                disabled={currentPage === pagination.total_pages}
                className="px-3 py-1 text-xs font-medium bg-[#111214] border border-[#363739] rounded hover:bg-[#1b1c1e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[#9c9c9d]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GatewayLogs;
