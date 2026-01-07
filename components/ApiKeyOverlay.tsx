import React, { useState, useEffect } from 'react';
import { Key, Lock, ExternalLink, RefreshCw } from 'lucide-react';

interface ApiKeyOverlayProps {
  onKeySelected: () => void;
}

export const ApiKeyOverlay: React.FC<ApiKeyOverlayProps> = ({ onKeySelected }) => {
  const [checking, setChecking] = useState(true);
  const [hasKey, setHasKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkKey = async () => {
    setChecking(true);
    setError(null);
    try {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
        if (selected) {
          onKeySelected();
        }
      } else {
        // Fallback for dev environments where window.aistudio might not exist
        // In a real scenario strictly following the guide, this branch might not be needed
        // but it prevents a blank screen crash if the environment isn't perfect.
        console.warn("window.aistudio is not defined. Assuming dev environment or waiting for injection.");
      }
    } catch (e) {
      console.error("Error checking API key:", e);
      setError("Failed to verify API key status.");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        // Assume success after interaction as per guidelines (race condition mitigation)
        setHasKey(true);
        onKeySelected();
      } catch (e: any) {
        console.error("Selection error:", e);
        if (e.message && e.message.includes("Requested entity was not found")) {
            setError("Project not found. Please try selecting a valid paid GCP project again.");
            setHasKey(false);
        }
      }
    }
  };

  if (hasKey) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/90 backdrop-blur-sm p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
          <Key className="w-8 h-8 text-blue-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Access Required</h2>
        <p className="text-gray-400 mb-8">
          To use the Nano Banana Pro 2 (Gemini 3 Pro) image generation model, you must select a valid Designinc registered project and its assigned API Key.
        </p>

        {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200 text-sm w-full">
                {error}
            </div>
        )}

        <button
          onClick={handleSelectKey}
          disabled={checking}
          className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
        >
          {checking ? (
             <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
             <Lock className="w-5 h-5" />
          )}
          <span>Select API Key</span>
        </button>

        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-6 text-sm text-gray-500 hover:text-gray-300 flex items-center gap-1.5 transition-colors"
        >
          <span>Read about billing requirements</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};