'use client';

import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import Link from 'next/link';
import AudioPlayer from '@/components/audio-player';
import LoadingSpinner from '@/components/loading-spinner';
import { showToast } from '@/components/toast';
import { DEVOTIONAL_MONTHS } from '@/lib/devotionals';
import api from '@/lib/api';
import {
  ApiErrorResponse,
  DailyDevotional,
  DailyDevotionalsResponse,
  ToggleActiveResponse,
} from '@/types';

const monthLabels = Object.fromEntries(
  DEVOTIONAL_MONTHS.map((month) => [month.value, month.label])
);

export default function DevotionalsPage() {
  const [devotionals, setDevotionals] = useState<DailyDevotional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchDevotionals = async () => {
      try {
        const response = await api.get<DailyDevotionalsResponse>('/api/devotionals');
        setDevotionals(response.data.data);
      } catch {
        setError('Erro ao carregar os devocionais. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDevotionals();
  }, []);

  const filteredDevotionals = useMemo(() => {
    if (!search.trim()) return devotionals;

    const lowerSearch = search.toLowerCase();
    return devotionals.filter((devotional) =>
      [
        devotional.titulo,
        devotional.mes,
        devotional.assuntoMes,
        devotional.assuntoSemana,
        devotional.referencia,
        devotional.perfilAlvo,
      ].some((value) => value.toLowerCase().includes(lowerSearch))
    );
  }, [devotionals, search]);

  const handleToggleActive = async (devotionalId: string, currentActive: boolean) => {
    setTogglingIds((prev) => new Set(prev).add(devotionalId));

    try {
      await api.patch<ToggleActiveResponse>(`/api/devotionals/${devotionalId}/active`, {
        is_active: !currentActive,
      });

      setDevotionals((prev) =>
        prev.map((devotional) =>
          devotional.id === devotionalId
            ? { ...devotional, isActive: !currentActive }
            : devotional
        )
      );

      showToast(
        `Devocional ${!currentActive ? 'ativado' : 'desativado'} com sucesso!`,
        'success'
      );
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      showToast(axiosError.response?.data?.message || 'Erro ao alterar status.', 'error');
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(devotionalId);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-muted">Carregando devocionais...</p>
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
          <h1 className="text-3xl font-bold text-foreground">Devocionais</h1>
          <p className="mt-1 text-sm text-muted">
            Cadastre e gerencie a jornada anual de 365 dias com leitura e oração em áudio
          </p>
        </div>

        <Link
          href="/devotionals/new"
          id="new-devotional-button"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:brightness-110 hover:shadow-primary/40"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Devocional
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
            id="search-devotionals"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por titulo, mes, assunto ou referencia..."
            className="w-full rounded-xl border border-input-border bg-input-bg py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted/50 transition-colors focus:border-input-focus focus:outline-none"
          />
        </div>
      </div>

      <p className="mb-4 text-sm text-muted">
        {filteredDevotionals.length === 1
          ? '1 devocional encontrado'
          : `${filteredDevotionals.length} devocionais encontrados`}
      </p>

      {filteredDevotionals.length === 0 ? (
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
            {search ? 'Nenhum devocional encontrado' : 'Nenhum devocional criado ainda'}
          </p>
          {!search && (
            <Link
              href="/devotionals/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary/20 px-4 py-2 text-sm text-primary-light transition-colors hover:bg-primary/30"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Criar primeiro devocional
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDevotionals.map((devotional) => (
            <DevotionalCard
              key={devotional.id}
              devotional={devotional}
              isToggling={togglingIds.has(devotional.id)}
              onToggleActive={() =>
                handleToggleActive(devotional.id, devotional.isActive !== false)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DevotionalCard({
  devotional,
  isToggling,
  onToggleActive,
}: {
  devotional: DailyDevotional;
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

  const perfilStyle =
    perfilColors[devotional.perfilAlvo] || 'bg-primary/10 text-primary-light border-primary/20';
  const monthLabel = monthLabels[devotional.mes] || devotional.mes;

  return (
    <div
      id={`devotional-${devotional.id}`}
      className={`group overflow-hidden rounded-2xl border bg-card/50 transition-all duration-200 hover:border-primary/40 hover:bg-card-hover hover:shadow-lg hover:shadow-primary/5 ${devotional.isActive === false ? 'border-border/50 opacity-60' : 'border-border'}`}
    >
      {devotional.coverImageUrl && (
        <div className="relative h-36 w-full overflow-hidden">
          <img
            src={devotional.coverImageUrl}
            alt={devotional.titulo}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        </div>
      )}

      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <h3 className="line-clamp-2 text-base font-semibold text-foreground transition-colors group-hover:text-primary-light">
              {devotional.titulo}
            </h3>
            <p className="mt-1 text-xs text-muted">
              {monthLabel} - Semana {devotional.semana} - Dia {devotional.dia}
            </p>
          </div>
          <button
            onClick={onToggleActive}
            disabled={isToggling}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${devotional.isActive !== false ? 'bg-success' : 'bg-border'}`}
            title={devotional.isActive !== false ? 'Desativar' : 'Ativar'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${devotional.isActive !== false ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        <p className="mb-1 text-xs font-medium text-primary-light">{devotional.assuntoMes}</p>
        <p className="mb-3 text-xs text-muted">{devotional.assuntoSemana}</p>
        <p className="mb-3 text-xs text-muted">{devotional.referencia}</p>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-lg border px-2 py-1 text-xs font-medium ${perfilStyle}`}>
            {devotional.perfilAlvo}
          </span>
          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${devotional.isActive !== false ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'}`}>
            {devotional.isActive !== false ? 'Ativo' : 'Inativo'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-xs font-medium text-muted">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {devotional.duracaoEstimadaMinutos} min
          </span>
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-muted">{devotional.textoLeitura}</p>

        <div className="mt-4 space-y-3 border-t border-border pt-3">
          <AudioPlayer
            streamEndpoint={`/api/devotionals/${devotional.id}/stream`}
            title="Audio da leitura"
          />
          <AudioPlayer
            streamEndpoint={`/api/devotionals/${devotional.id}/stream`}
            title="Audio da oracao"
            responseDataKey="oracaoAudioUrl"
          />
        </div>
      </div>
    </div>
  );
}
