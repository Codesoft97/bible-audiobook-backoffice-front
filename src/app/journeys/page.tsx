'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { CharacterJourney, CharacterJourneysResponse } from '@/types';
import LoadingSpinner from '@/components/loading-spinner';
import Link from 'next/link';

export default function JourneysPage() {
  const [journeys, setJourneys] = useState<CharacterJourney[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchJourneys = async () => {
      try {
        const response = await api.get<CharacterJourneysResponse>('/api/character-journeys');
        setJourneys(response.data.data);
      } catch {
        setError('Erro ao carregar as jornadas. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJourneys();
  }, []);

  const filteredJourneys = useMemo(() => {
    if (!search.trim()) return journeys;
    const lowerSearch = search.toLowerCase();
    return journeys.filter(
      (j) =>
        j.titulo.toLowerCase().includes(lowerSearch) ||
        j.categoria.toLowerCase().includes(lowerSearch) ||
        j.perfilAlvo.toLowerCase().includes(lowerSearch)
    );
  }, [journeys, search]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted text-sm">Carregando jornadas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-error/40 bg-error/10 px-8 py-6 text-center">
          <svg className="mx-auto h-10 w-10 text-error mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-error font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-error/20 px-4 py-2 text-sm text-error hover:bg-error/30 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page title */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Jornadas de Personagens</h1>
          <p className="text-muted text-sm mt-1">
            Audiobooks de histórias condensadas de personagens bíblicos
          </p>
        </div>
        <Link
          href="/journeys/new"
          id="new-journey-button"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:brightness-110"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nova Jornada
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            id="search-journeys"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, categoria ou perfil..."
            className="w-full rounded-xl border border-input-border bg-input-bg py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted/50 transition-colors focus:border-input-focus focus:outline-none"
          />
        </div>
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-muted">
        {filteredJourneys.length} jornada{filteredJourneys.length !== 1 ? 's' : ''} encontrada{filteredJourneys.length !== 1 ? 's' : ''}
      </p>

      {/* Journeys list */}
      {filteredJourneys.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card/30 py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-muted/50 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <p className="text-muted">
            {search ? 'Nenhuma jornada encontrada' : 'Nenhuma jornada criada ainda'}
          </p>
          {!search && (
            <Link
              href="/journeys/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary/20 px-4 py-2 text-sm text-primary-light hover:bg-primary/30 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Criar primeira jornada
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredJourneys.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} />
          ))}
        </div>
      )}
    </div>
  );
}

function JourneyCard({ journey }: { journey: CharacterJourney }) {
  const perfilColors: Record<string, string> = {
    Pai: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Mãe: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Filho: 'bg-green-500/10 text-green-400 border-green-500/20',
    Filha: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  };

  const perfilStyle = perfilColors[journey.perfilAlvo] || 'bg-primary/10 text-primary-light border-primary/20';

  return (
    <div
      id={`journey-${journey.id}`}
      className="group rounded-2xl border border-border bg-card/50 p-5 transition-all duration-200 hover:border-primary/40 hover:bg-card-hover hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Title */}
      <h3 className="font-semibold text-foreground group-hover:text-primary-light transition-colors mb-2 line-clamp-2">
        {journey.titulo}
      </h3>

      {/* Category */}
      <p className="text-xs text-muted mb-3 line-clamp-1">{journey.categoria}</p>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className={`inline-flex items-center rounded-lg border px-2 py-1 text-xs font-medium ${perfilStyle}`}>
          {journey.perfilAlvo}
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-xs font-medium text-muted">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {journey.duracaoEstimadaMinutos} min
        </span>
      </div>

      {/* Audio link */}
      {journey.audioUrl && (
        <a
          href={journey.audioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-primary-light hover:text-primary transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
          Ouvir audiobook
        </a>
      )}
    </div>
  );
}
