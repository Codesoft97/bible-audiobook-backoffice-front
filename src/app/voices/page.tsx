'use client';

import { useState, useEffect, FormEvent } from 'react';
import api from '@/lib/api';
import { Voice, VoicesResponse, VoiceCreateResponse, ApiErrorResponse } from '@/types';
import LoadingSpinner from '@/components/loading-spinner';
import { showToast } from '@/components/toast';
import { AxiosError } from 'axios';

interface FieldError {
  field: string;
  message: string;
}

const LANGUAGES = ['Portuguese', 'English', 'Spanish'];

const LANGUAGE_LABELS: Record<string, string> = {
  Portuguese: 'Português',
  English: 'Inglês',
  Spanish: 'Espanhol',
};

export default function VoicesPage() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('');
  const [externalId, setExternalId] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);

  const getFieldError = (field: string) =>
    fieldErrors.find((e) => e.field === field)?.message;

  const fetchVoices = async () => {
    try {
      const response = await api.get<VoicesResponse>('/api/voices');
      setVoices(response.data.data);
    } catch {
      setError('Erro ao carregar as vozes. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVoices();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFieldErrors([]);

    // Client-side validation
    const errors: FieldError[] = [];
    if (!name.trim()) errors.push({ field: 'name', message: 'Nome é obrigatório' });
    if (!language) errors.push({ field: 'language', message: 'Idioma é obrigatório' });
    if (!externalId.trim()) errors.push({ field: 'external_id', message: 'ID da voz é obrigatório' });

    if (errors.length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post<VoiceCreateResponse>('/api/voices', {
        name: name.trim(),
        language,
        external_id: externalId.trim(),
      });

      showToast('Voz cadastrada com sucesso!', 'success');

      // Reset form
      setName('');
      setLanguage('');
      setExternalId('');

      // Refresh list
      await fetchVoices();
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const data = axiosError.response?.data;
      if (data?.errors) {
        setFieldErrors(data.errors);
      }
      setFormError(data?.message || 'Erro ao cadastrar voz. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Vozes</h1>
        <p className="text-muted text-sm mt-1">
          Gerencie as vozes da ElevenLabs para geração de audiobooks
        </p>
      </div>

      {/* Create voice form */}
      <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-xl p-8 shadow-2xl shadow-black/10 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
          <svg className="h-5 w-5 text-primary-light" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Cadastrar Nova Voz
        </h2>

        {formError && (
          <div className="mb-6 rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Name */}
            <div>
              <label htmlFor="voice-name" className="block text-sm font-medium text-muted mb-1.5">
                Nome da Voz
              </label>
              <input
                id="voice-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted/50 transition-colors focus:outline-none ${getFieldError('name')
                  ? 'border-error focus:border-error'
                  : 'border-input-border focus:border-input-focus'
                  }`}
                placeholder="Ex: Adam"
                disabled={isSubmitting}
              />
              {getFieldError('name') && (
                <p className="mt-1 text-xs text-error">{getFieldError('name')}</p>
              )}
            </div>

            {/* Language */}
            <div>
              <label htmlFor="voice-language" className="block text-sm font-medium text-muted mb-1.5">
                Idioma
              </label>
              <select
                id="voice-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground transition-colors focus:outline-none appearance-none cursor-pointer ${getFieldError('language')
                  ? 'border-error focus:border-error'
                  : 'border-input-border focus:border-input-focus'
                  } ${!language ? 'text-muted/50' : ''}`}
                disabled={isSubmitting}
              >
                <option value="" disabled>Selecione...</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{LANGUAGE_LABELS[lang]}</option>
                ))}
              </select>
              {getFieldError('language') && (
                <p className="mt-1 text-xs text-error">{getFieldError('language')}</p>
              )}
            </div>

            {/* External ID */}
            <div>
              <label htmlFor="voice-external-id" className="block text-sm font-medium text-muted mb-1.5">
                ID da Voz (ElevenLabs)
              </label>
              <input
                id="voice-external-id"
                type="text"
                value={externalId}
                onChange={(e) => setExternalId(e.target.value)}
                className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted/50 transition-colors focus:outline-none ${getFieldError('external_id')
                  ? 'border-error focus:border-error'
                  : 'border-input-border focus:border-input-focus'
                  }`}
                placeholder="Ex: pNInz6obpgDQGcFmaJgB"
                disabled={isSubmitting}
              />
              {getFieldError('external_id') && (
                <p className="mt-1 text-xs text-error">{getFieldError('external_id')}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              id="create-voice-submit"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Cadastrar Voz
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Voices list */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <svg className="h-5 w-5 text-primary-light" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
          Vozes Cadastradas
          <span className="text-sm font-normal text-muted">({voices.length})</span>
        </h2>

        {isLoading ? (
          <div className="flex min-h-[20vh] items-center justify-center">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-muted text-sm">Carregando vozes...</p>
            </div>
          </div>
        ) : error ? (
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
        ) : voices.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card/30 py-16 text-center">
            <svg className="mx-auto h-12 w-12 text-muted/50 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
            <p className="text-muted">Nenhuma voz cadastrada ainda</p>
            <p className="text-muted/60 text-sm mt-1">Use o formulário acima para cadastrar sua primeira voz</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {voices.map((voice) => (
              <VoiceCard key={voice.id} voice={voice} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VoiceCard({ voice }: { voice: Voice }) {
  const languageColors: Record<string, string> = {
    Portuguese: 'bg-green-500/10 text-green-400 border-green-500/20',
    English: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Spanish: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };

  const languageStyle = languageColors[voice.language] || 'bg-primary/10 text-primary-light border-primary/20';

  return (
    <div
      id={`voice-${voice.id}`}
      className="group rounded-2xl border border-border bg-card/50 p-5 transition-all duration-200 hover:border-primary/40 hover:bg-card-hover hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Voice icon + name */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
          <svg className="h-5 w-5 text-primary-light" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-primary-light transition-colors truncate">
            {voice.name}
          </h3>
          <p className="text-xs text-muted font-mono truncate mt-0.5">{voice.externalId}</p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center rounded-lg border px-2 py-1 text-xs font-medium ${languageStyle}`}>
          {LANGUAGE_LABELS[voice.language] || voice.language}
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-xs font-medium text-muted">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {new Date(voice.createdAt).toLocaleDateString('pt-BR')}
        </span>
      </div>
    </div>
  );
}
