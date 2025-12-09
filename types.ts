export interface Scene {
  id: number;
  narration: string;
  visual_prompt: string;
  imageData?: string; // base64
  audioBuffer?: AudioBuffer;
}

export interface GeneratedScript {
  title: string;
  scenes: Scene[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING_SCRIPT = 'GENERATING_SCRIPT',
  GENERATING_IMAGES = 'GENERATING_IMAGES',
  GENERATING_AUDIO = 'GENERATING_AUDIO',
  READY = 'READY',
  ERROR = 'ERROR'
}

export interface GenerationProgress {
  current: number;
  total: number;
  message: string;
}