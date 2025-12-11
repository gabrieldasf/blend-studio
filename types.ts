export enum ProcessStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface AudioResult {
  transcription: string;
  summary: string;
}

export interface AudioItem {
  id: string;
  file: File;
  status: ProcessStatus;
  result?: AudioResult;
  error?: string;
  uploadProgress: number; // Simulated progress for UX
  currentChunk?: number;
  totalChunks?: number;
}
