'use client';

import { useState } from 'react';

import { faker } from '@faker-js/faker';

import { useSettings } from '@/components/editor/settings';

export const useChat = () => {
  const { keys, model } = useSettings();
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const sendMessage = async (input: string) => {
    setMessages((prev) => [...prev, `You: ${input}`]);
    setLoading(true);

    // Simulating API request for the demo purpose
    await fetch('/api/ai/command', {
      body: JSON.stringify({ apiKey: keys.openai, input, model: model.value }),
      method: 'POST',
    });

    // Mock the API response
    const stream = fakeStreamText();
    const reader = stream.getReader();
    let decoder = new TextDecoder();
    let result = '';

    // Simulate streaming and updating state
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
      setMessages((prev) => [...prev, `AI: ${result}`]);
    }

    setLoading(false);
  };

  return {
    messages,
    loading,
    sendMessage,
  };
};

// Used for testing. Remove it after implementing the API.
const fakeStreamText = () => {
  const blocks = [
    Array.from({ length: 5 }, () => ({
      delay: faker.number.int({ max: 100, min: 30 }),
      texts: faker.lorem.words({ max: 3, min: 1 }) + ' ',
    })),
    Array.from({ length: 3 }, () => ({
      delay: faker.number.int({ max: 100, min: 30 }),
      texts: faker.lorem.words({ max: 3, min: 1 }) + ' ',
    })),
  ];

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      for (const block of blocks) {
        for (const chunk of block) {
          await new Promise((resolve) => setTimeout(resolve, chunk.delay));
          controller.enqueue(encoder.encode(chunk.texts));
        }
        controller.enqueue(encoder.encode('\n\n'));
      }
      controller.close();
    },
  });
};
