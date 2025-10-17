const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const axios = require('axios');

let mainWindow;
let browserWindow;
let currentProxyConfig = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#1a1a2e',
    titleBarStyle: 'default'
  });

  mainWindow.loadFile('renderer/index.html');
}

ipcMain.handle('test-proxy', async (event, config) => {
  try {
    const response = await axios.get('https://api.ipify.org?format=json', {
      proxy: {
        protocol: config.type.toLowerCase(),
        host: config.ip,
        port: parseInt(config.port),
        auth: config.username && config.password ? {
          username: config.username,
          password: config.password
        } : undefined
      },
      timeout: 10000
    });

    let location = 'Unknown';
    try {
      const geoResponse = await axios.get(`https://ipapi.co/${response.data.ip}/json/`, {
        timeout: 5000
      });
      location = `${geoResponse.data.city}, ${geoResponse.data.country_name}`;
    } catch (e) {
      location = 'Location unavailable';
    }

    return {
      success: true,
      ip: response.data.ip,
      location: location
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('launch-browser', async (event, config) => {
  currentProxyConfig = config;

  if (browserWindow) {
    browserWindow.close();
  }

  const ses = session.fromPartition('persist:proxySession');
  
  await ses.setProxy({
    proxyRules: `${config.type.toLowerCase()}://${config.ip}:${config.port}`,
    proxyBypassRules: '<local>'
  });

  browserWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      session: ses,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    backgroundColor: '#1a1a2e'
  });

  browserWindow.loadURL('https://www.google.com');

  browserWindow.on('closed', () => {
    browserWindow = null;
  });

  return { success: true };
});

app.whenReady().then(createMainWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
