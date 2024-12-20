import { ChatMessage } from '@/types/chat';
import styles from './ChatResponse.module.css';

interface ChatResponseProps {
  message: ChatMessage;
}

export function ChatResponse({ message }: ChatResponseProps) {
  return (
    <div className={styles.message}>
      <p className={styles.content}>{message.content}</p>
      <span className={styles.timestamp}>
        {new Date(message.timestamp).toLocaleTimeString()}
      </span>
    </div>
  );
}