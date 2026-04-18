'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '@/components/loading-spinner';
import type {
  DashboardContentConsumption,
  DashboardContentConsumptionResponse,
  DashboardEngagement,
  DashboardEngagementResponse,
  DashboardInactiveUser,
  DashboardInactiveUsersResponse,
  DashboardOverview,
  DashboardOverviewResponse,
  DashboardPlan,
  DashboardUser,
  DashboardUsersResponse,
  PaginationMeta,
} from '@/types';

const USER_PAGE_SIZE = 20;
const INACTIVE_PAGE_SIZE = 20;

const emptyPagination: PaginationMeta = {
  page: 1,
  limit: USER_PAGE_SIZE,
  total: 0,
  totalPages: 0,
};

const planLabels: Record<DashboardPlan, string> = {
  free: 'Gratuito',
  free_trial: 'Teste grátis',
  paid: 'Pago',
};

const planStyles: Record<DashboardPlan, string> = {
  free: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
  free_trial: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  paid: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
};

const contentTypeLabels: Record<string, string> = {
  audiobook: 'Audiobook',
  parable: 'Parábola',
  teaching: 'Ensinamento',
  'character-journey': 'Jornada',
  'bible-promise': 'Promessa',
};

const contentTypeOptions = [
  { value: 'all', label: 'Todos os conteúdos' },
  { value: 'audiobook', label: 'Audiobooks' },
  { value: 'parable', label: 'Parábolas' },
  { value: 'teaching', label: 'Ensinamentos' },
  { value: 'character-journey', label: 'Jornadas' },
  { value: 'bible-promise', label: 'Promessas' },
];

type ActivityFilter = 'all' | 'true' | 'false';

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat('pt-BR').format(value ?? 0);
}

function formatPercent(value: number | null | undefined) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value ?? 0);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Sem atividade';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data inválida';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function getContentTypeLabel(type: string) {
  return contentTypeLabels[type] || type;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

async function dashboardGet<T>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {}
) {
  const response = await fetch(`/api/dashboard/${endpoint}${buildQuery(params)}`, {
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => null);

  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('user');
    await fetch('/api/auth/clear-token', { method: 'POST' }).catch(() => {});
    window.location.href = '/login';
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!response.ok) {
    const message =
      typeof payload?.message === 'string'
        ? payload.message
        : 'Não foi possível carregar os dados do dashboard.';
    throw new Error(message);
  }

  return payload as T;
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [content, setContent] = useState<DashboardContentConsumption | null>(null);
  const [engagement, setEngagement] = useState<DashboardEngagement | null>(null);
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [usersPagination, setUsersPagination] =
    useState<PaginationMeta>(emptyPagination);
  const [inactiveUsers, setInactiveUsers] = useState<DashboardInactiveUser[]>([]);
  const [inactivePagination, setInactivePagination] = useState<PaginationMeta>({
    ...emptyPagination,
    limit: INACTIVE_PAGE_SIZE,
  });

  const [planFilter, setPlanFilter] = useState<'all' | DashboardPlan>('all');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [usersPage, setUsersPage] = useState(1);
  const [inactivePage, setInactivePage] = useState(1);

  const [isMetricsLoading, setIsMetricsLoading] = useState(true);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [isInactiveLoading, setIsInactiveLoading] = useState(true);
  const [metricsError, setMetricsError] = useState('');
  const [usersError, setUsersError] = useState('');
  const [inactiveError, setInactiveError] = useState('');

  const loadMetrics = useCallback(async () => {
    setIsMetricsLoading(true);
    setMetricsError('');

    try {
      const periodParams = {
        startDate,
        endDate,
      };
      const contentParams = {
        ...periodParams,
        contentType: contentTypeFilter === 'all' ? undefined : contentTypeFilter,
      };

      const [overviewResponse, contentResponse, engagementResponse] =
        await Promise.all([
          dashboardGet<DashboardOverviewResponse>('overview'),
          dashboardGet<DashboardContentConsumptionResponse>(
            'content-consumption',
            contentParams
          ),
          dashboardGet<DashboardEngagementResponse>('engagement', periodParams),
        ]);

      setOverview(overviewResponse.data);
      setContent(contentResponse.data);
      setEngagement(engagementResponse.data);
    } catch (error) {
      setMetricsError(
        getErrorMessage(error, 'Erro ao carregar métricas do dashboard.')
      );
    } finally {
      setIsMetricsLoading(false);
    }
  }, [contentTypeFilter, endDate, startDate]);

  const loadUsers = useCallback(async () => {
    setIsUsersLoading(true);
    setUsersError('');

    try {
      const response = await dashboardGet<DashboardUsersResponse>('users', {
        page: usersPage,
        limit: USER_PAGE_SIZE,
        plan: planFilter === 'all' ? undefined : planFilter,
        hasActivity: activityFilter === 'all' ? undefined : activityFilter,
        startDate,
        endDate,
      });

      setUsers(response.data.users);
      setUsersPagination(response.data.pagination);
    } catch (error) {
      setUsersError(getErrorMessage(error, 'Erro ao carregar usuários.'));
    } finally {
      setIsUsersLoading(false);
    }
  }, [activityFilter, endDate, planFilter, startDate, usersPage]);

  const loadInactiveUsers = useCallback(async () => {
    setIsInactiveLoading(true);
    setInactiveError('');

    try {
      const response = await dashboardGet<DashboardInactiveUsersResponse>(
        'inactive-users',
        {
          page: inactivePage,
          limit: INACTIVE_PAGE_SIZE,
        }
      );

      setInactiveUsers(response.data.users);
      setInactivePagination(response.data.pagination);
    } catch (error) {
      setInactiveError(getErrorMessage(error, 'Erro ao carregar inativos.'));
    } finally {
      setIsInactiveLoading(false);
    }
  }, [inactivePage]);

  useEffect(() => {
    void loadMetrics();
  }, [loadMetrics]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    void loadInactiveUsers();
  }, [loadInactiveUsers]);

  const activityRate = useMemo(() => {
    if (!overview || overview.totalProfiles === 0) return 0;
    return overview.totalWithActivity / overview.totalProfiles;
  }, [overview]);

  const resetPagedFilters = () => {
    setUsersPage(1);
  };

  const clearFilters = () => {
    setPlanFilter('all');
    setActivityFilter('all');
    setContentTypeFilter('all');
    setStartDate('');
    setEndDate('');
    setUsersPage(1);
  };

  const refreshAll = () => {
    void loadMetrics();
    void loadUsers();
    void loadInactiveUsers();
  };

  if (isMetricsLoading && !overview) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-muted">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex rounded-lg border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-light">
            Métricas
          </span>
          <h1 className="mt-3 text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Acompanhe usuários cadastrados, atividade, consumo de conteúdo e
            perfis que ainda não deram o primeiro passo.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshAll}
          disabled={isMetricsLoading || isUsersLoading || isInactiveLoading}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-card-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {(isMetricsLoading || isUsersLoading || isInactiveLoading) && (
            <LoadingSpinner size="sm" />
          )}
          Atualizar dados
        </button>
      </div>

      {metricsError && <ErrorBanner message={metricsError} />}

      {overview && (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Famílias"
              value={formatNumber(overview.totalFamilies)}
              description="Total de famílias cadastradas"
              tone="blue"
            />
            <MetricCard
              label="Perfis"
              value={formatNumber(overview.totalProfiles)}
              description="Usuários/perfis na plataforma"
              tone="green"
            />
            <MetricCard
              label="Com atividade"
              value={formatNumber(overview.totalWithActivity)}
              description={`${formatPercent(activityRate)} dos perfis`}
              tone="amber"
            />
            <MetricCard
              label="Sem atividade"
              value={formatNumber(overview.totalWithoutActivity)}
              description="Nunca consumiram conteúdo"
              tone="rose"
            />
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <PlanDistribution overview={overview} />
            <div className="rounded-lg border border-border bg-card/50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Cadastros recentes
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-background/35 p-4">
                  <p className="text-2xl font-bold text-foreground">
                    {formatNumber(overview.newRegistrations.last7Days)}
                  </p>
                  <p className="mt-1 text-xs text-muted">Últimos 7 dias</p>
                </div>
                <div className="rounded-lg border border-border bg-background/35 p-4">
                  <p className="text-2xl font-bold text-foreground">
                    {formatNumber(overview.newRegistrations.last30Days)}
                  </p>
                  <p className="mt-1 text-xs text-muted">Últimos 30 dias</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <section className="rounded-lg border border-border bg-card/40 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-muted">
                Plano
              </span>
              <select
                value={planFilter}
                onChange={(event) => {
                  setPlanFilter(event.target.value as 'all' | DashboardPlan);
                  resetPagedFilters();
                }}
                className="w-full rounded-lg border border-input-border bg-input-bg px-3 py-2.5 text-sm text-foreground focus:border-input-focus focus:outline-none"
              >
                <option value="all">Todos os planos</option>
                <option value="free">Gratuito</option>
                <option value="free_trial">Teste grátis</option>
                <option value="paid">Pago</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-muted">
                Atividade
              </span>
              <select
                value={activityFilter}
                onChange={(event) => {
                  setActivityFilter(event.target.value as ActivityFilter);
                  resetPagedFilters();
                }}
                className="w-full rounded-lg border border-input-border bg-input-bg px-3 py-2.5 text-sm text-foreground focus:border-input-focus focus:outline-none"
              >
                <option value="all">Todos</option>
                <option value="true">Com atividade</option>
                <option value="false">Sem atividade</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-muted">
                Conteúdo
              </span>
              <select
                value={contentTypeFilter}
                onChange={(event) => setContentTypeFilter(event.target.value)}
                className="w-full rounded-lg border border-input-border bg-input-bg px-3 py-2.5 text-sm text-foreground focus:border-input-focus focus:outline-none"
              >
                {contentTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-muted">
                Início
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  resetPagedFilters();
                }}
                className="w-full rounded-lg border border-input-border bg-input-bg px-3 py-2.5 text-sm text-foreground focus:border-input-focus focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-muted">
                Fim
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  resetPagedFilters();
                }}
                className="w-full rounded-lg border border-input-border bg-input-bg px-3 py-2.5 text-sm text-foreground focus:border-input-focus focus:outline-none"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-primary/40 hover:text-foreground"
          >
            Limpar filtros
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        {content ? (
          <ContentConsumptionSection content={content} isLoading={isMetricsLoading} />
        ) : (
          <EmptyPanel title="Consumo" message="Nenhum dado de consumo recebido." />
        )}

        {engagement ? (
          <EngagementSection engagement={engagement} isLoading={isMetricsLoading} />
        ) : (
          <EmptyPanel
            title="Engajamento"
            message="Nenhum dado de engajamento recebido."
          />
        )}
      </section>

      <section className="rounded-lg border border-border bg-card/50">
        <div className="flex flex-col gap-2 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Usuários</h2>
            <p className="mt-1 text-sm text-muted">
              {formatNumber(usersPagination.total)} perfil
              {usersPagination.total === 1 ? '' : 's'} encontrado
              {usersPagination.total === 1 ? '' : 's'}
            </p>
          </div>
          {isUsersLoading && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <LoadingSpinner size="sm" />
              Atualizando lista
            </div>
          )}
        </div>

        {usersError ? (
          <div className="p-5">
            <ErrorBanner message={usersError} />
          </div>
        ) : users.length === 0 && !isUsersLoading ? (
          <EmptyState message="Nenhum usuário encontrado com os filtros atuais." />
        ) : (
          <UsersTable users={users} />
        )}

        <Pagination
          pagination={usersPagination}
          onPageChange={setUsersPage}
          isLoading={isUsersLoading}
        />
      </section>

      <section className="rounded-lg border border-border bg-card/50">
        <div className="flex flex-col gap-2 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Usuários sem consumo
            </h2>
            <p className="mt-1 text-sm text-muted">
              Perfis cadastrados que nunca ouviram, leram ou concluíram conteúdo.
            </p>
          </div>
          <span className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-1 text-sm font-semibold text-rose-200">
            {formatNumber(inactivePagination.total)} inativos
          </span>
        </div>

        {inactiveError ? (
          <div className="p-5">
            <ErrorBanner message={inactiveError} />
          </div>
        ) : inactiveUsers.length === 0 && !isInactiveLoading ? (
          <EmptyState message="Nenhum usuário inativo encontrado." />
        ) : (
          <InactiveUsersTable users={inactiveUsers} />
        )}

        <Pagination
          pagination={inactivePagination}
          onPageChange={setInactivePage}
          isLoading={isInactiveLoading}
        />
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  tone,
}: {
  label: string;
  value: string;
  description: string;
  tone: 'blue' | 'green' | 'amber' | 'rose';
}) {
  const toneClasses = {
    blue: 'border-sky-400/25 bg-sky-400/10 text-sky-200',
    green: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
    amber: 'border-amber-400/25 bg-amber-400/10 text-amber-200',
    rose: 'border-rose-400/25 bg-rose-400/10 text-rose-200',
  };

  return (
    <div className={`rounded-lg border p-5 ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
  );
}

function PlanDistribution({ overview }: { overview: DashboardOverview }) {
  const plans: DashboardPlan[] = ['free', 'free_trial', 'paid'];
  const maxValue = Math.max(
    ...plans.map((plan) => overview.planDistribution[plan] ?? 0),
    1
  );

  return (
    <div className="rounded-lg border border-border bg-card/50 p-5 lg:col-span-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        Distribuição por plano
      </p>
      <div className="mt-5 space-y-4">
        {plans.map((plan) => {
          const value = overview.planDistribution[plan] ?? 0;
          const width = Math.max((value / maxValue) * 100, value > 0 ? 4 : 0);

          return (
            <div key={plan}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className={`rounded-lg border px-2 py-1 text-xs font-semibold ${planStyles[plan]}`}>
                  {planLabels[plan]}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatNumber(value)}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-light via-emerald-300 to-amber-300"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContentConsumptionSection({
  content,
  isLoading,
}: {
  content: DashboardContentConsumption;
  isLoading: boolean;
}) {
  const contentEntries = Object.entries(content.byContentType || {}).sort(
    ([, first], [, second]) => second - first
  );
  const maxTypeValue = Math.max(...contentEntries.map(([, value]) => value), 1);
  const trend = [...(content.dailyTrend || [])]
    .sort((first, second) => first.date.localeCompare(second.date))
    .slice(-14);
  const maxTrendValue = Math.max(...trend.map((item) => item.total), 1);

  return (
    <div className="rounded-lg border border-border bg-card/50 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Consumo de conteúdo
          </h2>
          <p className="mt-1 text-sm text-muted">
            Volumes por tipo, conteúdos mais consumidos e tendência diária.
          </p>
        </div>
        {isLoading && <LoadingSpinner size="sm" />}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Por tipo</h3>
          <div className="mt-4 space-y-4">
            {contentEntries.length === 0 ? (
              <p className="text-sm text-muted">Sem consumo no período.</p>
            ) : (
              contentEntries.map(([type, value]) => {
                const width = Math.max((value / maxTypeValue) * 100, 3);

                return (
                  <div key={type}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="text-sm text-muted">
                        {getContentTypeLabel(type)}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {formatNumber(value)}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-300 via-emerald-300 to-amber-300"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Tendência diária
          </h3>
          {trend.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Sem tendência no período.</p>
          ) : (
            <div className="mt-4 flex h-44 items-end gap-2 rounded-lg border border-border bg-background/35 p-3">
              {trend.map((item) => {
                const height = Math.max((item.total / maxTrendValue) * 100, 6);

                return (
                  <div
                    key={item.date}
                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                    title={`${formatDate(item.date)}: ${formatNumber(item.total)}`}
                  >
                    <div
                      className="w-full rounded-t bg-primary-light"
                      style={{ height: `${height}%` }}
                    />
                    <span className="w-full truncate text-center text-[10px] text-muted">
                      {item.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-foreground">
          Conteúdos em destaque
        </h3>
        <div className="mt-3 overflow-hidden rounded-lg border border-border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-background/50 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Conteúdo</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 text-right font-semibold">Consumos</th>
                <th className="px-4 py-3 text-right font-semibold">Ouvintes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {content.topContents.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-muted" colSpan={4}>
                    Nenhum conteúdo encontrado.
                  </td>
                </tr>
              ) : (
                content.topContents.slice(0, 8).map((item) => (
                  <tr key={`${item.contentType}-${item.contentId}`}>
                    <td className="max-w-[220px] truncate px-4 py-3 font-mono text-xs text-foreground">
                      {item.contentId}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {getContentTypeLabel(item.contentType)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      {formatNumber(item.totalListens)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted">
                      {formatNumber(item.uniqueListeners)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EngagementSection({
  engagement,
  isLoading,
}: {
  engagement: DashboardEngagement;
  isLoading: boolean;
}) {
  const completionRate = engagement.devotionalProgress.completionRate ?? 0;

  return (
    <div className="rounded-lg border border-border bg-card/50 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Engajamento</h2>
          <p className="mt-1 text-sm text-muted">
            Ativos, devocionais e leitura bíblica.
          </p>
        </div>
        {isLoading && <LoadingSpinner size="sm" />}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <SmallStat label="DAU" value={engagement.activeUsers.daily} />
        <SmallStat label="WAU" value={engagement.activeUsers.weekly} />
        <SmallStat label="MAU" value={engagement.activeUsers.monthly} />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-background/35 p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">
            Conclusão devocional
          </p>
          <p className="text-sm font-semibold text-emerald-200">
            {formatPercent(completionRate)}
          </p>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-emerald-300"
            style={{ width: `${Math.min(completionRate * 100, 100)}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SmallStat
            label="Iniciados"
            value={engagement.devotionalProgress.totalStarted}
          />
          <SmallStat
            label="Conteúdo"
            value={engagement.devotionalProgress.totalContentCompleted}
          />
          <SmallStat
            label="Oração"
            value={engagement.devotionalProgress.totalPrayerCompleted}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SmallStat
          label="Leitores"
          value={engagement.bibleReading.totalReaders}
        />
        <SmallStat
          label="Livros únicos"
          value={engagement.bibleReading.uniqueBooks}
        />
        <SmallStat
          label="Capítulos/usuário"
          value={engagement.bibleReading.avgChaptersPerUser}
          decimals
        />
      </div>
    </div>
  );
}

function SmallStat({
  label,
  value,
  decimals = false,
}: {
  label: string;
  value: number;
  decimals?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/35 p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold text-foreground">
        {decimals ? value.toLocaleString('pt-BR') : formatNumber(value)}
      </p>
    </div>
  );
}

function UsersTable({ users }: { users: DashboardUser[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1040px] text-left text-sm">
        <thead className="bg-background/50 text-xs uppercase tracking-wider text-muted">
          <tr>
            <th className="px-5 py-3 font-semibold">Perfil</th>
            <th className="px-5 py-3 font-semibold">Família</th>
            <th className="px-5 py-3 font-semibold">Plano</th>
            <th className="px-5 py-3 font-semibold">Cadastro</th>
            <th className="px-5 py-3 font-semibold">Última atividade</th>
            <th className="px-5 py-3 text-right font-semibold">Audiobooks</th>
            <th className="px-5 py-3 text-right font-semibold">Devocionais</th>
            <th className="px-5 py-3 text-right font-semibold">Bíblia</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => (
            <tr key={user.profileId} className="transition-colors hover:bg-card-hover/50">
              <td className="px-5 py-4">
                <p className="font-semibold text-foreground">{user.profileName}</p>
                <p className="mt-0.5 text-xs text-muted">{user.email}</p>
                <p className="mt-1 text-xs text-muted">
                  {user.profileType}
                  {user.authProvider ? ` · ${user.authProvider}` : ''}
                </p>
              </td>
              <td className="px-5 py-4">
                <p className="text-foreground">{user.familyName}</p>
                <p className="mt-0.5 font-mono text-xs text-muted">{user.familyId}</p>
              </td>
              <td className="px-5 py-4">
                <PlanBadge plan={user.plan} />
              </td>
              <td className="px-5 py-4 text-muted">{formatDate(user.registeredAt)}</td>
              <td className="px-5 py-4 text-muted">
                {formatDateTime(user.lastActivityAt)}
              </td>
              <td className="px-5 py-4 text-right font-semibold text-foreground">
                {formatNumber(user.totalListenings)}
              </td>
              <td className="px-5 py-4 text-right font-semibold text-foreground">
                {formatNumber(user.totalDevotionals)}
              </td>
              <td className="px-5 py-4 text-right font-semibold text-foreground">
                {formatNumber(user.totalBibleReadings)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InactiveUsersTable({ users }: { users: DashboardInactiveUser[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-background/50 text-xs uppercase tracking-wider text-muted">
          <tr>
            <th className="px-5 py-3 font-semibold">Perfil</th>
            <th className="px-5 py-3 font-semibold">Família</th>
            <th className="px-5 py-3 font-semibold">Plano</th>
            <th className="px-5 py-3 font-semibold">Cadastro</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => (
            <tr key={user.profileId} className="transition-colors hover:bg-card-hover/50">
              <td className="px-5 py-4">
                <p className="font-semibold text-foreground">{user.profileName}</p>
                <p className="mt-0.5 text-xs text-muted">{user.email}</p>
                <p className="mt-1 text-xs text-muted">{user.profileType}</p>
              </td>
              <td className="px-5 py-4">
                <p className="text-foreground">{user.familyName}</p>
                <p className="mt-0.5 font-mono text-xs text-muted">{user.familyId}</p>
              </td>
              <td className="px-5 py-4">
                <PlanBadge plan={user.plan} />
              </td>
              <td className="px-5 py-4 text-muted">{formatDate(user.registeredAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlanBadge({ plan }: { plan: DashboardPlan }) {
  return (
    <span className={`inline-flex rounded-lg border px-2 py-1 text-xs font-semibold ${planStyles[plan]}`}>
      {planLabels[plan] || plan}
    </span>
  );
}

function Pagination({
  pagination,
  onPageChange,
  isLoading,
}: {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}) {
  const currentPage = pagination.page || 1;
  const totalPages = pagination.totalPages || 1;

  return (
    <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">
        Página {formatNumber(currentPage)} de {formatNumber(totalPages)}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage <= 1 || isLoading}
          className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage >= totalPages || isLoading}
          className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
      {message}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-5 py-12 text-center text-sm text-muted">
      {message}
    </div>
  );
}

function EmptyPanel({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-5">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-3 text-sm text-muted">{message}</p>
    </div>
  );
}
