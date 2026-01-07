import React, { useState, useRef } from 'react';
import { Send, ImagePlus, X, Loader2 } from 'lucide-react';

interface InputAreaProps {
  onSend: (text: string, image: string | undefined) => void;
  isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!text.trim() && !selectedImage) || isLoading) return;
    
    onSend(text, selectedImage);
    setText('');
    setSelectedImage(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-800 bg-gray-900 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Image Preview */}
        {selectedImage && (
          <div className="mb-3 relative inline-block">
            <div className="relative rounded-xl overflow-hidden border border-gray-700 w-24 h-24 group">
              <img src={selectedImage} alt="Reference" className="w-full h-full object-cover" />
              <button 
                onClick={() => {
                  setSelectedImage(undefined);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <span className="text-xs text-gray-500 mt-1 block">Reference Image</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-3 bg-gray-800 p-2 rounded-2xl border border-gray-700 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-lg">
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-xl transition-colors"
            title="Upload reference image"
            disabled={isLoading}
          >
            <ImagePlus className="w-5 h-5" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "Generating..." : "Describe the image you want to generate..."}
            className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 border-none focus:ring-0 resize-none py-3 max-h-32 min-h-[44px]"
            rows={1}
            disabled={isLoading}
            style={{ minHeight: '44px' }}
          />

          <button
            type="submit"
            disabled={(!text.trim() && !selectedImage) || isLoading}
            className={`
              p-3 rounded-xl flex items-center justify-center transition-all
              ${(!text.trim() && !selectedImage) || isLoading
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'}
            `}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
        
        <p className="text-center text-xs text-gray-600 mt-3">
            Nano Banana Pro 2 can generate high-fidelity images from text and optional reference images.
        </p>
      </div>
    </div>
  );
};