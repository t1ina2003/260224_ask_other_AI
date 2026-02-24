// background.js - Service Worker
// 負責建立右鍵選單與處理使用者點擊事件

// AI 服務定義
const AI_SERVICES = {
  gemini: {
    id: 'ask-gemini',
    title: '詢問 Gemini',
    url: 'https://gemini.google.com/app'
  },
  chatgpt: {
    id: 'ask-chatgpt',
    title: '詢問 ChatGPT',
    url: 'https://chatgpt.com/'
  },
  perplexity: {
    id: 'ask-perplexity',
    title: '詢問 Perplexity',
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

  // 建立子選單項目
  Object.values(AI_SERVICES).forEach(service => {
    chrome.contextMenus.create({
      id: service.id,
      parentId: 'ask-other-ai',
      title: service.title,
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

  // 根據點擊的選單項目決定要開啟的 AI 服務
  let targetService = null;
  for (const [key, service] of Object.entries(AI_SERVICES)) {
    if (info.menuItemId === service.id) {
      targetService = service;
      break;
    }
  }

  if (!targetService) return;

  // 將選取文字與設定暫存到 storage 中，供 content script 讀取
  await chrome.storage.local.set({
    pendingText: finalText,
    targetService: targetService.id,
    autoSubmit: settings.autoSubmit,
  });

  // 在背景開啟對應 AI 服務的新分頁（不切換焦點）
  chrome.tabs.create({ url: targetService.url, active: false });
});
