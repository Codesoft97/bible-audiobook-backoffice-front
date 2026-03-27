export interface DevotionalDayPlan {
  day: number;
  week: string;
  title: string;
  reference: string;
}

export interface DevotionalWeekPlan {
  week: string;
  title: string;
  days: DevotionalDayPlan[];
}

export interface DevotionalMonthPlan {
  value: string;
  label: string;
  assuntoMes: string;
  totalDays: number;
  weeks: DevotionalWeekPlan[];
}

export const DEVOTIONAL_TARGET_PROFILES = [
  'Todos',
  'Pai',
  'Mãe',
  'Filho',
  'Filha',
  'Família',
] as const;

export const DEVOTIONAL_WEEK_OPTIONS = ['1', '2', '3', '4', '5'] as const;

export const DEVOTIONAL_MONTHS: DevotionalMonthPlan[] = [
  {
    value: 'janeiro',
    label: 'Janeiro',
    assuntoMes: 'Novos Começos e Fundações',
    totalDays: 31,
    weeks: [
      {
        week: '1',
        title: 'Deixando o Passado e Abraçando o Novo',
        days: [
          { day: 1, week: '1', title: 'Tudo se Fez Novo', reference: '2 Coríntios 5:17' },
          {
            day: 2,
            week: '1',
            title: 'Esquecendo o Que Ficou Para Trás',
            reference: 'Filipenses 3:13-14',
          },
          {
            day: 3,
            week: '1',
            title: 'Misericórdias Renovadas',
            reference: 'Lamentações 3:22-23',
          },
          { day: 4, week: '1', title: 'Um Novo Coração', reference: 'Ezequiel 36:26' },
          { day: 5, week: '1', title: 'Águas no Deserto', reference: 'Isaías 43:19' },
          { day: 6, week: '1', title: 'Planos de Esperança', reference: 'Jeremias 29:11' },
          {
            day: 7,
            week: '1',
            title: 'O Primeiro Passo da Fé',
            reference: 'Hebreus 11:1',
          },
        ],
      },
      {
        week: '2',
        title: 'Construindo sobre a Rocha',
        days: [
          { day: 8, week: '2', title: 'A Rocha Inabalável', reference: 'Mateus 7:24-25' },
          { day: 9, week: '2', title: 'A Luz no Caminho', reference: 'Salmos 119:105' },
          {
            day: 10,
            week: '2',
            title: 'Buscando o Que Importa',
            reference: 'Mateus 6:33',
          },
          {
            day: 11,
            week: '2',
            title: 'Entregando Seus Caminhos',
            reference: 'Salmos 37:5',
          },
          { day: 12, week: '2', title: 'O Oleiro e o Barro', reference: 'Jeremias 18:4' },
          {
            day: 13,
            week: '2',
            title: 'A Palavra Que Sustenta',
            reference: 'Mateus 4:4',
          },
          {
            day: 14,
            week: '2',
            title: 'Confiança Total',
            reference: 'Provérbios 3:5-6',
          },
        ],
      },
      {
        week: '3',
        title: 'Renovação da Mente e do Espírito',
        days: [
          { day: 15, week: '3', title: 'Renovando a Mente', reference: 'Romanos 12:2' },
          {
            day: 16,
            week: '3',
            title: 'A Boa Obra em Andamento',
            reference: 'Filipenses 1:6',
          },
          {
            day: 17,
            week: '3',
            title: 'Vestindo a Nova Natureza',
            reference: 'Efésios 4:24',
          },
          {
            day: 18,
            week: '3',
            title: 'Força Para a Jornada',
            reference: 'Isaías 40:31',
          },
          { day: 19, week: '3', title: 'O Escudo da Fé', reference: 'Efésios 6:16' },
          {
            day: 20,
            week: '3',
            title: 'Alívio Para o Cansaço',
            reference: 'Mateus 11:28',
          },
          {
            day: 21,
            week: '3',
            title: 'A Paz Que Excede o Entendimento',
            reference: 'Filipenses 4:7',
          },
        ],
      },
      {
        week: '4',
        title: 'Firmando os Passos',
        days: [
          { day: 22, week: '4', title: 'Coragem Para Avançar', reference: 'Josué 1:9' },
          {
            day: 23,
            week: '4',
            title: 'A Fonte de Água Viva',
            reference: 'João 4:14',
          },
          { day: 24, week: '4', title: 'O Bom Pastor', reference: 'Salmos 23:1-2' },
          {
            day: 25,
            week: '4',
            title: 'Permanecendo na Videira',
            reference: 'João 15:5',
          },
          {
            day: 26,
            week: '4',
            title: 'Frutos Que Permanecem',
            reference: 'Gálatas 5:22-23',
          },
          {
            day: 27,
            week: '4',
            title: 'A Alegria é a Nossa Força',
            reference: 'Neemias 8:10',
          },
          {
            day: 28,
            week: '4',
            title: 'Contentamento em Toda Situação',
            reference: 'Filipenses 4:11-12',
          },
        ],
      },
      {
        week: '5',
        title: 'Preparados Para o Ano',
        days: [
          {
            day: 29,
            week: '5',
            title: 'Perdoando e Sendo Livre',
            reference: 'Colossenses 3:13',
          },
          {
            day: 30,
            week: '5',
            title: 'Um Caminho Seguro',
            reference: 'Salmos 16:11',
          },
          {
            day: 31,
            week: '5',
            title: 'Mais Que Vencedores',
            reference: 'Romanos 8:37',
          },
        ],
      },
    ],
  },
  {
    value: 'fevereiro',
    label: 'Fevereiro',
    assuntoMes: 'Identidade em Cristo',
    totalDays: 28,
    weeks: [],
  },
  {
    value: 'março',
    label: 'Março',
    assuntoMes: 'Oração e Intimidade',
    totalDays: 31,
    weeks: [],
  },
  {
    value: 'abril',
    label: 'Abril',
    assuntoMes: 'Graça, Sacrifício e Redenção',
    totalDays: 30,
    weeks: [],
  },
  {
    value: 'maio',
    label: 'Maio',
    assuntoMes: 'Família e Relacionamentos',
    totalDays: 31,
    weeks: [],
  },
  {
    value: 'junho',
    label: 'Junho',
    assuntoMes: 'Fé e Confiança em Tempos Difíceis',
    totalDays: 30,
    weeks: [],
  },
  {
    value: 'julho',
    label: 'Julho',
    assuntoMes: 'Sabedoria Prática para o Dia a Dia',
    totalDays: 31,
    weeks: [],
  },
  {
    value: 'agosto',
    label: 'Agosto',
    assuntoMes: 'Propósito e Chamado',
    totalDays: 31,
    weeks: [],
  },
  {
    value: 'setembro',
    label: 'Setembro',
    assuntoMes: 'O Poder da Palavra de Deus',
    totalDays: 30,
    weeks: [],
  },
  {
    value: 'outubro',
    label: 'Outubro',
    assuntoMes: 'Paz e Saúde Mental',
    totalDays: 31,
    weeks: [],
  },
  {
    value: 'novembro',
    label: 'Novembro',
    assuntoMes: 'Gratidão e Louvor',
    totalDays: 30,
    weeks: [],
  },
  {
    value: 'dezembro',
    label: 'Dezembro',
    assuntoMes: 'Esperança e a Luz do Mundo',
    totalDays: 31,
    weeks: [],
  },
];

export function getDevotionalMonthPlan(monthValue: string) {
  return DEVOTIONAL_MONTHS.find((month) => month.value === monthValue);
}

export function getDevotionalWeekPlan(monthValue: string, week: string) {
  return getDevotionalMonthPlan(monthValue)?.weeks.find((monthWeek) => monthWeek.week === week);
}

export function getDevotionalDayPlan(monthValue: string, day: number) {
  return getDevotionalMonthPlan(monthValue)?.weeks
    .flatMap((week) => week.days)
    .find((monthDay) => monthDay.day === day);
}

export function getDevotionalDaysForMonth(monthValue: string) {
  const totalDays = getDevotionalMonthPlan(monthValue)?.totalDays ?? 31;
  return Array.from({ length: totalDays }, (_, index) => index + 1);
}
