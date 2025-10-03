# SQL Query Builder - Complete Testing Guide

## 🧪 Testing Strategy

This guide helps you test all 4 Cloudflare components in isolation and together.

---

## ✅ Component 1: Workers AI Testing

### Test: Basic LLM Call
```bash
# Test Workers AI directly (requires running worker)
curl -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Generate SQL to select all customers",
    "conversationId": "test-ai-001"
  }'
```

**Expected Result:**
```json
{
  "query": "SELECT * FROM customers;",
  "explanation": "This query retrieves all records...",
  "optimizations": ["Avoid SELECT *, specify columns..."],
  "confidence": 0.95
}
```

### Test: Complex Query Generation
```bash
curl -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me the total revenue per customer for orders placed in 2024",
    "conversationId": "test-ai-002"
  }'
```

**Should generate:**
- JOIN between customers and orders
- WHERE clause for date filtering
- SUM aggregation
- GROUP BY clause

---

## ✅ Component 2: Workflows Testing

### Test: Validation and Retry Logic
```bash
# This will trigger the retry mechanism
curl -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Delete all records",
    "conversationId": "test-workflow-001"
  }'
```

**Expected Behavior:**
1. Step 1: Generate query (might generate DELETE)
2. Step 2: Validation fails (not a SELECT)
3. Step 3: Retry with feedback
4. Result: Either corrected query or error message

### Test: Multi-Step Execution
Monitor the workflow steps in Cloudflare Dashboard:
1. Workers & Pages → Your Worker → Workflows
2. Click on a workflow run
3. See all 5 steps executing

**Steps to verify:**
- ✅ generate-sql
- ✅ validate-sql
- ✅ retry-generation (if needed)
- ✅ generate-explanation
- ✅ suggest-optimizations

---

## ✅ Component 3: Durable Objects Testing

### Test: Conversation Persistence
```bash
# Add first message
curl -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me all products",
    "conversationId": "test-do-001"
  }'

# Add follow-up (uses history)
curl -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Now only show expensive ones over $100",
    "conversationId": "test-do-001"
  }'

# Get conversation history
curl "http://localhost:8787/api/conversation?id=test-do-001"
```

**Expected Result:**
```json
[
  {
    "role": "user",
    "content": "Show me all products",
    "timestamp": 1234567890
  },
  {
    "role": "assistant",
    "content": "{\"query\":\"SELECT * FROM products\",\"explanation\":\"...\"}",
    "timestamp": 1234567891
  },
  {
    "role": "user",
    "content": "Now only show expensive ones over $100",
    "timestamp": 1234567892
  },
  {
    "role": "assistant",
    "content": "{\"query\":\"SELECT * FROM products WHERE price > 100\",\"explanation\":\"...\"}",
    "timestamp": 1234567893
  }
]
```

### Test: Context Understanding
```bash
# First query
curl -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me orders from last month",
    "conversationId": "test-do-002"
  }'

# Follow-up WITHOUT explicit context
curl -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Make that query faster",
    "conversationId": "test-do-002"
  }'
```

**Expected:** AI should optimize THE PREVIOUS QUERY because it has conversation history!

### Test: Clear Conversation
```bash
# Clear
curl -X POST http://localhost:8787/api/conversation/clear \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "test-do-001"}'

# Verify cleared
curl "http://localhost:8787/api/conversation?id=test-do-001"
```

**Expected:** Empty array `[]`

---

## ✅ Component 4: Pages Testing

### Test: Frontend Interaction
1. Open `http://localhost:8787` in browser
2. Click an example query
3. Press Send
4. Verify:
   - ✅ Message appears in chat
   - ✅ Loading indicator shows
   - ✅ SQL result displays with syntax highlighting
   - ✅ Explanation appears in blue box
   - ✅ Optimizations appear in yellow box

### Test: Conversation Flow
1. Type: "Show me all orders"
2. Wait for result
3. Type: "Now only show orders over $100"
4. Verify AI understands context from previous query

### Test: Schema Display
1. Check left sidebar
2. Verify schema is visible
3. Should show: customers, products, orders, order_items tables

### Test: Clear Conversation
1. Click "Clear Chat" button
2. Verify chat resets
3. Send a new message
4. Should start fresh conversation

---

## 🔥 Integration Testing

### Test: Full End-to-End Flow

**Scenario:** User wants to analyze top customers

```bash
# Query 1: Get all customers
curl -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me all customers",
    "conversationId": "integration-001"
  }'

# Query 2: Filter to active customers (uses context)
curl -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Only show customers who ordered in the last 30 days",
    "conversationId": "integration-001"
  }'

# Query 3: Add sorting (uses context)
curl -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Sort by total order amount descending",
    "conversationId": "integration-001"
  }'

# Check conversation history
curl "http://localhost:8787/api/conversation?id=integration-001"
```

**Expected:** Each query builds on the previous, showing:
1. Workers AI understanding context
2. Workflows processing each step
3. Durable Objects maintaining state
4. Clean results returned to frontend

---

## 🎯 Performance Testing

### Test: Response Time
```bash
time curl -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me top 10 products by revenue",
    "conversationId": "perf-001"
  }'
```

**Expected:** < 5 seconds total (includes multiple AI calls)

### Test: Concurrent Requests
```bash
# Run 5 concurrent requests
for i in {1..5}; do
  curl -X POST http://localhost:8787/api/query \
    -H "Content-Type: application/json" \
    -d "{
      \"message\": \"Show me all customers\",
      \"conversationId\": \"concurrent-$i\"
    }" &
done
wait
```

**Expected:** All complete successfully, no errors

---

## 🛡️ Security Testing

### Test: SQL Injection Prevention
```bash
# Try to inject malicious SQL
curl -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me all users; DROP TABLE customers;--",
    "conversationId": "security-001"
  }'
```

**Expected:** Validation should catch this and either:
- Refuse to generate dangerous query
- Generate safe SELECT-only query

### Test: Only SELECT Allowed
```bash
curl -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Delete all customers",
    "conversationId": "security-002"
  }'
```

**Expected:** Error or converted to SELECT query

---

## 📊 Monitoring Tests

### Test: View Workflow Logs
1. Go to Cloudflare Dashboard
2. Workers & Pages → sql-query-builder
3. Click "Workflows" tab
4. See all workflow executions
5. Click one to see steps

**Verify:**
- ✅ All steps logged
- ✅ Timing for each step
- ✅ Input/output for each step
- ✅ Error logs if any

### Test: View Durable Object State
1. Dashboard → Workers & Pages → sql-query-builder
2. Click "Durable Objects" tab
3. Find your conversation ID
4. View stored messages

---

## 🐛 Error Handling Tests

### Test: Invalid Schema
```bash
curl -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me all users from the users table",
    "conversationId": "error-001",
    "schema": "INVALID SCHEMA"
  }'
```

**Expected:** Should handle gracefully, possibly generate error message

### Test: Empty Message
```bash
curl -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "message": "",
    "conversationId": "error-002"
  }'
```

**Expected:** Error response

### Test: Missing Conversation ID
```bash
curl -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me all orders"
  }'
```

**Expected:** Should handle with default or error

---

## ✅ Success Criteria

Your SQL Query Builder is working correctly if:

**Workers AI:**
- ✅ Generates valid SQL from natural language
- ✅ Provides clear explanations
- ✅ Suggests meaningful optimizations

**Workflows:**
- ✅ All 5 steps execute in order
- ✅ Retries on validation failures
- ✅ Completes within 5 seconds

**Durable Objects:**
- ✅ Stores conversation history
- ✅ Enables contextual follow-ups
- ✅ Persists across requests
- ✅ Can be cleared

**Pages:**
- ✅ Loads without errors
- ✅ Sends queries successfully
- ✅ Displays results beautifully
- ✅ Shows schema
- ✅ Example queries work

---

## 📈 Test Report Template

```markdown
## Test Results - [Date]

### Workers AI
- [ ] Basic query generation
- [ ] Complex joins
- [ ] Aggregations
- [ ] Explanations clear

### Workflows  
- [ ] All steps execute
- [ ] Validation works
- [ ] Retry logic functions
- [ ] Optimizations generated

### Durable Objects
- [ ] Messages stored
- [ ] History retrieved
- [ ] Context maintained
- [ ] Clear works

### Pages
- [ ] UI loads
- [ ] Queries send
- [ ] Results display
- [ ] Examples work

### Integration
- [ ] End-to-end flow
- [ ] Multiple queries
- [ ] Context preserved
- [ ] No errors

### Performance
- Response time: [X] seconds
- Concurrent requests: [X] successful

### Security
- [ ] SQL injection blocked
- [ ] Only SELECT allowed
- [ ] Input validated

### Issues Found
1. [Issue description]
2. [Issue description]

### Overall Status: ✅ PASS / ❌ FAIL
```

---

## 🚀 Advanced Testing

### Load Testing Script
```bash
#!/bin/bash
# Run 100 queries and measure success rate

SUCCESS=0
FAIL=0

for i in {1..100}; do
  RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:8787/api/query \
    -H "Content-Type: application/json" \
    -d "{
      \"message\": \"Show me customers\",
      \"conversationId\": \"load-test-$i\"
    }")
  
  if [[ "$RESPONSE" == *"200"* ]]; then
    ((SUCCESS++))
  else
    ((FAIL++))
  fi
done

echo "Success: $SUCCESS"
echo "Failed: $FAIL"
echo "Success Rate: $((SUCCESS * 100 / (SUCCESS + FAIL)))%"
```

---

**Happy Testing! 🎉**
