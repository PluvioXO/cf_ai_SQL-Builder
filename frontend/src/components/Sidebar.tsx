import { Database, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { ScrollArea } from './ui/ScrollArea';

const EXAMPLE_QUERIES = [
  "Show me all orders from last month over $100",
  "Which customers have made more than 5 orders?",
  "List the top 10 selling products by revenue",
  "Find customers who haven't ordered in 90 days",
  "What's the average order value per customer?",
];

const DEFAULT_SCHEMA = `-- E-commerce Database Schema

CREATE TABLE customers (
  customer_id INT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  product_id INT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  stock_quantity INT DEFAULT 0,
  category VARCHAR(100)
);

CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  customer_id INT REFERENCES customers(customer_id),
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pending'
);

CREATE TABLE order_items (
  order_item_id INT PRIMARY KEY,
  order_id INT REFERENCES orders(order_id),
  product_id INT REFERENCES products(product_id),
  quantity INT,
  price DECIMAL(10, 2)
);`;

interface SidebarProps {
  onExampleClick?: (query: string) => void;
}

export default function Sidebar({ onExampleClick }: SidebarProps) {
  return (
    <aside className="w-80 flex-shrink-0 space-y-4 overflow-y-auto p-4">
      {/* Schema Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Schema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-96">
            <pre className="text-xs text-gray-700 font-mono bg-gray-50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-words">
              {DEFAULT_SCHEMA}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Example Queries Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Example Queries
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {EXAMPLE_QUERIES.map((query, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => onExampleClick?.(query)}
              className="w-full justify-start h-auto p-3 text-left hover:bg-primary-50 hover:text-primary-700 whitespace-normal"
            >
              <span className="text-sm break-words">{query}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}
