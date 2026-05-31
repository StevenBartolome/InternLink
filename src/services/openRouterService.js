export const openRouterService = {
  get apiKey() {
    return process.env.REACT_APP_OPENROUTER_API_KEY || '';
  },

  isConfigured() {
    console.log('[OpenRouter Service] Checked configuration. Key length:', this.apiKey ? this.apiKey.length : 0, 'Key:', this.apiKey);
    return this.apiKey && this.apiKey !== 'your_openrouter_api_key_here';
  },

  async generateContent(prompt, model = 'openrouter/free') {
    if (!this.isConfigured()) throw new Error('OpenRouter API key is not configured.');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message || 'OpenRouter API failed');
    if (!data.choices || !data.choices[0]) throw new Error('Invalid response format from OpenRouter');

    return data.choices[0].message.content;
  },

  async generateVisionContent(prompt, base64Data, mimeType, model = 'openrouter/free') {
    if (!this.isConfigured()) throw new Error('OpenRouter API key is not configured.');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Data}` } }
          ]
        }]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message || 'OpenRouter API failed');
    if (!data.choices || !data.choices[0]) throw new Error('Invalid response format from OpenRouter');

    return data.choices[0].message.content;
  }
};
