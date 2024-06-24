
const { Configuration, OpenAIApi } = require("openai");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const operandClient = require("@operandinc/sdk").operandClient;
const indexIDHeaderKey = require("@operandinc/sdk").indexIDHeaderKey;
const ObjectService = require("@operandinc/sdk").ObjectService;

// Open AI Configuration
const configuration = new Configuration({
  apiKey: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxx'
});

const openai = new OpenAIApi(configuration);

// Express Configuration
const app = express();
const port = 80;

app.use(bodyParser.json());
app.use(cors());
app.use(require("morgan")("dev"));

// Routing
// Primary Open AI Route
app.post("/", async (req, res) => {
  const { message } = req.body;

  const runIndex = async () => {
    const operand = operandClient(
      ObjectService,
      "bdxgbb5ob9tchx3ym7ujs9c7oex99mok8ivr",
      "https://api.operand.ai",
      {
         [indexIDHeaderKey]: "z1b0740cgerk"
      }
    );

    try {
      const results = await operand.searchWithin({
        query: `${message}`,
        limit: 5,
      });

      if (results) {
        return results.matches.map((m) => `- ${m.content}`).join("\n");
      } else {
        return "";
      }
    } catch (error) {
      console.log(error);
    }
  };

  let operandSearch = await runIndex(message);
  console.log(operandSearch)

  const basePromptPrefix = `This is a conversation between bloger Chenzuoli and a stranger.\nRelevant information that zuoli knows:\n我的妻子是邓佳滢，一位文化行业从业者\n我的妻子很漂亮，她喜欢美食，爱好做饭，做得一手好菜，把她的老公拿捏\n我的兄弟是白璐，一位职业投资人\n${operandSearch}`;

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `${basePromptPrefix}\n\nStranger:${message}\n\nChenzuoli:`,
    max_tokens: 256,
    temperature: 0.7,
  });
  res.json({
    message: response.data.choices[0].text,
  });
});

// Get Models Route

// Start the server
app.listen(port, () => {
  console.log(`server running.`);
});

module.exports = app;
