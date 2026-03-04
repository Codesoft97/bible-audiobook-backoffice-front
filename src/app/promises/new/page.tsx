'use client';

import { FormEvent, useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  ApiErrorResponse,
  BiblePromiseResponse,
  Voice,
  VoicesResponse,
} from '@/types';
import LoadingSpinner from '@/components/loading-spinner';
import { showToast } from '@/components/toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

interface FieldError {
  field: string;
  message: string;
}

export default function NewPromisePage() {
  const router = useRouter();

  const [book, setBook] = useState('');
  const [chapter, setChapter] = useState('');
  const [verse, setVerse] = useState('');
  const [category, setCategory] = useState('');
  const [promiseText, setPromiseText] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await api.get<VoicesResponse>('/api/voices');
        setVoices(response.data.data);
      } catch {
        // voices list can stay empty
      }
    };

    fetchVoices();
  }, []);

  const getFieldError = (field: string) =>
    fieldErrors.find((fieldError) => fieldError.field === field)?.message;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);

    const errors: FieldError[] = [];

    if (!book.trim()) errors.push({ field: 'book', message: 'Livro e obrigatorio' });
    if (!chapter || Number(chapter) <= 0) {
      errors.push({ field: 'chapter', message: 'Capitulo deve ser maior que 0' });
    }
    if (!verse || Number(verse) <= 0) {
      errors.push({ field: 'verse', message: 'Versiculo deve ser maior que 0' });
    }
    if (!category.trim()) {
      errors.push({ field: 'category', message: 'Categoria e obrigatoria' });
    }
    if (!promiseText.trim()) {
      errors.push({ field: 'promise', message: 'Texto da promessa e obrigatorio' });
    }
    if (!selectedVoiceId) {
      errors.push({ field: 'voice_id', message: 'Selecione uma voz' });
    }

    if (errors.length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      await api.post<BiblePromiseResponse>('/api/bible-promises/generate', {
        book: book.trim(),
        chapter: Number(chapter),
        verse: Number(verse),
        category: category.trim(),
        promise: promiseText.trim(),
        voice_id: selectedVoiceId,
      });

      showToast('Promessa criada com sucesso!', 'success');
      router.push('/promises');
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const data = axiosError.response?.data;
      if (data?.errors) {
        setFieldErrors(data.errors);
      }
      setError(data?.message || 'Erro ao criar promessa. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/promises"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Voltar para a lista
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Nova Promessa</h1>
        <p className="mt-1 text-sm text-muted">
          Gere o audio de uma promessa biblica usando a voz selecionada
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card/50 p-8 shadow-2xl shadow-black/10 backdrop-blur-xl">
        {error && (
          <div className="mb-6 rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="promise-book" className="mb-1.5 block text-sm font-medium text-muted">
              Livro
            </label>
            <input
              id="promise-book"
              type="text"
              value={book}
              onChange={(e) => setBook(e.target.value)}
              className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted/50 transition-colors focus:outline-none ${getFieldError('book') ? 'border-error focus:border-error' : 'border-input-border focus:border-input-focus'}`}
              placeholder="Ex: Isaias"
              disabled={isLoading}
            />
            {getFieldError('book') && (
              <p className="mt-1 text-xs text-error">{getFieldError('book')}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="promise-chapter" className="mb-1.5 block text-sm font-medium text-muted">
                Capitulo
              </label>
              <input
                id="promise-chapter"
                type="number"
                min="1"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted/50 transition-colors focus:outline-none ${getFieldError('chapter') ? 'border-error focus:border-error' : 'border-input-border focus:border-input-focus'}`}
                placeholder="Ex: 41"
                disabled={isLoading}
              />
              {getFieldError('chapter') && (
                <p className="mt-1 text-xs text-error">{getFieldError('chapter')}</p>
              )}
            </div>

            <div>
              <label htmlFor="promise-verse" className="mb-1.5 block text-sm font-medium text-muted">
                Versiculo
              </label>
              <input
                id="promise-verse"
                type="number"
                min="1"
                value={verse}
                onChange={(e) => setVerse(e.target.value)}
                className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted/50 transition-colors focus:outline-none ${getFieldError('verse') ? 'border-error focus:border-error' : 'border-input-border focus:border-input-focus'}`}
                placeholder="Ex: 10"
                disabled={isLoading}
              />
              {getFieldError('verse') && (
                <p className="mt-1 text-xs text-error">{getFieldError('verse')}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="promise-category" className="mb-1.5 block text-sm font-medium text-muted">
              Categoria
            </label>
            <input
              id="promise-category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted/50 transition-colors focus:outline-none ${getFieldError('category') ? 'border-error focus:border-error' : 'border-input-border focus:border-input-focus'}`}
              placeholder="Ex: Coragem"
              disabled={isLoading}
            />
            {getFieldError('category') && (
              <p className="mt-1 text-xs text-error">{getFieldError('category')}</p>
            )}
          </div>

          <div>
            <label htmlFor="promise-text" className="mb-1.5 block text-sm font-medium text-muted">
              Promessa em texto
            </label>
            <textarea
              id="promise-text"
              rows={6}
              value={promiseText}
              onChange={(e) => setPromiseText(e.target.value)}
              className={`w-full resize-y rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted/50 transition-colors focus:outline-none ${getFieldError('promise') ? 'border-error focus:border-error' : 'border-input-border focus:border-input-focus'}`}
              placeholder="Ex: Nao temas, porque eu sou contigo..."
              disabled={isLoading}
            />
            {getFieldError('promise') && (
              <p className="mt-1 text-xs text-error">{getFieldError('promise')}</p>
            )}
          </div>

          <div>
            <label htmlFor="promise-voice" className="mb-1.5 block text-sm font-medium text-muted">
              Voz para geracao
            </label>
            <select
              id="promise-voice"
              value={selectedVoiceId}
              onChange={(e) => setSelectedVoiceId(e.target.value)}
              className={`w-full cursor-pointer appearance-none rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground transition-colors focus:outline-none ${getFieldError('voice_id') ? 'border-error focus:border-error' : 'border-input-border focus:border-input-focus'} ${!selectedVoiceId ? 'text-muted/50' : ''}`}
              disabled={isLoading}
            >
              <option value="" disabled>
                Selecione uma voz...
              </option>
              {voices.map((voice) => (
                <option key={voice.id} value={voice.externalId}>
                  {voice.name} ({voice.language})
                </option>
              ))}
            </select>
            {getFieldError('voice_id') && (
              <p className="mt-1 text-xs text-error">{getFieldError('voice_id')}</p>
            )}
            {voices.length === 0 && (
              <p className="mt-1.5 text-xs text-warning">
                Nenhuma voz cadastrada. Cadastre uma voz primeiro.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/promises"
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-card-hover hover:text-foreground"
            >
              Cancelar
            </Link>
            <button
              id="create-promise-submit"
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:brightness-110 hover:shadow-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Gerando audio...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                  Gerar Promessa
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
