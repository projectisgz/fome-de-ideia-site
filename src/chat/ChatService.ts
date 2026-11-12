import type { Recipe } from '../data/types';

/**
 * Camada de chat desacoplada da interface.
 *
 * Para conectar uma IA real, crie uma classe que implemente `ChatService`
 * (por exemplo, chamando seu backend) e troque a instância criada em
 * `src/chat/index.ts`. A interface não precisa mudar.
 *
 * Regra de segurança: nunca chame a API do modelo direto do navegador com uma
 * chave secreta; passe por um backend seu.
 */
export interface ChatContext {
  /** Receita aberta pelo usuário, se houver. */
  recipe?: Recipe;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: number;
  /** Cartão opcional de porções ajustadas. */
  portions?: { servings: number; items: { name: string; qty: string }[] };
  /** Título curto exibido acima da resposta (ex.: "Dica do Fogão"). */
  heading?: string;
}

export interface ChatService {
  /** Verdadeiro enquanto as respostas forem simuladas. A interface exibe um aviso. */
  readonly isDemo: boolean;
  reply(question: string, history: ChatMessage[], context: ChatContext): Promise<Omit<ChatMessage, 'id' | 'createdAt' | 'role'>>;
}
