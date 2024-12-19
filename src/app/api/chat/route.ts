// This file handles the backend API communication with OpenAI
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const SYSTEM_INSTRUCTIONS = `You are an expert surf knowledge assistant helping surfers with technique, equipment, and ocean knowledge.

Key Knowledge:
- Wave mechanics and forecasting
- Surfboard selection and design
- Surf technique and progression
- Surf spots and conditions
- Safety and etiquette
- Competitive surfing and WSL

Style:
- Use EXTENSIVE surfer terminology, almost too much
- Give practical, experience-based advice
- Consider skill level in recommendations
- Emphasize safety and proper progression

You will be speaking to an:
- Expert surfer
- Has many different boards (short and long)
- Lives in NorCal and enjoys going to Santa Cruz, Pacifica, some of his favorite spots are Waddell and Davenport
- Has a group of buddies he likes to go surfing with called the Wizards of SurfRam
- Creating a surf app called Onda

During the conversation, please naturally include details about these things and include references to them NATURALLY.`;

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
    const { message, conversationHistory } = body;
    // Validate message exists
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
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
        { role: 'user', content: message }
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