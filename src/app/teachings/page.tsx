'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import {
  Teaching,
  TeachingsResponse,
  ToggleActiveResponse,
  ApiErrorResponse,
} from '@/types';
import LoadingSpinner from '@/components/loading-spinner';
import AudioPlayer from '@/components/audio-player';
import { showToast } from '@/components/toast';
import Link from 'next/link';
import { AxiosError } from 'axios';

export default function TeachingsPage() {
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchTeachings = async () => {
      try {
        const response = await api.get<TeachingsResponse>('/api/teachings');
        setTeachings(response.data.data);
      } catch {
        setError('Erro ao carregar os ensinamentos. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachings();
  }, []);

  const filteredTeachings = useMemo(() => {
    if (!search.trim()) return teachings;

    const lowerSearch = search.toLowerCase();
    return teachings.filter(
      (teaching) =>
        teaching.titulo.toLowerCase().includes(lowerSearch) ||
        teaching.categoria.toLowerCase().includes(lowerSearch) ||
        teaching.perfilAlvo.toLowerCase().includes(lowerSearch) ||
        teaching.referencia.toLowerCase().includes(lowerSearch)
    );
  }, [teachings, search]);

  const handleToggleActive = async (teachingId: string, currentActive: boolean) => {
    setTogglingIds((prev) => new Set(prev).add(teachingId));

    try {
      await api.patch<ToggleActiveResponse>(`/api/teachings/${teachingId}/active`, {
        is_active: !currentActive,
      });

      setTeachings((prev) =>
        prev.map((teaching) =>
          teaching.id === teachingId ? { ...teaching, isActive: !currentActive } : teaching
        )
      );

      showToast(`Ensinamento ${!currentActive ? 'ativado' : 'desativado'} com sucesso!`, 'success');
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      showToast(axiosError.response?.data?.message || 'Erro ao alterar status.', 'error');
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(teachingId);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-muted">Carregando ensinamentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-error/40 bg-error/10 px-8 py-6 text-center">
          <svg
            className="mx-auto mb-3 h-10 w-10 text-error"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <p className="font-medium text-error">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-error/20 px-4 py-2 text-sm text-error transition-colors hover:bg-error/30"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ensinamentos</h1>
          <p className="mt-1 text-sm text-muted">
            Audiobooks de ensinamentos para estudo e meditação
          </p>
        </div>

        <Link
          href="/teachings/new"
          id="new-teaching-button"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:brightness-110 hover:shadow-primary/40"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Ensinamento
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            id="search-teachings"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por titulo, categoria ou referencia..."
            className="w-full rounded-xl border border-input-border bg-input-bg py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted/50 transition-colors focus:border-input-focus focus:outline-none"
          />
        </div>
      </div>

      <p className="mb-4 text-sm text-muted">
        {filteredTeachings.length} ensinamento{filteredTeachings.length !== 1 ? 's' : ''} encontrado
        {filteredTeachings.length !== 1 ? 's' : ''}
      </p>

      {filteredTeachings.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card/30 py-16 text-center">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-muted/50"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
          <p className="text-muted">
            {search ? 'Nenhum ensinamento encontrado' : 'Nenhum ensinamento criado ainda'}
          </p>
          {!search && (
            <Link
              href="/teachings/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary/20 px-4 py-2 text-sm text-primary-light transition-colors hover:bg-primary/30"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Criar primeiro ensinamento
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeachings.map((teaching) => (
            <TeachingCard
              key={teaching.id}
              teaching={teaching}
              isToggling={togglingIds.has(teaching.id)}
              onToggleActive={() => handleToggleActive(teaching.id, teaching.isActive !== false)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TeachingCard({
  teaching,
  isToggling,
  onToggleActive,
}: {
  teaching: Teaching;
  isToggling: boolean;
  onToggleActive: () => void;
}) {
  const perfilColors: Record<string, string> = {
    Todos: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Pai: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Mae: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Mãe: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Filho: 'bg-green-500/10 text-green-400 border-green-500/20',
    Filha: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    Familia: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Família: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const perfilStyle = perfilColors[teaching.perfilAlvo] || 'bg-primary/10 text-primary-light border-primary/20';

  return (
    <div
      id={`teaching-${teaching.id}`}
      className={`group overflow-hidden rounded-2xl border bg-card/50 transition-all duration-200 hover:border-primary/40 hover:bg-card-hover hover:shadow-lg hover:shadow-primary/5 ${teaching.isActive === false ? 'border-border/50 opacity-60' : 'border-border'}`}
    >
      {teaching.coverImageUrl && (
        <div className="relative h-36 w-full overflow-hidden">
          <img
            src={teaching.coverImageUrl}
            alt={teaching.titulo}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        </div>
      )}

      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-foreground transition-colors group-hover:text-primary-light line-clamp-2">
            {teaching.titulo}
          </h3>
          <button
            onClick={onToggleActive}
            disabled={isToggling}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${teaching.isActive !== false ? 'bg-success' : 'bg-border'
              }`}
            title={teaching.isActive !== false ? 'Desativar' : 'Ativar'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${teaching.isActive !== false ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>

        <p className="mb-3 text-xs text-muted line-clamp-1">{teaching.categoria}</p>
        <p className="mb-3 text-xs text-muted">{teaching.referencia}</p>

        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center rounded-lg border px-2 py-1 text-xs font-medium ${perfilStyle}`}>
            {teaching.perfilAlvo}
          </span>
          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${teaching.isActive !== false ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'}`}>
            {teaching.isActive !== false ? 'Ativo' : 'Inativo'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-xs font-medium text-muted">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {teaching.duracaoEstimadaMinutos} min
          </span>
        </div>

        <div className="mt-3 border-t border-border pt-3">
          <AudioPlayer streamEndpoint={`/api/teachings/${teaching.id}/stream`} />
        </div>
      </div>
    </div>
  );
}
