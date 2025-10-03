/**
 * Workflow: SQL Generation Pipeline
 * Multi-step process:
 * 1. Parse user intent
 * 2. Generate SQL query using Workers AI
 * 3. Validate syntax
 * 4. Generate explanation
 * 5. Suggest optimizations
 */

import {
  WorkflowEntrypoint,
  WorkflowStep,
  WorkflowEvent,
} from 'cloudflare:workers';

interface SqlGenerationParams {
  message: string;
  history: Array<{ role: string; content: string }>;
  schema: string;
}

export interface SqlResult {
  query: string;
  explanation: string;
  optimizations: string[];
  confidence: number;
  error?: string;
}

interface Env {
  AI: Ai;
}

// Helper function to run the SQL generation logic directly (for development)
export async function generateSQL(
  params: SqlGenerationParams,
  env: Env
): Promise<SqlResult> {
  const { message, history, schema } = params;

  // Step 1: Generate SQL query using Workers AI
  console.log('[Workflow Step] generate-sql');
  const systemPrompt = `You are an expert SQL query generator. Given a database schema and user request, generate a valid SQL query.

Database Schema:
${schema}

Rules:
- Generate ONLY valid SQL syntax
- Use proper JOIN conditions
- Include appropriate WHERE clauses
- Consider performance (use indexes, avoid SELECT *)
- Return ONLY the SQL query, no explanations in this step

Previous conversation context:
${history.slice(-3).map(h => `${h.role}: ${h.content}`).join('\n')}`;

  const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
    max_tokens: 500,
  });

  let sqlQuery = (response as { response: string }).response.trim();
  
  // Clean up markdown formatting if present
  sqlQuery = cleanSqlResponse(sqlQuery);

  // Step 2: Validate SQL syntax
  console.log('[Workflow Step] validate-sql');
  const validation = validateSqlSyntax(sqlQuery);

  // If validation fails, retry with error feedback
  if (!validation.valid) {
    console.log('[Workflow Step] retry-generation');
    const retryResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        { 
          role: 'system', 
          content: 'Fix this SQL query. Previous attempt had errors.' 
        },
        { 
          role: 'user', 
          content: `Original request: ${message}\n\nFailed query: ${sqlQuery}\n\nError: ${validation.error}\n\nGenerate a corrected SQL query.` 
        },
      ],
      max_tokens: 500,
    });

    const retryQuery = (retryResponse as { response: string }).response.trim();
    
    // Validate retry
    console.log('[Workflow Step] validate-retry');
    const retryValidation = validateSqlSyntax(retryQuery);

    if (!retryValidation.valid) {
      return {
        query: sqlQuery,
        explanation: 'Failed to generate valid SQL',
        optimizations: [],
        confidence: 0,
        error: retryValidation.error,
      };
    }

    // Continue with corrected query
    return await generateExplanationAndOptimizations(
      retryQuery,
      message,
      schema,
      env
    );
  }

  // Step 3: Generate explanation and optimizations
  return await generateExplanationAndOptimizations(
    sqlQuery,
    message,
    schema,
    env
  );
}

async function generateExplanationAndOptimizations(
  query: string,
  userMessage: string,
  schema: string,
  env: Env
): Promise<SqlResult> {
  // Step 3: Generate explanation
  console.log('[Workflow Step] generate-explanation');
  const explanationResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [
      {
        role: 'system',
        content: 'Explain this SQL query in simple terms for someone learning SQL.',
      },
      {
        role: 'user',
        content: `User asked: "${userMessage}"\n\nGenerated query:\n${query}\n\nExplain what this query does and why it answers the user's question.`,
      },
    ],
    max_tokens: 300,
  });

  const explanation = (explanationResponse as { response: string }).response.trim();

  // Step 4: Generate optimizations
  console.log('[Workflow Step] suggest-optimizations');
  const optimizationResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [
      {
        role: 'system',
        content: 'You are a database performance expert. Suggest optimizations for SQL queries.',
      },
      {
        role: 'user',
        content: `Schema:\n${schema}\n\nQuery:\n${query}\n\nSuggest 2-3 specific optimizations (indexes, query rewrites, etc.). Be concise.`,
      },
    ],
    max_tokens: 200,
  });

  const text = (optimizationResponse as { response: string }).response.trim();
  // Parse into array of suggestions
  const optimizations = text.split('\n').filter(line => line.trim().length > 0);

  return {
    query,
    explanation,
    optimizations,
    confidence: 0.95,
  };
}

export class SqlGenerationWorkflow extends WorkflowEntrypoint<
  Env,
  SqlGenerationParams
> {
  async run(event: WorkflowEvent<SqlGenerationParams>, step: WorkflowStep) {
    const { message, history, schema } = event.payload;

    // Step 1: Generate SQL query using Workers AI
    const sqlQuery = await step.do('generate-sql', async () => {
      const systemPrompt = `You are an expert SQL query generator. Given a database schema and user request, generate a valid SQL query.

Database Schema:
${schema}

Rules:
- Generate ONLY valid SQL syntax
- Use proper JOIN conditions
- Include appropriate WHERE clauses
- Consider performance (use indexes, avoid SELECT *)
- Return ONLY the SQL query, no explanations in this step

Previous conversation context:
${history.slice(-3).map(h => `${h.role}: ${h.content}`).join('\n')}`;

      const response = await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 500,
      });

      return (response as { response: string }).response.trim();
    });

    // Step 2: Validate SQL syntax
    const validation = await step.do('validate-sql', async () => {
      return validateSqlSyntax(sqlQuery);
    });

    // If validation fails, retry with error feedback
    if (!validation.valid) {
      const retryQuery = await step.do('retry-generation', async () => {
        const response = await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
          messages: [
            { 
              role: 'system', 
              content: 'Fix this SQL query. Previous attempt had errors.' 
            },
            { 
              role: 'user', 
              content: `Original request: ${message}\n\nFailed query: ${sqlQuery}\n\nError: ${validation.error}\n\nGenerate a corrected SQL query.` 
            },
          ],
          max_tokens: 500,
        });

        return (response as { response: string }).response.trim();
      });

      // Validate retry
      const retryValidation = await step.do('validate-retry', async () => {
        return validateSqlSyntax(retryQuery);
      });

      if (!retryValidation.valid) {
        return {
          query: sqlQuery,
          explanation: 'Failed to generate valid SQL',
          optimizations: [],
          confidence: 0,
          error: retryValidation.error,
        };
      }

      // Continue with corrected query
      return await this.generateExplanationAndOptimizations(
        step,
        retryQuery,
        message,
        schema
      );
    }

    // Step 3: Generate explanation and optimizations
    return await this.generateExplanationAndOptimizations(
      step,
      sqlQuery,
      message,
      schema
    );
  }

  private async generateExplanationAndOptimizations(
    step: WorkflowStep,
    query: string,
    userMessage: string,
    schema: string
  ): Promise<SqlResult> {
    // Step 3: Generate explanation
    const explanation = await step.do('generate-explanation', async () => {
      const response = await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: [
          {
            role: 'system',
            content: 'Explain this SQL query in simple terms for someone learning SQL.',
          },
          {
            role: 'user',
            content: `User asked: "${userMessage}"\n\nGenerated query:\n${query}\n\nExplain what this query does and why it answers the user's question.`,
          },
        ],
        max_tokens: 300,
      });

      return (response as { response: string }).response.trim();
    });

    // Step 4: Generate optimizations
    const optimizations = await step.do('suggest-optimizations', async () => {
      const response = await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: [
          {
            role: 'system',
            content: 'You are a database performance expert. Suggest optimizations for SQL queries.',
          },
          {
            role: 'user',
            content: `Schema:\n${schema}\n\nQuery:\n${query}\n\nSuggest 2-3 specific optimizations (indexes, query rewrites, etc.). Be concise.`,
          },
        ],
        max_tokens: 200,
      });

      const text = (response as { response: string }).response.trim();
      // Parse into array of suggestions
      return text.split('\n').filter(line => line.trim().length > 0);
    });

    return {
      query,
      explanation,
      optimizations,
      confidence: 0.95,
    };
  }
}

// Basic SQL syntax validation
/**
 * Cleans markdown formatting from SQL response
 */
function cleanSqlResponse(sql: string): string {
  // Remove markdown code blocks (```sql, ```)
  let cleaned = sql.replace(/```sql\n?/gi, '');
  cleaned = cleaned.replace(/```\n?/g, '');
  return cleaned.trim();
}

/**
 * Validates SQL syntax with basic safety checks
 */
function validateSqlSyntax(sql: string): { valid: boolean; error?: string } {
  const trimmed = sql.trim().toUpperCase();

  // Check for SQL injection patterns
  const dangerousPatterns = [
    /;\s*DROP/i,
    /;\s*DELETE/i,
    /;\s*TRUNCATE/i,
    /--.*DROP/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(sql)) {
      return { valid: false, error: 'Potentially dangerous SQL detected' };
    }
  }

  // Must start with SELECT (for this demo)
  if (!trimmed.startsWith('SELECT')) {
    return { valid: false, error: 'Query must be a SELECT statement' };
  }

  // Basic syntax checks
  if (!trimmed.includes('FROM')) {
    return { valid: false, error: 'Missing FROM clause' };
  }

  // Check for balanced parentheses
  const openParens = (sql.match(/\(/g) || []).length;
  const closeParens = (sql.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    return { valid: false, error: 'Unbalanced parentheses' };
  }

  return { valid: true };
}
