let currentProxyType = 'HTTP';
let proxyConfig = {
  type: 'HTTP',
  ip: '',
  port: '',
  username: '',
  password: ''
};

const proxyBtns = document.querySelectorAll('.proxy-btn');
const ipInput = document.getElementById('ip-input');
const portInput = document.getElementById('port-input');
const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
const testBtn = document.getElementById('test-btn');
const connectBtn = document.getElementById('connect-btn');
const testResult = document.getElementById('test-result');

proxyBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    proxyBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentProxyType = btn.dataset.type;
    proxyConfig.type = currentProxyType;
  });
});

ipInput.addEventListener('input', (e) => {
  proxyConfig.ip = e.target.value;
});

portInput.addEventListener('input', (e) => {
  proxyConfig.port = e.target.value;
});

usernameInput.addEventListener('input', (e) => {
  proxyConfig.username = e.target.value;
});

passwordInput.addEventListener('input', (e) => {
  proxyConfig.password = e.target.value;
});

testBtn.addEventListener('click', async () => {
  if (!proxyConfig.ip || !proxyConfig.port) {
    showTestResult(false, 'Please enter IP and Port');
    return;
  }

  testBtn.querySelector('.btn-text').textContent = 'Testing...';
  testBtn.querySelector('.spinner').classList.remove('hidden');
  testBtn.disabled = true;
  testResult.classList.add('hidden');

  try {
    const result = await window.electron.testProxy(proxyConfig);
    
    testBtn.querySelector('.btn-text').textContent = 'Test Connection';
    testBtn.querySelector('.spinner').classList.add('hidden');
    testBtn.disabled = false;

    if (result.success) {
      showTestResult(true, `✓ Connected successfully!<br>IP: ${result.ip}<br>Location: ${result.location}`);
      connectBtn.disabled = false;
      proxyConfig.location = result.location;
    } else {
      showTestResult(false, `✗ Connection failed: ${result.error}`);
      connectBtn.disabled = true;
    }
  } catch (error) {
    testBtn.querySelector('.btn-text').textContent = 'Test Connection';
    testBtn.querySelector('.spinner').classList.add('hidden');
    testBtn.disabled = false;
    showTestResult(false, `✗ Error: ${error.message}`);
    connectBtn.disabled = true;
  }
});

connectBtn.addEventListener('click', async () => {
  connectBtn.disabled = true;
  connectBtn.textContent = 'Launching...';

  try {
    await window.electron.launchBrowser(proxyConfig);
    connectBtn.textContent = 'Browser Launched!';
    setTimeout(() => {
      connectBtn.textContent = 'Launch Browser';
      connectBtn.disabled = false;
    }, 2000);
  } catch (error) {
    connectBtn.textContent = 'Launch Failed';
    setTimeout(() => {
      connectBtn.textContent = 'Launch Browser';
      connectBtn.disabled = false;
    }, 2000);
  }
});

function showTestResult(success, message) {
  testResult.className = 'test-result';
  testResult.classList.add(success ? 'success' : 'error');
  testResult.innerHTML = message;
}
