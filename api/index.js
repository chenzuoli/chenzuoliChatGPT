const { Configuration, OpenAIApi } = require("openai");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const operandClient = require("@operandinc/sdk").operandClient;
const indexIDHeaderKey = require("@operandinc/sdk").indexIDHeaderKey;
const ObjectService = require("@operandinc/sdk").ObjectService;

// Open AI Configuration
const configuration = new Configuration({
  apiKey: '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'
});

const openai = new OpenAIApi(configuration);

// Express Configuration
const app = express();
const port = 3080;

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
         [indexIDHeaderKey]: "hkd9o780woe8"
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

  const basePromptPrefix = `This is a conversation between bloger Chenzuoli and a stranger.\nRelevant information that zuoli knows:\n${operandSearch}`;

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `${basePromptPrefix}\n\nStranger:${message}\n\nChenzuoli:`,
    //prompt: `${message}`,
    max_tokens: 256,
    temperature: 0.0,
    stop: '1',
    frequency_penalty: 0.0,
    presence_penalty: 0.0
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
