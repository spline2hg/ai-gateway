import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { BACKEND_URL } from '../services/config';

interface ModelRow {
  id: string;
  provider: string;
  input_cost: number | null;
  output_cost: number | null;
}

const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<ModelRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const url = showAll
          ? `${BACKEND_URL}/models/list?show_all=true`
          : `${BACKEND_URL}/models/list`;
        const response = await fetch(url);
        const data = await response.json();
        setModels((data.models || []).sort((a: ModelRow, b: ModelRow) => a.provider.localeCompare(b.provider) || a.id.localeCompare(b.id)));
      } catch (err) {
        console.error('Failed to fetch models:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, [showAll]);

  const filtered = models.filter(m =>
    !search || m.id.toLowerCase().includes(search.toLowerCase()) || m.provider.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10 pl-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Models</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">{models.length} models available. Use <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-xs">provider/model</code> format.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search models or providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-transparent border border-gray-300 dark:border-gray-800 rounded-md pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-gray-300 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 placeholder:text-gray-500 dark:placeholder:text-gray-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs ${!showAll ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-500'}`}>Canonical</span>
          <button
            onClick={() => setShowAll(!showAll)}
            className="relative w-10 h-5 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors"
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white dark:bg-gray-300 shadow transition-transform ${showAll ? 'translate-x-5' : ''}`} />
          </button>
          <span className={`text-xs ${showAll ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-500'}`}>All Models</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500 text-sm">Loading...</div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-100 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-2.5 text-left text-[10px] font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Provider</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Model</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Input ($/1M tokens)</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Output ($/1M tokens)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800/50 bg-white dark:bg-transparent">
              {filtered.map((m, i) => (
                <tr key={`${m.provider}-${m.id}-${i}`} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 capitalize">{m.provider}</td>
                  <td className="px-4 py-2 text-sm font-mono text-gray-900 dark:text-white">{m.id}</td>
                  <td className="px-4 py-2 text-sm font-mono text-right text-gray-600 dark:text-gray-400">
                    {m.input_cost == null ? <span className="text-gray-400">N/A</span> : m.input_cost === 0 ? <span className="text-emerald-600 dark:text-emerald-400">Free</span> : `$${m.input_cost}`}
                  </td>
                  <td className="px-4 py-2 text-sm font-mono text-right text-gray-600 dark:text-gray-400">
                    {m.output_cost == null ? <span className="text-gray-400">N/A</span> : m.output_cost === 0 ? <span className="text-emerald-600 dark:text-emerald-400">Free</span> : `$${m.output_cost}`}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-500 text-sm">No models match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ModelsPage;
