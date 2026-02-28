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
export interface AudiobookResponse {
  status: string;
  data: {
    id: string;
    book: string;
    chapter: number;
    audioUrl: string;
    createdAt: string;
    updatedAt: string;
  };
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
