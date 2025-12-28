import React, { useState, useEffect } from 'react';
import { LogEntry } from '../types';
import { formatDate, formatCurrency } from '../utils';
import { analyticsApi } from '../services/apiService';
import { ChevronDown, ChevronRight, Copy, Check, CheckCircle, AlertCircle, Clock, Zap, FileJson, Loader2 } from 'lucide-react';

interface GatewayLogsProps {
  gatewayId: string;
  initialLogs: LogEntry[];
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
    if (status >= 500) return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-400/10 border border-red-300 dark:border-red-400/20';
    if (status >= 400) return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-400/10 border border-orange-300 dark:border-orange-400/20';
    return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10 border border-emerald-300 dark:border-emerald-400/20';
  };

  return (
    <>
      <tr 
        className={`border-b border-gray-200 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/40 cursor-pointer transition-colors group text-sm ${expanded ? 'bg-gray-50 dark:bg-gray-900/40' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3 whitespace-nowrap w-8">
            <div className="text-gray-500 dark:text-gray-500">
                {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-400 font-mono text-xs">
            {formatDate(log.timestamp)}
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <div className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-medium ${getStatusColor(log.status)}`}>
            {log.status} {log.statusText}
          </div>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-gray-800 dark:text-gray-300">
           <span className="font-medium text-xs">{log.model}</span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400">
           <span className="font-mono text-gray-700 dark:text-gray-300">{log.tokensIn + log.tokensOut}</span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-700 dark:text-gray-300">
          {formatCurrency(log.cost)}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400 text-right font-mono">
          {log.duration.toFixed(0)}ms
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} className="px-0 py-0 border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900/20">
            <div className="max-h-[400px] overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
              
              {/* Left Column: Metadata */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-xs font-semibold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Request Details</span>
                </div>

                <div className="bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-md overflow-hidden">
                    <div className="grid grid-cols-3 border-b border-gray-300 dark:border-gray-800">
                        <div className="p-3 border-r border-gray-300 dark:border-gray-800">
                             <div className="text-[10px] text-gray-600 dark:text-gray-500 uppercase mb-1">Provider</div>
                             <div className="text-xs text-gray-900 dark:text-white">{log.provider}</div>
                        </div>
                        <div className="p-3 border-r border-gray-300 dark:border-gray-800">
                             <div className="text-[10px] text-gray-600 dark:text-gray-500 uppercase mb-1">Chat ID</div>
                             <div className="flex items-center gap-1 group">
                                 <div className="text-[10px] font-mono text-gray-600 dark:text-gray-400 truncate flex-1" title={log.responseId}>{log.responseId}</div>
                                 <button
                                    onClick={handleCopyChatId}
                                    className="opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white p-0.5 rounded"
                                    title={copied ? "Copied!" : "Copy Chat ID"}
                                 >
                                     {copied ? <Check size={10} /> : <Copy size={10} />}
                                 </button>
                             </div>
                        </div>
                        <div className="p-3">
                             <div className="text-[10px] text-gray-600 dark:text-gray-500 uppercase mb-1">Latency</div>
                             <div className="text-xs font-mono text-gray-900 dark:text-white">{log.duration.toFixed(2)}ms</div>
                        </div>
                    </div>
                    <div>
                         <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-300 dark:border-gray-800">
                            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-500">Payload</span>
                         </div>
                         <div className="p-3 overflow-x-auto max-h-[300px] overflow-y-auto">
                            <pre className="text-[11px] text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                                {JSON.stringify(log.requestBody, null, 2)}
                            </pre>
                         </div>
                    </div>
                </div>
              </div>

              {/* Right Column: Response */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-xs font-semibold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Response Details</span>
                </div>

                <div className="bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-md overflow-hidden h-full">
                     <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-300 dark:border-gray-800">
                        <span className="text-[10px] font-medium text-gray-600 dark:text-gray-500">Output</span>
                     </div>
                     <div className="p-3 overflow-auto max-h-[300px]">
                        <pre className="text-[11px] text-blue-700 dark:text-blue-200 font-mono whitespace-pre-wrap leading-relaxed">
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

const GatewayLogs: React.FC<GatewayLogsProps> = ({ gatewayId, initialLogs }) => {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>(initialLogs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const fetchedLogs = await analyticsApi.fetchGatewayLogs(gatewayId || 'default_gateway', 30);
        setLogs(fetchedLogs);
        setFilteredLogs(fetchedLogs);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
        setError('No logs data available');
        setLogs([]);
        setFilteredLogs([]);
      } finally {
        setLoading(false);
      }
    };

    if (gatewayId) {
      fetchLogs();
    }
  }, [gatewayId, initialLogs]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredLogs(logs);
      return;
    }

    const filtered = logs.filter(log =>
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.status.toString().includes(searchTerm) ||
      (log.requestBody && JSON.stringify(log.requestBody).toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [logs, searchTerm]);

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const endIndex = startIndex + logsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex flex-col h-full space-y-4">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="text-gray-400 dark:text-gray-600 animate-spin" />
            <span className="text-gray-600 dark:text-gray-500 text-sm">Loading logs...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800/30 rounded-lg p-6 text-center">
          <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4 overflow-hidden">

      {/* Filters Bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
            <input
                type="text"
                placeholder="Search by Request ID, Model, Status, or Content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white dark:bg-transparent border border-gray-300 dark:border-gray-800 rounded-md px-3 py-1.5 text-xs text-gray-900 dark:text-gray-300 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 w-72 transition-all placeholder:text-gray-600 dark:placeholder:text-gray-600"
            />
            <button className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                Filter
            </button>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-500 font-mono">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} logs
        </div>
      </div>

      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-100 dark:bg-gray-900/50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="w-8 px-4 py-2"></th>
                <th scope="col" className="px-4 py-2 text-left text-[10px] font-medium text-gray-700 dark:text-gray-500 uppercase tracking-wider">Time</th>
                <th scope="col" className="px-4 py-2 text-left text-[10px] font-medium text-gray-700 dark:text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-2 text-left text-[10px] font-medium text-gray-700 dark:text-gray-500 uppercase tracking-wider">Model</th>
                <th scope="col" className="px-4 py-2 text-left text-[10px] font-medium text-gray-700 dark:text-gray-500 uppercase tracking-wider">Tokens</th>
                <th scope="col" className="px-4 py-2 text-left text-[10px] font-medium text-gray-700 dark:text-gray-500 uppercase tracking-wider">Cost</th>
                <th scope="col" className="px-4 py-2 text-right text-[10px] font-medium text-gray-700 dark:text-gray-500 uppercase tracking-wider">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800/50 bg-white dark:bg-transparent">
              {currentLogs.length === 0 ? (
                  <tr>
                      <td colSpan={7} className="text-center py-16 text-gray-600 dark:text-gray-500 text-sm">
                          {searchTerm ? 'No logs match your search criteria.' : 'No logs found for this period.'}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30">
            <div className="text-xs text-gray-600 dark:text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
              >
                Previous
              </button>
              <span className="text-xs text-gray-600 dark:text-gray-500 px-2">
                {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
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
