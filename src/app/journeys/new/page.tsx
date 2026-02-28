'use client';

import { useState, FormEvent } from 'react';
import api from '@/lib/api';
import { CharacterJourneyResponse, ApiErrorResponse } from '@/types';
import LoadingSpinner from '@/components/loading-spinner';
import { showToast } from '@/components/toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

interface FieldError {
  field: string;
  message: string;
}

const CATEGORIAS = [
  'Histórias de Pais da Bíblia',
  'Histórias de Mães da Bíblia',
];

const PERFIS_ALVO = ['Pai', 'Mãe', 'Filho', 'Filha'];

export default function NewJourneyPage() {
  const router = useRouter();

  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [perfilAlvo, setPerfilAlvo] = useState('');
  const [duracaoEstimada, setDuracaoEstimada] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getFieldError = (field: string) =>
    fieldErrors.find((e) => e.field === field)?.message;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);

    // Client-side validation
    const errors: FieldError[] = [];
    if (!titulo.trim()) errors.push({ field: 'titulo', message: 'Título é obrigatório' });
    if (!categoria) errors.push({ field: 'categoria', message: 'Categoria é obrigatória' });
    if (!perfilAlvo) errors.push({ field: 'perfil_alvo', message: 'Perfil alvo é obrigatório' });
    if (!duracaoEstimada || Number(duracaoEstimada) <= 0) errors.push({ field: 'duracao_estimada_minutos', message: 'Duração deve ser maior que 0' });
    if (!conteudo.trim()) errors.push({ field: 'segmentos_de_texto', message: 'Conteúdo é obrigatório' });

    if (errors.length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Split content into segments (by paragraphs / double newlines)
    const segmentos = conteudo
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (segmentos.length === 0) {
      setFieldErrors([{ field: 'segmentos_de_texto', message: 'Insira pelo menos um parágrafo de conteúdo' }]);
      return;
    }

    setIsLoading(true);

    try {
      await api.post<CharacterJourneyResponse>('/api/character-journeys/generate', {
        titulo: titulo.trim(),
        categoria,
        perfil_alvo: perfilAlvo,
        duracao_estimada_minutos: Number(duracaoEstimada),
        segmentos_de_texto: segmentos,
      });

      showToast('Jornada criada com sucesso!', 'success');
      router.push('/journeys');
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const data = axiosError.response?.data;
      if (data?.errors) {
        setFieldErrors(data.errors);
      }
      setError(data?.message || 'Erro ao criar jornada. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <Link
        href="/journeys"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Voltar para a lista
      </Link>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Nova Jornada</h1>
        <p className="text-muted text-sm mt-1">
          Crie um audiobook de uma história condensada de um personagem bíblico
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-xl p-8 shadow-2xl shadow-black/10">
        {error && (
          <div className="mb-6 rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Título */}
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-muted mb-1.5">
              Título da Jornada
            </label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted/50 transition-colors focus:outline-none ${getFieldError('titulo')
                  ? 'border-error focus:border-error'
                  : 'border-input-border focus:border-input-focus'
                }`}
              placeholder="Ex: A Jornada de Isaque: Fé, Submissão e Legado"
              disabled={isLoading}
            />
            {getFieldError('titulo') && (
              <p className="mt-1 text-xs text-error">{getFieldError('titulo')}</p>
            )}
          </div>

          {/* Categoria & Perfil Alvo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-muted mb-1.5">
                Categoria
              </label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground transition-colors focus:outline-none appearance-none cursor-pointer ${getFieldError('categoria')
                    ? 'border-error focus:border-error'
                    : 'border-input-border focus:border-input-focus'
                  } ${!categoria ? 'text-muted/50' : ''}`}
                disabled={isLoading}
              >
                <option value="" disabled>Selecione...</option>
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {getFieldError('categoria') && (
                <p className="mt-1 text-xs text-error">{getFieldError('categoria')}</p>
              )}
            </div>

            <div>
              <label htmlFor="perfil-alvo" className="block text-sm font-medium text-muted mb-1.5">
                Perfil Alvo
              </label>
              <select
                id="perfil-alvo"
                value={perfilAlvo}
                onChange={(e) => setPerfilAlvo(e.target.value)}
                className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground transition-colors focus:outline-none appearance-none cursor-pointer ${getFieldError('perfil_alvo')
                    ? 'border-error focus:border-error'
                    : 'border-input-border focus:border-input-focus'
                  } ${!perfilAlvo ? 'text-muted/50' : ''}`}
                disabled={isLoading}
              >
                <option value="" disabled>Selecione...</option>
                {PERFIS_ALVO.map((perfil) => (
                  <option key={perfil} value={perfil}>{perfil}</option>
                ))}
              </select>
              {getFieldError('perfil_alvo') && (
                <p className="mt-1 text-xs text-error">{getFieldError('perfil_alvo')}</p>
              )}
            </div>
          </div>

          {/* Duração Estimada */}
          <div>
            <label htmlFor="duracao" className="block text-sm font-medium text-muted mb-1.5">
              Duração Estimada (minutos)
            </label>
            <input
              id="duracao"
              type="number"
              min="1"
              value={duracaoEstimada}
              onChange={(e) => setDuracaoEstimada(e.target.value)}
              className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted/50 transition-colors focus:outline-none ${getFieldError('duracao_estimada_minutos')
                  ? 'border-error focus:border-error'
                  : 'border-input-border focus:border-input-focus'
                }`}
              placeholder="Ex: 4"
              disabled={isLoading}
            />
            {getFieldError('duracao_estimada_minutos') && (
              <p className="mt-1 text-xs text-error">{getFieldError('duracao_estimada_minutos')}</p>
            )}
          </div>

          {/* Conteúdo */}
          <div>
            <label htmlFor="conteudo" className="block text-sm font-medium text-muted mb-1.5">
              Conteúdo
            </label>
            <textarea
              id="conteudo"
              rows={10}
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted/50 transition-colors focus:outline-none resize-y ${getFieldError('segmentos_de_texto')
                  ? 'border-error focus:border-error'
                  : 'border-input-border focus:border-input-focus'
                }`}
              placeholder="Escreva o texto da história. Separe os segmentos com uma linha em branco entre eles.

Ex:
Isaque foi o filho da promessa, nascido de um milagre quando Abraão e Sara já eram idosos.

Ainda jovem, Isaque participou de um dos momentos mais tensos e reveladores de toda a Escritura.

A jornada de Isaque nos ensina sobre a força da obediência quieta."
              disabled={isLoading}
            />
            {getFieldError('segmentos_de_texto') && (
              <p className="mt-1 text-xs text-error">{getFieldError('segmentos_de_texto')}</p>
            )}
            <p className="mt-1.5 text-xs text-muted">
              Separe os segmentos com uma linha em branco. Cada parágrafo será um segmento do audiobook.
            </p>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/journeys"
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-card-hover hover:text-foreground"
            >
              Cancelar
            </Link>
            <button
              id="create-journey-submit"
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Gerando audiobook...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                  Gerar Audiobook
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
