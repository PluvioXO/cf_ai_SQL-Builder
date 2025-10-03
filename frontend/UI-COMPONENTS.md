# UI Components Reference

This project uses **shadcn/ui-style components** - a copy-paste component library pattern. All components are located in `frontend/src/components/ui/`.

## Installation

All required dependencies are already installed:
```json
{
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.2.0",
  "class-variance-authority": "^0.7.0"
}
```

## Utility Function

### `cn()` - Merge classNames
Location: `frontend/src/lib/utils.ts`

Combines `clsx` and `tailwind-merge` for optimal className handling:
```tsx
import { cn } from '../lib/utils';

<div className={cn('base-class', isActive && 'active-class', className)} />
```

## Components

### 1. Card

**Location**: `frontend/src/components/ui/Card.tsx`

A versatile container component with optional header, title, description, content, and footer.

#### Import
```tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from './ui/Card';
```

#### Basic Usage
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Examples
```tsx
// Simple card
<Card className="p-4">
  <p>Content</p>
</Card>

// Card with header
<Card>
  <CardHeader>
    <CardTitle>Database Schema</CardTitle>
  </CardHeader>
  <CardContent>
    <pre>{schemaCode}</pre>
  </CardContent>
</Card>

// Full featured card
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Database className="w-5 h-5" />
      Tables
    </CardTitle>
    <CardDescription>
      Available database tables
    </CardDescription>
  </CardHeader>
  <CardContent>
    <TableList />
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

### 2. Button

**Location**: `frontend/src/components/ui/Button.tsx`

Button component with multiple variants and sizes.

#### Import
```tsx
import { Button } from './ui/Button';
```

#### Props
```tsx
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  onClick?: () => void;
  // ... all HTML button attributes
}
```

#### Variants
```tsx
// Default - gradient primary button
<Button variant="default">Save Changes</Button>

// Outline - white with border
<Button variant="outline">Cancel</Button>

// Ghost - transparent background
<Button variant="ghost">Learn More</Button>

// Destructive - red for dangerous actions
<Button variant="destructive">Delete Account</Button>

// Secondary - muted background
<Button variant="secondary">Secondary</Button>

// Link - styled as link
<Button variant="link">Go to docs</Button>
```

#### Sizes
```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><X className="w-4 h-4" /></Button>
```

#### With Icons
```tsx
import { Send, Trash2 } from 'lucide-react';

<Button className="gap-2">
  <Send className="w-4 h-4" />
  Send Message
</Button>

<Button variant="destructive" className="gap-2">
  <Trash2 className="w-4 h-4" />
  Delete
</Button>
```

### 3. Input

**Location**: `frontend/src/components/ui/Input.tsx`

Styled text input with focus states.

#### Import
```tsx
import { Input } from './ui/Input';
```

#### Usage
```tsx
<Input 
  type="text"
  placeholder="Enter your query..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
  disabled={isLoading}
/>

// With label
<div>
  <label className="text-sm font-medium">Email</label>
  <Input type="email" placeholder="you@example.com" />
</div>

// Search input
<div className="relative">
  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
  <Input 
    type="search" 
    placeholder="Search..." 
    className="pl-10"
  />
</div>
```

### 4. Badge

**Location**: `frontend/src/components/ui/Badge.tsx`

Small pill-shaped labels for tags and status indicators.

#### Import
```tsx
import { Badge } from './ui/Badge';
```

#### Props
```tsx
interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}
```

#### Variants
```tsx
<Badge variant="default">Workers AI</Badge>
<Badge variant="secondary">Workflows</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Draft</Badge>
```

#### Examples
```tsx
// Status badges
<Badge>Active</Badge>
<Badge variant="destructive">Failed</Badge>
<Badge variant="secondary">Pending</Badge>

// With icons
<Badge className="gap-1">
  <Sparkles className="w-3 h-3" />
  AI Powered
</Badge>

// Custom colors
<Badge className="bg-blue-50 text-blue-700 border-blue-200">
  Custom
</Badge>
```

### 5. ScrollArea

**Location**: `frontend/src/components/ui/ScrollArea.tsx`

Custom scrollable container with consistent styling.

#### Import
```tsx
import { ScrollArea } from './ui/ScrollArea';
```

#### Usage
```tsx
<ScrollArea className="h-96">
  <div className="space-y-4">
    {items.map(item => (
      <Card key={item.id}>{item.content}</Card>
    ))}
  </div>
</ScrollArea>

// With max height
<ScrollArea className="max-h-[500px]">
  <pre>{longCode}</pre>
</ScrollArea>
```

### 6. CodeBlock

**Location**: `frontend/src/components/ui/CodeBlock.tsx`

Syntax-highlighted code display using Prism.

#### Import
```tsx
import CodeBlock from './ui/CodeBlock';
```

#### Props
```tsx
interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
}
```

#### Usage
```tsx
<CodeBlock 
  code="SELECT * FROM users WHERE active = 1" 
  language="sql" 
/>

<CodeBlock 
  code={`function hello() {
  console.log("Hello!");
}`}
  language="javascript" 
/>

// Supported languages: sql, javascript, typescript, python, jsx, tsx, etc.
```

#### In Cards
```tsx
<Card className="bg-gray-900 border-gray-800">
  <CardHeader className="bg-gray-800">
    <CardTitle className="text-gray-300">SQL Query</CardTitle>
  </CardHeader>
  <CardContent className="p-0">
    <CodeBlock code={sqlQuery} language="sql" />
  </CardContent>
</Card>
```

## Composition Patterns

### Form Layout
```tsx
<Card>
  <CardHeader>
    <CardTitle>Settings</CardTitle>
    <CardDescription>Configure your preferences</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div>
      <label className="text-sm font-medium">Name</label>
      <Input placeholder="Enter name" />
    </div>
    <div>
      <label className="text-sm font-medium">Email</label>
      <Input type="email" placeholder="you@example.com" />
    </div>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Cancel</Button>
    <Button>Save Changes</Button>
  </CardFooter>
</Card>
```

### List with Actions
```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      <span>Queries</span>
      <Badge>{queries.length}</Badge>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <ScrollArea className="max-h-96">
      {queries.map(query => (
        <div key={query.id} className="flex items-center justify-between p-3 border-b">
          <span>{query.name}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost">Edit</Button>
            <Button size="sm" variant="destructive">Delete</Button>
          </div>
        </div>
      ))}
    </ScrollArea>
  </CardContent>
</Card>
```

### Chat Message
```tsx
<div className="flex gap-3">
  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
    <Bot className="w-5 h-5 text-white" />
  </div>
  <Card className="flex-1">
    <CardContent className="pt-6">
      <p className="mb-4">{message.content}</p>
      <CodeBlock code={message.sql} language="sql" />
    </CardContent>
  </Card>
</div>
```

## Styling Tips

### Using cn() utility
```tsx
// Conditional classes
<Button className={cn('w-full', isLoading && 'opacity-50')}>
  Submit
</Button>

// Merge with defaults
<Card className={cn('hover:shadow-lg transition-shadow', className)}>
  {children}
</Card>

// Override Tailwind classes
<Button className={cn('bg-blue-500', 'bg-red-500')}>
  {/* Will be red - tailwind-merge handles conflicts */}
</Button>
```

### Custom Variants with CVA
```tsx
import { cva } from 'class-variance-authority';

const alertVariants = cva(
  'rounded-lg p-4 border',
  {
    variants: {
      variant: {
        info: 'bg-blue-50 border-blue-200 text-blue-900',
        success: 'bg-green-50 border-green-200 text-green-900',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
        error: 'bg-red-50 border-red-200 text-red-900',
      }
    },
    defaultVariants: {
      variant: 'info'
    }
  }
);

function Alert({ variant, children }) {
  return <div className={alertVariants({ variant })}>{children}</div>;
}
```

## Best Practices

1. **Always use forwardRef** for components that need ref access
2. **Spread ...props** to allow custom attributes
3. **Use cn()** to merge classNames properly
4. **Provide TypeScript types** for all props
5. **Set displayName** for better debugging
6. **Support className override** for flexibility
7. **Use semantic HTML** (button, input, etc.)

## Customization

### Theme Colors
Edit `frontend/tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f5f3ff',
        500: '#667eea',
        600: '#764ba2',
        700: '#553c9a',
      }
    }
  }
}
```

### Component Defaults
Each component can be customized by modifying its base classes:
```tsx
// In Card.tsx
const Card = React.forwardRef<HTMLDivElement, ...>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border bg-card text-card-foreground shadow',
        className  // Your custom classes override these
      )}
      {...props}
    />
  )
);
```

## Adding New Components

To add a new component:

1. Create file in `frontend/src/components/ui/YourComponent.tsx`
2. Use React.forwardRef pattern
3. Add TypeScript types
4. Use cn() utility for className merging
5. Export component

Example template:
```tsx
import * as React from 'react';
import { cn } from '../../lib/utils';

export interface YourComponentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'other';
}

const YourComponent = React.forwardRef<HTMLDivElement, YourComponentProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'base-classes',
          variant === 'other' && 'variant-classes',
          className
        )}
        {...props}
      />
    );
  }
);
YourComponent.displayName = 'YourComponent';

export { YourComponent };
```

---

## Resources

- [shadcn/ui](https://ui.shadcn.com/) - Component pattern inspiration
- [reactbits.dev](https://reactbits.dev/) - React component patterns
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Lucide Icons](https://lucide.dev/) - Icon library
- [class-variance-authority](https://cva.style/docs) - CVA docs
- [tailwind-merge](https://github.com/dcastil/tailwind-merge) - TW merge utility
