const axios = require('axios');
const config = require('../config');

async function call(prompt, apiKey, retries = 2) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        `${config.OPENROUTER_BASE_URL}/chat/completions`,
        {
          model: config.MODEL,
          messages: [
            { role: 'system', content: prompt.system },
            { role: 'user', content: prompt.user }
          ],
          temperature: 0.3,
          max_tokens: 8192
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://web-spec-generator.local',
            'X-Title': 'Web Spec Generator'
          },
          timeout: 45000
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      lastError = error;
      const errMsg = error.response?.data?.error?.message || error.message;
      console.error(`LLM attempt ${attempt + 1}/${retries + 1} failed:`, errMsg);

      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error('OpenRouter API error: ' + (lastError.response?.data?.error?.message || lastError.message));
}

module.exports = { call };
