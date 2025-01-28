import type { NextRequest } from 'next/server';

import { createOpenAI } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Add error handling for empty request body
  const body = await req.text();
  if (!body) {
    return NextResponse.json(
      { error: 'Request body is empty' },
      { status: 400 }
    );
  }

  const { apiKey: key, messages, model, system } = JSON.parse(body);

  if (!messages) {
    return NextResponse.json(
      { error: 'Messages are required' },
      { status: 400 }
    );
  }

  const apiKey = key || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing OpenAI API key.' },
      { status: 401 }
    );
  }

  const openai = createOpenAI({ apiKey });

  try {
    const result = await streamText({
      maxTokens: 2048,
      messages: convertToCoreMessages(messages),
      model: openai(model),
      system: system,
    });

    return result.toDataStreamResponse();
  } catch {
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
