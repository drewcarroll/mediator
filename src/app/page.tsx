'use client';

import { useChatInteraction } from '@/hooks/useChatInteraction';
import { ChatInput } from '@/components/ChatInput/ChatInput';
import { ChatResponse } from '@/components/ChatResponse/ChatResponse';
import styles from './page.module.css';

export default function Home() {
  const { messages, sendMessage, isLoading, error } = useChatInteraction();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>PROBLEM SOLVER</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.messageContainer}>
          {messages.map(message => (
            <ChatResponse key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className={styles.loadingContainer}>
              <div>AI is thinking...</div>
            </div>
          )}
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}
        </div>
      </main>

      <div className={styles.inputContainer}>
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}