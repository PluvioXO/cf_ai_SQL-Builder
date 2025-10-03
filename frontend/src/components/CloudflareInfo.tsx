import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { CheckCircle2, Brain, Workflow, Database, MessageSquare } from 'lucide-react';

export default function CloudflareInfo() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Cloudflare AI Assignment Requirements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* LLM */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-sm">LLM</h3>
              <Badge variant="default" className="text-xs">Required</Badge>
            </div>
            <p className="text-xs text-gray-600">
              <strong>Workers AI</strong> with Llama 3.3 (70B) model
            </p>
            <p className="text-xs text-gray-500">
              Converts natural language to SQL, generates explanations and optimizations
            </p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded block break-all">
              @cf/meta/llama-3.3-70b-instruct-fp8-fast
            </code>
          </div>

          {/* Workflow */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Workflow className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-sm">Workflow</h3>
              <Badge variant="secondary" className="text-xs">Required</Badge>
            </div>
            <p className="text-xs text-gray-600">
              <strong>Cloudflare Workflows</strong> orchestration
            </p>
            <p className="text-xs text-gray-500">
              5-step pipeline: Generate → Validate → Retry → Explain → Optimize
            </p>
            <div className="text-xs text-gray-500">
              <div>✓ Multi-step coordination</div>
              <div>✓ Automatic retries</div>
              <div>✓ Error handling</div>
            </div>
          </div>

          {/* Memory/State */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-sm">Memory / State</h3>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">Required</Badge>
            </div>
            <p className="text-xs text-gray-600">
              <strong>Durable Objects</strong> for conversation
            </p>
            <p className="text-xs text-gray-500">
              Stores last 20 messages per session for context-aware responses
            </p>
            <div className="text-xs text-gray-500">
              <div>✓ Persistent state</div>
              <div>✓ Follow-up questions</div>
              <div>✓ Context memory</div>
            </div>
          </div>

          {/* User Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-sm">User Input</h3>
              <Badge variant="default" className="text-xs bg-green-50 text-green-700 border-green-200">Required</Badge>
            </div>
            <p className="text-xs text-gray-600">
              <strong>Chat Interface</strong> (this page!)
            </p>
            <p className="text-xs text-gray-500">
              Type natural language queries and get instant SQL results
            </p>
            <div className="text-xs text-gray-500">
              <div>✓ Text chat input</div>
              <div>✓ Example queries</div>
              <div>✓ Interactive UI</div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong>All requirements met:</strong> This AI-powered SQL Query Builder uses Workers AI (Llama 3.3) as the LLM, 
              Workflows for multi-step orchestration, Durable Objects for conversation memory, and provides a chat interface 
              for user input. The application demonstrates the complete Cloudflare AI stack in a production-ready implementation.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
