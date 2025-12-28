import OpenAI from "openai";
import { BACKEND_URL } from './config';

export const generateCompletion = async (
  prompt: string,
  modelId: string = 'free',
  gatewayId: string = 'demo-gateway',
  gatewaySecret: string = 'demo-key',
  systemPrompt: string = 'You are a helpful AI assistant.'
) => {
  const startTime = performance.now();

  try {
    const requestBody = {
      model: modelId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
    };

    console.log('Sending to backend:', JSON.stringify(requestBody, null, 2));

    // Make direct API call to our backend with proper headers
    // No Authorization header needed - backend will use its own API key for 'free' model
    const response = await fetch(`${BACKEND_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-ID': gatewayId,
        'X-Gateway-Authorization': gatewaySecret,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('AI Gateway Response Status:', response.status);

    const endTime = performance.now();
    const duration = endTime - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Gateway API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('AI Gateway Response Data:', data);

    // Check if response has expected OpenAI-compatible structure
    if (!data.choices || !Array.isArray(data.choices)) {
      console.error('Invalid response structure:', data);
      throw new Error(`Invalid response format. Expected choices array, got: ${JSON.stringify(data).substring(0, 200)}...`);
    }

    if (data.choices.length === 0) {
      throw new Error("No choices in response from AI Gateway");
    }

    const choice = data.choices[0];
    if (!choice.message || !choice.message.content) {
      throw new Error("No message content in response from AI Gateway");
    }

    const text = choice.message.content;

    // Rough token estimation for demo purposes
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(text.length / 4);

    return {
      success: true,
      data: text,
      meta: {
        duration,
        tokensIn: inputTokens,
        tokensOut: outputTokens,
        // Mock cost calculation
        cost: ((inputTokens + outputTokens) / 1000000) * 0.10
      }
    };
  } catch (error: any) {
    console.error('AI Gateway Error:', error); // Debug log
    const endTime = performance.now();
    return {
      success: false,
      error: error.message || "Failed to connect to AI Gateway",
      meta: {
        duration: endTime - startTime,
        tokensIn: 0,
        tokensOut: 0,
        cost: 0
      }
    };
  }
};
