'use client';

import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  Calculator,
} from 'lucide-react';

interface SidebarProps {
  activeView: 'dashboard' | 'projects' | 'customers' | 'settings';
  onViewChange: (view: 'dashboard' | 'projects' | 'customers' | 'settings') => void;
  appName: string;
}

export function Sidebar({ activeView, onViewChange, appName }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: '概览面板', icon: LayoutDashboard },
    { id: 'projects', label: '项目管理', icon: FolderKanban },
    { id: 'customers', label: '客户管理', icon: Users },
    { id: 'settings', label: '系统设置', icon: Settings },
  ] as const;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo区域 */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900 leading-tight">
              {appName}
            </h1>
            <p className="text-xs text-gray-500">专业记账工具</p>
          </div>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 底部信息 */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 text-white">
          <p className="text-xs opacity-90 mb-1">当前版本</p>
          <p className="font-semibold">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
