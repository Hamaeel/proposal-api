const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Token list (for demo)
const validTokens = ['abc123', 'xyz789']; // You can store these in DB later

app.post('/generate', async (req, res) => {
  const { token, jobTitle, jobDescription, platform } = req.body;

  if (!validTokens.includes(token)) {
    return res.status(401).json({ error: 'Invalid or missing token' });
  }

  const prompt = generatePrompt(platform, jobTitle, jobDescription);

  try {
    const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_KEY }));
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    const output = completion.data.choices[0].message.content;
    res.json({ proposal: output });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'API call failed' });
  }
});

function generatePrompt(platform, title, description) {
  const prompt = platform === 'upwork'
    ? `You are a top-rated freelancer on Upwork. Write a short proposal (max 120 words) tailored for this Upwork job:\n\nTitle: ${title}\nDescription: ${description}`
    : `You are a top-rated freelancer on Freelancer.com. Write a short proposal (max 120 words) tailored for this Freelancer job:\n\nTitle: ${title}\nDescription: ${description}`;
  return prompt;
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
