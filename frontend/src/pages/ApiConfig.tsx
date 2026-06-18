import { useState, useEffect } from 'react';
import { configAPI } from '../services/api';
import { Plus, Trash2, Edit, Save, X, Key, Globe, DollarSign } from 'lucide-react';

interface ApiConfigProps {
  token: string;
}

interface ApiConfigItem {
  id: number;
  provider: string;
  api_key: string;
  endpoint: string | null;
  budget: number;
  note: string | null;
}

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI', color: '#10a37f' },
  { value: 'anthropic', label: 'Anthropic', color: '#cc9e4c' },
  { value: 'google', label: 'Google Gemini', color: '#4285f4' },
  { value: 'deepseek', label: 'DeepSeek', color: '#4a90e2' },
  { value: 'mistral', label: 'Mistral AI', color: '#ff7700' },
  { value: 'groq', label: 'Groq', color: '#f472b6' },
  { value: 'cohere', label: 'Cohere', color: '#27a262' },
  { value: 'perplexity', label: 'Perplexity', color: '#2cb680' },
  { value: 'xai', label: 'xAI (Grok)', color: '#a78bfa' },
  { value: 'zhipu', label: '智谱 AI', color: '#3b82f6' },
  { value: 'baidu', label: '百度文心', color: '#4f46e5' },
  { value: 'minimax', label: 'MiniMax', color: '#f59e0b' },
];

export default function ApiConfig(_props: ApiConfigProps) {
  const [configs, setConfigs] = useState<ApiConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    provider: 'openai',
    api_key: '',
    endpoint: '',
    budget: 100,
    note: '',
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await configAPI.getAll();
      setConfigs(response.data);
    } catch (error) {
      console.error('获取配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await configAPI.update(editingId, formData);
      } else {
        await configAPI.create(formData);
      }
      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchConfigs();
    } catch (error) {
      console.error('保存配置失败:', error);
    }
  };

  const handleEdit = (config: ApiConfigItem) => {
    setEditingId(config.id);
    setFormData({
      provider: config.provider,
      api_key: config.api_key,
      endpoint: config.endpoint || '',
      budget: config.budget,
      note: config.note || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个配置吗？')) return;
    try {
      await configAPI.delete(id);
      fetchConfigs();
    } catch (error) {
      console.error('删除配置失败:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      provider: 'openai',
      api_key: '',
      endpoint: '',
      budget: 100,
      note: '',
    });
  };

  const getProviderColor = (provider: string) => {
    return PROVIDERS.find(p => p.value === provider)?.color || '#6b7280';
  };

  const getProviderLabel = (provider: string) => {
    return PROVIDERS.find(p => p.value === provider)?.label || provider;
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '****';
    return key.substring(0, 4) + '****' + key.substring(key.length - 4);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          API 配置管理
        </h2>
        <button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          添加配置
        </button>
      </div>

      {/* 配置列表 */}
      {configs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
          <Key className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            暂无 API 配置
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            添加您的 API Key 以开始用量追踪
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            添加第一个配置
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {configs.map((config) => (
            <div
              key={config.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: getProviderColor(config.provider) }}
                  >
                    {config.provider.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {getProviderLabel(config.provider)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {config.note || '未添加备注'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(config)}
                    className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(config.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Key size={14} className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300 font-mono">
                    {maskApiKey(config.api_key)}
                  </span>
                </div>

                {config.endpoint && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe size={14} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300 truncate">
                      {config.endpoint}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <DollarSign size={14} className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    月度预算: ${config.budget}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingId ? '编辑配置' : '添加 API 配置'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  提供商
                </label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="sk-..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  自定义端点（可选）
                </label>
                <input
                  type="url"
                  value={formData.endpoint}
                  onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="https://api.example.com/v1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    月度预算 ($)
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 100 })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    备注
                  </label>
                  <input
                    type="text"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="生产环境"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                >
                  <Save size={16} />
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
