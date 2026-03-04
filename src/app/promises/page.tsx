'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import {
  BiblePromise,
  BiblePromisesResponse,
  ToggleActiveResponse,
  ApiErrorResponse,
} from '@/types';
import LoadingSpinner from '@/components/loading-spinner';
import AudioPlayer from '@/components/audio-player';
import { showToast } from '@/components/toast';
import Link from 'next/link';
import { AxiosError } from 'axios';

export default function PromisesPage() {
  const [promises, setPromises] = useState<BiblePromise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchPromises = async () => {
      try {
        const response = await api.get<BiblePromisesResponse>('/api/bible-promises');
        setPromises(response.data.data);
      } catch {
        setError('Erro ao carregar as promessas. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromises();
  }, []);

  const filteredPromises = useMemo(() => {
    if (!search.trim()) return promises;

    const lowerSearch = search.toLowerCase();
    return promises.filter((promiseItem) => {
      const reference = `${promiseItem.book} ${promiseItem.chapter}:${promiseItem.verse}`.toLowerCase();

      return (
        reference.includes(lowerSearch) ||
        promiseItem.category.toLowerCase().includes(lowerSearch) ||
        promiseItem.promise.toLowerCase().includes(lowerSearch)
      );
    });
  }, [promises, search]);

  const handleToggleActive = async (promiseId: string, currentActive: boolean) => {
    setTogglingIds((prev) => new Set(prev).add(promiseId));

    try {
      await api.patch<ToggleActiveResponse>(`/api/bible-promises/${promiseId}/active`, {
        is_active: !currentActive,
      });

      setPromises((prev) =>
        prev.map((promiseItem) =>
          promiseItem.id === promiseId
            ? { ...promiseItem, isActive: !currentActive }
            : promiseItem
        )
      );

      showToast(`Promessa ${!currentActive ? 'ativada' : 'desativada'} com sucesso!`, 'success');
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      showToast(axiosError.response?.data?.message || 'Erro ao alterar status.', 'error');
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(promiseId);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted text-sm">Carregando promessas...</p>
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
          <p className="text-error font-medium">{error}</p>
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
          <h1 className="text-3xl font-bold text-foreground">Promessas</h1>
          <p className="mt-1 text-sm text-muted">
            Cadastre, escute e gerencie promessas biblicas com audio
          </p>
        </div>

        <Link
          href="/promises/new"
          id="new-promise-button"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:brightness-110 hover:shadow-primary/40"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nova Promessa
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
            id="search-promises"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por referencia, categoria ou texto..."
            className="w-full rounded-xl border border-input-border bg-input-bg py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted/50 transition-colors focus:border-input-focus focus:outline-none"
          />
        </div>
      </div>

      <p className="mb-4 text-sm text-muted">
        {filteredPromises.length} promessa{filteredPromises.length !== 1 ? 's' : ''} encontrada
        {filteredPromises.length !== 1 ? 's' : ''}
      </p>

      {filteredPromises.length === 0 ? (
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
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
          <p className="text-muted">
            {search ? 'Nenhuma promessa encontrada' : 'Nenhuma promessa criada ainda'}
          </p>
          {!search && (
            <Link
              href="/promises/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary/20 px-4 py-2 text-sm text-primary-light transition-colors hover:bg-primary/30"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Criar primeira promessa
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPromises.map((promiseItem) => (
            <PromiseCard
              key={promiseItem.id}
              promiseItem={promiseItem}
              isToggling={togglingIds.has(promiseItem.id)}
              onToggleActive={() =>
                handleToggleActive(promiseItem.id, promiseItem.isActive !== false)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PromiseCard({
  promiseItem,
  isToggling,
  onToggleActive,
}: {
  promiseItem: BiblePromise;
  isToggling: boolean;
  onToggleActive: () => void;
}) {
  const reference = `${promiseItem.book} ${promiseItem.chapter}:${promiseItem.verse}`;

  return (
    <div
      id={`promise-${promiseItem.id}`}
      className={`group overflow-hidden rounded-2xl border bg-card/50 transition-all duration-200 hover:border-primary/40 hover:bg-card-hover hover:shadow-lg hover:shadow-primary/5 ${promiseItem.isActive === false ? 'border-border/50 opacity-60' : 'border-border'}`}
    >
      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-foreground transition-colors group-hover:text-primary-light">
              {reference}
            </h3>
            <p className="mt-1 text-xs text-muted">{promiseItem.category}</p>
          </div>
          <button
            onClick={onToggleActive}
            disabled={isToggling}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${promiseItem.isActive !== false ? 'bg-success' : 'bg-border'}`}
            title={promiseItem.isActive !== false ? 'Desativar' : 'Ativar'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${promiseItem.isActive !== false ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        <div className="mb-3 flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${promiseItem.isActive !== false ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'}`}
          >
            {promiseItem.isActive !== false ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        <p className="line-clamp-4 text-sm leading-relaxed text-muted">{promiseItem.promise}</p>

        <div className="mt-4 border-t border-border pt-3">
          <AudioPlayer streamEndpoint={`/api/bible-promises/${promiseItem.id}/stream`} />
        </div>
      </div>
    </div>
  );
}
