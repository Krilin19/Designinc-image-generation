import React, { useState, useRef, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { ApiKeyOverlay } from './components/ApiKeyOverlay';
import { ChatMessage } from './components/ChatMessage';
import { InputArea } from './components/InputArea';
import { SettingsSidebar } from './components/SettingsSidebar';
import { Message, GenerationConfig } from './types';
import { generateContentWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm NanoGraph Pro, powered by the Nano Banana Pro 2 (Gemini 3 Pro) model. I can generate high-quality 1K, 2K, and 4K images.\n\nDescribe what you want to see, or upload a reference image to get started.",
      timestamp: Date.now(),
      images: []
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Default Configuration
  const [config, setConfig] = useState<GenerationConfig>({
    aspectRatio: '1:1',
    imageSize: '1K',
    googleSearch: false,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string, image?: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      images: image ? [image] : [],
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await generateContentWithGemini({
        prompt: text,
        referenceImage: image,
        config: config
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || (response.images.length > 0 ? "Here is your generated image." : "I couldn't generate an image, but here is my response."),
        images: response.images,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `Error: ${error.message || 'Something went wrong while generating the image.'}. \n\nIf you see a "404" or "Entity not found", please try re-selecting your API key using the refresh button (page reload).`,
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden text-gray-100 font-sans">
      
      {/* API Key Gate */}
      <ApiKeyOverlay onKeySelected={() => setIsApiKeyValid(true)} />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col h-full transition-opacity duration-500 ${isApiKeyValid ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <header className="h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 z-10 sticky top-0">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/20">
                <span className="font-bold text-white text-sm">NP</span>
             </div>
             <h1 className="font-semibold text-lg tracking-tight">Designinc image generation <span className="text-gray-500 font-normal">Pro</span></h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-400 hover:text-white lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                 <div className="flex flex-row gap-4 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-purple-600/50 flex-shrink-0" />
                    <div className="flex flex-col gap-2">
                        <div className="h-4 w-24 bg-gray-800 rounded"></div>
                        <div className="h-32 w-48 bg-gray-800 rounded-xl border border-gray-700"></div>
                    </div>
                 </div>
              </div>
            )}
            <div ref={chatEndRef} className="h-4" />
          </div>
        </main>

        {/* Input Area */}
        <InputArea onSend={handleSendMessage} isLoading={isLoading} />
      </div>

      {/* Settings Sidebar */}
      <SettingsSidebar 
        config={config} 
        setConfig={setConfig} 
        isOpen={isSidebarOpen} 
        toggle={() => setIsSidebarOpen(false)}
      />

    </div>
  );
};

export default App;