/**
 * Durable Object: Conversation State
 * Stores conversation history per user session
 * Maintains context for follow-up questions
 */

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export class ConversationState {
  private state: DurableObjectState;
  private messages: Message[] = [];

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Initialize messages from storage
    if (this.messages.length === 0) {
      const stored = await this.state.storage.get<Message[]>('messages');
      this.messages = stored || [];
    }

    // Add a new message
    if (url.pathname === '/add-message' && request.method === 'POST') {
      const message = await request.json() as Omit<Message, 'timestamp'>;
      const fullMessage: Message = {
        ...message,
        timestamp: Date.now(),
      };

      this.messages.push(fullMessage);
      
      // Keep only last 20 messages to manage storage
      if (this.messages.length > 20) {
        this.messages = this.messages.slice(-20);
      }

      await this.state.storage.put('messages', this.messages);

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get conversation history
    if (url.pathname === '/get-history') {
      return new Response(JSON.stringify(this.messages), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Clear conversation
    if (url.pathname === '/clear') {
      this.messages = [];
      await this.state.storage.deleteAll();

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  }
}
