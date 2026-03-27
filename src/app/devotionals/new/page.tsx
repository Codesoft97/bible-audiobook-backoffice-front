'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/loading-spinner';
import { showToast } from '@/components/toast';
import {
  DEVOTIONAL_MONTHS,
  DEVOTIONAL_TARGET_PROFILES,
  DEVOTIONAL_WEEK_OPTIONS,
  getDevotionalDayPlan,
  getDevotionalDaysForMonth,
  getDevotionalMonthPlan,
  getDevotionalWeekPlan,
} from '@/lib/devotionals';
import api from '@/lib/api';
import {
  ApiErrorResponse,
  DailyDevotionalResponse,
  Voice,
  VoicesResponse,
} from '@/types';

interface FieldError {
  field: string;
  message: string;
}

function splitSegments(value: string) {
  return value
    .split(/\n\s*\n/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
}

export default function NewDevotionalPage() {
  const router = useRouter();

  const [titulo, setTitulo] = useState('');
  const [mes, setMes] = useState('');
  const [semana, setSemana] = useState('');
  const [dia, setDia] = useState('');
  const [assuntoMes, setAssuntoMes] = useState('');
  const [assuntoSemana, setAssuntoSemana] = useState('');
  const [perfilAlvo, setPerfilAlvo] = useState('Todos');
  const [referencia, setReferencia] = useState('');
  const [textoLeitura, setTextoLeitura] = useState('');
  const [oracaoLeitura, setOracaoLeitura] = useState('');
  const [textoAudio, setTextoAudio] = useState('');
  const [oracaoAudio, setOracaoAudio] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [coverImage, setCoverImage] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const selectedMonthPlan = useMemo(() => getDevotionalMonthPlan(mes), [mes]);
  const selectedWeekPlan = useMemo(
    () => (mes && semana ? getDevotionalWeekPlan(mes, semana) : undefined),
    [mes, semana]
  );
  const selectedDayPlan = useMemo(
    () => (mes && dia ? getDevotionalDayPlan(mes, Number(dia)) : undefined),
    [mes, dia]
  );
  const dayOptions = useMemo(() => (mes ? getDevotionalDaysForMonth(mes) : []), [mes]);

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

  useEffect(() => {
    if (!mes) {
      setAssuntoMes('');
      return;
    }

    const monthPlan = getDevotionalMonthPlan(mes);
    setAssuntoMes(monthPlan?.assuntoMes ?? '');

    if (dia && monthPlan && Number(dia) > monthPlan.totalDays) {
      setDia('');
    }
  }, [dia, mes]);

  useEffect(() => {
    const monthPlan = getDevotionalMonthPlan(mes);

    if (!monthPlan || monthPlan.weeks.length > 0) return;

    setAssuntoSemana('');
    setTitulo('');
    setReferencia('');
  }, [mes]);

  useEffect(() => {
    if (selectedWeekPlan) {
      setAssuntoSemana(selectedWeekPlan.title);
    }
  }, [selectedWeekPlan]);

  useEffect(() => {
    if (!selectedDayPlan) return;

    setSemana(selectedDayPlan.week);
    setTitulo(selectedDayPlan.title);
    setReferencia(selectedDayPlan.reference);

    const weekPlan = getDevotionalWeekPlan(mes, selectedDayPlan.week);
    if (weekPlan) {
      setAssuntoSemana(weekPlan.title);
    }
  }, [mes, selectedDayPlan]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverPreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const getFieldError = (field: string) =>
    fieldErrors.find((fieldError) => fieldError.field === field)?.message;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);

    const errors: FieldError[] = [];
    const parsedDay = Number(dia);

    if (!titulo.trim()) errors.push({ field: 'titulo', message: 'Titulo e obrigatorio' });
    if (!mes) errors.push({ field: 'mes', message: 'Mes e obrigatorio' });
    if (!semana) errors.push({ field: 'semana', message: 'Semana e obrigatoria' });
    if (!dia || parsedDay <= 0) {
      errors.push({ field: 'dia', message: 'Dia deve ser maior que 0' });
    }
    if (selectedMonthPlan && parsedDay > selectedMonthPlan.totalDays) {
      errors.push({
        field: 'dia',
        message: `O mes selecionado permite ate ${selectedMonthPlan.totalDays} dias`,
      });
    }
    if (!assuntoMes.trim()) {
      errors.push({ field: 'assunto_mes', message: 'Assunto do mes e obrigatorio' });
    }
    if (!assuntoSemana.trim()) {
      errors.push({ field: 'assunto_semana', message: 'Assunto da semana e obrigatorio' });
    }
    if (!perfilAlvo) {
      errors.push({ field: 'perfil_alvo', message: 'Perfil alvo e obrigatorio' });
    }
    if (!referencia.trim()) {
      errors.push({ field: 'referencia', message: 'Referencia e obrigatoria' });
    }
    if (!textoLeitura.trim()) {
      errors.push({ field: 'texto_leitura', message: 'Texto de leitura e obrigatorio' });
    }
    if (!oracaoLeitura.trim()) {
      errors.push({ field: 'oracao_leitura', message: 'Oracao de leitura e obrigatoria' });
    }
    if (!textoAudio.trim()) {
      errors.push({
        field: 'segmentos_de_texto_audio',
        message: 'Informe os segmentos do audio da leitura',
      });
    }
    if (!oracaoAudio.trim()) {
      errors.push({
        field: 'segmentos_de_oracao_audio',
        message: 'Informe os segmentos do audio da oracao',
      });
    }
    if (!selectedVoiceId) {
      errors.push({ field: 'voice_id', message: 'Selecione uma voz' });
    }

    if (errors.length > 0) {
      setFieldErrors(errors);
      return;
    }

    const segmentosDeTextoAudio = splitSegments(textoAudio);
    const segmentosDeOracaoAudio = splitSegments(oracaoAudio);

    if (segmentosDeTextoAudio.length === 0 || segmentosDeOracaoAudio.length === 0) {
      setFieldErrors([
        ...(segmentosDeTextoAudio.length === 0
          ? [
              {
                field: 'segmentos_de_texto_audio',
                message: 'Insira pelo menos um segmento para o audio da leitura',
              },
            ]
          : []),
        ...(segmentosDeOracaoAudio.length === 0
          ? [
              {
                field: 'segmentos_de_oracao_audio',
                message: 'Insira pelo menos um segmento para o audio da oracao',
              },
            ]
          : []),
      ]);
      return;
    }

    setIsLoading(true);

    try {
      await api.post<DailyDevotionalResponse>('/api/devotionals/generate', {
        titulo: titulo.trim(),
        mes,
        semana,
        dia: parsedDay,
        assunto_mes: assuntoMes.trim(),
        assunto_semana: assuntoSemana.trim(),
        perfil_alvo: perfilAlvo,
        referencia: referencia.trim(),
        texto_leitura: textoLeitura.trim(),
        oracao_leitura: oracaoLeitura.trim(),
        segmentos_de_texto_audio: segmentosDeTextoAudio,
        segmentos_de_oracao_audio: segmentosDeOracaoAudio,
        voice_id: selectedVoiceId,
        ...(coverImage ? { cover_image: coverImage } : {}),
      });

      showToast('Devocional criado com sucesso!', 'success');
      router.push('/devotionals');
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const data = axiosError.response?.data;
      if (data?.errors) {
        setFieldErrors(data.errors);
      }
      setError(data?.message || 'Erro ao criar devocional. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/devotionals"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Voltar para a lista
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Novo Devocional</h1>
        <p className="mt-1 text-sm text-muted">
          Monte a leitura, a oração e os dois áudios seguindo o plano anual de 365 dias
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Plano anual</h2>
            <p className="mt-1 text-xs text-muted">
              Os assuntos do mes sao preenchidos automaticamente. Janeiro ja conta com a
              estrutura detalhada de semanas e dias para acelerar o cadastro.
            </p>
          </div>
          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-light">
            A Jornada
          </span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {DEVOTIONAL_MONTHS.map((month) => (
            <div
              key={month.value}
              className={`rounded-xl border px-3 py-2 transition-colors ${mes === month.value ? 'border-primary/40 bg-primary/10' : 'border-border bg-card/40'}`}
            >
              <p className="text-xs font-semibold text-foreground">{month.label}</p>
              <p className="mt-1 text-xs text-muted">{month.assuntoMes}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/50 p-8 shadow-2xl shadow-black/10 backdrop-blur-xl">
        {error && (
          <div className="mb-6 rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="devotional-titulo" className="mb-1.5 block text-sm font-medium text-muted">
              Titulo do devocional
            </label>
            <input
              id="devotional-titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted/50 transition-colors focus:outline-none ${getFieldError('titulo') ? 'border-error focus:border-error' : 'border-input-border focus:border-input-focus'}`}
              placeholder="Ex: Esquecendo o Que Ficou Para Tras"
              disabled={isLoading}
            />
            {getFieldError('titulo') && (
              <p className="mt-1 text-xs text-error">{getFieldError('titulo')}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="devotional-mes" className="mb-1.5 block text-sm font-medium text-muted">
                Mes
              </label>
              <select
                id="devotional-mes"
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className={`w-full cursor-pointer appearance-none rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground transition-colors focus:outline-none ${getFieldError('mes') ? 'border-error focus:border-error' : 'border-input-border focus:border-input-focus'} ${!mes ? 'text-muted/50' : ''}`}
                disabled={isLoading}
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {DEVOTIONAL_MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              {getFieldError('mes') && (
                <p className="mt-1 text-xs text-error">{getFieldError('mes')}</p>
              )}
            </div>

            <div>
              <label htmlFor="devotional-semana" className="mb-1.5 block text-sm font-medium text-muted">
                Semana
              </label>
              <select
                id="devotional-semana"
                value={semana}
                onChange={(e) => setSemana(e.target.value)}
                className={`w-full cursor-pointer appearance-none rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground transition-colors focus:outline-none ${getFieldError('semana') ? 'border-error focus:border-error' : 'border-input-border focus:border-input-focus'} ${!semana ? 'text-muted/50' : ''}`}
                disabled={isLoading}
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {DEVOTIONAL_WEEK_OPTIONS.map((week) => (
                  <option key={week} value={week}>
                    Semana {week}
                  </option>
                ))}
              </select>
              {getFieldError('semana') && (
                <p className="mt-1 text-xs text-error">{getFieldError('semana')}</p>
              )}
            </div>

            <div>
              <label htmlFor="devotional-dia" className="mb-1.5 block text-sm font-medium text-muted">
                Dia
              </label>
              <select
                id="devotional-dia"
                value={dia}
                onChange={(e) => setDia(e.target.value)}
                className={`w-full cursor-pointer appearance-none rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground transition-colors focus:outline-none ${getFieldError('dia') ? 'border-error focus:border-error' : 'border-input-border focus:border-input-focus'} ${!dia ? 'text-muted/50' : ''}`}
                disabled={isLoading || !mes}
              >
                <option value="" disabled>
                  {mes ? 'Selecione...' : 'Escolha o mes primeiro'}
                </option>
                {dayOptions.map((dayOption) => (
                  <option key={dayOption} value={dayOption}>
                    Dia {dayOption}
                  </option>
                ))}
              </select>
              {getFieldError('dia') && (
                <p className="mt-1 text-xs text-error">{getFieldError('dia')}</p>
              )}
            </div>
          </div>

          {(selectedMonthPlan || selectedWeekPlan || selectedDayPlan) && (
            <div className="rounded-xl border border-border bg-background/40 px-4 py-4">
              <h2 className="text-sm font-semibold text-foreground">Contexto do plano</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted">Mes</p>
                  <p className="mt-1 text-sm text-foreground">
                    {selectedMonthPlan?.assuntoMes || 'Preencha manualmente'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted">Semana</p>
                  <p className="mt-1 text-sm text-foreground">
                    {selectedWeekPlan?.title || 'Sem detalhamento automatico'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted">Dia</p>
                  <p className="mt-1 text-sm text-foreground">
                    {selectedDayPlan
                      ? `${selectedDayPlan.title} (${selectedDayPlan.reference})`
                      : 'Sem sugestao automatica para o dia'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="devotional-assunto-mes" className="mb-1.5 block text-sm font-medium text-muted">
                Assunto do mes
              </label>
              <input
                id="devotional-assunto-mes"
                type="text"
                value={assuntoMes}
                onChange={(e) => setAssuntoMes(e.target.value)}
                className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted/50 transition-colors focus:outline-none ${getFieldError('assunto_mes') ? 'border-error focus:border-error' : 'border-input-border focus:border-input-focus'}`}
                placeholder="Ex: Novos Comecos e Fundacoes"
                disabled={isLoading}
              />
              {getFieldError('assunto_mes') && (
                <p className="mt-1 text-xs text-error">{getFieldError('assunto_mes')}</p>
              )}
            </div>

            <div>
              <label htmlFor="devotional-assunto-semana" className="mb-1.5 block text-sm font-medium text-muted">
                Assunto da semana
              </label>
              <input
                id="devotional-assunto-semana"
                type="text"
                value={assuntoSemana}
                onChange={(e) => setAssuntoSemana(e.target.value)}
                className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted/50 transition-colors focus:outline-none ${getFieldError('assunto_semana') ? 'border-error focus:border-error' : 'border-input-border focus:border-input-focus'}`}
                placeholder="Ex: Deixando o Passado e Abracando o Novo"
                disabled={isLoading}
              />
              {getFieldError('assunto_semana') && (
                <p className="mt-1 text-xs text-error">{getFieldError('assunto_semana')}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="devotional-referencia" className="mb-1.5 block text-sm font-medium text-muted">
                Referencia
              </label>
              <input
                id="devotional-referencia"
                type="text"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted/50 transition-colors focus:outline-none ${getFieldError('referencia') ? 'border-error focus:border-error' : 'border-input-border focus:border-input-focus'}`}
                placeholder="Ex: Filipenses 3:13-14; Lucas 9:62"
                disabled={isLoading}
              />
              {getFieldError('referencia') && (
                <p className="mt-1 text-xs text-error">{getFieldError('referencia')}</p>
              )}
            </div>

            <div>
              <label htmlFor="devotional-perfil" className="mb-1.5 block text-sm font-medium text-muted">
                Perfil alvo
              </label>
              <select
                id="devotional-perfil"
                value={perfilAlvo}
                onChange={(e) => setPerfilAlvo(e.target.value)}
                className={`w-full cursor-pointer appearance-none rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground transition-colors focus:outline-none ${getFieldError('perfil_alvo') ? 'border-error focus:border-error' : 'border-input-border focus:border-input-focus'}`}
                disabled={isLoading}
              >
                {DEVOTIONAL_TARGET_PROFILES.map((perfil) => (
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
            <label htmlFor="devotional-texto-leitura" className="mb-1.5 block text-sm font-medium text-muted">
              Texto de leitura
            </label>
            <textarea
              id="devotional-texto-leitura"
              rows={8}
              value={textoLeitura}
              onChange={(e) => setTextoLeitura(e.target.value)}
              className={`w-full resize-y rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted/50 transition-colors focus:outline-none ${getFieldError('texto_leitura') ? 'border-error focus:border-error' : 'border-input-border focus:border-input-focus'}`}
              placeholder="Escreva a leitura completa do devocional."
              disabled={isLoading}
            />
            {getFieldError('texto_leitura') && (
              <p className="mt-1 text-xs text-error">{getFieldError('texto_leitura')}</p>
            )}
          </div>

          <div>
            <label htmlFor="devotional-oracao-leitura" className="mb-1.5 block text-sm font-medium text-muted">
              Oracao de leitura
            </label>
            <textarea
              id="devotional-oracao-leitura"
              rows={5}
              value={oracaoLeitura}
              onChange={(e) => setOracaoLeitura(e.target.value)}
              className={`w-full resize-y rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted/50 transition-colors focus:outline-none ${getFieldError('oracao_leitura') ? 'border-error focus:border-error' : 'border-input-border focus:border-input-focus'}`}
              placeholder="Escreva a oracao que sera lida ao final do devocional."
              disabled={isLoading}
            />
            {getFieldError('oracao_leitura') && (
              <p className="mt-1 text-xs text-error">{getFieldError('oracao_leitura')}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div>
              <label htmlFor="devotional-texto-audio" className="mb-1.5 block text-sm font-medium text-muted">
                Segmentos do audio da leitura
              </label>
              <textarea
                id="devotional-texto-audio"
                rows={8}
                value={textoAudio}
                onChange={(e) => setTextoAudio(e.target.value)}
                className={`w-full resize-y rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted/50 transition-colors focus:outline-none ${getFieldError('segmentos_de_texto_audio') ? 'border-error focus:border-error' : 'border-input-border focus:border-input-focus'}`}
                placeholder={`Separe os segmentos com uma linha em branco.\n\nEx:\nEsquecendo o Que Ficou Para Tras.\n\nEsquecendo-me das coisas que para tras ficam e avancando para as que estao diante de mim, prossigo para o alvo.`}
                disabled={isLoading}
              />
              {getFieldError('segmentos_de_texto_audio') && (
                <p className="mt-1 text-xs text-error">{getFieldError('segmentos_de_texto_audio')}</p>
              )}
              <p className="mt-1.5 text-xs text-muted">
                Cada paragrafo sera enviado como um segmento independente do audio principal.
              </p>
            </div>

            <div>
              <label htmlFor="devotional-oracao-audio" className="mb-1.5 block text-sm font-medium text-muted">
                Segmentos do audio da oracao
              </label>
              <textarea
                id="devotional-oracao-audio"
                rows={8}
                value={oracaoAudio}
                onChange={(e) => setOracaoAudio(e.target.value)}
                className={`w-full resize-y rounded-xl border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted/50 transition-colors focus:outline-none ${getFieldError('segmentos_de_oracao_audio') ? 'border-error focus:border-error' : 'border-input-border focus:border-input-focus'}`}
                placeholder={`Separe os segmentos com uma linha em branco.\n\nEx:\nSenhor, perdoa-me por remoer o passado.\n\nEu escolho hoje esquecer o que ficou para tras e avancar com fe.`}
                disabled={isLoading}
              />
              {getFieldError('segmentos_de_oracao_audio') && (
                <p className="mt-1 text-xs text-error">{getFieldError('segmentos_de_oracao_audio')}</p>
              )}
              <p className="mt-1.5 text-xs text-muted">
                Cada paragrafo sera enviado como um segmento independente do audio da oracao.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="devotional-voice" className="mb-1.5 block text-sm font-medium text-muted">
              Voz para geracao
            </label>
            <select
              id="devotional-voice"
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

          <div>
            <label htmlFor="devotional-cover-image" className="mb-1.5 block text-sm font-medium text-muted">
              Imagem de capa (opcional)
            </label>
            <div className="relative">
              <input
                id="devotional-cover-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
                className="hidden"
              />
              <label
                htmlFor="devotional-cover-image"
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-input-border bg-input-bg px-4 py-3 text-sm text-muted transition-colors hover:border-primary/50 hover:text-foreground"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
                {coverPreview ? 'Trocar imagem' : 'Selecionar imagem'}
              </label>
            </div>
            {coverPreview && (
              <div className="relative mt-3">
                <img
                  src={coverPreview}
                  alt="Preview"
                  className="h-48 w-full rounded-lg border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImage('');
                    setCoverPreview('');
                  }}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-error/80 text-xs text-white transition-colors hover:bg-error"
                >
                  X
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/devotionals"
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-card-hover hover:text-foreground"
            >
              Cancelar
            </Link>
            <button
              id="create-devotional-submit"
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:brightness-110 hover:shadow-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Gerando devocional...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                  Gerar Devocional
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
