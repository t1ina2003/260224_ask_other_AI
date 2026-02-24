// options.js - 選項頁面邏輯
// 負責載入/儲存使用者設定

document.addEventListener('DOMContentLoaded', async () => {
  const prefixInput = document.getElementById('prompt-prefix');
  const previewEl = document.getElementById('preview');
  const saveBtn = document.getElementById('save-btn');
  const resetBtn = document.getElementById('reset-btn');
  const toast = document.getElementById('toast');

  // 載入已儲存的設定
  const settings = await chrome.storage.sync.get({
    promptPrefix: '',
  });

  prefixInput.value = settings.promptPrefix;
  updatePreview();

  // 即時預覽
  prefixInput.addEventListener('input', updatePreview);

  function updatePreview() {
    const prefix = prefixInput.value.trim();
    if (prefix) {
      previewEl.textContent = `${prefix}\n\n[你框選的文字會出現在這裡]`;
    } else {
      previewEl.textContent = '（框選文字將直接傳送）';
    }
  }

  // 儲存設定
  saveBtn.addEventListener('click', async () => {
    await chrome.storage.sync.set({
      promptPrefix: prefixInput.value.trim(),
    });
    showToast();
  });

  // 重設設定
  resetBtn.addEventListener('click', async () => {
    prefixInput.value = '';
    await chrome.storage.sync.set({
      promptPrefix: '',
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
