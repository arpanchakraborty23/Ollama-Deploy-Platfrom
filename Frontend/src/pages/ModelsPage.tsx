import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Cpu, CheckCircle, HardDrive, Key, AlertCircle, Download } from 'lucide-react';
import Layout from '../components/Layout';
import { listModels, pullModel } from '../api/models';
import type { PullProgress } from '../types/api';

const formatBytes = (bytes: number | null) => {
  if (bytes === null) return 'Unknown';
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function ModelsPage() {
  const [search, setSearch] = useState('');
  const [pullingModels, setPullingModels] = useState<Record<string, PullProgress>>({});
  const [pullErrors, setPullErrors] = useState<Record<string, string>>({});
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: models, isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: listModels,
    staleTime: 60 * 1000,
  });

  const pullMutation = useMutation({
    mutationFn: pullModel,
    onSuccess: (url, modelName) => {
      // Setup SSE connection to track progress
      const source = new EventSource(url, { withCredentials: true });
      
      source.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as PullProgress;
          setPullingModels((prev) => ({ ...prev, [modelName]: data }));

          if (data.status === 'success' || data.status === 'done') {
            source.close();
            queryClient.invalidateQueries({ queryKey: ['models'] });
            setPullingModels((prev) => {
              const next = { ...prev };
              delete next[modelName];
              return next;
            });
          } else if (data.status === 'error') {
            source.close();
            setPullErrors((prev) => ({ ...prev, [modelName]: 'Failed to pull' }));
            setPullingModels((prev) => {
              const next = { ...prev };
              delete next[modelName];
              return next;
            });
          }
        } catch (e) {
          console.error("Failed to parse SSE event", e);
        }
      };

      source.onerror = () => {
        source.close();
        setPullErrors((prev) => ({ ...prev, [modelName]: 'Connection lost' }));
        setPullingModels((prev) => {
          const next = { ...prev };
          delete next[modelName];
          return next;
        });
      };
    },
    onError: (error: any, modelName) => {
      setPullErrors((prev) => ({ ...prev, [modelName]: error.message || 'Failed to start pull' }));
    }
  });

  const handlePull = (name: string) => {
    setPullErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setPullingModels((prev) => ({
      ...prev,
      [name]: { status: 'starting', completed: 0, total: 100, percent: 0 }
    }));
    pullMutation.mutate(name);
  };

  const filteredModels = models?.filter(m => m.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <Layout title="Models">
      <div className="space-y-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <input
            type="text"
            placeholder="Search models..."
            className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Empty State */}
        {!isLoading && filteredModels.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Cpu className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">No models found</h3>
            <p className="text-gray-500 max-w-sm">
              We couldn't find any models matching your search.
            </p>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col h-[200px] animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-auto"></div>
                <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Model Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredModels.map((model) => {
            const isPulling = !!pullingModels[model.name];
            const pullProgress = pullingModels[model.name];
            const pullError = pullErrors[model.name];

            return (
              <div key={model.name} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 break-all pr-2">{model.name}</h3>
                  {model.is_pulled ? (
                    <span className="shrink-0 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Ready
                    </span>
                  ) : (
                    <span className="shrink-0 bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-200">
                      Not pulled
                    </span>
                  )}
                </div>
                
                <div className="flex-1 mt-2 text-sm text-gray-500 space-y-1.5">
                  {model.is_pulled ? (
                    <>
                      <div className="flex items-center gap-2"><HardDrive className="w-4 h-4 text-gray-400" /> {formatBytes(model.size_bytes)}</div>
                      <div className="flex items-center gap-2 text-xs">Updated: {model.pulled_at ? new Date(model.pulled_at).toLocaleDateString() : 'Unknown'}</div>
                    </>
                  ) : (
                    <p>Model is available but not yet downloaded to your server.</p>
                  )}
                </div>

                <div className="mt-6">
                  {isPulling ? (
                    <div className="w-full bg-gray-100 rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between text-xs font-semibold text-gray-700 mb-2">
                        <span className="capitalize">{Math.round(pullProgress.percent || 0)}%</span>
                        <span className="text-gray-500">{pullProgress.status}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.max(0, Math.min(100, pullProgress.percent || 0))}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : pullError ? (
                    <div className="flex items-center justify-between w-full bg-red-50 text-red-700 py-2.5 px-4 rounded-lg font-medium text-sm border border-red-200">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="truncate max-w-[150px]">{pullError}</span>
                      </div>
                      <button onClick={() => handlePull(model.name)} className="underline hover:text-red-800">Retry</button>
                    </div>
                  ) : model.is_pulled ? (
                    <button
                      onClick={() => navigate(`/keys?model=${encodeURIComponent(model.name)}`)}
                      className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg font-medium transition-colors focus:ring-4 focus:ring-gray-200"
                    >
                      <Key className="w-4 h-4" /> Generate Key
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePull(model.name)}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-2.5 rounded-lg font-medium transition-colors border border-indigo-200"
                    >
                      <Download className="w-4 h-4" /> Pull to Server
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
