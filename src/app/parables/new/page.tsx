'use client';

import { FormEvent, useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  ApiErrorResponse,
  ParableResponse,
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

const CATEGORIAS = [
  'Parábolas de Jesus',
  'Parábolas de misericórdia',
  'Parábolas do Reino',
];

const PERFIS_ALVO = ['Todos', 'Pai', 'Mãe', 'Filho', 'Filha', 'Família'];

export default function NewParablePage() {
  const router = useRouter();

  const [titulo, setTitulo] = useState('');
  const [referencia, setReferencia] = useState('');
  const [categoria, setCategoria] = useState('');
  const [perfilAlvo, setPerfilAlvo] = useState('');
  const [duracaoEstimada, setDuracaoEstimada] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [coverImage, setCoverImage] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverPreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

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

    if (!titulo.trim()) errors.push({ field: 'titulo', message: 'Titulo e obrigatorio' });
    if (!referencia.trim()) errors.push({ field: 'referencia', message: 'Referência é obrigatória' });
    if (!categoria) errors.push({ field: 'categoria', message: 'Categoria e obrigatoria' });
    if (!perfilAlvo) errors.push({ field: 'perfil_alvo', message: 'Perfil alvo e obrigatorio' });
    if (!duracaoEstimada || Number(duracaoEstimada) <= 0) {
      errors.push({ field: 'duracao_estimada_minutos', message: 'Duração deve ser maior que 0' });
    }
    if (!conteudo.trim()) errors.push({ field: 'segmentos_de_texto', message: 'Conteudo e obrigatorio' });
    if (!selectedVoiceId) errors.push({ field: 'voice_id', message: 'Selecione uma voz' });

    if (errors.length > 0) {
      setFieldErrors(errors);
      return;
    }

    const segmentos = conteudo
      .split(/\n\s*\n/)
      .map((segmento) => segmento.trim())
      .filter((segmento) => segmento.length > 0);

    if (segmentos.length === 0) {
      setFieldErrors([{ field: 'segmentos_de_texto', message: 'Insira pelo menos um parágrafo de conteúdo' }]);
      return;
    }

    setIsLoading(true);

    try {
      await api.post<ParableResponse>('/api/parables/generate', {
        titulo: titulo.trim(),
        referencia: referencia.trim(),
        categoria,
        perfil_alvo: perfilAlvo,
        duracao_estimada_minutos: Number(duracaoEstimada),
        segmentos_de_texto: segmentos,
        voice_id: selectedVoiceId,
        ...(coverImage ? { cover_image: coverImage } : {}),
      });

      showToast('Parábola criada com sucesso!', 'success');
      router.push('/parables');
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const data = axiosError.response?.data;
      if (data?.errors) {
        setFieldErrors(data.errors);
      }
      setError(data?.message || 'Erro ao criar parabola. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/parables"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Voltar para a lista
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Nova Parábola</h1>
        <p className="mt-1 text-sm text-muted">
          Crie um audiobook baseado em uma parábola bíblica
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
          <label htmlFor="titulo" className="mb-1.5 block text-sm font-medium text-muted">
            Título da Parábola
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
              placeholder="Ex: O Bom Samaritano"
              disabled={isLoading}
            />
            {getFieldError('titulo') && (
              <p className="mt-1 text-xs text-error">{getFieldError('titulo')}</p>
            )}
          </div>

          <div>
            <label htmlFor="referencia" className="mb-1.5 block text-sm font-medium text-muted">
              Referência
            </label>
            <input
              id="referencia"
              type="text"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted/50 transition-colors focus:outline-none ${getFieldError('referencia')
                ? 'border-error focus:border-error'
                : 'border-input-border focus:border-input-focus'
                }`}
              placeholder="Ex: Lucas 10:25-37"
              disabled={isLoading}
            />
            {getFieldError('referencia') && (
              <p className="mt-1 text-xs text-error">{getFieldError('referencia')}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="categoria" className="mb-1.5 block text-sm font-medium text-muted">
                Categoria
              </label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className={`w-full appearance-none cursor-pointer rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground transition-colors focus:outline-none ${getFieldError('categoria')
                  ? 'border-error focus:border-error'
                  : 'border-input-border focus:border-input-focus'
                  } ${!categoria ? 'text-muted/50' : ''}`}
                disabled={isLoading}
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {getFieldError('categoria') && (
                <p className="mt-1 text-xs text-error">{getFieldError('categoria')}</p>
              )}
            </div>

            <div>
              <label htmlFor="perfil-alvo" className="mb-1.5 block text-sm font-medium text-muted">
                Perfil Alvo
              </label>
              <select
                id="perfil-alvo"
                value={perfilAlvo}
                onChange={(e) => setPerfilAlvo(e.target.value)}
                className={`w-full appearance-none cursor-pointer rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground transition-colors focus:outline-none ${getFieldError('perfil_alvo')
                  ? 'border-error focus:border-error'
                  : 'border-input-border focus:border-input-focus'
                  } ${!perfilAlvo ? 'text-muted/50' : ''}`}
                disabled={isLoading}
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {PERFIS_ALVO.map((perfil) => (
                  <option key={perfil} value={perfil}>
                    {perfil}
                  </option>
                ))}
              </select>
              {getFieldError('perfil_alvo') && (
                <p className="mt-1 text-xs text-error">{getFieldError('perfil_alvo')}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="duracao-estimada"
              className="mb-1.5 block text-sm font-medium text-muted"
            >
              Duração estimada (minutos)
            </label>
            <input
              id="duracao-estimada"
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

          <div>
            <label htmlFor="voice-select" className="mb-1.5 block text-sm font-medium text-muted">
              Voz para geração
            </label>
            <select
              id="voice-select"
              value={selectedVoiceId}
              onChange={(e) => setSelectedVoiceId(e.target.value)}
              className={`w-full appearance-none cursor-pointer rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground transition-colors focus:outline-none ${getFieldError('voice_id')
                ? 'border-error focus:border-error'
                : 'border-input-border focus:border-input-focus'
                } ${!selectedVoiceId ? 'text-muted/50' : ''}`}
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
              <p className="mt-1.5 text-xs text-warning">Nenhuma voz cadastrada. Cadastre uma voz primeiro.</p>
            )}
          </div>

          <div>
            <label htmlFor="conteudo" className="mb-1.5 block text-sm font-medium text-muted">
              Conteúdo
            </label>
            <textarea
              id="conteudo"
              rows={10}
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              className={`w-full resize-y rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted/50 transition-colors focus:outline-none ${getFieldError('segmentos_de_texto')
                ? 'border-error focus:border-error'
                : 'border-input-border focus:border-input-focus'
                }`}
              placeholder="Escreva o texto da parábola. Separe os segmentos com uma linha em branco entre eles.

Ex:
Um homem descia de Jerusalém para Jericó e caiu nas mãos dos salteadores.

Passaram um sacerdote e um levita, mas nenhum o ajudou.

Então um samaritano, vendo-o, moveu-se de íntima compaixão e cuidou dele."
              disabled={isLoading}
            />
            {getFieldError('segmentos_de_texto') && (
              <p className="mt-1 text-xs text-error">{getFieldError('segmentos_de_texto')}</p>
            )}
            <p className="mt-1.5 text-xs text-muted">
              Separe os segmentos com uma linha em branco. Cada paragrafo sera um segmento do audiobook.
            </p>
          </div>

          <div>
            <label htmlFor="cover-image" className="mb-1.5 block text-sm font-medium text-muted">
              Imagem de capa (opcional)
            </label>
            <div className="relative">
              <input
                id="cover-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
                className="hidden"
              />
              <label
                htmlFor="cover-image"
                className="flex items-center justify-center gap-2 w-full cursor-pointer rounded-xl border border-dashed border-input-border bg-input-bg px-4 py-3 text-sm text-muted transition-colors hover:border-primary/50 hover:text-foreground"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
                {coverPreview ? 'Trocar imagem' : 'Selecionar imagem'}
              </label>
            </div>
            {coverPreview && (
              <div className="mt-3 relative">
                <img src={coverPreview} alt="Preview" className="h-40 w-full rounded-lg border border-border object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImage('');
                    setCoverPreview('');
                  }}
                  className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-error/80 text-xs text-white transition-colors hover:bg-error"
                >
                  X
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/parables"
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-card-hover hover:text-foreground"
            >
              Cancelar
            </Link>
            <button
              id="create-parable-submit"
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:brightness-110 hover:shadow-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
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
