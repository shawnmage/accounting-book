export interface Customer {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: number;
}

export interface ProjectType {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  type: 'service' | 'product' | 'other';
  quantity: number;
  unitPrice: number;
  costPrice?: number;
  description?: string;
}

export interface Invoice {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: number;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: number;
}

export interface Project {
  id: string;
  projectNumber: string;
  name: string;
  customerId: string;
  customerName: string;
  projectTypeId?: string;
  projectTypeName?: string;
  items: ProjectItem[];
  totalAmount: number;
  totalCost: number;
  profit: number;
  startDate: number;
  endDate?: number;
  status: 'ongoing' | 'completed' | 'cancelled';
  isPaid: boolean;
  paidAmount?: number;
  invoices: Invoice[];
  attachments: Attachment[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Statistics {
  totalProjects: number;
  ongoingProjects: number;
  completedProjects: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  paidAmount: number;
  unpaidAmount: number;
  monthlyData: MonthlyData[];
}

export interface MonthlyData {
  month: string;
  revenue: number;
  cost: number;
  profit: number;
  projects: number;
}

export interface AppSettings {
  appName: string;
  currency: string;
  dateFormat: string;
  theme: 'system' | 'light' | 'dark';
}

declare global {
  interface Window {
    electronAPI?: {
      dbRead: () => Promise<any>;
      dbWrite: (data: any) => Promise<{ success: boolean }>;
      fileSave: (params: { type: string; name: string; buffer: number[] }) => Promise<{ success: boolean; path?: string }>;
      fileRead: (params: { type: string; name: string }) => Promise<{ success: boolean; buffer: number[] }>;
      fileDelete: (params: { type: string; name: string }) => Promise<{ success: boolean }>;
      openFileExternally: (params: { type: string; name: string }) => Promise<{ success: boolean; error?: string }>;
      dialogOpen: (options: any) => Promise<any>;
      dialogSave: (options: any) => Promise<any>;
      exportData: (params: { data: any; filename: string }) => Promise<{ success: boolean; path?: string }>;
      importData: () => Promise<{ success: boolean; data?: any; error?: string }>;
    };
  }
}
