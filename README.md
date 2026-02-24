# Ask Other AI - Chrome Extension

框選網頁文字，右鍵快速傳送至 Gemini、ChatGPT 或 Perplexity 的對話框中。

**僅預填文字，不會自動送出。**

## 功能

- 框選任意網頁文字後，右鍵選單即可選擇 AI 服務
- 支援 Gemini、ChatGPT、Perplexity
- 文字自動填入 AI 對話框，但不會自動送出
- 可設定自訂提示語前綴（例如「請用繁體中文回答：」）
- 深色主題的精美 Popup 介面

## 安裝方式（開發者模式）

1. 下載或 clone 此專案
2. 打開 Chrome，前往 `chrome://extensions/`
3. 開啟右上角的「開發者模式」
4. 點擊「載入未封裝項目」
5. 選擇此專案的資料夾
6. 完成！

## 使用方式

1. 在任意網頁上框選文字
2. 點擊右鍵，選擇「Ask Other AI」
3. 從子選單中選擇想要的 AI 服務
4. 新分頁會開啟，文字自動填入對話框
5. 確認內容後手動送出

## 專案結構

```
├── manifest.json      # Extension 設定檔（Manifest V3）
├── background.js      # Service Worker（右鍵選單邏輯）
├── content.js         # Content Script（AI 對話框預填）
├── popup/             # Popup 介面
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── options/           # 選項設定頁面
│   ├── options.html
│   └── options.js
└── icons/             # Extension 圖示
```

## 技術細節

- 使用 Chrome Extension Manifest V3
- Service Worker 處理右鍵選單事件
- Content Script 使用 MutationObserver 等待 AI 頁面 DOM 載入
- 設定資料透過 `chrome.storage.sync` 跨裝置同步
