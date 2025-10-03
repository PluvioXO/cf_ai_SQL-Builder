# SQL Query Builder - Cloudflare AI Stack Demo

An AI-powered SQL Query Builder demonstrating all required Cloudflare AI components in a production-ready application.

### Run Locally

```bash
# 1. Install dependencies
npm install
cd frontend && npm install && cd ..

# 2. Start backend (Terminal 1)
npm run dev

# 3. Start frontend (Terminal 2) 
npm run frontend:dev
```

Visit `http://localhost:5173` - The frontend proxies API calls to the backend at `http://localhost:8787`.

### Assignment Requirements

This project meets all requirements from the **Cloudflare AI Assignment**:

| Requirement | Implementation | Location |
|------------|----------------|----------|
| **LLM** (Llama 3.3 on Workers AI) | Natural language → SQL conversion | `src/workflows/sql-generation.ts` |
| **Workflow/Coordination** (Workflows) | 5-step pipeline: Generate → Validate → Retry → Explain → Optimize | `src/workflows/sql-generation.ts` |
| **Memory/State** (Durable Objects) | Conversation history (20 messages) for context-aware responses | `src/durable-objects/conversation.ts` |
| **User Input** (Pages + Realtime pattern) | React chat interface with real-time message updates | `frontend/src/components/ChatInterface.tsx` |

**Repository**: `cf_ai_SQL-Builder` 
**README.md**: This file  
**PROMPTS.md**: All AI prompts documented 
**Visible Components**: UI displays all 4 requirements below the chat

### How It Works

```
User types: "Show me all orders over $100"
     ↓
Workers AI (Llama 3.3) generates SQL
     ↓
Workflow validates syntax & security
     ↓
Durable Object saves to conversation history
     ↓
AI explains query + suggests optimizations
     ↓
Response displayed in chat with syntax highlighting
```

**Key Feature**: Ask follow-up questions like "make it faster" - the Durable Object remembers context!

## Example Queries

Try these:
- "Show me all orders from last month over $100"
- "Which customers have made more than 5 orders?"
- "List the top 10 selling products by revenue"
- Follow-up: "Add the customer names" (uses conversation memory!)

## Architecture

**Backend** (`src/`):
- `index.ts` - Worker API with routes
- `workflows/sql-generation.ts` - 5-step AI pipeline
- `durable-objects/conversation.ts` - Conversation memory
- `wrangler.toml` - Cloudflare bindings config

**Frontend** (`frontend/src/`):
- `components/ChatInterface.tsx` - Main chat UI
- `components/ui/` - shadcn/ui-style components (Card, Button, Input, Badge, CodeBlock)
- `api/index.ts` - API client
- `vite.config.ts` - Dev server with proxy

## Documentation

- **PROMPTS.md** - All AI prompts with examples
- **UI-COMPONENTS.md** - Component reference guide
- **SUMMARY.md** - Project overview

## Key Technologies

- **Workers AI**: Llama 3.3 (70B) model for SQL generation
- **Workflows**: Multi-step orchestration with automatic retries
- **Durable Objects**: Persistent conversation state
- **Pages**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui pattern
- **Syntax Highlighting**: Prism React Renderer

## Deployment

```bash
npm run deploy        # Deploy Worker
npm run pages:deploy  # Deploy Pages
```

---


