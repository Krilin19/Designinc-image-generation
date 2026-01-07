import React from 'react';
import { Settings, Image as ImageIcon, Search, Key, Database, RefreshCw } from 'lucide-react';
import { GenerationConfig, AspectRatio, ImageSize } from '../types';
import { MODEL_NAME } from '../services/geminiService';

interface SettingsSidebarProps {
  config: GenerationConfig;
  setConfig: React.Dispatch<React.SetStateAction<GenerationConfig>>;
  isOpen: boolean;
  toggle: () => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ config, setConfig, isOpen, toggle }) => {
  const aspectRatios: AspectRatio[] = ['1:1', '3:4', '4:3', '9:16', '16:9'];
  const sizes: ImageSize[] = ['1K', '2K', '4K'];

  const apiKey = process.env.API_KEY || '';
  const maskedKey = apiKey.length > 10 
    ? `${apiKey.slice(0, 8)}...${apiKey.slice(-6)}` 
    : 'Not Connected';
  
  // Try to grab project ID if available in environment, otherwise fallback
  const projectId = (process.env as any).GOOGLE_CLOUD_PROJECT || (process.env as any).GCP_PROJECT || 'Paid Cloud Project';

  const handleChangeKey = async () => {
    if (window.aistudio?.openSelectKey) {
        try {
            await window.aistudio.openSelectKey();
            // Force a reload to pick up the new key in the environment if the platform requires it
            // or just let the user know. 
            // In some implementations, the env var updates immediately, in others it requires reload.
            // We'll just log for now, as the service creates a new instance every call.
            console.log("Key selection dialog opened");
        } catch (e) {
            console.error(e);
        }
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
          onClick={toggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 right-0 z-30
        w-80 bg-gray-900 border-l border-gray-800
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
                <Settings className="w-5 h-5 text-purple-400" />
                <h2 className="font-semibold text-lg">Configuration</h2>
            </div>
            <button onClick={toggle} className="lg:hidden text-gray-400 hover:text-white">
                &times;
            </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto flex-1">
          
          {/* Aspect Ratio */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setConfig(prev => ({ ...prev, aspectRatio: ratio }))}
                  className={`
                    px-3 py-2 text-sm rounded-lg border transition-all
                    ${config.aspectRatio === ratio 
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750 hover:border-gray-600'}
                  `}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Image Size */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-400">Resolution</label>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setConfig(prev => ({ ...prev, imageSize: size }))}
                  className={`
                    px-3 py-2 text-sm rounded-lg border transition-all
                    ${config.imageSize === size 
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750 hover:border-gray-600'}
                  `}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Higher resolutions (2K/4K) may take longer to generate.
            </p>
          </div>

          {/* Google Search Toggle */}
          <div className="space-y-3">
            <label className="flex items-center justify-between group cursor-pointer">
              <span className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Google Search Grounding
              </span>
              <div 
                onClick={() => setConfig(prev => ({ ...prev, googleSearch: !prev.googleSearch }))}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${config.googleSearch ? 'bg-green-600' : 'bg-gray-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${config.googleSearch ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </label>
            <p className="text-xs text-gray-500">
              Enables the model to use real-time search data for more accurate details in images.
            </p>
          </div>

        </div>

        {/* Connection Info Footer */}
        <div className="p-4 bg-gray-900/50 border-t border-gray-800">
            <div className="bg-gray-800/50 rounded-xl p-3 space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                    <Database className="w-4 h-4 text-blue-400" />
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Model</span>
                        <span className="text-xs font-mono">{MODEL_NAME}</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-4 flex justify-center"><div className="w-2 h-2 rounded-full bg-green-500"></div></div>
                     <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Project</span>
                        <span className="text-xs truncate max-w-[180px]">{projectId}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                    <Key className="w-4 h-4 text-yellow-500" />
                    <div className="flex flex-col flex-1">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">API Key</span>
                        <span className="text-xs font-mono">{maskedKey}</span>
                    </div>
                    <button onClick={handleChangeKey} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white" title="Change API Key">
                        <RefreshCw className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};