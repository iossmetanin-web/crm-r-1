export type StageId = "lead" | "qualified" | "proposal" | "won";

export type Deal = {
  id: string;
  name: string;
  company: string;
  owner: string;
  value: number;
  priority: "Low" | "Medium" | "High";
  dueDate: string;
};

export const pipelineStages: Array<{
  id: StageId;
  title: string;
  subtitle: string;
  tint: string;
}> = [
  { id: "lead", title: "Лид", subtitle: "Первичный интерес", tint: "from-sky-400/25 to-sky-600/10" },
  { id: "qualified", title: "Квалификация", subtitle: "Потребность подтверждена", tint: "from-indigo-400/25 to-indigo-600/10" },
  { id: "proposal", title: "Предложение", subtitle: "Согласование условий", tint: "from-cyan-400/25 to-cyan-600/10" },
  { id: "won", title: "Выиграно", subtitle: "Закрытая выручка", tint: "from-emerald-400/25 to-emerald-600/10" },
];

export const initialDeals: Record<StageId, Deal[]> = {
  lead: [
    {
      id: "deal-1",
      name: "Расширение продления",
      company: "Northline Labs",
      owner: "Ava Martin",
      value: 42000,
      priority: "High",
      dueDate: "24 мар",
    },
    {
      id: "deal-2",
      name: "Пакет онбординга",
      company: "Lumen Retail",
      owner: "Noah Brooks",
      value: 18000,
      priority: "Medium",
      dueDate: "27 мар",
    },
  ],
  qualified: [
    {
      id: "deal-3",
      name: "Апгрейд AI-аналитики",
      company: "Pulse Dynamics",
      owner: "Olivia Chen",
      value: 76000,
      priority: "High",
      dueDate: "21 мар",
    },
    {
      id: "deal-4",
      name: "Сервисный ретейнер",
      company: "Mercury Studio",
      owner: "Ethan Ross",
      value: 25500,
      priority: "Low",
      dueDate: "3 апр",
    },
  ],
  proposal: [
    {
      id: "deal-5",
      name: "Корпоративное внедрение",
      company: "Harbor Finance",
      owner: "Mia Patel",
      value: 138000,
      priority: "High",
      dueDate: "19 мар",
    },
  ],
  won: [
    {
      id: "deal-6",
      name: "Ретейнер роста",
      company: "Atlas Mobility",
      owner: "Leo Kim",
      value: 92000,
      priority: "Medium",
      dueDate: "Закрыто",
    },
  ],
};

export type Client = {
  id: string;
  name: string;
  company: string;
  tier: "Enterprise" | "Growth" | "Starter";
  status: "Active" | "At Risk" | "New";
  email: string;
  phone: string;
  value: number;
  location: string;
  notes: string;
};

export const clients: Client[] = [
  {
    id: "client-1",
    name: "Sophia Reed",
    company: "Northline Labs",
    tier: "Enterprise",
    status: "Active",
    email: "sophia@northline.com",
    phone: "+1 (415) 555-0193",
    value: 184000,
    location: "Сан-Франциско, CA",
    notes: "Предпочитает еженедельные статус-апдейты и предпросмотр релизов по пятницам.",
  },
  {
    id: "client-2",
    name: "James Carter",
    company: "Pulse Dynamics",
    tier: "Growth",
    status: "At Risk",
    email: "j.carter@pulse.io",
    phone: "+1 (646) 555-0131",
    value: 76000,
    location: "Нью-Йорк, NY",
    notes: "Беспокоится о скорости онбординга новых менеджеров по продажам.",
  },
  {
    id: "client-3",
    name: "Mila Lawson",
    company: "Harbor Finance",
    tier: "Enterprise",
    status: "Active",
    email: "mila@harborfinance.com",
    phone: "+1 (617) 555-0159",
    value: 138000,
    location: "Бостон, MA",
    notes: "Требует обзор безопасности на каждом квартальном закрытии.",
  },
  {
    id: "client-4",
    name: "Daniel Quinn",
    company: "Lumen Retail",
    tier: "Starter",
    status: "New",
    email: "daniel.quinn@lumen.co",
    phone: "+1 (303) 555-0128",
    value: 24000,
    location: "Денвер, CO",
    notes: "Нужна интеграция с POS и поддержка миграции Shopify.",
  },
];

export type Task = {
  id: string;
  title: string;
  assignee: string;
  priority: "Low" | "Medium" | "High";
  due: string;
  completed: boolean;
};

export const teamMembers = ["Ava", "Noah", "Olivia", "Mia", "Leo"];

export const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Подготовить предложение по продлению Q2 для Northline Labs",
    assignee: "Ava",
    priority: "High",
    due: "18 мар",
    completed: false,
  },
  {
    id: "task-2",
    title: "Сделать фоллоу-ап по анкете безопасности с Harbor Finance",
    assignee: "Olivia",
    priority: "Medium",
    due: "20 мар",
    completed: false,
  },
  {
    id: "task-3",
    title: "Запланировать воркшоп по онбордингу для команды Lumen Retail",
    assignee: "Noah",
    priority: "Low",
    due: "25 мар",
    completed: true,
  },
];

export const dashboardMetrics = [
  { label: "Выручка в воронке", value: "$356K", trend: "+12.4%" },
  { label: "Активные сделки", value: "18", trend: "+4 за неделю" },
  { label: "Конверсия", value: "32%", trend: "+2.1 п.п." },
  { label: "Задачи на сегодня", value: "7", trend: "2 просрочено" },
];
