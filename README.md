# Dear 銳銳 — v42 AI 接入準備區

新增：
- AI 接入準備區
- 可以開啟 / 關閉 AI 回覆模式
- 支援 Demo 模式
- 支援自訂 Proxy / Serverless Endpoint
- 支援 OpenAI / Gemini 相容設定欄位
- 可設定模型名稱
- 可設定角色提示詞 / 老公人格
- 可選擇帶入：
  - 記憶庫
  - 最近心情
  - 紀念日
  - 動態牆語氣
  - 最近聊天歷史
- 可預覽送出的 payload / prompt
- 可測試 AI 回覆
- 聊天頁在 AI 開啟時會優先走 AI 回覆；失敗則顯示 fallback

重要安全提醒：
不要把正式 API Key 直接放在公開前端。
建議流程：
Dear 銳銳前端 → 你的 Vercel/Netlify Serverless API → OpenAI/Gemini API

使用：
左上角 ☰ → AI 接入準備區

部署：
覆蓋 GitHub repo → Commit changes → Vercel 自動部署。
