const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  testProxy: (config) => ipcRenderer.invoke('test-proxy', config),
  launchBrowser: (config) => ipcRenderer.invoke('launch-browser', config),
  getProxyInfo: () => ipcRenderer.invoke('get-proxy-info')
});
