// options.js - 選項頁面邏輯
// 負責載入/儲存使用者設定

document.addEventListener('DOMContentLoaded', async () => {
  // 套用 i18n 翻譯
  applyI18n();

  const prefixInput = document.getElementById('prompt-prefix');
  const previewEl = document.getElementById('preview');
  const autoSubmitToggle = document.getElementById('auto-submit');
  const saveBtn = document.getElementById('save-btn');
  const resetBtn = document.getElementById('reset-btn');
  const toast = document.getElementById('toast');

  // 載入已儲存的設定
  const settings = await chrome.storage.sync.get({
    promptPrefix: '',
    autoSubmit: false,
  });

  prefixInput.value = settings.promptPrefix;
  autoSubmitToggle.checked = settings.autoSubmit;
  updatePreview();

  // 即時預覽
  prefixInput.addEventListener('input', updatePreview);

  function updatePreview() {
    const prefix = prefixInput.value.trim();
    if (prefix) {
      const suffix = chrome.i18n.getMessage('optionsPreviewSuffix');
      previewEl.textContent = `${prefix}\n\n${suffix}`;
    } else {
      previewEl.textContent = chrome.i18n.getMessage('optionsPreviewDefault');
    }
  }

  // 儲存設定
  saveBtn.addEventListener('click', async () => {
    await chrome.storage.sync.set({
      promptPrefix: prefixInput.value.trim(),
      autoSubmit: autoSubmitToggle.checked,
    });
    showToast();
  });

  // 重設設定
  resetBtn.addEventListener('click', async () => {
    prefixInput.value = '';
    autoSubmitToggle.checked = false;
    await chrome.storage.sync.set({
      promptPrefix: '',
      autoSubmit: false,
    });
    updatePreview();
    showToast();
  });

  // 顯示成功提示
  function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }
});

/**
 * 自動套用 i18n 翻譯到所有標記了 data-i18n 的元素
 */
function applyI18n() {
  // data-i18n：純文字替換
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const msg = chrome.i18n.getMessage(key);
    if (msg) el.textContent = msg;
  });

  // data-i18n-html：HTML 替換
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    const msg = chrome.i18n.getMessage(key);
    if (msg) el.innerHTML = msg;
  });

  // data-i18n-placeholder：placeholder 替換
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const msg = chrome.i18n.getMessage(key);
    if (msg) el.placeholder = msg;
  });
}
