/**
 * SQL Query Builder - Main Worker Entry Point
 * Demonstrates all 4 Cloudflare components:
 * 1. Workers AI (Llama 3.3)
 * 2. Workflows
 * 3. Pages + Realtime
 * 4. Durable Objects
 */

export { ConversationState } from './durable-objects/conversation';
export { SqlGenerationWorkflow } from './workflows/sql-generation';

interface Env {
  AI: Ai;
  CONVERSATIONS: DurableObjectNamespace;
  SCHEMA_CACHE: KVNamespace;
  WORKFLOW?: Workflow;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers for frontend
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route: Generate SQL query
      if (url.pathname === '/api/query' && request.method === 'POST') {
        const { message, conversationId, schema } = await request.json() as {
          message: string;
          conversationId: string;
          schema?: string;
        };

        // Get or create conversation state
        const id = env.CONVERSATIONS.idFromName(conversationId);
        const conversationStub = env.CONVERSATIONS.get(id);

        // Add message to conversation history
        await conversationStub.fetch(new Request('http://internal/add-message', {
          method: 'POST',
          body: JSON.stringify({ role: 'user', content: message }),
        }));

        // Get conversation history for context
        const historyResponse = await conversationStub.fetch(
          new Request('http://internal/get-history')
        );
        const history = await historyResponse.json() as Array<{ role: string; content: string }>;

        // Get schema
        const dbSchema = schema || await getDefaultSchema(env);

        // Call workflow logic directly
        const { generateSQL } = await import('./workflows/sql-generation');
        const result = await generateSQL(
          { message, history, schema: dbSchema },
          env
        );

        // Store assistant response
        await conversationStub.fetch(new Request('http://internal/add-message', {
          method: 'POST',
          body: JSON.stringify({ 
            role: 'assistant', 
            content: JSON.stringify(result) 
          }),
        }));

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: Get conversation history
      if (url.pathname === '/api/conversation' && request.method === 'GET') {
        const conversationId = url.searchParams.get('id');
        if (!conversationId) {
          return new Response('Missing conversation ID', { status: 400, headers: corsHeaders });
        }

        const id = env.CONVERSATIONS.idFromName(conversationId);
        const conversationStub = env.CONVERSATIONS.get(id);
        const response = await conversationStub.fetch(
          new Request('http://internal/get-history')
        );

        const history = await response.json();
        return new Response(JSON.stringify(history), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: Clear conversation
      if (url.pathname === '/api/conversation/clear' && request.method === 'POST') {
        const { conversationId } = await request.json() as { conversationId: string };
        
        const id = env.CONVERSATIONS.idFromName(conversationId);
        const conversationStub = env.CONVERSATIONS.get(id);
        await conversationStub.fetch(new Request('http://internal/clear'));

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: Save custom schema
      if (url.pathname === '/api/schema' && request.method === 'POST') {
        const { schema, name } = await request.json() as { schema: string; name: string };
        await env.SCHEMA_CACHE.put(`schema:${name}`, schema);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

// Default schema for demo
async function getDefaultSchema(env: Env): Promise<string> {
  const cached = await env.SCHEMA_CACHE.get('schema:default');
  if (cached) return cached;

  const defaultSchema = `
-- E-commerce Database Schema

CREATE TABLE customers (
  customer_id INT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  product_id INT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  stock_quantity INT DEFAULT 0,
  category VARCHAR(100)
);

CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  customer_id INT REFERENCES customers(customer_id),
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pending'
);

CREATE TABLE order_items (
  order_item_id INT PRIMARY KEY,
  order_id INT REFERENCES orders(order_id),
  product_id INT REFERENCES products(product_id),
  quantity INT,
  price DECIMAL(10, 2)
);
`.trim();

  await env.SCHEMA_CACHE.put('schema:default', defaultSchema);
  return defaultSchema;
}
