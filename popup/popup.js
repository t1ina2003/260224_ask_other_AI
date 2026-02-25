// popup.js - Popup 邏輯
// 負責載入使用者設定並處理選項頁面開啟

document.addEventListener('DOMContentLoaded', async () => {
  // 套用 i18n 翻譯
  applyI18n();

  // 載入使用者設定的提示語前綴
  const settings = await chrome.storage.sync.get({
    promptPrefix: '',
  });

  // 顯示目前的提示語前綴
  const prefixEl = document.getElementById('current-prefix');
  if (settings.promptPrefix) {
    prefixEl.textContent = settings.promptPrefix;
  } else {
    prefixEl.textContent = chrome.i18n.getMessage('prefixNone');
  }

  // 開啟設定頁面
  document.getElementById('open-options').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
});

/**
 * 自動套用 i18n 翻譯到所有標記了 data-i18n 或 data-i18n-html 的元素
 */
function applyI18n() {
  // data-i18n：純文字替換
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const msg = chrome.i18n.getMessage(key);
    if (msg) el.textContent = msg;
  });

  // data-i18n-html：HTML 替換（用於包含 <strong> 等標籤的文字）
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    const msg = chrome.i18n.getMessage(key);
    if (msg) el.innerHTML = msg;
  });
}
