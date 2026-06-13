# Dear 銳銳 — v43 Vercel AI Proxy 實接版

這版新增：
- `/api/chat.js` Vercel Serverless API
- 前端可以填 `/api/chat` 當 Proxy Endpoint
- 支援 Gemini：`GEMINI_API_KEY`
- 支援 OpenAI：`OPENAI_API_KEY`
- 可用 `AI_PROVIDER` 指定 `gemini` 或 `openai`
- 可用 `AI_MODEL` 指定模型
- API Key 不會放在前端

## 最簡單接 Gemini 的方式

1. 到 Google AI Studio 建立 Gemini API Key
2. 到 Vercel 專案：
   - Settings
   - Environment Variables
   - 新增 `GEMINI_API_KEY`
   - Value 貼上你的 API Key
   - Environment 選 Production / Preview / Development
3. 重新部署 Redeploy
4. 打開 Dear 銳銳：
   - 左上角 ☰
   - AI 接入準備區
   - 啟用 AI 回覆模式
   - AI 服務類型：Vercel Proxy / Serverless API
   - Endpoint：`/api/chat`
   - 模型名稱：`gemini-3.5-flash`
   - 按「測試 AI 回覆」

## 接 OpenAI 的方式

1. 到 Vercel Environment Variables 新增 `OPENAI_API_KEY`
2. 可選新增：
   - `AI_PROVIDER=openai`
   - `AI_MODEL=gpt-4.1-mini`
3. 重新部署
4. 小屋 Endpoint 一樣填 `/api/chat`

## 安全提醒

不要把正式 API Key 填在前端，也不要寫進 `index.html`。
API Key 應放在 Vercel Environment Variables 裡。
