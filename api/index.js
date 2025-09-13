const express = require("express");
const main = require("../aiChatting");
const cors = require("cors");
const app = express();
require("dotenv").config();

app.use(express.json());
app.use(cors());

const Port = process.env.PORT || 4000;

app.listen(Port, () => {
  console.log(`Listening at Port ${Port}`);
});

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
      parts: [{
        text: msg + " Respond as a mental health support assistant for students. Be empathetic, encouraging, and avoid clinical diagnosis. Focus on emotional support, stress management, and academic pressure. Don't mention being an AI."
      }],
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

  const phqScore = phq9.reduce((a, b) => a + b, 0);

  const getSeverity = (score) => {
    if (score <= 4) return ["Minimal", "Maintain healthy habits like sleep, hydration, and social connection."];
    if (score <= 9) return ["Mild", "Try journaling, light exercise, and talking to a friend."];
    if (score <= 14) return ["Moderate", "Consider mindfulness apps or speaking with a counselor."];
    if (score <= 19) return ["Moderately Severe", "Professional support is recommended. Therapy can help."];
    return ["Severe", "Seek immediate help from a mental health professional or helpline."];
  };

  const [phqSeverity, phqSuggestion] = getSeverity(phqScore);

  // Store system message in chat history
  Allchat[_id] = Allchat[_id] || [];
  Allchat[_id].push({
    role: "user",
    parts: [{
      text: `PHQ-9: ${phqScore} (${phqSeverity})`
    }],
  });

  // Follow-up message to chatbot
  const followUpMsg = `Based on my PHQ-9 score of ${phqScore} (${phqSeverity}), I feel overwhelmed. Can you help me with emotional support or coping strategies?`;

  const ques = [
    ...Allchat[_id],
    {
      role: "user",
      parts: [{
        text: followUpMsg + " Respond as a mental health support assistant for students. Be empathetic, encouraging, and avoid clinical diagnosis. Focus on emotional support, stress management, and academic pressure. Don't mention being an AI."
      }],
    },
  ];

  try {
    const answer = await main(ques);

    Allchat[_id].push(
      { role: "user", parts: [{ text: followUpMsg }] },
      { role: "model", parts: [{ text: answer }] }
    );

    res.send({
      phq9: { score: phqScore, severity: phqSeverity, suggestion: phqSuggestion },
      followUpResponse: answer,
    });
  } catch (err) {
    const message = err?.message || JSON.stringify(err);
    res.status(500).send({ error: message });
  }
});
