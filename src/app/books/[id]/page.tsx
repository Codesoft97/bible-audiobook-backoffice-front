'use client';

import { useState, useEffect, use } from 'react';
import api from '@/lib/api';
import { BibleBook, BibleBooksResponse, AudiobookGenerateResponse, Audiobook, AudiobooksResponse, ApiErrorResponse } from '@/types';
import LoadingSpinner from '@/components/loading-spinner';
import AudioPlayer from '@/components/audio-player';
import { showToast } from '@/components/toast';
import Link from 'next/link';
import { AxiosError } from 'axios';

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [book, setBook] = useState<BibleBook | null>(null);
  const [audiobooks, setAudiobooks] = useState<Audiobook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [booksRes, audiobooksRes] = await Promise.all([
        api.get<BibleBooksResponse>('/api/bible-books'),
        api.get<AudiobooksResponse>('/api/audiobooks'),
      ]);

      const foundBook = booksRes.data.data.find((b) => b.id === id);
      if (foundBook) {
        setBook(foundBook);
        // Filter audiobooks for this book and sort by chapter
        const bookAudiobooks = audiobooksRes.data.data
          .filter((a) => a.book === foundBook.abbrev)
          .sort((a, b) => a.chapter - b.chapter);
        setAudiobooks(bookAudiobooks);
      } else {
        setError('Livro não encontrado.');
      }
    } catch {
      setError('Erro ao carregar o livro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleGenerate = async () => {
    if (!book || book.isCompleted) return;

    setIsGenerating(true);
    try {
      await api.post<AudiobookGenerateResponse>('/api/audiobooks/generate', {
        book: book.abbrev,
        chapter: book.nextChapter,
      });

      showToast(
        `Capítulo ${book.nextChapter} de ${book.name} gerado com sucesso!`,
        'success'
      );

      // Refresh all data
      await fetchData();
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const message = axiosError.response?.data?.message || 'Erro ao gerar audiobook. Tente novamente.';
      showToast(message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted text-sm">Carregando livro...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-error/40 bg-error/10 px-8 py-6 text-center">
          <svg className="mx-auto h-10 w-10 text-error mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-error font-medium">{error || 'Livro não encontrado'}</p>
          <Link
            href="/books"
            className="mt-4 inline-block rounded-lg bg-error/20 px-4 py-2 text-sm text-error hover:bg-error/30 transition-colors"
          >
            Voltar para a lista
          </Link>
        </div>
      </div>
    );
  }

  const progress = book.totalChapters > 0
    ? Math.round((book.currentChapter / book.totalChapters) * 100)
    : 0;

  return (
    <div>
      {/* Back button */}
      <Link
        href="/books"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Voltar para a lista
      </Link>

      {/* Book header */}
      <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-xl p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{book.name}</h1>
                <span className="text-sm text-muted uppercase tracking-wider">{book.abbrev}</span>
              </div>
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-2 self-start rounded-xl px-4 py-2 text-sm font-semibold ${book.isCompleted
                ? 'bg-success/10 border border-success/30 text-success'
                : 'bg-primary/10 border border-primary/30 text-primary-light'
              }`}
          >
            {book.isCompleted ? (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Audiobook Completo
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Em Progresso
              </>
            )}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted">Progresso de Geração</span>
            <span className="text-sm font-bold text-foreground">{progress}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-border">
            <div
              className={`h-full rounded-full transition-all duration-700 ${book.isCompleted
                  ? 'bg-gradient-to-r from-success to-green-400'
                  : 'bg-gradient-to-r from-primary to-primary-light'
                }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted">
            {book.currentChapter} de {book.totalChapters} capítulos gerados
          </p>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <InfoCard
          label="Total de Capítulos"
          value={book.totalChapters.toString()}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
          }
        />
        <InfoCard
          label="Capítulos Gerados"
          value={book.currentChapter.toString()}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="success"
        />
        <InfoCard
          label="Próximo Capítulo"
          value={book.isCompleted ? '—' : book.nextChapter.toString()}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z" />
            </svg>
          }
          color="primary"
        />
        <InfoCard
          label="Restantes"
          value={(book.totalChapters - book.currentChapter).toString()}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="warning"
        />
      </div>

      {/* Generated chapters */}
      {audiobooks.length > 0 && (
        <div className="rounded-2xl border border-border bg-card/50 p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-primary-light" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
            Capítulos Gerados
          </h2>
          <div className="space-y-3">
            {audiobooks.map((audiobook) => (
              <div
                key={audiobook.id}
                className="rounded-xl border border-border bg-background/30 p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary-light text-sm font-bold">
                    {audiobook.chapter}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    Capítulo {audiobook.chapter}
                  </span>
                </div>
                <AudioPlayer
                  streamEndpoint={`/api/audiobooks/${audiobook.id}/stream`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate button */}
      <div className="rounded-2xl border border-border bg-card/50 p-6">
        {book.isCompleted ? (
          <div className="text-center py-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-4">
              <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Audiobook Completo!
            </h3>
            <p className="text-sm text-muted">
              Todos os {book.totalChapters} capítulos do livro de {book.name} já foram gerados.
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Gerar Próximo Capítulo
            </h3>
            <p className="text-sm text-muted mb-6">
              Capítulo {book.nextChapter} de {book.totalChapters} — {book.name}
            </p>
            <button
              id="generate-audiobook"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner size="sm" />
                  Gerando capítulo {book.nextChapter}...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                  Gerar Capítulo {book.nextChapter}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon,
  color = 'default',
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: 'default' | 'success' | 'primary' | 'warning';
}) {
  const colorClasses = {
    default: 'text-muted',
    success: 'text-success',
    primary: 'text-primary-light',
    warning: 'text-warning',
  };

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className={`mb-2 ${colorClasses[color]}`}>{icon}</div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted mt-0.5">{label}</p>
    </div>
  );
}
