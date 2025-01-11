// Manages the communication between the frontend and OpenAI's API.
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client with API key from environment variables.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

export async function POST(request: Request) {
  // Verify API key exists in environment variables
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Parse the request body and extract relevant data
    const body = await request.json();
    const { message, conversationHistory, systemInstructions } = body
    // Ensure message field is not empty
    if (!message || !systemInstructions) {
      return NextResponse.json(
        { error: 'Message and system instructions are required' },
        { status: 400 }
      );
    }

    // Create the messages array for OpenAI
    const messages = [
      { role: 'system', content: systemInstructions },
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Log the context being sent to OpenAI
    console.log('\n=== Current Conversation Context ===');
    console.log('System Instructions:', systemInstructions);
    console.log('Full Context Being Sent to AI:');
    messages.forEach((msg, index) => {
      console.log(`[${index}] ${msg.role}: ${msg.content}`);
    });
    console.log('=====================================\n');

    // Make the API call
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    // Extract the AI's response from the completion object
    const aiResponse = completion.choices[0].message.content;

    // Return successful response with AI's message
    return NextResponse.json({ message: aiResponse });

  } catch (error: any) {
    // Log error for debugging and return user-friendly error message
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate response' },
      { status: 500 }
    );
  }
}