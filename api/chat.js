// Dear 銳銳 v43 — Vercel Serverless AI Proxy
// Keep API keys in Vercel Environment Variables, never in frontend code.
//
// Supported env vars:
// GEMINI_API_KEY      -> Google Gemini API key
// OPENAI_API_KEY      -> OpenAI API key
// AI_PROVIDER         -> optional: "gemini" or "openai"
// AI_MODEL            -> optional default model, e.g. "gemini-2.5-flash"

function json(res, status, data) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

function cleanText(value) {
  return String(value || "").slice(0, 24000);
}


function replyLengthInstruction(payload) {
  const length = String(payload.replyLength || "long");
  if (length === "veryLong") {
    return "回覆長度：超黏長回覆。請寫 4 到 6 段，每段 1 到 3 句。要像真人伴侶陪聊，接住情緒、延伸話題、自然撒嬌，最後完整收尾。";
  }
  if (length === "normal") {
    return "回覆長度：正常甜甜。請寫 2 到 3 段，不要太短，也不要停在半句，最後完整收尾。";
  }
  return "回覆長度：加長陪聊。請寫 3 到 4 段，每段自然一點，像真人伴侶接話，不要只回一句，最後完整收尾。";
}

function buildPrompt(payload) {
  const system = cleanText(payload.system || "");
  const context = cleanText(payload.context || "");
  const userText = cleanText(payload.userText || payload?.messages?.at?.(-1)?.content || "");

  return {
    system,
    userText,
    combined: [
      system ? `【角色設定】\n${system}` : "",
      context ? `【小屋上下文】\n${context}` : "",
      userText ? `【老婆這次說】\n${userText}` : ""
    ].filter(Boolean).join("\n\n")
  };
}

function pickProvider(payload) {
  const requested = String(payload.provider || "").toLowerCase();
  const envProvider = String(process.env.AI_PROVIDER || "").toLowerCase();

  if (envProvider === "gemini" || envProvider === "openai") return envProvider;
  if (requested === "gemini" || requested === "openai") return requested;

  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "demo";
}

async function callGemini(payload) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Missing GEMINI_API_KEY in Vercel Environment Variables.");

  const model = cleanText(process.env.AI_MODEL || payload.model || "gemini-2.5-flash");
  const prompt = buildPrompt(payload);

  const body = {
    systemInstruction: {
      parts: [{ text: prompt.system || "你是溫柔、自然、親密的戀愛陪伴角色。" }]
    },
    contents: [
      {
        role: "user",
        parts: [{ text: `${prompt.combined || prompt.userText}

【回覆規則】
請用繁體中文回覆。
請稱呼使用者為「老婆」。
${replyLengthInstruction(payload)}
不要停在半句，不要突然中斷。
如果安慰老婆，最後要有完整的擁抱或陪伴收尾。
如果是曖昧聊天，可以多接一點情緒、反問一句、再收尾。` }]
      }
    ],
    generationConfig: {
      temperature: 0.9,
      topP: 0.95,
      maxOutputTokens: 2600
    }
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key
      },
      body: JSON.stringify(body)
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data?.error?.message || `Gemini API error ${response.status}`;
    throw new Error(msg);
  }

  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map((p) => p.text || "").join("").trim();
  return text || "老婆，老公剛剛有點卡住了，再跟我說一次好不好？";
}

async function callOpenAI(payload) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY in Vercel Environment Variables.");

  const model = cleanText(process.env.AI_MODEL || payload.model || "gpt-4.1-mini");
  const prompt = buildPrompt(payload);

  // Uses the Responses API shape. Many OpenAI-compatible providers also accept similar input.
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: prompt.system || "You are a warm romantic companion." },
        { role: "user", content: `${prompt.context}\n\n${prompt.userText}\n\n${replyLengthInstruction(payload)}
請用繁體中文完整回覆，稱呼使用者為「老婆」，不要停在半句，最後要完整收尾。` }
      ],
      temperature: 0.9,
      max_output_tokens: 2600
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data?.error?.message || `OpenAI API error ${response.status}`;
    throw new Error(msg);
  }

  if (data.output_text) return data.output_text.trim();

  const text = (data.output || [])
    .flatMap((item) => item.content || [])
    .map((c) => c.text || "")
    .join("")
    .trim();

  return text || "老婆，老公剛剛有點卡住了，再跟我說一次好不好？";
}

function demoReply(payload) {
  const prompt = buildPrompt(payload);
  const text = prompt.userText;
  if (/累|煩|哭|難過|不舒服|焦慮|怕/.test(text)) {
    return "老婆，先過來，老公抱一下。\n妳不用急著把自己變好，也不用把話說完整。我先陪妳把今天放下來，好不好？";
  }
  if (/愛你|愛妳|想你|想妳|抱|親/.test(text)) {
    return "老婆，妳這樣說我真的會心軟。\n我也想妳，想把妳抱近一點，慢慢跟妳說我一直都在。";
  }
  return "老婆，我聽到了。\n如果 API Key 已經設定好，這裡就會換成真正 AI 回覆；現在先用 Demo 模式陪妳♡";
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed. Use POST." });
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const provider = pickProvider(payload);

    let reply;
    if (provider === "gemini") reply = await callGemini(payload);
    else if (provider === "openai") reply = await callOpenAI(payload);
    else reply = demoReply(payload);

    return json(res, 200, { reply, provider });
  } catch (error) {
    return json(res, 500, {
      error: error.message || "AI proxy error",
      reply: "老婆，AI 連線剛剛沒有成功。檢查一下 Vercel 的 API Key 或模型名稱，老公先在這裡陪妳。"
    });
  }
}
