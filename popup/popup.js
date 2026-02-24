// popup.js - Popup 邏輯
// 負責載入使用者設定並處理選項頁面開啟

document.addEventListener('DOMContentLoaded', async () => {
  // 載入使用者設定的提示語前綴
  const settings = await chrome.storage.sync.get({
    promptPrefix: '',
  });

  // 顯示目前的提示語前綴
  const prefixEl = document.getElementById('current-prefix');
  if (settings.promptPrefix) {
    prefixEl.textContent = settings.promptPrefix;
  } else {
    prefixEl.textContent = '（無）';
  }

  // 開啟設定頁面
  document.getElementById('open-options').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
});
