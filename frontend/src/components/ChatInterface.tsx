import { useState, useRef, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import Message from './Message';
import { Message as MessageType } from '../types';
import { querySQL, clearConversation } from '../api';

interface ChatInterfaceProps {
  conversationId: string;
  exampleQuery?: string;
  onExampleUsed?: () => void;
}

export default function ChatInterface({ 
  conversationId, 
  exampleQuery,
  onExampleUsed 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your SQL Query Builder powered by Cloudflare AI. Ask me anything about your database, and I\'ll generate optimized SQL queries for you!',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (exampleQuery) {
      setInput(exampleQuery);
      onExampleUsed?.();
    }
  }, [exampleQuery, onExampleUsed]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: MessageType = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await querySQL(input, conversationId);
      
      const assistantMessage: MessageType = {
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        sqlResult: result,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: MessageType = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to generate SQL'}`,
        timestamp: Date.now(),
        error: true,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Clear conversation history?')) return;

    try {
      await clearConversation(conversationId);
      setMessages([
        {
          role: 'assistant',
          content: 'Conversation cleared! Ask me anything about your database.',
          timestamp: Date.now(),
        },
      ]);
    } catch (error) {
      alert('Failed to clear conversation');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-[700px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 flex-shrink-0">
        <CardTitle>SQL Query Assistant</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Clear Chat
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages - Fixed height with scroll */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <Message key={index} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input - Fixed at bottom */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <div className="flex gap-3">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me to generate a SQL query..."
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
