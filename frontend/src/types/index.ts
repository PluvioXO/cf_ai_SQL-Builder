export interface SqlResult {
  query: string;
  explanation: string;
  optimizations: string[];
  confidence: number;
  error?: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  sqlResult?: SqlResult;
  error?: boolean;
}
