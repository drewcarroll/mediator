export interface ChatMessage {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
}
  
export interface ChatResponse {
    message: string;
    success: boolean;
}