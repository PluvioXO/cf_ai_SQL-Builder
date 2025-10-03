import { Code2, Info, Zap } from 'lucide-react';
import { SqlResult as SqlResultType } from '../types';
import CodeBlock from './ui/CodeBlock';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface SqlResultProps {
  result: SqlResultType;
}

/**
 * Simple markdown formatter for basic markdown features
 */
function formatMarkdown(text: string): string {
  let html = text;
  
  // Bold: **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Italic: *text* or _text_
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // Code: `code`
  html = html.replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-blue-100 text-blue-900 rounded text-xs font-mono">$1</code>');
  
  // Line breaks
  html = html.replace(/\n/g, '<br />');
  
  return html;
}

export default function SqlResult({ result }: SqlResultProps) {
  return (
    <div className="space-y-3 mt-3">
      {/* SQL Query */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 bg-gray-800 border-b border-gray-700">
          <Code2 className="w-4 h-4 text-gray-400" />
          <CardTitle className="text-xs text-gray-300">SQL Query</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CodeBlock code={result.query} language="sql" />
        </CardContent>
      </Card>

      {/* Explanation */}
      <Card className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-900">Explanation</span>
          </div>
          <div className="text-sm text-blue-800 leading-relaxed prose prose-sm prose-blue max-w-none">
            <div dangerouslySetInnerHTML={{ __html: formatMarkdown(result.explanation) }} />
          </div>
        </CardContent>
      </Card>

      {/* Optimizations */}
      {result.optimizations && result.optimizations.length > 0 && (
        <Card className="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-900">
                Optimization Suggestions
              </span>
            </div>
            <ul className="space-y-2">
              {result.optimizations.map((opt, index) => (
                <li key={index} className="text-sm text-yellow-800 flex gap-2">
                  <span className="text-yellow-600 font-bold">•</span>
                  <span>{opt}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
