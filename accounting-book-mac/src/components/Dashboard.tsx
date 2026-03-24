'use client';

import { useStore } from '@/store/useStore';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FolderKanban,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardProps {
  onProjectClick: (projectId: string) => void;
  onViewUnpaidProjects?: () => void;
}

export function Dashboard({ onProjectClick, onViewUnpaidProjects }: DashboardProps) {
  const { projects, customers, projectTypes, settings } = useStore();

  // 直接在组件中计算统计数据
  const statistics = {
    totalRevenue: projects.reduce((sum, p) => sum + p.totalAmount, 0),
    totalCost: projects.reduce((sum, p) => sum + p.totalCost, 0),
    totalProfit: projects.reduce((sum, p) => sum + p.totalAmount, 0) - projects.reduce((sum, p) => sum + p.totalCost, 0),
    ongoingProjects: projects.filter((p) => p.status === 'ongoing').length,
    monthlyData: (() => {
      const monthlyMap = new Map<string, { month: string; revenue: number; cost: number; profit: number; projects: number }>();
      projects.forEach((project) => {
        const date = new Date(project.startDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { month: monthKey, revenue: 0, cost: 0, profit: 0, projects: 0 });
        }
        const data = monthlyMap.get(monthKey)!;
        data.revenue += project.totalAmount;
        data.cost += project.totalCost;
        data.profit += project.totalAmount - project.totalCost;
        data.projects += 1;
      });
      return Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    })(),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: settings.currency || 'CNY',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // 最近项目
  const recentProjects = [...projects]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  // 项目类型分布数据
  const projectTypeData = projectTypes.map((type) => {
    const count = projects.filter((p) => p.projectTypeId === type.id).length;
    return { name: type.name, value: count, color: type.color };
  }).filter(d => d.value > 0);

  // 待收款项目 - 计算实际待收款金额大于0的项目
  const unpaidProjects = projects.filter(
    (p) => p.status !== 'cancelled' && !p.isPaid && (p.totalAmount - (p.paidAmount || 0)) > 0
  );
  const totalUnpaid = unpaidProjects.reduce(
    (sum, p) => sum + (p.totalAmount - (p.paidAmount || 0)),
    0
  );

  // 计算本月和上月的收入对比
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthKey = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;
  
  const currentMonthData = statistics.monthlyData.find(d => d.month === currentMonthKey);
  const lastMonthData = statistics.monthlyData.find(d => d.month === lastMonthKey);
  
  // 只有当有两个月数据时才计算增长率
  const hasMultipleMonths = statistics.monthlyData.length >= 2;
  
  const revenueChange = hasMultipleMonths && lastMonthData && lastMonthData.revenue > 0 
    ? Math.round(((currentMonthData?.revenue || 0) - lastMonthData.revenue) / lastMonthData.revenue * 100)
    : null;
  
  const profitChange = hasMultipleMonths && lastMonthData && lastMonthData.profit > 0
    ? Math.round(((currentMonthData?.profit || 0) - lastMonthData.profit) / lastMonthData.profit * 100)
    : null;

  const statCards = [
    {
      title: '总收入',
      value: formatCurrency(statistics.totalRevenue),
      change: revenueChange !== null ? `${revenueChange >= 0 ? '+' : ''}${revenueChange}%` : null,
      trend: revenueChange !== null ? (revenueChange >= 0 ? 'up' : 'down') : 'neutral',
      icon: DollarSign,
      color: 'blue',
    },
    {
      title: '净利润',
      value: formatCurrency(statistics.totalProfit),
      change: profitChange !== null ? `${profitChange >= 0 ? '+' : ''}${profitChange}%` : null,
      trend: profitChange !== null ? (profitChange >= 0 ? 'up' : 'down') : 'neutral',
      icon: TrendingUp,
      color: 'green',
    },
    {
      title: '客户总数',
      value: customers.length.toString(),
      change: null,
      trend: 'neutral',
      icon: Users,
      color: 'purple',
    },
    {
      title: '进行中项目',
      value: statistics.ongoingProjects.toString(),
      change: statistics.ongoingProjects > 0 ? '活跃' : null,
      trend: 'neutral',
      icon: FolderKanban,
      color: 'orange',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; light: string }> = {
      blue: { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' },
      green: { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50' },
      purple: { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50' },
      orange: { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">概览面板</h1>
        <p className="text-gray-500 mt-1">查看您的业务概况和财务状况</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const colors = getColorClasses(card.color);
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 card-shadow border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className={`${colors.light} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                {card.change !== null && (
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      card.trend === 'up'
                        ? 'bg-green-100 text-green-700'
                        : card.trend === 'down'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {card.change}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：图表 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 月度趋势图 */}
          <div className="bg-white rounded-xl p-6 card-shadow border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              月度收支趋势
            </h3>
            {statistics.monthlyData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statistics.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                      tickFormatter={(value) =>
                        value >= 1000 ? `${value / 1000}k` : value
                      }
                    />
                    <Tooltip
                      formatter={(value: number) =>
                        formatCurrency(value)
                      }
                      labelStyle={{ color: '#374151' }}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      name="收入"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="cost"
                      name="成本"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="profit"
                      name="利润"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>暂无数据，开始创建项目吧</p>
                </div>
              </div>
            )}
          </div>

          {/* 项目类型分布 */}
          {projectTypeData.length > 0 && (
            <div className="bg-white rounded-xl p-6 card-shadow border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                项目类型分布
              </h3>
              <div className="flex items-center">
                <div className="w-1/2 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {projectTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 pl-4">
                  {projectTypeData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-600">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {item.value}个
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：概览和待办 */}
        <div className="space-y-6">
          {/* 财务概览 */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">财务概览</h3>
            <div className="space-y-4">
              <div>
                <p className="text-blue-100 text-sm">总收入</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(statistics.totalRevenue)}
                </p>
              </div>
              <div className="h-px bg-white/20" />
              <div className="flex justify-between">
                <div>
                  <p className="text-blue-100 text-sm">总成本</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(statistics.totalCost)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm">净利润</p>
                  <p className="text-lg font-semibold text-green-300">
                    {formatCurrency(statistics.totalProfit)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 待收款提醒 */}
          {unpaidProjects.length > 0 && (
            <div className="bg-white rounded-xl p-6 card-shadow border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  待收款提醒
                </h3>
                <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                  {unpaidProjects.length} 笔
                </span>
              </div>
              <div className="space-y-3">
                {unpaidProjects.slice(0, 3).map((project) => (
                  <div
                    key={project.id}
                    onClick={() => onProjectClick(project.id)}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {project.customerName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">
                        {formatCurrency(project.totalAmount - (project.paidAmount || 0))}
                      </p>
                      <p className="text-xs text-gray-500">待收</p>
                    </div>
                  </div>
                ))}
              </div>
              {unpaidProjects.length > 3 && (
                <button
                  onClick={() => onViewUnpaidProjects ? onViewUnpaidProjects() : onProjectClick(unpaidProjects[0].id)}
                  className="w-full mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  查看全部 {unpaidProjects.length} 笔待收款 →
                </button>
              )}
            </div>
          )}

          {/* 最近活动 */}
          <div className="bg-white rounded-xl p-6 card-shadow border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              最近项目
            </h3>
            {recentProjects.length > 0 ? (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => onProjectClick(project.id)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        project.status === 'completed'
                          ? 'bg-green-500'
                          : project.status === 'ongoing'
                          ? 'bg-blue-500'
                          : 'bg-gray-400'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {project.customerName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(project.totalAmount)}
                      </p>
                      <p
                        className={`text-xs ${
                          project.isPaid
                            ? 'text-green-600'
                            : 'text-red-500'
                        }`}
                      >
                        {project.isPaid ? '已收款' : '未收款'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>暂无项目，点击创建您的第一个项目</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
