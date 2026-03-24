import { create } from 'zustand';
import {
  Customer,
  ProjectType,
  Project,
  Statistics,
  MonthlyData,
  AppSettings,
  ProjectItem,
  Invoice,
  Attachment,
} from '@/types';

// 生成项目编号 - 基于当前时间和现有最大序号
const generateProjectNumber = (projects: Project[]) => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // 找出当前年月已存在的最大序号
  const prefix = `P${year}${month}`;
  const existingNumbers = projects
    .map(p => p.projectNumber)
    .filter(n => n.startsWith(prefix))
    .map(n => {
      const match = n.match(/-(\d{4})$/);
      return match ? parseInt(match[1]) : 0;
    });
  
  const maxSequence = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
  const sequence = String(maxSequence + 1).padStart(4, '0');
  return `${prefix}-${sequence}`;
};

// 计算统计数据
const calculateStatistics = (projects: Project[]): Statistics => {
  const totalProjects = projects.length;
  const ongoingProjects = projects.filter((p) => p.status === 'ongoing').length;
  const completedProjects = projects.filter(
    (p) => p.status === 'completed'
  ).length;

  const totalRevenue = projects.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalCost = projects.reduce((sum, p) => sum + p.totalCost, 0);
  const totalProfit = totalRevenue - totalCost;

  const paidAmount = projects
    .filter((p) => p.isPaid)
    .reduce((sum, p) => sum + p.totalAmount, 0);
  const unpaidAmount = totalRevenue - paidAmount;

  // 计算月度数据
  const monthlyMap = new Map<string, MonthlyData>();

  projects.forEach((project) => {
    const date = new Date(project.startDate);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        month: monthKey,
        revenue: 0,
        cost: 0,
        profit: 0,
        projects: 0,
      });
    }

    const data = monthlyMap.get(monthKey)!;
    data.revenue += project.totalAmount;
    data.cost += project.totalCost;
    data.profit += project.totalAmount - project.totalCost;
    data.projects += 1;
  });

  const monthlyData = Array.from(monthlyMap.values()).sort((a, b) =>
    a.month.localeCompare(b.month)
  );

  return {
    totalProjects,
    ongoingProjects,
    completedProjects,
    totalRevenue,
    totalCost,
    totalProfit,
    paidAmount,
    unpaidAmount,
    monthlyData,
  };
};

interface StoreState {
  // 数据
  customers: Customer[];
  projectTypes: ProjectType[];
  projects: Project[];
  settings: AppSettings;
  isLoading: boolean;

  // 计算属性
  statistics: Statistics;

  // 初始化
  initStore: () => Promise<void>;

  // 客户操作
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // 项目类型操作
  addProjectType: (projectType: Omit<ProjectType, 'id'>) => Promise<void>;
  updateProjectType: (id: string, data: Partial<ProjectType>) => Promise<void>;
  deleteProjectType: (id: string) => Promise<void>;

  // 项目操作
  addProject: (project: Omit<Project, 'id' | 'projectNumber' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addProjectItem: (projectId: string, item: Omit<ProjectItem, 'id'>) => Promise<void>;
  removeProjectItem: (projectId: string, itemId: string) => Promise<void>;
  addInvoice: (projectId: string, invoice: Omit<Invoice, 'id'>) => Promise<void>;
  removeInvoice: (projectId: string, invoiceId: string) => Promise<void>;
  addAttachment: (projectId: string, attachment: Omit<Attachment, 'id'>) => Promise<void>;
  removeAttachment: (projectId: string, attachmentId: string) => Promise<void>;
  markProjectAsPaid: (projectId: string, paidAmount?: number) => Promise<void>;
  completeProject: (projectId: string) => Promise<void>;

  // 设置
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
}

const defaultSettings: AppSettings = {
  appName: '我的账本',
  currency: 'CNY',
  dateFormat: 'YYYY-MM-DD',
  theme: 'system',
};

const sampleProjectTypes: ProjectType[] = [
  { id: 'pt-1', name: '平面设计', color: '#3b82f6', description: '海报、画册、VI设计等' },
  { id: 'pt-2', name: '展台搭建', color: '#f59e0b', description: '展览展示、展台设计搭建' },
  { id: 'pt-3', name: '礼品定制', color: '#10b981', description: '定制礼品、促销品' },
  { id: 'pt-4', name: '其他', color: '#6b7280', description: '其他类型项目' },
];

// 保存数据到文件系统
const saveToFile = async (data: any) => {
  try {
    // 只保存必要的数据字段
    const dataToSave = {
      customers: data.customers || [],
      projectTypes: data.projectTypes || [],
      projects: data.projects || [],
      settings: data.settings || {},
    };
    console.log('Saving data:', dataToSave);
    if (window.electronAPI) {
      const result = await window.electronAPI.dbWrite(dataToSave);
      console.log('Save result:', result);
    }
  } catch (error) {
    console.error('保存数据失败:', error);
  }
};

// 从文件系统加载数据
const loadFromFile = async () => {
  try {
    if (window.electronAPI) {
      const data = await window.electronAPI.dbRead();
      // 检查数据是否有效（有实际内容）
      if (data && (data.customers || data.projects)) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error('加载数据失败:', error);
    return null;
  }
};

export const useStore = create<StoreState>()(
  (set, get) => ({
    // 初始数据
    customers: [],
    projectTypes: sampleProjectTypes,
    projects: [],
    settings: defaultSettings,
    isLoading: true,

    // 计算属性
    get statistics() {
      return calculateStatistics(get().projects);
    },

    // 初始化 - 从文件系统加载
    initStore: async () => {
      const data = await loadFromFile();
      if (data) {
        // 显式提取需要的字段，排除可能残留的计算属性（如旧版本保存的 statistics）
        const { customers, projectTypes, projects, settings } = data;
        set({
          customers: customers || [],
          projectTypes: projectTypes || sampleProjectTypes,
          projects: projects || [],
          settings: settings || defaultSettings,
          isLoading: false,
        });
      } else {
        const initialData = {
          customers: [],
          projectTypes: sampleProjectTypes,
          projects: [],
          settings: defaultSettings,
        };
        await saveToFile(initialData);
        set({ isLoading: false });
      }
    },

    // 客户操作
    addCustomer: async (customer) => {
      const newCustomer: Customer = {
        ...customer,
        id: `cust-${Date.now()}`,
        createdAt: Date.now(),
      };
      const state = get();
      const newCustomers = [...state.customers, newCustomer];
      set({ customers: newCustomers });
      await saveToFile({ ...state, customers: newCustomers });
    },

    updateCustomer: async (id, data) => {
      const state = get();
      const newCustomers = state.customers.map((c) =>
        c.id === id ? { ...c, ...data } : c
      );
      set({ customers: newCustomers });
      await saveToFile({ ...state, customers: newCustomers });
    },

    deleteCustomer: async (id) => {
      const state = get();
      const newCustomers = state.customers.filter((c) => c.id !== id);
      set({ customers: newCustomers });
      await saveToFile({ ...state, customers: newCustomers });
    },

    // 项目类型操作
    addProjectType: async (projectType) => {
      const newType: ProjectType = {
        ...projectType,
        id: `pt-${Date.now()}`,
      };
      const state = get();
      const newProjectTypes = [...state.projectTypes, newType];
      set({ projectTypes: newProjectTypes });
      await saveToFile({ ...state, projectTypes: newProjectTypes });
    },

    updateProjectType: async (id, data) => {
      const state = get();
      const newProjectTypes = state.projectTypes.map((pt) =>
        pt.id === id ? { ...pt, ...data } : pt
      );
      set({ projectTypes: newProjectTypes });
      await saveToFile({ ...state, projectTypes: newProjectTypes });
    },

    deleteProjectType: async (id) => {
      const state = get();
      const newProjectTypes = state.projectTypes.filter((pt) => pt.id !== id);
      set({ projectTypes: newProjectTypes });
      await saveToFile({ ...state, projectTypes: newProjectTypes });
    },

    // 项目操作
    addProject: async (project) => {
      const id = `proj-${Date.now()}`;
      const state = get();
      const projectNumber = generateProjectNumber(state.projects);
      const newProject: Project = {
        ...project,
        id,
        projectNumber,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const newProjects = [...state.projects, newProject];
      set({ projects: newProjects });
      await saveToFile({ ...state, projects: newProjects });
      return id;
    },

    updateProject: async (id, data) => {
      const state = get();
      const newProjects = state.projects.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: Date.now() } : p
      );
      set({ projects: newProjects });
      await saveToFile({ ...state, projects: newProjects });
    },

    deleteProject: async (id) => {
      const state = get();
      const newProjects = state.projects.filter((p) => p.id !== id);
      set({ projects: newProjects });
      await saveToFile({ ...state, projects: newProjects });
    },

    addProjectItem: async (projectId, item) => {
      const newItem: ProjectItem = { ...item, id: `item-${Date.now()}` };
      const state = get();
      const newProjects = state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const items = [...p.items, newItem];
        const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
        const totalCost = items.reduce((sum, i) => sum + (i.costPrice || 0) * i.quantity, 0);
        return { ...p, items, totalAmount, totalCost, profit: totalAmount - totalCost, updatedAt: Date.now() };
      });
      set({ projects: newProjects });
      await saveToFile({ ...state, projects: newProjects });
    },

    removeProjectItem: async (projectId, itemId) => {
      const state = get();
      const newProjects = state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const items = p.items.filter((i) => i.id !== itemId);
        const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
        const totalCost = items.reduce((sum, i) => sum + (i.costPrice || 0) * i.quantity, 0);
        return { ...p, items, totalAmount, totalCost, profit: totalAmount - totalCost, updatedAt: Date.now() };
      });
      set({ projects: newProjects });
      await saveToFile({ ...state, projects: newProjects });
    },

    addInvoice: async (projectId, invoice) => {
      const newInvoice: Invoice = { ...invoice, id: `inv-${Date.now()}` };
      const state = get();
      const newProjects = state.projects.map((p) =>
        p.id === projectId ? { ...p, invoices: [...p.invoices, newInvoice], updatedAt: Date.now() } : p
      );
      set({ projects: newProjects });
      await saveToFile({ ...state, projects: newProjects });
    },

    removeInvoice: async (projectId, invoiceId) => {
      const state = get();
      const project = state.projects.find((p) => p.id === projectId);
      const invoice = project?.invoices.find((i) => i.id === invoiceId);
      
      // 先删除物理文件
      if (invoice?.fileUrl && window.electronAPI) {
        try {
          const fileName = invoice.fileUrl.split('/').pop();
          console.log('Deleting invoice file:', fileName);
          if (fileName) {
            const result = await window.electronAPI.fileDelete({ type: 'invoice', name: fileName });
            console.log('Delete result:', result);
          }
        } catch (error) {
          console.error('删除文件失败:', error);
        }
      }
      
      const newProjects = state.projects.map((p) =>
        p.id === projectId
          ? { ...p, invoices: p.invoices.filter((i) => i.id !== invoiceId), updatedAt: Date.now() }
          : p
      );
      set({ projects: newProjects });
      await saveToFile({ ...state, projects: newProjects });
    },

    addAttachment: async (projectId, attachment) => {
      const newAttachment: Attachment = { ...attachment, id: `att-${Date.now()}` };
      const state = get();
      const newProjects = state.projects.map((p) =>
        p.id === projectId ? { ...p, attachments: [...p.attachments, newAttachment], updatedAt: Date.now() } : p
      );
      set({ projects: newProjects });
      await saveToFile({ ...state, projects: newProjects });
    },

    removeAttachment: async (projectId, attachmentId) => {
      const state = get();
      const project = state.projects.find((p) => p.id === projectId);
      const attachment = project?.attachments.find((a) => a.id === attachmentId);
      
      // 先删除物理文件
      if (attachment?.fileUrl && window.electronAPI) {
        try {
          const fileName = attachment.fileUrl.split('/').pop();
          console.log('Deleting attachment file:', fileName);
          if (fileName) {
            const result = await window.electronAPI.fileDelete({ type: 'attachment', name: fileName });
            console.log('Delete result:', result);
          }
        } catch (error) {
          console.error('删除文件失败:', error);
        }
      }
      
      const newProjects = state.projects.map((p) =>
        p.id === projectId
          ? { ...p, attachments: p.attachments.filter((a) => a.id !== attachmentId), updatedAt: Date.now() }
          : p
      );
      set({ projects: newProjects });
      await saveToFile({ ...state, projects: newProjects });
    },

    markProjectAsPaid: async (projectId, paidAmount) => {
      const state = get();
      const newProjects = state.projects.map((p) =>
        p.id === projectId
          ? { ...p, isPaid: true, paidAmount: paidAmount || p.totalAmount, updatedAt: Date.now() }
          : p
      );
      set({ projects: newProjects });
      await saveToFile({ ...state, projects: newProjects });
    },

    completeProject: async (projectId) => {
      const state = get();
      const newProjects = state.projects.map((p) =>
        p.id === projectId
          ? { ...p, status: 'completed' as const, endDate: Date.now(), updatedAt: Date.now() }
          : p
      );
      set({ projects: newProjects });
      await saveToFile({ ...state, projects: newProjects });
    },

    updateSettings: async (settings) => {
      const state = get();
      const newSettings = { ...state.settings, ...settings };
      set({ settings: newSettings });
      await saveToFile({ ...state, settings: newSettings });
    },
  })
);
