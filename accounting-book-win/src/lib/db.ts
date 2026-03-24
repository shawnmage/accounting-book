import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// 获取项目根目录（兼容开发和生产环境）
function getProjectRoot(): string {
  let currentDir = process.cwd();
  
  // 如果当前目录是 .next/standalone 或包含 .next，向上查找
  if (currentDir.includes('.next') && !currentDir.includes('node_modules')) {
    while (currentDir !== path.dirname(currentDir)) {
      const dataDir = path.join(currentDir, 'data');
      if (existsSync(dataDir)) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }
  }
  
  return currentDir;
}

const PROJECT_ROOT = getProjectRoot();
const DATA_DIR = path.join(PROJECT_ROOT, 'data');

// 确保目录存在
export async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// 读取 JSON 文件
export async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// 写入 JSON 文件
export async function writeJsonFile(filePath: string, data: any) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// 获取数据目录路径
export function getDataPath(subPath: string) {
  return path.join(DATA_DIR, subPath);
}

// 初始化数据库
export async function initDatabase() {
  const dirs = ['projects', 'customers', 'invoices', 'attachments'];
  for (const dir of dirs) {
    await ensureDir(getDataPath(dir));
  }
  
  // 初始化主数据文件
  const mainDbPath = getDataPath('db.json');
  try {
    await fs.access(mainDbPath);
  } catch {
    await writeJsonFile(mainDbPath, {
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
    });
  }
}
