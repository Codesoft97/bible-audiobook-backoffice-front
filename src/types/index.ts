// Auth types
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  status: string;
  data: {
    token: string;
    user: User;
  };
}

export interface RegisterResponse {
  status: string;
  data: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Bible Book types
export interface BibleBook {
  id: string;
  name: string;
  abbrev: string;
  totalChapters: number;
  currentChapter: number;
  nextChapter: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BibleBooksResponse {
  status: string;
  data: BibleBook[];
}

// Audiobook types
export interface AudiobookGenerateResponse {
  status: string;
  data: {
    id: string;
    book: string;
    chapter: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Audiobook {
  id: string;
  book: string;
  chapter: number;
  createdAt: string;
  updatedAt: string;
}

export interface AudiobooksResponse {
  status: string;
  data: Audiobook[];
}

// Character Journey types
export interface CharacterJourney {
  id: string;
  titulo: string;
  categoria: string;
  perfilAlvo: string;
  duracaoEstimadaMinutos: number;
  createdAt: string;
  updatedAt: string;
}

// Stream types
export interface StreamResponse {
  status: string;
  data: {
    audioUrl: string;
  };
}

export interface CharacterJourneyResponse {
  status: string;
  data: CharacterJourney;
}

export interface CharacterJourneysResponse {
  status: string;
  data: CharacterJourney[];
}

// API Error types
export interface ApiValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  status: string;
  message: string;
  errors?: ApiValidationError[];
}
