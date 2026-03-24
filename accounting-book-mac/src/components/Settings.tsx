'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  Settings as SettingsIcon,
  Palette,
  DollarSign,
  Type,
  Save,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Plus,
  X,
  Edit,
  Palette as PaletteIcon,
} from 'lucide-react';
import { ProjectType } from '@/types';

export function Settings() {
  const { settings, updateSettings, projectTypes, addProjectType, updateProjectType, deleteProjectType, customers, projects } = useStore();
  const [formData, setFormData] = useState({ ...settings });
  const [showAddType, setShowAddType] = useState(false);
  const [editingType, setEditingType] = useState<ProjectType | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const [typeForm, setTypeForm] = useState({
    name: '',
    color: '#3b82f6',
    description: '',
  });

  const handleSave = () => {
    updateSettings(formData);
    alert('设置已保存');
  };

  const handleExport = async () => {
    try {
      if (!window.electronAPI) {
        alert('导出功能仅在桌面版可用');
        return;
      }
      
      const data = {
        customers,
        projectTypes,
        projects,
        settings,
      };
      
      const result = await window.electronAPI.exportData({
        data,
        filename: `账本备份_${new Date().toISOString().split('T')[0]}.json`,
      });
      
      if (result.success) {
        alert('导出成功！');
      }
    } catch (error) {
      alert('导出失败，请重试');
    }
  };

  const handleImport = async () => {
    if (!window.electronAPI) {
      alert('导入功能仅在桌面版可用');
      return;
    }

    try {
      const result = await window.electronAPI.importData();
      if (result.success && result.data) {
        // 写入导入的数据
        await window.electronAPI.dbWrite(result.data);
        alert('导入成功！页面将重新加载');
        window.location.reload();
      } else {
        alert('导入失败: ' + (result.error || '未知错误'));
      }
    } catch (error) {
      alert('导入失败，请检查文件格式');
    }
  };

  const handleClearAll = async () => {
    try {
      if (!window.electronAPI) {
        alert('此功能仅在桌面版可用');
        return;
      }
      
      const emptyData = {
        customers: [],
        projectTypes: [
          { id: 'pt-1', name: '平面设计', color: '#3b82f6', description: '海报、画册、VI设计等' },
          { id: 'pt-2', name: '展台搭建', color: '#f59e0b', description: '展览展示、展台设计搭建' },
          { id: 'pt-3', name: '礼品定制', color: '#10b981', description: '定制礼品、促销品' },
          { id: 'pt-4', name: '其他', color: '#6b7280', description: '其他类型项目' },
        ],
        projects: [],
        settings: {
          appName: '我的账本',
          currency: 'CNY',
          dateFormat: 'YYYY-MM-DD',
          theme: 'system',
        },
      };
      
      await window.electronAPI.dbWrite(emptyData);
      window.location.reload();
    } catch (error) {
      alert('清空数据失败，请重试');
    }
  };

  const handleAddType = () => {
    if (!typeForm.name.trim()) return;

    if (editingType) {
      updateProjectType(editingType.id, typeForm);
    } else {
      addProjectType(typeForm);
    }

    setTypeForm({ name: '', color: '#3b82f6', description: '' });
    setEditingType(null);
    setShowAddType(false);
  };

  const handleEditType = (type: ProjectType) => {
    setEditingType(type);
    setTypeForm({
      name: type.name,
      color: type.color || '#3b82f6',
      description: type.description || '',
    });
    setShowAddType(true);
  };

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
        <p className="text-gray-500 mt-1">自定义您的账本软件</p>
      </div>

      <div className="space-y-6">
        {/* 基本设置 */}
        <div className="bg-white rounded-xl p-6 card-shadow border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <SettingsIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">基本设置</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                账本名称
              </label>
              <input
                type="text"
                value={formData.appName}
                onChange={(e) =>
                  setFormData({ ...formData, appName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="我的账本"
              />
              <p className="text-xs text-gray-500 mt-1">显示在侧边栏和应用标题中</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                货币单位
              </label>
              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="CNY">人民币 (CNY)</option>
                <option value="USD">美元 (USD)</option>
                <option value="EUR">欧元 (EUR)</option>
                <option value="HKD">港币 (HKD)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                日期格式
              </label>
              <select
                value={formData.dateFormat}
                onChange={(e) =>
                  setFormData({ ...formData, dateFormat: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="YYYY-MM-DD">2024-01-01</option>
                <option value="YYYY/MM/DD">2024/01/01</option>
                <option value="DD/MM/YYYY">01/01/2024</option>
                <option value="MM/DD/YYYY">01/01/2024</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                主题模式
              </label>
              <select
                value={formData.theme}
                onChange={(e) =>
                  setFormData({ ...formData, theme: e.target.value as any })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="system">跟随系统</option>
                <option value="light">浅色模式</option>
                <option value="dark">深色模式</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Save className="w-4 h-4" />
              保存设置
            </button>
          </div>
        </div>

        {/* 项目类型管理 */}
        <div className="bg-white rounded-xl p-6 card-shadow border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <PaletteIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">项目类型</h2>
                <p className="text-sm text-gray-500">自定义您的业务类型</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingType(null);
                setTypeForm({ name: '', color: '#3b82f6', description: '' });
                setShowAddType(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              添加类型
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projectTypes.map((type) => (
              <div
                key={type.id}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: type.color }}
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{type.name}</p>
                  {type.description && (
                    <p className="text-xs text-gray-500">{type.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleEditType(type)}
                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 数据管理 */}
        <div className="bg-white rounded-xl p-6 card-shadow border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-50 rounded-lg">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">数据管理</h2>
              <p className="text-sm text-gray-500">备份和恢复您的数据</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">导出数据</h3>
              <p className="text-sm text-gray-500 mb-4">
                将所有数据导出为 JSON 文件，用于备份
              </p>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Download className="w-4 h-4" />
                导出备份
              </button>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">导入备份</h3>
              <p className="text-sm text-gray-500 mb-4">
                选择 ZIP 或 JSON 备份文件，自动恢复所有数据
              </p>
              <button
                onClick={handleImport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Upload className="w-4 h-4" />
                选择备份文件
              </button>
            </div>
          </div>
        </div>

        {/* 危险操作 */}
        <div className="bg-white rounded-xl p-6 card-shadow border border-red-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-900">危险操作</h2>
              <p className="text-sm text-red-500">这些操作无法撤销，请谨慎操作</p>
            </div>
          </div>

          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <h3 className="font-medium text-red-900 mb-2">清空所有数据</h3>
            <p className="text-sm text-red-600 mb-4">
              这将删除所有客户、项目和设置，无法恢复
            </p>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              清空数据
            </button>
          </div>
        </div>
      </div>

      {/* 添加/编辑类型弹窗 */}
      {showAddType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingType ? '编辑类型' : '添加类型'}
              </h2>
              <button
                onClick={() => setShowAddType(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  类型名称 *
                </label>
                <input
                  type="text"
                  value={typeForm.name}
                  onChange={(e) =>
                    setTypeForm({ ...typeForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="如：品牌设计"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  颜色
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setTypeForm({ ...typeForm, color })}
                      className={`w-8 h-8 rounded-lg transition-transform ${
                        typeForm.color === color
                          ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                          : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <input
                  type="text"
                  value={typeForm.description}
                  onChange={(e) =>
                    setTypeForm({ ...typeForm, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="可选描述"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    if (editingType) {
                      deleteProjectType(editingType.id);
                    }
                    setShowAddType(false);
                  }}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  删除
                </button>
                <button
                  onClick={() => setShowAddType(false)}
                  className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddType}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingType ? '保存' : '添加'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 清空确认弹窗 */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-lg font-semibold">警告</h3>
            </div>
            <p className="text-gray-600 mb-6">
              确定要清空所有数据吗？此操作将删除所有客户、项目、发票和设置，且无法撤销。建议先导出备份。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
