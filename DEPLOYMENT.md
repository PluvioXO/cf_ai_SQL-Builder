# Deployment Checklist - SQL Query Builder

Use this checklist to ensure your SQL Query Builder is properly deployed to production.

---

## 📋 Pre-Deployment Checklist

### ✅ Local Testing
- [ ] `npm install` completed successfully
- [ ] `npm run dev` starts without errors
- [ ] Can access http://localhost:8787
- [ ] Chat interface loads properly
- [ ] Example queries work
- [ ] SQL generation functions correctly
- [ ] Explanations appear
- [ ] Optimizations are suggested
- [ ] Conversation history works
- [ ] Clear conversation button works

### ✅ Cloudflare Account Setup
- [ ] Logged in with `npx wrangler login`
- [ ] Account has Workers AI enabled
- [ ] Account has Workflows enabled (beta)
- [ ] Account has Durable Objects enabled
- [ ] Have sufficient credits/plan for AI usage

### ✅ Configuration
- [ ] KV namespace created
- [ ] KV namespace ID added to `wrangler.toml`
- [ ] Durable Object migration configured
- [ ] Workflow binding configured
- [ ] AI binding configured

---

## 🚀 Deployment Steps

### Step 1: Create KV Namespace

```bash
npx wrangler kv:namespace create SCHEMA_CACHE
```

**Expected Output:**
```
🌀 Creating namespace with title "sql-query-builder-SCHEMA_CACHE"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "SCHEMA_CACHE", id = "abc123..." }
```

**Action:** Copy the ID and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "SCHEMA_CACHE"
id = "YOUR_NAMESPACE_ID_HERE"  # ← Replace this!
```

- [ ] KV namespace created
- [ ] ID copied to `wrangler.toml`

---

### Step 2: Deploy Worker

```bash
npm run deploy
```

**Expected Output:**
```
Total Upload: XX.XX KiB / gzip: XX.XX KiB
Uploaded sql-query-builder (X.XX sec)
Published sql-query-builder (X.XX sec)
  https://sql-query-builder.YOUR-SUBDOMAIN.workers.dev
Current Deployment ID: xxxx-xxxx-xxxx
```

**Action:** Copy your Worker URL.

- [ ] Worker deployed successfully
- [ ] Worker URL saved
- [ ] Can access Worker URL in browser

---

### Step 3: Test Worker API

Test the deployed worker:

```bash
# Replace with YOUR worker URL
WORKER_URL="https://sql-query-builder.YOUR-SUBDOMAIN.workers.dev"

curl -X POST "$WORKER_URL/api/query" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me all customers",
    "conversationId": "test-prod-001"
  }'
```

**Expected:** JSON response with query, explanation, optimizations

- [ ] API responds successfully
- [ ] SQL query generated
- [ ] Explanation provided
- [ ] Optimizations suggested

---

### Step 4: Deploy Pages (Optional)

If you want to deploy the frontend separately:

```bash
npm run pages:deploy
```

Or, the worker already serves the HTML from `public/index.html` at the root path.

**Action:** Update `API_BASE` in `public/index.html` if deploying separately:

```javascript
const API_BASE = 'https://sql-query-builder.YOUR-SUBDOMAIN.workers.dev';
```

- [ ] Pages deployed (or using worker-served HTML)
- [ ] API_BASE updated if needed
- [ ] Frontend accessible

---

### Step 5: Test Frontend

1. Open your Worker URL in browser
2. Try example queries
3. Check conversation memory

**Tests:**
- [ ] UI loads correctly
- [ ] Schema displays
- [ ] Example queries clickable
- [ ] Can send custom queries
- [ ] Results display properly
- [ ] Follow-up questions work
- [ ] Clear conversation works

---

### Step 6: Configure Custom Domain (Optional)

Add a custom domain to your worker:

1. Go to Cloudflare Dashboard
2. Workers & Pages → sql-query-builder
3. Settings → Domains & Routes
4. Add custom domain

```
Example: sql-builder.yourdomain.com
```

- [ ] Custom domain added
- [ ] DNS configured
- [ ] SSL certificate active
- [ ] Domain accessible

---

## 🔍 Post-Deployment Verification

### ✅ Functionality Tests

Run these tests against production:

```bash
PROD_URL="https://your-worker-url.workers.dev"

# Test 1: Basic query
curl -X POST "$PROD_URL/api/query" \
  -H "Content-Type: application/json" \
  -d '{"message": "Show all orders", "conversationId": "verify-1"}'

# Test 2: Complex query
curl -X POST "$PROD_URL/api/query" \
  -H "Content-Type: application/json" \
  -d '{"message": "Top 10 customers by revenue", "conversationId": "verify-2"}'

# Test 3: Follow-up query
curl -X POST "$PROD_URL/api/query" \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me orders", "conversationId": "verify-3"}'

curl -X POST "$PROD_URL/api/query" \
  -H "Content-Type: application/json" \
  -d '{"message": "Only expensive ones", "conversationId": "verify-3"}'

# Test 4: Get history
curl "$PROD_URL/api/conversation?id=verify-3"

# Test 5: Clear conversation
curl -X POST "$PROD_URL/api/conversation/clear" \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "verify-3"}'
```

**Results:**
- [ ] Test 1: ✅ Basic query works
- [ ] Test 2: ✅ Complex query works
- [ ] Test 3: ✅ Follow-up works
- [ ] Test 4: ✅ History retrieved
- [ ] Test 5: ✅ Conversation cleared

---

### ✅ Performance Tests

```bash
# Measure response time
time curl -X POST "$PROD_URL/api/query" \
  -H "Content-Type: application/json" \
  -d '{"message": "Show customers", "conversationId": "perf-test"}'
```

**Expected:** < 5 seconds

- [ ] Response time acceptable
- [ ] No timeout errors
- [ ] Consistent performance

---

### ✅ Security Tests

```bash
# Test SQL injection prevention
curl -X POST "$PROD_URL/api/query" \
  -H "Content-Type: application/json" \
  -d '{"message": "SELECT * FROM users; DROP TABLE customers;--", "conversationId": "security-1"}'

# Test DELETE prevention
curl -X POST "$PROD_URL/api/query" \
  -H "Content-Type: application/json" \
  -d '{"message": "DELETE all records", "conversationId": "security-2"}'
```

**Expected:** Validation should prevent dangerous queries

- [ ] SQL injection blocked
- [ ] DELETE/DROP prevented
- [ ] Only SELECT queries allowed

---

## 📊 Monitoring Setup

### Set Up Alerts

1. Go to Cloudflare Dashboard
2. Workers & Pages → sql-query-builder
3. Set up alerts for:
   - Error rate > 5%
   - Response time > 5s
   - Request volume spikes

- [ ] Error alerts configured
- [ ] Performance alerts configured
- [ ] Usage alerts configured

### View Logs

Check logs in dashboard:
- Workers & Pages → sql-query-builder → Logs

**What to look for:**
- No error spikes
- Reasonable response times
- Workflow executions completing

- [ ] Logs accessible
- [ ] No critical errors
- [ ] Workflows executing properly

### Monitor Workflows

1. Workers & Pages → sql-query-builder → Workflows
2. Check recent executions
3. Verify all steps completing

- [ ] Workflows visible
- [ ] Steps completing
- [ ] No stuck workflows

### Monitor Durable Objects

1. Workers & Pages → sql-query-builder → Durable Objects
2. Check object count
3. Verify storage usage reasonable

- [ ] Durable Objects visible
- [ ] Storage usage normal
- [ ] No orphaned objects

---

## 💰 Cost Monitoring

### Estimated Costs (as of 2024)

**Workers AI:**
- ~1,000 tokens per query
- Free tier: 10,000 requests/day
- Paid: ~$0.01 per 1,000 tokens

**Workflows:**
- Free tier: 10,000 steps/month
- Paid: ~$0.30 per 1,000,000 steps

**Durable Objects:**
- Free tier: 1,000,000 requests/month
- Paid: ~$0.15 per million requests

**KV:**
- Free tier: 100,000 reads/day
- Paid: ~$0.50 per million reads

**Pages:**
- Free tier: 100,000 requests/month
- Paid: Free for most use cases

### Set Budget Alerts

1. Dashboard → Account → Billing
2. Set spending limit
3. Enable notifications

- [ ] Budget alerts set
- [ ] Spending limit configured
- [ ] Email notifications enabled

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: "KV namespace not found"
**Solution:** Make sure KV namespace ID in `wrangler.toml` matches created namespace

```bash
npx wrangler kv:namespace list
# Find your namespace ID and update wrangler.toml
```

#### Issue: "Workflow not found"
**Solution:** Ensure Workflows are enabled in your account (currently beta)

Contact Cloudflare support to enable Workflows beta access.

#### Issue: "Durable Object not found"
**Solution:** Deploy with migration

```bash
npx wrangler deploy
```

Check `wrangler.toml` has migration block:
```toml
[[migrations]]
tag = "v1"
new_classes = ["ConversationState"]
```

#### Issue: "AI model not available"
**Solution:** Check Workers AI is enabled

Dashboard → AI → Check available models

#### Issue: High latency
**Possible causes:**
- Cold starts (first request slower)
- Model loading time
- Complex queries

**Solutions:**
- Add warming requests
- Optimize prompts
- Cache common queries

---

## 📝 Production Checklist

Before announcing to users:

- [ ] All functionality tests passing
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Monitoring configured
- [ ] Alerts set up
- [ ] Budget limits configured
- [ ] Custom domain (if needed)
- [ ] README updated with prod URL
- [ ] Documentation complete
- [ ] Support contact available

---

## 🎉 Success!

Your SQL Query Builder is live! 

**Next Steps:**
1. Share with users
2. Collect feedback
3. Monitor usage
4. Iterate and improve

**Useful Links:**
- Worker Dashboard: https://dash.cloudflare.com/?to=/:account/workers
- Logs: https://dash.cloudflare.com/?to=/:account/workers/view/:worker/logs
- Analytics: https://dash.cloudflare.com/?to=/:account/workers/view/:worker/analytics

---

## 🔄 Update Checklist

When deploying updates:

1. Test locally first
```bash
npm run dev
```

2. Deploy to production
```bash
npm run deploy
```

3. Test production immediately
```bash
curl -X POST "$PROD_URL/api/query" ...
```

4. Monitor for errors
- Check logs for 10 minutes
- Verify no error spikes

5. Rollback if needed
```bash
npx wrangler rollback
```

---

**Deployment Complete! 🚀**

Need help? Check:
- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/
- Workers AI Docs: https://developers.cloudflare.com/workers-ai/
- Workflows Docs: https://developers.cloudflare.com/workflows/
- Durable Objects Docs: https://developers.cloudflare.com/durable-objects/
