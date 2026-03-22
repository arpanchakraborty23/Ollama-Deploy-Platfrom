import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, MoreVertical, Key as KeyIcon, Edit2, Trash2, 
  Copy, Check, FileCode, CheckCircle2, AlertCircle
} from 'lucide-react';
import Layout from '../components/Layout';
import { listKeys, createKey, revokeKey, updateKeyLabel } from '../api/keys';
import { listModels } from '../api/models';
import type { ApiKey, CreateKeyPayload } from '../types/api';

export default function KeysPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryModel = searchParams.get('model');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'form' | 'success'>('form');
  const [newKey, setNewKey] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateKeyPayload>({ model_name: '', label: '' });
  const [copied, setCopied] = useState(false);
  const [isEditModeId, setIsEditModeId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState<string>('');

  const queryClient = useQueryClient();

  const { data: keys, isLoading: isLoadingKeys } = useQuery({
    queryKey: ['keys'],
    queryFn: listKeys,
  });

  const { data: models } = useQuery({
    queryKey: ['models'],
    queryFn: listModels,
  });

  useEffect(() => {
    if (queryModel) {
      setFormData(prev => ({ ...prev, model_name: queryModel }));
      setIsModalOpen(true);
      // Remove the query param gracefully
      searchParams.delete('model');
      setSearchParams(searchParams, { replace: true });
    }
  }, [queryModel, searchParams, setSearchParams]);

  const createMutation = useMutation({
    mutationFn: createKey,
    onSuccess: (data) => {
      setNewKey(data.plain_key);
      setModalStep('success');
      queryClient.invalidateQueries({ queryKey: ['keys'] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: revokeKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keys'] });
    },
  });

  const updateLabelMutation = useMutation({
    mutationFn: (args: { id: string; label: string }) => updateKeyLabel(args.id, args.label),
    onSuccess: () => {
      setIsEditModeId(null);
      queryClient.invalidateQueries({ queryKey: ['keys'] });
    },
  });

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.model_name) return;
    createMutation.mutate(formData);
  };

  const handleCopy = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setModalStep('form');
      setNewKey(null);
      setFormData({ model_name: '', label: '' });
      createMutation.reset();
    }, 200);
  };

  const startEdit = (key: ApiKey) => {
    setIsEditModeId(key.id);
    setEditLabel(key.label || '');
  };

  const saveEdit = (id: string) => {
    updateLabelMutation.mutate({ id, label: editLabel });
  };

  const confirmRevoke = (id: string) => {
    if (window.confirm("Are you sure you want to revoke this key? This action cannot be undone.")) {
      revokeMutation.mutate(id);
    }
  };

  const availableModels = models?.filter(m => m.is_pulled) || [];

  return (
    <Layout title="API Keys">
      <div className="space-y-6">
        
        <div className="flex justify-between items-center">
          <p className="text-gray-500">Manage your application keys used by downstream clients.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors focus:ring-4 focus:ring-gray-200"
          >
            <Plus className="w-5 h-5" /> New Key
          </button>
        </div>

        {/* Keys Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
          {isLoadingKeys ? (
             <div className="p-12 flex justify-center items-center">
               <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
             </div>
          ) : keys && keys.length > 0 ? (
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 border-b border-gray-200">Label</th>
                    <th className="px-6 py-4 border-b border-gray-200">Model</th>
                    <th className="px-6 py-4 border-b border-gray-200">Key Prefix</th>
                    <th className="px-6 py-4 border-b border-gray-200 hidden md:table-cell">Created</th>
                    <th className="px-6 py-4 border-b border-gray-200 hidden lg:table-cell">Last Used</th>
                    <th className="px-6 py-4 border-b border-gray-200 text-center">Status</th>
                    <th className="px-6 py-4 border-b border-gray-200 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-sm">
                  {keys.map((keyItem) => (
                    <tr key={keyItem.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        {isEditModeId === keyItem.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              autoFocus
                              type="text"
                              value={editLabel}
                              onChange={(e) => setEditLabel(e.target.value)}
                              placeholder="Key label"
                              className="border border-gray-300 rounded px-2 py-1 text-sm outline-none w-32 focus:ring-1 focus:ring-indigo-500"
                              onKeyDown={(e) => e.key === 'Enter' && saveEdit(keyItem.id)}
                            />
                            <button onClick={() => saveEdit(keyItem.id)} className="text-green-600 hover:text-green-800 p-1" disabled={updateLabelMutation.isPending}>
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 font-medium text-gray-900">
                            {keyItem.label || <span className="text-gray-400 italic">Unnamed</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-600 text-xs">{keyItem.model_name}</td>
                      <td className="px-6 py-4 font-mono text-gray-500 bg-gray-50 rounded pl-4">{keyItem.key_prefix}•••••••••••</td>
                      <td className="px-6 py-4 text-gray-500 hidden md:table-cell">
                        {new Date(keyItem.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">
                        {keyItem.last_used ? new Date(keyItem.last_used).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {keyItem.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            Revoked
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {keyItem.is_active && (
                          <div className="flex items-center justify-end gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEdit(keyItem)}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit label"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => confirmRevoke(keyItem.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Revoke key"
                              disabled={revokeMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <KeyIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No API keys yet</h3>
              <p className="text-gray-500 max-w-sm mb-6">
                Create an API key to allow your applications to securely connect to OllamaGate.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-colors border border-indigo-200"
              >
                <Plus className="w-4 h-4" /> Create first key
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Modal Backdrop and Content */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={modalStep === 'form' ? closeModal : undefined}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
            
            {modalStep === 'form' && (
              <>
                <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900">Create new API key</h3>
                </div>
                <form onSubmit={handleCreateKey} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="modelSelect">
                      Select Target Model
                    </label>
                    <select
                      id="modelSelect"
                      required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all block"
                      value={formData.model_name}
                      onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                    >
                      <option value="" disabled>Choose a model</option>
                      {availableModels.map(model => (
                        <option key={model.name} value={model.name}>{model.name}</option>
                      ))}
                    </select>
                    {availableModels.length === 0 && (
                      <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> No models pulled yet. Please pull a model first.
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="labelInput">
                      Key Label (Optional)
                    </label>
                    <input
                      id="labelInput"
                      type="text"
                      placeholder="e.g. My Next.js app"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    />
                  </div>
                  
                  {createMutation.isError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">Failed to create API key.</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending || !formData.model_name}
                      className="flex-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                      {createMutation.isPending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        'Generate Key'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}

            {modalStep === 'success' && (
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Key generated successfully</h3>
                <p className="text-gray-500 mb-6 text-sm max-w-[280px]">
                  Please save this secret key somewhere safe and accessible. For security reasons, <strong className="text-gray-900">you will not be able to view it again</strong>.
                </p>

                <div className="relative w-full mb-6 group">
                  <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm text-gray-800 break-all pt-9">
                    {newKey}
                  </div>
                  <div className="absolute top-0 left-0 right-0 px-3 py-2 flex justify-between items-center rounded-t-lg bg-gray-100 border-b border-gray-200">
                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5 uppercase tracking-wide">
                      <FileCode className="w-3.5 h-3.5" /> Plain Key Secret
                    </span>
                    <button 
                      onClick={handleCopy}
                      className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1 text-xs font-semibold"
                    >
                      {copied ? <><Check className="w-3.5 h-3.5 text-green-600" /> <span className="text-green-600">Copied</span></> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  className="w-full px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors focus:ring-4 focus:ring-gray-200"
                >
                  Done
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}

    </Layout>
  );
}
