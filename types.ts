export interface Message {
  id: string;
  role: 'user' | 'model';
  text?: string;
  images?: string[]; // Array of base64 data URIs
  timestamp: number;
  isError?: boolean;
}

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
export type ImageSize = '1K' | '2K' | '4K';

export interface GenerationConfig {
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
  googleSearch: boolean;
}

// Augment window for the AI Studio specific API key selection
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
