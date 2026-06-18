import { useState, useEffect } from 'react';
import { usageAPI, alertAPI } from '../services/api';
import { DollarSign, Activity, Cpu, Building2, AlertTriangle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardProps {
  token: string;
}

interface Stats {
  total: {
    totalCost: number;
    totalRequests: number;
    totalTokens: number;
  };
  providers: Array<{
    provider: string;
    cost: number;
    requests: number;
    tokens: number;
    budget: number;
    usagePercent: number;
  }>;
}

interface ModelStat {
  model: string;
  provider: string;
  requests: number;
  tokens: number;
  cost: number;
  avgLatency: number;
}

interface HistoryItem {
  date: string;
  cost: number;
  requests: number;
  tokens: number;
}

export default function Dashboard(_props: DashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [models, setModels] = useState<ModelStat[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, modelsRes, historyRes, alertsRes] = await Promise.all([
        usageAPI.getStats(),
        usageAPI.getModels(),
        usageAPI.getHistory(7),
        alertAPI.getUnreadCount(),
      ]);

      setStats(statsRes.data);
      setModels(modelsRes.data);
      setHistory(historyRes.data);
      setUnreadAlerts(alertsRes.data.count);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  const getStatusColor = (percent: number) => {
    if (percent >= 90) return 'text-red-500 bg-red-500/10';
    if (percent >= 70) return 'text-amber-500 bg-amber-500/10';
    return 'text-emerald-500 bg-emerald-500/10';
  };

  const getStatusText = (percent: number) => {
    if (percent >= 90) return '超额';
    if (percent >= 70) return '偏高';
    return '正常';
  };

  // 图表数据
  const lineChartData = {
    labels: history.map(h => h.date.slice(5)),
    datasets: [
      {
        label: '花费 ($)',
        data: history.map(h => h.cost),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: models.slice(0, 5).map(m => m.model),
    datasets: [
      {
        label: '请求数',
        data: models.slice(0, 5).map(m => m.requests),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
      },
    ],
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
      {/* 告警提示 */}
      {unreadAlerts > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
          <AlertTriangle className="text-amber-500" size={20} />
          <span className="text-amber-600 dark:text-amber-400">
            您有 {unreadAlerts} 条未读告警
          </span>
        </div>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <DollarSign className="text-emerald-500" size={20} />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">总花费</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ${stats?.total.totalCost.toFixed(2) || '0.00'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Activity className="text-blue-500" size={20} />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">总请求数</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats?.total.totalRequests || 0)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Cpu className="text-purple-500" size={20} />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Token 用量</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats?.total.totalTokens || 0)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Building2 className="text-amber-500" size={20} />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">活跃提供商</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.providers.length || 0}
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            花费趋势（近7天）
          </h3>
          <div className="h-64">
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(156, 163, 175, 0.1)',
                    },
                  },
                  x: {
                    grid: { display: false },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            热门模型请求量
          </h3>
          <div className="h-64">
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(156, 163, 175, 0.1)',
                    },
                  },
                  x: {
                    grid: { display: false },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* 提供商卡片 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          提供商用量
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats?.providers.map((provider) => (
            <div
              key={provider.provider}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-gray-900 dark:text-white">
                  {provider.provider}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(provider.usagePercent)}`}>
                  {getStatusText(provider.usagePercent)}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-gray-400">预算用量</span>
                  <span className="text-gray-900 dark:text-white">
                    {provider.usagePercent.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      provider.usagePercent >= 90
                        ? 'bg-red-500'
                        : provider.usagePercent >= 70
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(provider.usagePercent, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${provider.cost.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">花费</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatNumber(provider.requests)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">请求</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatNumber(provider.tokens)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Tokens</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 模型详情表格 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            模型用量排行
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  模型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  提供商
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  请求数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Token 用量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  费用
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  平均延迟
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {models.map((model, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {model.model}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {model.provider}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                    {formatNumber(model.requests)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {formatNumber(model.tokens)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-emerald-500 font-medium">
                    ${model.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={
                        model.avgLatency > 500
                          ? 'text-red-500'
                          : model.avgLatency > 300
                          ? 'text-amber-500'
                          : 'text-gray-500 dark:text-gray-400'
                      }
                    >
                      {Math.round(model.avgLatency)}ms
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
