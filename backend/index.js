require('dotenv').config();

const express = require('express');
const cors = require('cors');

const Anthropic = require("@anthropic-ai/sdk");

const app = express();
const PORT = process.env.PORT || 3001;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;


app.use(express.json());

app.use(cors({
    origin: [
      'https://q9g97zpqp2.us-east-2.awsapprunner.com/',
      'http://localhost:3000' // For local development
    ]
  }));


const anthropic = new Anthropic({ apiKey: CLAUDE_API_KEY });

app.get('/', (req, res) => {
    res.send('<h1 style="text-align: center;">Welcome to MasterChef-Claude API Homepage!!</h1><p style="text-align: center;">Please navigate to <a href="https://q9g97zpqp2.us-east-2.awsapprunner.com/">https://q9g97zpqp2.us-east-2.awsapprunner.com/</a> to actually generate a recipe!</p>');
})


app.post('/generate-recipe', async (req, res) => {

    const { ingredients, systemPrompt } = req.body;

    if (!ingredients || !systemPrompt) {
        return res.status(400).json({ message: "Ingredients and systemPrompt are required." });
    }

    if (!CLAUDE_API_KEY) {
        return res.status(500).json({ message: "Claude API Key not configured on backend." });
    }

    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: "user", content: `I have theseIngredients: ${ingredients}. Please give me a recipe you'd recommend I make!` }],
        });

        if (response.content && response.content[0] && response.content[0].text) {
            return res.json({ recipe: response.content[0].text });
        } else {
            throw new Error("Unexpected response from Claude API");
        }

    } catch (error) {
        console.error("Error fetching recipe from Claude API:", error);
        return res.status(500).json({ message: "Error generating recipe.", error: error.message });
    }
});


app.get('/health', (req, res) => {
    res.status(200).send('Backend is healthy!');
});


app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});