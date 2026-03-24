const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  dbRead: () => ipcRenderer.invoke('db-read'),
  dbWrite: (data) => ipcRenderer.invoke('db-write', data),
  fileSave: (params) => ipcRenderer.invoke('file-save', params),
  fileRead: (params) => ipcRenderer.invoke('file-read', params),
  fileDelete: (params) => ipcRenderer.invoke('file-delete', params),
  openFileExternally: (params) => ipcRenderer.invoke('open-file-externally', params),
  dialogOpen: (options) => ipcRenderer.invoke('dialog-open', options),
  dialogSave: (options) => ipcRenderer.invoke('dialog-save', options),
  exportData: (params) => ipcRenderer.invoke('export-data', params),
  importData: () => ipcRenderer.invoke('import-data'),
});
