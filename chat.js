export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { chatHistory, userMessage } = req.body;

  const payload = {
    contents: [
      ...chatHistory.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }]
      })),
      { role: "user", parts: [{ text: userMessage }] }
    ],
    systemInstruction: {
      parts: [{ text: "You are a helpful, friendly AI assistant." }]
    }
  };

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // IMPORTANT — correct header
          "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Walang sagot si Gemini.";

    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({
      error: "Error sa server: " + err.message
    });
  }
}
