// This file handles the backend API communication with OpenAI
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const SYSTEM_INSTRUCTIONS = `You are helping solve an argument.
When the user explains their side, summarize it back to them clearly and concisely,
then ask if you understood correctly.
Only move forward when the user confirms you understood their side correctly.
Don't be too formal in your responses, and use language which suggests you are taking their side. `;

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

export async function POST(request: Request) {
  // First check if API key exists
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    );
  }
  try {
    // Extract message and conversation history from request body
    const body = await request.json();
    const { message, conversationHistory, conversationState } = body;
    // Validate message exists
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    } // ******* REVIEW THIS STUFF ------ WHAT IS PROMPT CONTENT? *******
    let promptContent = message;
    if (conversationState.currentPhase === 'UNDERSTANDING' &&
      conversationState.progress.understanding.step === 'INITIAL') {
      promptContent = "What's your side?";
    }
    // Make API call to OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        // Set the AI's persona
        { role: 'system', content: SYSTEM_INSTRUCTIONS },
        // Map previous conversation to OpenAI's format
        ...(conversationHistory || []).map((msg: any) => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.content
        })),
        // Add the new message
        { role: 'user', content: promptContent }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });
    // Extract AI's response
    const aiResponse = completion.choices[0].message.content;

    return NextResponse.json({ message: aiResponse });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate response' },
      { status: 500 }
    );
  }
}