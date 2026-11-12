import { DemoChatService } from './demoChatService';
import type { ChatService } from './ChatService';

/** Ponto único de troca: substitua por uma implementação real quando houver backend. */
export const chatService: ChatService = new DemoChatService();
export type { ChatMessage, ChatContext, ChatService } from './ChatService';
export { quickQuestions } from './demoChatService';
