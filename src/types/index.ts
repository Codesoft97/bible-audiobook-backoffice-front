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
  coverImageUrl?: string;
  isActive?: boolean;
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
  coverImageUrl?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Toggle Active Response
export interface ToggleActiveResponse {
  status: string;
  data: {
    id: string;
    isActive: boolean;
  };
}

// Stream types
export interface StreamResponse {
  status: string;
  data: {
    audioUrl: string;
    oracaoAudioUrl?: string;
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

// Parable types
export interface Parable {
  id: string;
  referencia: string;
  titulo: string;
  categoria: string;
  perfilAlvo: string;
  duracaoEstimadaMinutos: number;
  coverImageUrl?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParableResponse {
  status: string;
  data: Parable;
}

export interface ParablesResponse {
  status: string;
  data: Parable[];
}

// Teaching types
export interface Teaching {
  id: string;
  titulo: string;
  categoria: string;
  perfilAlvo: string;
  referencia: string;
  duracaoEstimadaMinutos: number;
  coverImageUrl?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeachingResponse {
  status: string;
  data: Teaching;
}

export interface TeachingsResponse {
  status: string;
  data: Teaching[];
}

// Bible Promise types
export interface BiblePromise {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  promise: string;
  category: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BiblePromiseResponse {
  status: string;
  data: BiblePromise;
}

export interface BiblePromisesResponse {
  status: string;
  data: BiblePromise[];
}

// Daily Devotional types
export interface DailyDevotional {
  id: string;
  titulo: string;
  mes: string;
  semana: string;
  dia: number;
  assuntoMes: string;
  assuntoSemana: string;
  perfilAlvo: string;
  referencia: string;
  textoLeitura: string;
  oracaoLeitura: string;
  duracaoEstimadaMinutos: number;
  coverImageUrl?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyDevotionalResponse {
  status: string;
  data: DailyDevotional;
}

export interface DailyDevotionalsResponse {
  status: string;
  data: DailyDevotional[];
}

// Voice types
export interface Voice {
  id: string;
  name: string;
  language: string;
  externalId: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoicesResponse {
  status: string;
  data: Voice[];
}

export interface VoiceCreateResponse {
  status: string;
  data: Voice;
}

// Dashboard types
export type DashboardPlan = 'free' | 'free_trial' | 'paid';

export interface DashboardOverview {
  totalFamilies: number;
  totalProfiles: number;
  planDistribution: Record<DashboardPlan, number>;
  newRegistrations: {
    last7Days: number;
    last30Days: number;
  };
  totalWithActivity: number;
  totalWithoutActivity: number;
}

export interface DashboardOverviewResponse {
  status: string;
  data: DashboardOverview;
}

export interface DashboardUser {
  profileId: string;
  profileName: string;
  profileType: string;
  familyId: string;
  familyName: string;
  email: string;
  plan: DashboardPlan;
  authProvider?: string;
  registeredAt: string;
  lastActivityAt: string | null;
  totalListenings: number;
  totalDevotionals: number;
  totalBibleReadings: number;
}

export interface DashboardInactiveUser {
  profileId: string;
  profileName: string;
  profileType: string;
  familyId: string;
  familyName: string;
  email: string;
  plan: DashboardPlan;
  registeredAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DashboardUsersResponse {
  status: string;
  data: {
    users: DashboardUser[];
    pagination: PaginationMeta;
  };
}

export interface DashboardInactiveUsersResponse {
  status: string;
  data: {
    users: DashboardInactiveUser[];
    pagination: PaginationMeta;
  };
}

export interface DashboardTopContent {
  contentId: string;
  contentType: string;
  totalListens: number;
  uniqueListeners: number;
}

export interface DashboardDailyTrend {
  date: string;
  total: number;
}

export interface DashboardContentConsumption {
  byContentType: Record<string, number>;
  topContents: DashboardTopContent[];
  dailyTrend: DashboardDailyTrend[];
}

export interface DashboardContentConsumptionResponse {
  status: string;
  data: DashboardContentConsumption;
}

export interface DashboardEngagement {
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  devotionalProgress: {
    totalStarted: number;
    totalContentCompleted: number;
    totalPrayerCompleted: number;
    completionRate: number;
  };
  bibleReading: {
    totalReaders: number;
    uniqueBooks: number;
    avgChaptersPerUser: number;
  };
}

export interface DashboardEngagementResponse {
  status: string;
  data: DashboardEngagement;
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
