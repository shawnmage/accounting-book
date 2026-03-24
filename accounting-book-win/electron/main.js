const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { readFile, writeFile, mkdir, readdir, stat, unlink, copyFile } = require('fs/promises');

const DATA_DIR = path.join(app.getPath('userData'), 'data');
const INVOICES_DIR = path.join(DATA_DIR, 'invoices');
const ATTACHMENTS_DIR = path.join(DATA_DIR, 'attachments');

console.log('Data directory:', DATA_DIR);

async function ensureDirs() {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(INVOICES_DIR, { recursive: true });
  await mkdir(ATTACHMENTS_DIR, { recursive: true });
  console.log('Directories ensured');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../build/icon.icns'),
  });

  win.loadFile(path.join(__dirname, '../dist/index.html'));
  
  // 拦截请求，修正 _next 路径
  win.webContents.session.webRequest.onBeforeRequest({ urls: ['file:///_next/*'] }, (details, callback) => {
    const url = details.url.replace('file:///_next/', `file://${path.join(__dirname, '../dist/_next/').replace(/\\/g, '/')}`);
    callback({ redirectURL: url });
  });
  
  // 开发时打开 DevTools
  // win.webContents.openDevTools();
}

app.whenReady().then(async () => {
  await ensureDirs();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('db-read', async () => {
  try {
    const dbPath = path.join(DATA_DIR, 'db.json');
    const data = await readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { customers: [], orders: [], invoices: [], attachments: [] };
  }
});

ipcMain.handle('db-write', async (event, data) => {
  try {
    const dbPath = path.join(DATA_DIR, 'db.json');
    console.log('Writing to:', dbPath);
    await writeFile(dbPath, JSON.stringify(data, null, 2));
    console.log('Data written successfully');
    return { success: true };
  } catch (error) {
    console.error('Write error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file-save', async (event, { type, name, buffer }) => {
  const dir = type === 'invoice' ? INVOICES_DIR : ATTACHMENTS_DIR;
  const filePath = path.join(dir, name);
  await writeFile(filePath, Buffer.from(buffer));
  return { success: true, path: filePath };
});

ipcMain.handle('file-read', async (event, { type, name }) => {
  const dir = type === 'invoice' ? INVOICES_DIR : ATTACHMENTS_DIR;
  const filePath = path.join(dir, name);
  try {
    const data = await readFile(filePath);
    return { success: true, buffer: Array.from(data) };
  } catch (error) {
    console.error('File read error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file-delete', async (event, { type, name }) => {
  const dir = type === 'invoice' ? INVOICES_DIR : ATTACHMENTS_DIR;
  const filePath = path.join(dir, name);
  try {
    await unlink(filePath);
    return { success: true };
  } catch {
    return { success: false };
  }
});

ipcMain.handle('open-file-externally', async (event, { type, name }) => {
  const dir = type === 'invoice' ? INVOICES_DIR : ATTACHMENTS_DIR;
  const filePath = path.join(dir, name);
  try {
    await shell.openPath(filePath);
    return { success: true };
  } catch (error) {
    console.error('Open file error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('dialog-open', async (event, options) => {
  const result = await dialog.showOpenDialog(options);
  return result;
});

ipcMain.handle('dialog-save', async (event, options) => {
  const result = await dialog.showSaveDialog(options);
  return result;
});

ipcMain.handle('export-data', async (event, { data, filename }) => {
  const result = await dialog.showSaveDialog({
    defaultPath: filename.replace('.json', '.zip'),
    filters: [
      { name: 'ZIP Backup', extensions: ['zip'] },
      { name: 'JSON', extensions: ['json'] },
    ],
  });
  if (result.canceled || !result.filePath) {
    return { success: false };
  }

  const ext = path.extname(result.filePath).toLowerCase();
  
  if (ext === '.json') {
    // 纯 JSON 导出（向后兼容）
    await writeFile(result.filePath, JSON.stringify(data, null, 2));
    return { success: true, path: result.filePath };
  }

  // ZIP 导出 - 只导出数据库中存在的文件
  try {
    const { execSync } = require('child_process');
    const tempDir = path.join(DATA_DIR, '_temp_export');
    const tempInvoicesDir = path.join(tempDir, 'invoices');
    const tempAttachmentsDir = path.join(tempDir, 'attachments');
    
    await mkdir(tempDir, { recursive: true });
    await mkdir(tempInvoicesDir, { recursive: true });
    await mkdir(tempAttachmentsDir, { recursive: true });
    
    // 写入 db.json
    await writeFile(path.join(tempDir, 'db.json'), JSON.stringify(data, null, 2));
    
    // 只复制数据库中存在的发票文件
    const projects = data.projects || [];
    const invoiceFiles = new Set();
    const attachmentFiles = new Set();
    
    projects.forEach(p => {
      (p.invoices || []).forEach(inv => {
        if (inv.fileUrl) {
          const fileName = inv.fileUrl.split('/').pop();
          if (fileName) invoiceFiles.add(fileName);
        }
      });
      (p.attachments || []).forEach(att => {
        if (att.fileUrl) {
          const fileName = att.fileUrl.split('/').pop();
          if (fileName) attachmentFiles.add(fileName);
        }
      });
    });
    
    // 复制存在的发票文件
    for (const fileName of invoiceFiles) {
      const srcPath = path.join(INVOICES_DIR, fileName);
      if (fs.existsSync(srcPath)) {
        await copyFile(srcPath, path.join(tempInvoicesDir, fileName));
      }
    }
    
    // 复制存在的附件文件
    for (const fileName of attachmentFiles) {
      const srcPath = path.join(ATTACHMENTS_DIR, fileName);
      if (fs.existsSync(srcPath)) {
        await copyFile(srcPath, path.join(tempAttachmentsDir, fileName));
      }
    }
    
    // 创建 ZIP
    execSync(`cd "${tempDir}" && zip -r "${result.filePath}" .`);
    
    // 清理临时目录
    fs.rmSync(tempDir, { recursive: true, force: true });
    
    return { success: true, path: result.filePath };
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('import-data', async () => {
  const result = await dialog.showOpenDialog({
    filters: [
      { name: 'Backup Files', extensions: ['zip', 'json'] },
      { name: 'All Files', extensions: ['*'] },
    ],
    properties: ['openFile'],
  });
  
  if (result.canceled || result.filePaths.length === 0) {
    return { success: false };
  }

  const filePath = result.filePaths[0];
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === '.json') {
      // 纯 JSON 导入（向后兼容）
      const data = await readFile(filePath, 'utf-8');
      return { success: true, data: JSON.parse(data) };
    }

    // ZIP 导入 - 使用系统 unzip 命令
    const extractDir = path.join(DATA_DIR, '_temp_import');
    await mkdir(extractDir, { recursive: true });
    
    // 使用系统 unzip 命令解压
    const { execSync } = require('child_process');
    execSync(`unzip -o "${filePath}" -d "${extractDir}"`);

    // 读取 db.json
    const dbPath = path.join(extractDir, 'db.json');
    const data = JSON.parse(await readFile(dbPath, 'utf-8'));

    // 恢复附件文件
    const tempInvoicesDir = path.join(extractDir, 'invoices');
    if (fs.existsSync(tempInvoicesDir)) {
      const files = await readdir(tempInvoicesDir);
      for (const file of files) {
        await copyFile(
          path.join(tempInvoicesDir, file),
          path.join(INVOICES_DIR, file)
        );
      }
    }

    const tempAttachmentsDir = path.join(extractDir, 'attachments');
    if (fs.existsSync(tempAttachmentsDir)) {
      const files = await readdir(tempAttachmentsDir);
      for (const file of files) {
        await copyFile(
          path.join(tempAttachmentsDir, file),
          path.join(ATTACHMENTS_DIR, file)
        );
      }
    }

    // 清理临时目录
    fs.rmSync(extractDir, { recursive: true, force: true });

    return { success: true, data };
  } catch (error) {
    console.error('Import error:', error);
    return { success: false, error: error.message };
  }
});
