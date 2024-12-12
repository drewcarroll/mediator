// src/app/page.tsx
'use client';

import { useChatInteraction } from '@/hooks/useChatInteraction';
import { ChatInput } from '@/components/ChatInput';
import { ChatResponse } from '@/components/ChatResponse';

export default function Home() {
  const { messages, sendMessage, isLoading, error } = useChatInteraction();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-xl font-semibold text-gray-800">AI Chat Assistant</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="max-w-2xl mx-auto">
          {messages.map(message => (
            <ChatResponse key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex justify-center">
              <div className="animate-pulse text-gray-400">AI is thinking...</div>
            </div>
          )}
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center">
              {error}
            </div>
          )}
        </div>
      </main>

      <div className="border-t">
        <div className="max-w-2xl mx-auto">
          <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}