# SQL Query Builder - React Frontend

Modern React frontend with Tailwind CSS and components inspired by reactbits.dev design patterns.

## 🎨 Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Lightning-fast build tool
- **Lucide React** - Beautiful icons
- **Prism React Renderer** - Syntax highlighting

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Card.tsx          # Reusable card component
│   │   │   └── CodeBlock.tsx      # SQL syntax highlighting
│   │   ├── ChatInterface.tsx      # Main chat component
│   │   ├── Header.tsx             # App header
│   │   ├── Message.tsx            # Chat message bubble
│   │   ├── Sidebar.tsx            # Schema & examples sidebar
│   │   └── SqlResult.tsx          # SQL result display
│   ├── api/
│   │   └── index.ts               # API client
│   ├── types/
│   │   └── index.ts               # TypeScript types
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # App entry point
│   └── index.css                  # Global styles + Tailwind
├── index.html                     # HTML template
├── vite.config.ts                 # Vite configuration
├── tailwind.config.js             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies
```

## 🚀 Development

### Start Frontend Dev Server
```bash
cd frontend
npm run dev
```

The dev server will start on `http://localhost:5173` with hot module replacement.

### Build for Production
```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

## 🎨 Design System

### Colors
- **Primary**: Purple gradient (`from-primary-500 to-purple-600`)
- **Text**: Gray scale for hierarchy
- **Accents**: Blue (info), Yellow (warnings), Red (errors)

### Components

#### Card
```tsx
import Card from './components/ui/Card';

<Card className="custom-class">
  {children}
</Card>
```

#### CodeBlock
```tsx
import CodeBlock from './components/ui/CodeBlock';

<CodeBlock code={sqlQuery} language="sql" />
```

### Utility Classes

```css
.btn-primary    /* Primary gradient button */
.btn-secondary  /* Secondary outline button */
.input-field    /* Text input with focus states */
.card           /* Rounded white card with shadow */
```

## 🔌 API Integration

The frontend connects to the Cloudflare Worker API:

### Development
Uses Vite proxy to forward `/api/*` requests to `http://localhost:8787`

### Production
Update `API_BASE` in `src/api/index.ts`:
```typescript
const API_BASE = 'https://your-worker.workers.dev';
```

## 📱 Features

### Chat Interface
- Real-time message streaming
- Typing indicators
- Error handling
- Auto-scroll to latest message

### SQL Display
- Syntax highlighting with Prism
- Dark theme for code blocks
- Copy-to-clipboard (ready to implement)

### Sidebar
- Database schema viewer
- Example query buttons
- Responsive collapse on mobile

### Results Display
- Structured SQL output
- Plain English explanations
- Optimization suggestions
- Confidence scores

## 🎯 Responsive Design

- **Desktop**: Full sidebar + chat
- **Tablet**: Collapsible sidebar
- **Mobile**: Stack layout

Breakpoints handled by Tailwind:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 🔧 Configuration

### Tailwind Config
Custom theme extends in `tailwind.config.js`:
- Primary color palette
- Custom animations
- Additional utilities

### Vite Config
API proxy for local development in `vite.config.ts`

### TypeScript
Strict mode enabled with full type checking

## 🚀 Deployment

### Deploy to Cloudflare Pages

```bash
# From project root
npm run frontend:build
npm run pages:deploy
```

Or connect your Git repo in Cloudflare Dashboard:
1. Workers & Pages → Create application
2. Connect to Git → Select repo
3. Build command: `cd frontend && npm run build`
4. Build output: `frontend/dist`
5. Deploy!

### Environment Variables

Create `.env` in frontend directory:
```env
VITE_API_URL=https://your-worker.workers.dev
```

Access in code:
```typescript
const API_URL = import.meta.env.VITE_API_URL;
```

## 🎨 Customization

### Change Theme Colors

Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-color',
        600: '#your-darker-color',
      },
    },
  },
}
```

### Add New Components

Follow the pattern in `src/components/ui/`:
1. Create component file
2. Export default
3. Use Tailwind for styling
4. Add TypeScript interfaces

### Modify Layout

Edit `src/App.tsx` for overall layout changes.

## 📦 Dependencies

### Production
- `react` - UI library
- `react-dom` - React renderer
- `lucide-react` - Icon set
- `clsx` - Conditional classes
- `prism-react-renderer` - Syntax highlighting

### Development
- `vite` - Build tool
- `typescript` - Type checking
- `tailwindcss` - CSS framework
- `@vitejs/plugin-react` - React support

## 🐛 Troubleshooting

### Port Already in Use
Change port in `package.json`:
```json
"dev": "vite --port 3000"
```

### Tailwind Not Working
1. Ensure `tailwind.config.js` has correct content paths
2. Check `@tailwind` directives in `index.css`
3. Restart dev server

### API Connection Errors
1. Check Worker is running: `npm run dev` (from root)
2. Verify proxy config in `vite.config.ts`
3. Check console for CORS errors

## 🎓 Learning Resources

- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [ReactBits.dev](https://reactbits.dev) - Component patterns

## ✨ Future Enhancements

- [ ] Dark mode toggle
- [ ] Export SQL to file
- [ ] Query history panel
- [ ] Collaborative editing
- [ ] Voice input
- [ ] Mobile app wrapper

---

**Built with modern React patterns and Tailwind CSS**
