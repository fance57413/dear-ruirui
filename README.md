# Dear 銳銳 — v45 AI 長回覆 / 超黏陪聊版

新增：
- AI 接入準備區新增「AI 回覆長度」
  - 正常甜甜
  - 加長陪聊
  - 超黏長回覆
- 預設改成「加長陪聊」
- 後端 `/api/chat.js` 會把回覆長度偏好傳給 Gemini / OpenAI
- 增加輸出上限到 2600 tokens
- 讓 AI 回覆更像真人伴侶陪聊：接住情緒、延伸話題、自然反問、完整收尾

更新：
1. 覆蓋 GitHub 所有 v45 檔案
2. 務必更新 `api/chat.js`
3. Commit changes
4. 等 Vercel 部署
5. 回小屋 → AI 接入準備區 → AI 回覆長度選「加長陪聊」或「超黏長回覆」
