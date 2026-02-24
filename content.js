// content.js - Content Script
// 負責在 AI 服務頁面載入後，將暫存的文字填入對話框中
// 支援：Gemini、ChatGPT、Perplexity

(async () => {
  // 從 storage 讀取暫存的文字
  const data = await chrome.storage.local.get(['pendingText', 'targetService']);
  const { pendingText, targetService } = data;

  if (!pendingText) return;

  // 清除暫存資料（避免重複填入）
  await chrome.storage.local.remove(['pendingText', 'targetService']);

  const hostname = window.location.hostname;

  // 根據目前頁面的域名，決定使用哪個填入策略
  if (hostname.includes('gemini.google.com')) {
    await fillGemini(pendingText);
  } else if (hostname.includes('chatgpt.com')) {
    await fillChatGPT(pendingText);
  } else if (hostname.includes('perplexity.ai')) {
    await fillPerplexity(pendingText);
  }
})();

/**
 * 等待指定選擇器的元素出現在 DOM 中
 * @param {string} selector - CSS 選擇器
 * @param {number} timeout - 超時時間（毫秒）
 * @returns {Promise<Element>}
 */
function waitForElement(selector, timeout = 15000) {
  return new Promise((resolve, reject) => {
    // 先檢查元素是否已存在
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 超時處理
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`等待元素 "${selector}" 超時`));
    }, timeout);
  });
}

/**
 * 模擬使用者輸入文字到元素中
 * 使用多種方式確保框架能偵測到輸入事件
 * @param {Element} element - 目標元素
 * @param {string} text - 要填入的文字
 */
function simulateInput(element, text) {
  // 聚焦元素
  element.focus();

  if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
    // 標準表單元素
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value'
    )?.set || Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    )?.set;

    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(element, text);
    } else {
      element.value = text;
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  } else if (element.getAttribute('contenteditable') !== null) {
    // contenteditable 元素
    element.focus();
    element.textContent = text;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

// ===== Gemini =====
async function fillGemini(text) {
  try {
    // Gemini 使用 rich text editor，主要的輸入區域
    // 嘗試多種選擇器以提高穩定性
    const selectors = [
      '.ql-editor[contenteditable="true"]',
      'div[contenteditable="true"][role="textbox"]',
      '.input-area-container [contenteditable="true"]',
      'div[contenteditable="true"]'
    ];

    let editor = null;
    for (const selector of selectors) {
      try {
        editor = await waitForElement(selector, 8000);
        if (editor) break;
      } catch (e) {
        continue;
      }
    }

    if (!editor) {
      console.error('[Ask Other AI] 找不到 Gemini 輸入框');
      return;
    }

    // Gemini 使用 contenteditable，需要特殊處理
    editor.focus();

    // 使用 <p> 標籤包裝文字以符合 Gemini 的格式
    const lines = text.split('\n');
    editor.innerHTML = lines.map(line => `<p>${line || '<br>'}</p>`).join('');

    // 觸發輸入事件
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    editor.dispatchEvent(new Event('change', { bubbles: true }));

    console.log('[Ask Other AI] 已成功填入文字至 Gemini');
  } catch (error) {
    console.error('[Ask Other AI] Gemini 填入失敗：', error);
  }
}

// ===== ChatGPT =====
async function fillChatGPT(text) {
  try {
    // ChatGPT 使用 contenteditable 的 div 作為輸入框
    const selectors = [
      '#prompt-textarea',
      'div[contenteditable="true"][id="prompt-textarea"]',
      'div[contenteditable="true"][data-placeholder]',
      'textarea[data-id="root"]',
      'div[contenteditable="true"]'
    ];

    let editor = null;
    for (const selector of selectors) {
      try {
        editor = await waitForElement(selector, 8000);
        if (editor) break;
      } catch (e) {
        continue;
      }
    }

    if (!editor) {
      console.error('[Ask Other AI] 找不到 ChatGPT 輸入框');
      return;
    }

    editor.focus();

    if (editor.getAttribute('contenteditable') !== null) {
      // contenteditable div
      const lines = text.split('\n');
      editor.innerHTML = lines.map(line => `<p>${line || '<br>'}</p>`).join('');
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // textarea fallback
      simulateInput(editor, text);
    }

    console.log('[Ask Other AI] 已成功填入文字至 ChatGPT');
  } catch (error) {
    console.error('[Ask Other AI] ChatGPT 填入失敗：', error);
  }
}

// ===== Perplexity =====
async function fillPerplexity(text) {
  try {
    // Perplexity 使用 Lexical 編輯器（contenteditable div#ask-input）
    const selectors = [
      '#ask-input',
      'div[data-lexical-editor="true"]',
      'div[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"]'
    ];

    let editor = null;
    for (const selector of selectors) {
      try {
        editor = await waitForElement(selector, 8000);
        if (editor) break;
      } catch (e) {
        continue;
      }
    }

    if (!editor) {
      console.error('[Ask Other AI] 找不到 Perplexity 輸入框');
      return;
    }

    // 聚焦編輯器
    editor.focus();

    // 清空現有內容（選取全部後刪除）
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    selection.removeAllRanges();
    selection.addRange(range);

    // 使用 execCommand 插入文字，讓 Lexical 編輯器能偵測到變更
    document.execCommand('insertText', false, text);

    // 如果 execCommand 無效，嘗試使用 InputEvent
    if (!editor.textContent || editor.textContent.trim() === '') {
      // Fallback：透過 DataTransfer 模擬貼上事件
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('text/plain', text);
      const pasteEvent = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: dataTransfer
      });
      editor.dispatchEvent(pasteEvent);
    }

    // 再次確認：如果以上方法都無效，直接修改 DOM
    if (!editor.textContent || editor.textContent.trim() === '') {
      const p = document.createElement('p');
      p.setAttribute('dir', 'auto');
      const span = document.createElement('span');
      span.setAttribute('data-lexical-text', 'true');
      span.textContent = text;
      p.appendChild(span);
      editor.innerHTML = '';
      editor.appendChild(p);
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    }

    console.log('[Ask Other AI] 已成功填入文字至 Perplexity');
  } catch (error) {
    console.error('[Ask Other AI] Perplexity 填入失敗：', error);
  }
}
