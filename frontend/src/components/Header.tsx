import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

export default function Header() {
  return (
    <Card className="p-6 rounded-none border-x-0 border-t-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            SQL Query Builder
          </h1>
          <p className="text-sm text-gray-600">
            Powered by Cloudflare AI Stack
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="default">
            Workers AI
          </Badge>
          <Badge variant="secondary">
            Workflows
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Durable Objects
          </Badge>
        </div>
      </div>
    </Card>
  );
}
