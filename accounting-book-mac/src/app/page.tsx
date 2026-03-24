'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { ProjectsList } from '@/components/ProjectsList';
import { ProjectDetail } from '@/components/ProjectDetail';
import { CustomersList } from '@/components/CustomersList';
import { Settings } from '@/components/Settings';

export default function Home() {
  const [activeView, setActiveView] = useState<'dashboard' | 'projects' | 'customers' | 'settings'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const { settings, initStore } = useStore();

  // 初始化 - 从文件系统加载数据
  useEffect(() => {
    initStore();
  }, [initStore]);

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveView('projects');
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
  };

  const handleViewUnpaidProjects = () => {
    setPaymentFilter('unpaid');
    setSelectedProjectId(null);
    setActiveView('projects');
  };

  const renderContent = () => {
    if (activeView === 'dashboard') {
      return <Dashboard onProjectClick={handleProjectClick} onViewUnpaidProjects={handleViewUnpaidProjects} />;
    }

    if (activeView === 'projects') {
      if (selectedProjectId) {
        return (
          <ProjectDetail
            projectId={selectedProjectId}
            onBack={handleBackToProjects}
          />
        );
      }
      return <ProjectsList onProjectClick={handleProjectClick} initialPaymentFilter={paymentFilter} />;
    }

    if (activeView === 'customers') {
      return <CustomersList />;
    }

    if (activeView === 'settings') {
      return <Settings />;
    }

    return <Dashboard onProjectClick={handleProjectClick} />;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        appName={settings.appName}
      />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}
