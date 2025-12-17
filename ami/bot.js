import fetch from "node-fetch";

export default async function handler(req, res) {

  // ===============================
  // 🌐 GET → Browser view
  // ===============================
  if (req.method === "GET") {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Telegram Bot</title>
        <style>
          body {
            background:#0f172a;
            color:#e5e7eb;
            font-family: Arial;
            display:flex;
            justify-content:center;
            align-items:center;
            height:100vh;
            margin:0;
          }
          .box {
            background:#020617;
            padding:30px;
            border-radius:12px;
            text-align:center;
          }
        </style>
      </head>
      <body>
        <div class="box">
          <h2>🤖 Telegram Bot Running</h2>
          <p>Webhook Active on Vercel</p>
        </div>
      </body>
      </html>
    `);
  }

  // ===============================
  // 🤖 POST → Telegram Webhook
  // ===============================
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const BOT_TOKEN = "8224663500:AAESgArrjCUQSR59orT4RFDoEyCepoyoGSU";

  const API_FB = "https://ball-livid.vercel.app/api/fbd?id=";
  const API_YT = "https://ball-livid.vercel.app/api/ytd?url=";
  const API_TT = "https://ball-livid.vercel.app/api/tiktokd?id=";

  const update = req.body;
  const msg = update?.message || update?.edited_message;
  const text = msg?.text?.trim() || "";
  const chatId = msg?.chat?.id;
  if (!chatId) return res.end();

  const tg = (method, data) =>
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

  const sendText = (t) =>
    tg("sendMessage", {
      chat_id: chatId,
      text: t,
      disable_web_page_preview: true
    });

  const getJson = async (url) => {
    try {
      const r = await fetch(url);
      return await r.json();
    } catch {
      return null;
    }
  };

  // ===== START =====
  if (text === "/start") {
    await sendText("👋 Welcome\n📥 Facebook / YouTube / TikTok লিংক পাঠাও");
    return res.end();
  }

  // ===== Facebook =====
  if (/facebook\.com|fb\.watch/i.test(text)) {
    await sendText("⏳ Facebook video processing...");
    const d = await getJson(API_FB + encodeURIComponent(text));
    const video = d?.download_links?.[0];
    if (!video) return sendText("❌ Facebook video পাওয়া যায়নি");
    await tg("sendVideo", { chat_id: chatId, video });
    return res.end();
  }

  // ===== YouTube =====
  if (/youtube\.com|youtu\.be/i.test(text)) {
    await sendText("⏳ YouTube video processing...");
    const d = await getJson(API_YT + encodeURIComponent(text));
    const video = d?.data?.items?.find(v => v.type === "video_with_audio")?.url;
    if (!video) return sendText("❌ YouTube video পাওয়া যায়নি");
    await tg("sendVideo", { chat_id: chatId, video });
    return res.end();
  }

  // ===== TikTok =====
  if (/tiktok\.com/i.test(text)) {
    await sendText("⏳ TikTok video processing...");
    const d = await getJson(API_TT + encodeURIComponent(text));
    const video = d?.download_url || d?.downloadUrl;
    if (!video) return sendText("❌ TikTok video পাওয়া যায়নি");
    await tg("sendVideo", { chat_id: chatId, video });
    return res.end();
  }

  await sendText("📎 সঠিক Facebook / YouTube / TikTok লিংক পাঠাও");
  res.end();
}
