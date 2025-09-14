const express = require("express");
const main = require("../aiChatting");
const cors = require("cors");
const app = express();
require("dotenv").config();

app.use(express.json());
app.use(cors());

let Allchat = {};

// --------------------- CHAT ENDPOINT ---------------------
app.post("/chat", async (req, res) => {
  const { _id, msg } = req.body;

  if (!_id || !msg) {
    return res.status(400).send("Missing _id or msg in request body");
  }

  if (!Allchat[_id]) {
    Allchat[_id] = [];
  }
  const history = Allchat[_id];

  const ques = [
    ...history,
    {
      role: "user",
      parts: [
        {
          text:
            msg +
            " Respond as a mental health support assistant for students. Be empathetic, encouraging, and avoid clinical diagnosis. Focus on emotional support, stress management, and academic pressure. Don't mention being an AI.",
        },
      ],
    },
  ];

  try {
    const answer = await main(ques);

    Allchat[_id] = [
      ...history,
      { role: "user", parts: [{ text: msg }] },
      { role: "model", parts: [{ text: answer }] },
    ];

    res.send(answer);
  } catch (err) {
    const message = err?.message || JSON.stringify(err);
    res.status(500).send(message);
  }
});

// --------------------- MENTAL HEALTH (PHQ-9 ONLY) ENDPOINT ---------------------
app.post("/mental-health", async (req, res) => {
  const { _id, phq9 } = req.body;

  if (!_id || !phq9 || phq9.length !== 9) {
    return res.status(400).send("Invalid _id or PHQ-9 input");
  }

  // 1. Calculate score
  const phqScore = phq9.reduce((a, b) => a + b, 0);

  // 2. Severity + Suggestion
  const getSeverity = (score) => {
    if (score <= 4)
      return [
        "Minimal",
        "Maintain healthy habits like sleep, hydration, and social connection.",
      ];
    if (score <= 9)
      return [
        "Mild",
        "Try journaling, light exercise, and talking to a friend.",
      ];
    if (score <= 14)
      return [
        "Moderate",
        "Consider mindfulness apps or speaking with a counselor.",
      ];
    if (score <= 19)
      return [
        "Moderately Severe",
        "Professional support is recommended. Therapy can help.",
      ];
    return [
      "Severe",
      "Seek immediate help from a mental health professional or helpline.",
    ];
  };

  const [phqSeverity, phqSuggestion] = getSeverity(phqScore);

  // 3. Build context message with PHQ-9 answers
  const phqSummary = `PHQ-9 answers: ${phq9.join(", ")}. \
Total score = ${phqScore} (${phqSeverity}). \
These answers reflect the student's emotional state.`;

  const followUpMsg = `Based on my PHQ-9 score of ${phqScore} (${phqSeverity}), I am struggling. \
Please give me emotional support and coping tips. \
Keep your reply short (3–5 sentences), empathetic, encouraging, and vary wording. \
Avoid clinical diagnosis. Do not mention being an AI.`;

  // 4. Save in chat history
  Allchat[_id] = Allchat[_id] || [];
  Allchat[_id].push({
    role: "user",
    parts: [{ text: phqSummary }],
  });

  const ques = [
    ...Allchat[_id],
    { role: "user", parts: [{ text: followUpMsg }] },
  ];

  try {
    const answer = await main(ques);

    Allchat[_id].push(
      { role: "user", parts: [{ text: followUpMsg }] },
      { role: "model", parts: [{ text: answer }] }
    );

    res.send({
      phq9: {
        score: phqScore,
        severity: phqSeverity,
        suggestion: phqSuggestion,
      },
      followUpResponse: answer,
    });
  } catch (err) {
    const message = err?.message || JSON.stringify(err);
    res.status(500).send({ error: message });
  }
});

// ❌ REMOVE app.listen()
// ✅ EXPORT the app for Vercel
module.exports = app;
