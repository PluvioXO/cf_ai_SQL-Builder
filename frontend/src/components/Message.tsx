import { User, Bot, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Message as MessageType } from '../types';
import SqlResult from './SqlResult';

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 animate-slide-in', isUser && 'justify-end')}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}

      <div className={cn('max-w-3xl', isUser && 'order-first')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            isUser
              ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white'
              : message.error
              ? 'bg-red-50 text-red-900 border border-red-200'
              : 'bg-white border border-gray-200'
          )}
        >
          {message.error && (
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-semibold text-sm">Error</span>
            </div>
          )}
          
          {message.content && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}

          {message.sqlResult && (
            <SqlResult result={message.sqlResult} />
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-gray-600" />
        </div>
      )}
    </div>
  );
}
