import React from 'react';
import { User, Bot, Download, AlertCircle } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  const downloadImage = (dataUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `generated-${message.id}-${index}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
      <div className={`
        flex max-w-[85%] lg:max-w-[70%] gap-4 
        ${isUser ? 'flex-row-reverse' : 'flex-row'}
      `}>
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser ? 'bg-blue-600' : message.isError ? 'bg-red-600' : 'bg-purple-600'}
          shadow-lg
        `}>
          {isUser ? <User className="w-5 h-5 text-white" /> : message.isError ? <AlertCircle className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
        </div>

        {/* Content Bubble */}
        <div className={`
          flex flex-col gap-3 p-4 rounded-2xl
          ${isUser 
            ? 'bg-blue-600/10 border border-blue-500/20 text-blue-100 rounded-tr-none' 
            : message.isError
                ? 'bg-red-900/20 border border-red-800 text-red-200 rounded-tl-none'
                : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-none'
          }
        `}>
          
          {/* Text Content */}
          {message.text && (
            <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
              {message.text}
            </p>
          )}

          {/* Image Grid */}
          {message.images && message.images.length > 0 && (
            <div className={`grid gap-3 ${message.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {message.images.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-700/50 bg-black/40">
                  <img 
                    src={img} 
                    alt={`Generated content ${idx + 1}`} 
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-2">
                    <button 
                      onClick={() => downloadImage(img, idx)}
                      className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white transition-colors"
                      title="Download Image"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <span className="text-[10px] opacity-40 self-end mt-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};