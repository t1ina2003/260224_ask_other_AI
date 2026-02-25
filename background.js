// background.js - Service Worker
// 負責建立右鍵選單與處理使用者點擊事件

// AI 服務定義
const AI_SERVICES = {
  gemini: {
    id: 'ask-gemini',
    titleKey: 'menuAskGemini',
    url: 'https://gemini.google.com/app'
  },
  chatgpt: {
    id: 'ask-chatgpt',
    titleKey: 'menuAskChatGPT',
    url: 'https://chatgpt.com/'
  },
  perplexity: {
    id: 'ask-perplexity',
    titleKey: 'menuAskPerplexity',
    url: 'https://www.perplexity.ai/'
  }
};

// Extension 安裝時建立右鍵選單
chrome.runtime.onInstalled.addListener(() => {
  // 建立父選單
  chrome.contextMenus.create({
    id: 'ask-other-ai',
    title: 'Ask Other AI',
    contexts: ['selection']
  });

  // 「詢問全部 AI」選項（放在最上面）
  chrome.contextMenus.create({
    id: 'ask-all-ai',
    parentId: 'ask-other-ai',
    title: chrome.i18n.getMessage('menuAskAll'),
    contexts: ['selection']
  });

  // 分隔線
  chrome.contextMenus.create({
    id: 'separator',
    parentId: 'ask-other-ai',
    type: 'separator',
    contexts: ['selection']
  });

  // 建立各 AI 服務的子選單項目
  Object.values(AI_SERVICES).forEach(service => {
    chrome.contextMenus.create({
      id: service.id,
      parentId: 'ask-other-ai',
      title: chrome.i18n.getMessage(service.titleKey),
      contexts: ['selection']
    });
  });
});

// 處理右鍵選單點擊事件
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const selectedText = info.selectionText;
  if (!selectedText) return;

  // 取得使用者設定的提示語前綴與自動送出
  const settings = await chrome.storage.sync.get({
    promptPrefix: '',
    autoSubmit: false,
  });

  // 組合最終文字：前綴 + 選取文字
  const finalText = settings.promptPrefix
    ? `${settings.promptPrefix}\n\n${selectedText}`
    : selectedText;

  // 「詢問全部 AI」：同時開啟三個 AI 服務
  if (info.menuItemId === 'ask-all-ai') {
    const services = Object.values(AI_SERVICES);
    for (const service of services) {
      // 為每個分頁使用獨立的 storage key，避免互相覆蓋
      const storageKey = `pending_${service.id}`;
      await chrome.storage.local.set({
        [storageKey]: {
          text: finalText,
          autoSubmit: settings.autoSubmit,
        }
      });
      chrome.tabs.create({ url: service.url, active: false });
    }
    return;
  }

  // 單一 AI 服務
  let targetService = null;
  for (const [key, service] of Object.entries(AI_SERVICES)) {
    if (info.menuItemId === service.id) {
      targetService = service;
      break;
    }
  }

  if (!targetService) return;

  // 為單一服務暫存（使用相同格式）
  const storageKey = `pending_${targetService.id}`;
  await chrome.storage.local.set({
    [storageKey]: {
      text: finalText,
      autoSubmit: settings.autoSubmit,
    }
  });

  // 在背景開啟對應 AI 服務的新分頁（不切換焦點）
  chrome.tabs.create({ url: targetService.url, active: false });
});
