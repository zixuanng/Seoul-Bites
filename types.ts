export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        content: string;
      }[];
    };
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  searchEntryPoint?: {
    renderedContent?: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  groundingMetadata?: GroundingMetadata;
  timestamp: number;
}

export enum AppView {
  HOME = 'HOME',
  CHAT = 'CHAT',
  SEARCH = 'SEARCH'
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface Place {
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  price?: string;
}