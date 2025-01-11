'use client';

import { useChatInteraction } from '@/hooks/useChatInteraction';
import { ChatInput } from '@/components/ChatInput/ChatInput';
import { ChatResponse } from '@/components/ChatResponse/ChatResponse';
import styles from './page.module.css';

export default function Home() {
  const leftChat = useChatInteraction('left');
  const rightChat = useChatInteraction('right');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Mediator.ai</h1>
      </header>

      <main className={styles.main}>
        {/* Left Chat Panel */}
        <div className={styles.chatPanel}>
          <div className={styles.messageContainer}>
            {leftChat.messages.map(message => (
              <ChatResponse key={message.id} message={message} />
            ))}
            {leftChat.isLoading && (
              <div className={styles.loadingContainer}>
                <div>AI is thinking...</div>
              </div>
            )}
            {leftChat.error && (
              <div className={styles.error}>
                {leftChat.error}
              </div>
            )}
          </div>
          {!leftChat.isComplete && (
            <div className={styles.inputContainer}>
              <ChatInput onSendMessage={leftChat.sendMessage} isLoading={leftChat.isLoading} />
            </div>
          )}
        </div>

        {/* Right Chat Panel */}
        <div className={styles.chatPanel}>
          <div className={styles.messageContainer}>
            {rightChat.messages.map(message => (
              <ChatResponse key={message.id} message={message} />
            ))}
            {rightChat.isLoading && (
              <div className={styles.loadingContainer}>
                <div>AI is thinking...</div>
              </div>
            )}
            {rightChat.error && (
              <div className={styles.error}>
                {rightChat.error}
              </div>
            )}
          </div>
          {!rightChat.isComplete && (
            <div className={styles.inputContainer}>
              <ChatInput onSendMessage={rightChat.sendMessage} isLoading={rightChat.isLoading} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}