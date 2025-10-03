# SQL Query Builder - Quick Start

## 🎯 This Project Demonstrates

✅ **Workers AI** - Llama 3.3 for SQL generation
✅ **Workflows** - Multi-step orchestration with auto-retry
✅ **Cloudflare Pages** - Interactive frontend
✅ **Durable Objects** - Conversation state management

## 🚀 Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Login to Cloudflare
```bash
npx wrangler login
```

### 3. Create KV Namespace
```bash
npx wrangler kv:namespace create SCHEMA_CACHE
```

Copy the ID from the output and update `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "SCHEMA_CACHE"
id = "YOUR_KV_ID_HERE"  # Replace this!
```

### 4. Run Locally
```bash
# Terminal 1: Run the worker
npm run dev

# Terminal 2: Open the frontend (optional - worker includes it)
# Visit http://localhost:8787 in your browser
```

### 5. Deploy to Production
```bash
npm run deploy
```

## 🎮 How It Works

### User Flow Example:
```
User: "Show me all orders from last month over $100"
    ↓
[Durable Object stores message]
    ↓
[Workflow Step 1: Generate SQL with Workers AI]
    ↓
[Workflow Step 2: Validate syntax]
    ↓
[Workflow Step 3: If invalid, retry with error feedback]
    ↓
[Workflow Step 4: Generate explanation]
    ↓
[Workflow Step 5: Suggest optimizations]
    ↓
Result returned with SQL + explanation + tips
```

## 📁 Key Files

- **`src/index.ts`** - Main worker, handles API routes
- **`src/workflows/sql-generation.ts`** - Multi-step SQL generation pipeline
- **`src/durable-objects/conversation.ts`** - Conversation state storage
- **`public/index.html`** - Beautiful chat UI
- **`wrangler.toml`** - Cloudflare configuration

## 🧪 Test the API

### Generate SQL Query
```bash
curl -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me all customers who ordered in the last week",
    "conversationId": "test-123"
  }'
```

### Get Conversation History
```bash
curl "http://localhost:8787/api/conversation?id=test-123"
```

### Clear Conversation
```bash
curl -X POST http://localhost:8787/api/conversation/clear \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "test-123"}'
```

## 🎨 Frontend Features

- 💬 Real-time chat interface
- 🎨 Syntax-highlighted SQL queries
- 📝 Plain English explanations
- 💡 Optimization suggestions
- 🔄 Conversation memory
- 📋 Example queries
- 🗂️ Schema visualization

## 🔐 Security Features

✅ SQL injection detection
✅ Only allows SELECT statements
✅ Syntax validation
✅ Dangerous pattern filtering
✅ Balanced parentheses checking

## 🌟 Example Queries to Try

1. "Show me all orders from last month over $100"
2. "Which customers have made more than 5 orders?"
3. "List the top 10 selling products by revenue"
4. "Find customers who haven't ordered in 90 days"
5. "What's the average order value per customer?"

## 🔧 Troubleshooting

### Worker not starting?
- Make sure you're logged in: `npx wrangler login`
- Check your account has Workers AI enabled

### Workflow errors?
- Workflows are in beta - ensure they're enabled in your account
- Check the Cloudflare dashboard for workflow logs

### KV errors?
- Make sure you created the namespace and updated `wrangler.toml`
- The ID must match exactly

## 📊 Monitor Your Application

View logs and metrics:
1. Go to Cloudflare Dashboard
2. Workers & Pages → Your Worker
3. Check Logs, Metrics, and Workflow runs

## 🚀 Next Steps

Add these features:
- [ ] Connect to D1 database and execute queries
- [ ] Add Realtime for live streaming results
- [ ] Voice input for queries
- [ ] Query history and favorites
- [ ] Support for INSERT/UPDATE/DELETE
- [ ] Multiple database schema support
- [ ] Query execution with result visualization

## 📝 Architecture Deep Dive

### Component #1: Workers AI
- Model: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- Used in workflow for: SQL generation, explanations, optimizations
- Automatic retries on errors

### Component #2: Workflows
- Orchestrates 5 steps: generate → validate → retry? → explain → optimize
- Handles errors gracefully
- Provides structured output

### Component #3: Durable Objects
- One object per conversation ID
- Stores last 20 messages
- Enables contextual follow-ups

### Component #4: Pages (Frontend)
- Served from `/public/index.html`
- Responsive chat UI
- Real-time updates

---

**Built with ❤️ using Cloudflare's complete AI stack!**
