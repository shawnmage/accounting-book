'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  FileText,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Project } from '@/types';

interface ProjectsListProps {
  onProjectClick: (projectId: string) => void;
  initialPaymentFilter?: 'all' | 'unpaid' | 'paid';
}

export function ProjectsList({ onProjectClick, initialPaymentFilter = 'all' }: ProjectsListProps) {
  const { projects, customers, projectTypes, deleteProject, settings, completeProject } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>(initialPaymentFilter);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: settings.currency || 'CNY',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || project.status === statusFilter;

    const matchesPayment =
      paymentFilter === 'all' ||
      (paymentFilter === 'unpaid' && !project.isPaid) ||
      (paymentFilter === 'paid' && project.isPaid);

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleDelete = (projectId: string) => {
    deleteProject(projectId);
    setShowDeleteConfirm(null);
  };

  const getStatusBadge = (status: string, isPaid: boolean) => {
    if (status === 'completed') {
      return isPaid ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" />
          已完成
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          待收款
        </span>
      );
    }
    if (status === 'ongoing') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          进行中
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        已取消
      </span>
    );
  };

  const getProjectTypeColor = (typeId?: string) => {
    const type = projectTypes.find((t) => t.id === typeId);
    return type?.color || '#6b7280';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">项目管理</h1>
          <p className="text-gray-500 mt-1">
            共 {filteredProjects.length} 个项目
          </p>
        </div>
        <button
          onClick={() => onProjectClick('new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          新建项目
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索项目名称、客户或编号..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
          >
            <option value="all">全部状态</option>
            <option value="ongoing">进行中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
          >
            <option value="all">全部收款</option>
            <option value="unpaid">待收款</option>
            <option value="paid">已收款</option>
          </select>
        </div>
      </div>

      {/* 项目列表 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  项目信息
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  客户
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  日期
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProjects.length > 0 ? (
                filteredProjects
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((project) => (
                    <>
                      <tr
                        key={project.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer table-hover"
                        onClick={() => setExpandedRow(expandedRow === project.id ? null : project.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedRow(expandedRow === project.id ? null : project.id);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {expandedRow === project.id ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronUp className="w-4 h-4" />
                              )}
                            </button>
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: getProjectTypeColor(
                                  project.projectTypeId
                                ),
                              }}
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {project.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {project.projectNumber}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {project.customerName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatCurrency(project.totalAmount)}
                            </p>
                            <p className="text-xs text-gray-500">
                              成本: {formatCurrency(project.totalCost)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(project.status, project.isPaid)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {new Date(project.startDate).toLocaleDateString(
                              'zh-CN'
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onProjectClick(project.id);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="查看详情"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(project.id);
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* 展开的项目详情 */}
                      {expandedRow === project.id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">利润:</span>
                                <p
                                  className={`font-medium ${
                                    project.profit >= 0
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {formatCurrency(project.profit)}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">收款状态:</span>
                                <p
                                  className={`font-medium ${
                                    project.isPaid
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {project.isPaid ? '已收款' : '未收款'}
                                  {project.paidAmount
                                    ? ` (${formatCurrency(
                                        project.paidAmount
                                      )})`
                                    : ''}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">服务项:</span>
                                <p className="font-medium text-gray-900">
                                  {project.items.length} 项
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">附件:</span>
                                <p className="font-medium text-gray-900">
                                  {project.invoices.length + project.attachments.length} 个
                                </p>
                              </div>
                            </div>
                            {project.items.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs text-gray-500 mb-2">项目明细:</p>
                                <div className="flex flex-wrap gap-2">
                                  {project.items.slice(0, 5).map((item) => (
                                    <span
                                      key={item.id}
                                      className="px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200"
                                    >
                                      {item.name} x{item.quantity}
                                    </span>
                                  ))}
                                  {project.items.length > 5 && (
                                    <span className="px-2 py-1 text-xs text-gray-400">
                                      +{project.items.length - 5} 更多
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-12 h-12 opacity-30" />
                      <p>暂无项目</p>
                      <button
                        onClick={() => onProjectClick('new')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        创建第一个项目 →
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              确认删除
            </h3>
            <p className="text-gray-500 mb-6">
              确定要删除这个项目吗？此操作无法撤销。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
