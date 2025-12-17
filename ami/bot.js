export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("OK");
  }

  const BOT_TOKEN = process.env.BOT_TOKEN; // 👈 token env এ দিবে
  const update = req.body;

  const chatId = update?.message?.chat?.id;
  const text = update?.message?.text;

  if (!chatId) return res.end();

  // শুধু test response
  const reply = text === "/start"
    ? "✅ Test Bot Working!"
    : "👋 Hello from Vercel Bot";

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: reply
    })
  });

  res.status(200).end("OK");
}
