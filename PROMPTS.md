# AI Prompts Used in SQL Query Builder

This document contains all AI prompts used in the SQL Query Builder application, as required for the Cloudflare AI assignment.

## Overview

This application uses **Workers AI with Llama 3.3 (70B)** model to convert natural language queries into SQL. The prompts are used across a 5-step workflow pipeline.

---

## 1. SQL Generation Prompt

**Location**: `src/workflows/sql-generation.ts` - Step 1 (generate-sql)

**Purpose**: Convert user's natural language query into SQL

**Prompt Template**:
```typescript
const systemPrompt = `You are an expert SQL query generator. Given a database schema and a natural language request, generate a valid SQL query.

Database Schema:
${schema}

Rules:
1. Generate valid SQL syntax
2. Use appropriate JOINs when querying multiple tables
3. Add helpful comments explaining complex parts
4. Optimize for performance
5. NEVER use DROP, DELETE, TRUNCATE, or other destructive operations
6. Always include LIMIT clauses for large result sets

Conversation History:
${conversationHistory}

User Request: ${message}

Return ONLY the SQL query without any explanation or markdown formatting.`;
```

**Variables**:
- `schema`: Database schema (e.g., CREATE TABLE statements)
- `conversationHistory`: Previous messages for context
- `message`: User's natural language query

**Example Input**:
```
User Request: Show me the top 5 customers by total purchases
```

**Example Output**:
```sql
SELECT 
  c.customer_id,
  c.first_name,
  c.last_name,
  c.email,
  SUM(o.total) as total_purchases
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name, c.email
ORDER BY total_purchases DESC
LIMIT 5;
```

---

## 2. SQL Explanation Prompt

**Location**: `src/workflows/sql-generation.ts` - Step 4 (generate-explanation)

**Purpose**: Generate a plain English explanation of what the SQL query does

**Prompt Template**:
```typescript
const explanationPrompt = `Explain the following SQL query in simple, plain English. 
Describe what data it retrieves and how it works.

SQL Query:
${sqlQuery}

Database Schema:
${schema}

Provide a concise 2-3 sentence explanation that a non-technical person would understand.
Do not use technical jargon. Focus on what the query returns and why.`;
```

**Variables**:
- `sqlQuery`: The generated SQL query
- `schema`: Database schema for context

**Example Input**:
```sql
SELECT c.customer_id, c.email, COUNT(o.order_id) as order_count
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.email
HAVING COUNT(o.order_id) > 5
```

**Example Output**:
```
This query finds customers who have placed more than 5 orders. It counts the number of orders for each customer and only shows customers whose order count exceeds 5. The result includes the customer's ID, email address, and their total number of orders.
```

---

## 3. SQL Optimization Prompt

**Location**: `src/workflows/sql-generation.ts` - Step 5 (suggest-optimizations)

**Purpose**: Suggest performance improvements for the SQL query

**Prompt Template**:
```typescript
const optimizationPrompt = `Analyze the following SQL query and suggest performance optimizations.

SQL Query:
${sqlQuery}

Database Schema:
${schema}

Suggest 2-4 specific optimizations such as:
- Index recommendations
- Query restructuring
- Avoiding unnecessary operations
- Using appropriate JOINs

Return ONLY a JSON array of optimization suggestions as strings.
Example: ["Add index on customers.email for faster lookups", "Use INNER JOIN instead of WHERE clause"]

Return the array without any markdown formatting or explanation.`;
```

**Variables**:
- `sqlQuery`: The generated SQL query
- `schema`: Database schema for context

**Example Input**:
```sql
SELECT * FROM orders 
WHERE order_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
AND total > 100
```

**Example Output**:
```json
[
  "Add a composite index on (order_date, total) for faster filtering",
  "Avoid SELECT * and specify only needed columns to reduce data transfer",
  "Consider partitioning the orders table by date for better performance on date-range queries"
]
```

---

## 4. Retry Generation Prompt (Error Recovery)

**Location**: `src/workflows/sql-generation.ts` - Step 3 (retry-generation)

**Purpose**: Regenerate SQL when validation fails, with error context

**Prompt Template**:
```typescript
const retryPrompt = `You are an expert SQL query generator. Your previous attempt had validation errors.

Previous Query:
${previousQuery}

Validation Errors:
${validationErrors}

Database Schema:
${schema}

Original User Request: ${message}

Please generate a corrected SQL query that:
1. Fixes the validation errors
2. Follows all SQL syntax rules
3. Avoids destructive operations (DROP, DELETE, TRUNCATE)
4. Has balanced parentheses
5. Uses valid SQL keywords

Return ONLY the corrected SQL query without explanation.`;
```

**Variables**:
- `previousQuery`: The SQL that failed validation
- `validationErrors`: Specific errors found (e.g., "Unbalanced parentheses")
- `schema`: Database schema
- `message`: Original user request

**Example Input**:
```
Previous Query: SELECT * FROM orders WHERE (total > 100
Validation Errors: Unbalanced parentheses detected
```

**Example Output**:
```sql
SELECT * FROM orders WHERE (total > 100);
```

---

## Prompt Engineering Techniques Used

### 1. **Clear Role Definition**
- "You are an expert SQL query generator"
- Establishes the AI's expertise and expected behavior

### 2. **Explicit Rules and Constraints**
- Numbered lists of requirements
- Security rules (no DROP/DELETE/TRUNCATE)
- Format requirements (no markdown, JSON only, etc.)

### 3. **Context Provision**
- Database schema included in every prompt
- Conversation history for context-aware responses
- Previous errors for retry attempts

### 4. **Output Format Specification**
- "Return ONLY the SQL query"
- "Return ONLY a JSON array"
- "Without any markdown formatting"
- Prevents AI from adding unwanted explanations

### 5. **Example-Driven Instructions**
- Shows expected output format
- Demonstrates the type of optimizations wanted
- Clarifies ambiguous requirements

### 6. **Progressive Enhancement**
- Step 1: Generate SQL
- Step 2: Validate (non-AI)
- Step 3: Retry with error context (if needed)
- Step 4: Explain in simple terms
- Step 5: Optimize for performance

### 7. **Safety First**
- Explicitly forbids destructive operations
- Validation before acceptance
- Retry mechanism for errors

---

## Model Configuration

**Model**: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`

**Workers AI Call Example**:
```typescript
const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message }
  ],
  temperature: 0.2,  // Low temperature for consistent, deterministic output
  max_tokens: 500    // Sufficient for SQL queries
});
```

**Temperature**: 0.2 (low) - Ensures consistent, predictable SQL generation rather than creative variations

**Max Tokens**: 500 - Adequate for most SQL queries while preventing excessive token usage

---

## Conversation Context

The application maintains conversation history using **Durable Objects**, allowing the AI to:

1. **Remember previous queries**: "Make that query faster" refers to the last query
2. **Maintain context**: "Add a filter for high-value customers" builds on previous context
3. **Refine iteratively**: Users can ask for modifications without repeating the full request

**Context Format**:
```typescript
conversationHistory = messages.map(m => 
  `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
).join('\n');
```

---

## Security Considerations

### SQL Injection Prevention

**Validation Function** (`src/workflows/sql-generation.ts`):
```typescript
function validateSqlSyntax(sql: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Block destructive operations
  const dangerousPatterns = [
    /\bDROP\b/i,
    /\bDELETE\b/i,
    /\bTRUNCATE\b/i,
    /\bALTER\b/i,
    /\bUPDATE\b.*SET/i
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(sql)) {
      errors.push(`Dangerous operation detected: ${pattern.source}`);
    }
  }
  
  // Check balanced parentheses
  const openParens = (sql.match(/\(/g) || []).length;
  const closeParens = (sql.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push('Unbalanced parentheses detected');
  }
  
  return { valid: errors.length === 0, errors };
}
```

### Why This Matters

1. **AI models can be manipulated**: Users might try to trick the AI into generating malicious SQL
2. **Defense in depth**: Prompts instruct the AI to be safe, but code validates the output
3. **No execution**: This app generates SQL but doesn't execute it, limiting risk

---

## Workflow Integration

All prompts are orchestrated through **Cloudflare Workflows**:

```typescript
export class SqlGenerationWorkflow extends WorkflowEntrypoint<Env, Params, Response> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    // Step 1: Generate SQL
    const sqlQuery = await step.do('generate-sql', async () => {
      const response = await this.env.AI.run(MODEL, {
        messages: [{ role: 'system', content: sqlPrompt }]
      });
      return response.response;
    });

    // Step 2: Validate
    const validation = await step.do('validate-sql', async () => {
      return validateSqlSyntax(sqlQuery);
    });

    // Step 3: Retry if needed (with error context prompt)
    // Step 4: Generate explanation (with explanation prompt)
    // Step 5: Suggest optimizations (with optimization prompt)
  }
}
```

---

## Prompt Evolution and Iteration

### Initial Approach (What Didn't Work)
```typescript
// Too vague - resulted in inconsistent output
"Convert this to SQL: ${message}"
```

### Current Approach (What Works)
```typescript
// Specific, with rules and context
`You are an expert SQL query generator. Given a database schema and a natural language request, generate a valid SQL query.

Database Schema:
${schema}

Rules:
1. Generate valid SQL syntax
2. Use appropriate JOINs...
[etc.]`
```

**Key Improvements**:
- Added explicit role ("expert SQL query generator")
- Included database schema for context
- Listed specific rules and constraints
- Specified output format explicitly
- Added security constraints

---

## Testing Prompts

You can test the prompts by running the application and trying these queries:

1. **Simple query**: "Show me all customers"
2. **Complex query**: "Which customers have made more than 5 orders?"
3. **Ambiguous query**: "Show me the expensive ones" (tests context memory)
4. **Edge case**: "Delete all customers" (tests security validation)

---

## Resources

- [Cloudflare Workers AI Docs](https://developers.cloudflare.com/workers-ai/)
- [Llama 3.3 Model Card](https://developers.cloudflare.com/workers-ai/models/llama-3.3-70b-instruct-fp8-fast/)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

---

**Note**: All prompts are designed to be deterministic, secure, and production-ready. The combination of clear prompts, validation, and workflow orchestration ensures reliable SQL generation.
