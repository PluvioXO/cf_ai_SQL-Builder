import { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CloudflareInfo from './components/CloudflareInfo';

function App() {
  const [conversationId] = useState(() => 
    `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [selectedExample, setSelectedExample] = useState<string>('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6 pb-8">
        <Header />
        
        <div className="flex gap-6 mt-6">
          <Sidebar onExampleClick={setSelectedExample} />
          <div className="flex-1 flex flex-col gap-4">
            <ChatInterface 
              conversationId={conversationId}
              exampleQuery={selectedExample}
              onExampleUsed={() => setSelectedExample('')}
            />
            <CloudflareInfo />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
