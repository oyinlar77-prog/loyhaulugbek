import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: "2mb" }));

// ── AI endpoint ────────────────────────────────────────────────────────────
app.post("/api/ai/chat", async (req, res) => {
  const { messages, system, maxTokens } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages majburiy" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res
      .status(500)
      .json({ error: "ANTHROPIC_API_KEY sozlanmagan. Railway Variables ga qo'shing." });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: maxTokens ?? 800,
      system:
        system ||
        "Sen Ulug'bek AI — O'zbekistonning aqlli yordamchisi. O'zbek tilida qisqa, foydali javob ber.",
      messages,
    });

    const text =
      response.content[0]?.type === "text" ? response.content[0].text : "";
    res.json({ text });
  } catch (err) {
    console.error("Anthropic xato:", err?.message ?? err);
    res.status(500).json({ error: err?.message ?? "Noma'lum xato" });
  }
});

// ── Frontend static files ──────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Ulug'bek AI ishlamoqda → http://localhost:${PORT}`);
});
