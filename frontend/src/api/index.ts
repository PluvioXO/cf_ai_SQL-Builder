import { SqlResult } from '../types';

const API_BASE = import.meta.env.PROD 
  ? 'https://your-worker.your-subdomain.workers.dev'
  : '/api';

export async function querySQL(
  message: string,
  conversationId: string,
  schema?: string
): Promise<SqlResult> {
  const response = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationId, schema }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate SQL query');
  }

  return response.json();
}

export async function getConversation(conversationId: string) {
  const response = await fetch(
    `${API_BASE}/conversation?id=${conversationId}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch conversation');
  }

  return response.json();
}

export async function clearConversation(conversationId: string) {
  const response = await fetch(`${API_BASE}/conversation/clear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId }),
  });

  if (!response.ok) {
    throw new Error('Failed to clear conversation');
  }

  return response.json();
}
