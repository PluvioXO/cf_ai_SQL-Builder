# SQL Query Builder - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         USER INTERACTION                                    │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐     │
│   │                                                                   │     │
│   │  🖥️  CLOUDFLARE PAGES (Component #3)                             │     │
│   │                                                                   │     │
│   │  ┌─────────────────────────────────────────────────────────┐   │     │
│   │  │  📱 Chat Interface                                       │   │     │
│   │  │  • Natural language input                               │   │     │
│   │  │  • SQL syntax highlighting                              │   │     │
│   │  │  • Real-time responses                                  │   │     │
│   │  │  • Example queries                                      │   │     │
│   │  │  • Schema visualization                                 │   │     │
│   │  └─────────────────────────────────────────────────────────┘   │     │
│   │                              │                                   │     │
│   └──────────────────────────────┼───────────────────────────────────┘     │
│                                  │                                         │
└──────────────────────────────────┼─────────────────────────────────────────┘
                                   │
                                   │ POST /api/query
                                   │ { message, conversationId, schema }
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         CLOUDFLARE WORKER                                   │
│                         (src/index.ts)                                      │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐     │
│   │  🔀 Request Router                                               │     │
│   │  • /api/query → Generate SQL                                    │     │
│   │  • /api/conversation → Get history                              │     │
│   │  • /api/conversation/clear → Reset chat                         │     │
│   │  • /api/schema → Save custom schema                             │     │
│   └─────────────────────────────────────────────────────────────────┘     │
│                    │                           │                           │
│                    │                           │                           │
└────────────────────┼───────────────────────────┼───────────────────────────┘
                     │                           │
                     │                           │
        ┌────────────▼──────────┐   ┌───────────▼────────────┐
        │                       │   │                        │
        │  💾 DURABLE OBJECT    │   │  ⚙️  WORKFLOW          │
        │  (Component #4)       │   │  (Component #2)        │
        │                       │   │                        │
        │  ConversationState    │   │  SqlGenerationWorkflow │
        │                       │   │                        │
        └───────────────────────┘   └────────────────────────┘
                 │                              │
                 │                              │
                 │                              │
                 ▼                              ▼
┌────────────────────────────────┐  ┌──────────────────────────────────────┐
│                                │  │                                      │
│  💬 CONVERSATION STORAGE       │  │  🔄 MULTI-STEP ORCHESTRATION        │
│                                │  │                                      │
│  • Store user messages         │  │  Step 1: Generate SQL               │
│  • Store AI responses          │  │  ┌──────────────────────────────┐  │
│  • Maintain context            │  │  │ 🤖 Workers AI (Llama 3.3)   │  │
│  • Up to 20 messages           │  │  │ Convert natural language    │  │
│  • Per-conversation isolation  │  │  │ to SQL query                │  │
│                                │  │  └──────────────────────────────┘  │
│  Storage Methods:              │  │           │                         │
│  • /add-message               │  │           ▼                         │
│  • /get-history               │  │  Step 2: Validate Syntax           │
│  • /clear                     │  │  ┌──────────────────────────────┐  │
│                                │  │  │ Check SQL safety            │  │
│  Enables:                      │  │  │ • No DROP/DELETE/TRUNCATE   │  │
│  • "Show me that query again"  │  │  │ • Must start with SELECT    │  │
│  • "Make it faster"            │  │  │ • Balanced parentheses      │  │
│  • "Add a WHERE clause"        │  │  └──────────────────────────────┘  │
│                                │  │           │                         │
└────────────────────────────────┘  │           ▼                         │
                                    │  Step 3: Retry if Invalid           │
                                    │  ┌──────────────────────────────┐  │
                                    │  │ 🤖 Workers AI + Error        │  │
                                    │  │ Regenerate with feedback     │  │
                                    │  └──────────────────────────────┘  │
                                    │           │                         │
                                    │           ▼                         │
                                    │  Step 4: Generate Explanation       │
                                    │  ┌──────────────────────────────┐  │
                                    │  │ 🤖 Workers AI                │  │
                                    │  │ Explain query in plain English│  │
                                    │  └──────────────────────────────┘  │
                                    │           │                         │
                                    │           ▼                         │
                                    │  Step 5: Suggest Optimizations      │
                                    │  ┌──────────────────────────────┐  │
                                    │  │ 🤖 Workers AI                │  │
                                    │  │ Performance tips & indexes   │  │
                                    │  └──────────────────────────────┘  │
                                    │           │                         │
                                    └───────────┼─────────────────────────┘
                                                │
                                                ▼
                                    ┌───────────────────────────┐
                                    │  📦 RESULT                │
                                    │  {                        │
                                    │    query: "SELECT ...",   │
                                    │    explanation: "...",    │
                                    │    optimizations: [...],  │
                                    │    confidence: 0.95       │
                                    │  }                        │
                                    └───────────────────────────┘
                                                │
                                                │
                                                ▼
                                    Back to Worker → Pages → User


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                           COMPONENT BREAKDOWN

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


┌─────────────────────────┐      ┌─────────────────────────┐
│  🤖 WORKERS AI          │      │  ⚙️  WORKFLOWS          │
│  (Component #1)         │      │  (Component #2)         │
├─────────────────────────┤      ├─────────────────────────┤
│ Model:                  │      │ Class:                  │
│ llama-3.3-70b-instruct  │      │ SqlGenerationWorkflow   │
│                         │      │                         │
│ Capabilities:           │      │ Orchestrates:           │
│ • SQL generation        │      │ • 5 sequential steps    │
│ • Explanation           │      │ • Automatic retries     │
│ • Optimization          │      │ • Error handling        │
│ • Error correction      │      │ • State persistence     │
│                         │      │                         │
│ Used in:                │      │ Benefits:               │
│ • Step 1 (generate)     │      │ • Reliable execution    │
│ • Step 3 (retry)        │      │ • Built-in resilience   │
│ • Step 4 (explain)      │      │ • Monitoring/logging    │
│ • Step 5 (optimize)     │      │ • Clean error handling  │
└─────────────────────────┘      └─────────────────────────┘

┌─────────────────────────┐      ┌─────────────────────────┐
│  💾 DURABLE OBJECTS     │      │  🖥️  CLOUDFLARE PAGES   │
│  (Component #4)         │      │  (Component #3)         │
├─────────────────────────┤      ├─────────────────────────┤
│ Class:                  │      │ Frontend:               │
│ ConversationState       │      │ public/index.html       │
│                         │      │                         │
│ Storage:                │      │ Features:               │
│ • Messages array        │      │ • Chat interface        │
│ • Per-conversation      │      │ • Syntax highlighting   │
│ • Auto-persistence      │      │ • Real-time updates     │
│ • Max 20 messages       │      │ • Schema display        │
│                         │      │ • Example queries       │
│ Enables:                │      │                         │
│ • Context memory        │      │ API Integration:        │
│ • Follow-up questions   │      │ • POST /api/query       │
│ • "that query"          │      │ • GET /api/conversation │
│ • "make it faster"      │      │ • POST /api/.../clear   │
└─────────────────────────┘      └─────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                           EXAMPLE USER FLOW

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


User: "Show me all orders from last month over $100"

    1. Pages → Worker
       POST /api/query { message, conversationId }

    2. Worker → Durable Object
       Store user message in conversation history

    3. Worker → Workflow
       Trigger SqlGenerationWorkflow with message + history

    4. Workflow → Workers AI (Step 1)
       Generate SQL query from natural language

    5. Workflow (Step 2)
       Validate: ✅ SELECT only, ✅ No dangerous patterns

    6. Workflow → Workers AI (Step 4)
       Generate explanation in plain English

    7. Workflow → Workers AI (Step 5)
       Suggest performance optimizations

    8. Workflow → Worker
       Return complete result { query, explanation, optimizations }

    9. Worker → Durable Object
       Store assistant response in history

    10. Worker → Pages
        Return JSON response

    11. Pages → User
        Display beautiful formatted result


Follow-up: "Make that query faster"

    1. Pages → Worker → Durable Object
       Retrieve conversation history (includes previous query)

    2. Workflow receives:
       • message: "Make that query faster"
       • history: [...previous messages...]

    3. Workers AI understands:
       "that query" = the SELECT query from last message

    4. Generates optimized version with indexes

    5. User sees improved query with optimization explanation


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                           DATA FLOW

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


INPUT (from user):
  "Show me all orders from last month over $100"

    ↓

DURABLE OBJECT STORES:
  {
    role: "user",
    content: "Show me all orders from last month over $100",
    timestamp: 1733246400000
  }

    ↓

WORKFLOW STEP 1 (Workers AI):
  Generate SQL →
  "SELECT * FROM orders 
   WHERE order_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
   AND total > 100"

    ↓

WORKFLOW STEP 2:
  Validate → ✅ VALID

    ↓

WORKFLOW STEP 4 (Workers AI):
  Explain →
  "This query retrieves all order records from the orders table
   where the order was placed within the last month and the
   total amount exceeds $100..."

    ↓

WORKFLOW STEP 5 (Workers AI):
  Optimize →
  [
    "Add index on order_date for faster date filtering",
    "Add index on total for WHERE clause optimization",
    "Specify columns instead of SELECT * to reduce data transfer"
  ]

    ↓

DURABLE OBJECT STORES:
  {
    role: "assistant",
    content: "{\"query\":\"SELECT * ...\",\"explanation\":\"...\"}",
    timestamp: 1733246405000
  }

    ↓

OUTPUT (to user):
  ┌────────────────────────────────────────────┐
  │ SQL Query:                                 │
  │ SELECT * FROM orders                       │
  │ WHERE order_date >= DATE_SUB(NOW(), ...)  │
  │ AND total > 100                            │
  ├────────────────────────────────────────────┤
  │ Explanation:                               │
  │ This query retrieves all order records...  │
  ├────────────────────────────────────────────┤
  │ 💡 Optimizations:                          │
  │ • Add index on order_date...               │
  │ • Add index on total...                    │
  │ • Specify columns instead of SELECT *...   │
  └────────────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                     WHY THIS ARCHITECTURE WINS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


✅ SCALABILITY
   • Workers AI: Serverless, scales to zero, handles any load
   • Workflows: Isolated execution, parallel processing
   • Durable Objects: One per user, independent scaling
   • Pages: Global CDN, cached at edge

✅ RELIABILITY
   • Workflows: Built-in retries, error handling
   • Durable Objects: Automatic persistence
   • Workers AI: Multiple models, fallback options
   • Pages: 100% uptime, distributed

✅ PERFORMANCE
   • Workers AI: Sub-second inference
   • Workflows: Efficient orchestration
   • Durable Objects: In-memory access
   • Pages: Edge-cached, <100ms load

✅ COST-EFFECTIVE
   • Pay per use, no idle costs
   • Free tiers available
   • Efficient resource usage
   • No server management

✅ DEVELOPER EXPERIENCE
   • Simple TypeScript APIs
   • Local development with wrangler
   • Built-in monitoring
   • Easy deployment


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## File Structure

```
sql-query-builder/
│
├── src/
│   ├── index.ts                       # Main Worker (Router)
│   │   • Handles /api/query
│   │   • Handles /api/conversation
│   │   • Coordinates components
│   │
│   ├── workflows/
│   │   └── sql-generation.ts          # Component #2: Workflows
│   │       • 5-step SQL generation
│   │       • Validation & retry
│   │       • Uses Workers AI
│   │
│   └── durable-objects/
│       └── conversation.ts             # Component #4: Durable Objects
│           • Store messages
│           • Retrieve history
│           • Clear conversation
│
├── public/
│   └── index.html                      # Component #3: Pages
│       • Chat interface
│       • SQL display
│       • Schema viewer
│
├── wrangler.toml                       # Cloudflare config
│   • AI binding
│   • Workflow binding
│   • Durable Object binding
│   • KV binding
│
└── package.json                        # Dependencies
```

## Quick Reference: Which Component Does What?

| Task | Component | File |
|------|-----------|------|
| Generate SQL | Workers AI (#1) | workflow step 1 |
| Explain query | Workers AI (#1) | workflow step 4 |
| Suggest optimizations | Workers AI (#1) | workflow step 5 |
| Orchestrate steps | Workflows (#2) | workflows/sql-generation.ts |
| Validate syntax | Workflows (#2) | workflows/sql-generation.ts |
| Auto-retry on error | Workflows (#2) | workflows/sql-generation.ts |
| Display chat UI | Pages (#3) | public/index.html |
| Send/receive messages | Pages (#3) | public/index.html |
| Store conversation | Durable Objects (#4) | durable-objects/conversation.ts |
| Maintain context | Durable Objects (#4) | durable-objects/conversation.ts |
| Route requests | Worker | src/index.ts |
| CORS handling | Worker | src/index.ts |
