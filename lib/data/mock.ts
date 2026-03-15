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
  { id: "lead", title: "Lead", subtitle: "Early discovery", tint: "from-sky-400/25 to-sky-600/10" },
  { id: "qualified", title: "Qualified", subtitle: "Need validated", tint: "from-indigo-400/25 to-indigo-600/10" },
  { id: "proposal", title: "Proposal", subtitle: "Commercial terms", tint: "from-cyan-400/25 to-cyan-600/10" },
  { id: "won", title: "Won", subtitle: "Closed revenue", tint: "from-emerald-400/25 to-emerald-600/10" },
];

export const initialDeals: Record<StageId, Deal[]> = {
  lead: [
    {
      id: "deal-1",
      name: "Renewal Expansion",
      company: "Northline Labs",
      owner: "Ava Martin",
      value: 42000,
      priority: "High",
      dueDate: "Mar 24",
    },
    {
      id: "deal-2",
      name: "Onboarding Suite",
      company: "Lumen Retail",
      owner: "Noah Brooks",
      value: 18000,
      priority: "Medium",
      dueDate: "Mar 27",
    },
  ],
  qualified: [
    {
      id: "deal-3",
      name: "AI Analytics Upgrade",
      company: "Pulse Dynamics",
      owner: "Olivia Chen",
      value: 76000,
      priority: "High",
      dueDate: "Mar 21",
    },
    {
      id: "deal-4",
      name: "Service Retainer",
      company: "Mercury Studio",
      owner: "Ethan Ross",
      value: 25500,
      priority: "Low",
      dueDate: "Apr 3",
    },
  ],
  proposal: [
    {
      id: "deal-5",
      name: "Enterprise Rollout",
      company: "Harbor Finance",
      owner: "Mia Patel",
      value: 138000,
      priority: "High",
      dueDate: "Mar 19",
    },
  ],
  won: [
    {
      id: "deal-6",
      name: "Growth Retainer",
      company: "Atlas Mobility",
      owner: "Leo Kim",
      value: 92000,
      priority: "Medium",
      dueDate: "Closed",
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
    location: "San Francisco, CA",
    notes: "Prefers weekly status notes and release previews every Friday.",
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
    location: "New York, NY",
    notes: "Concerned about onboarding speed for new sales reps.",
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
    location: "Boston, MA",
    notes: "Requires security review on every quarter close.",
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
    location: "Denver, CO",
    notes: "Needs integration with POS and Shopify migration support.",
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
    title: "Prepare Q2 renewal proposal for Northline Labs",
    assignee: "Ava",
    priority: "High",
    due: "Mar 18",
    completed: false,
  },
  {
    id: "task-2",
    title: "Follow up on security questionnaire with Harbor Finance",
    assignee: "Olivia",
    priority: "Medium",
    due: "Mar 20",
    completed: false,
  },
  {
    id: "task-3",
    title: "Schedule onboarding workshop for Lumen Retail team",
    assignee: "Noah",
    priority: "Low",
    due: "Mar 25",
    completed: true,
  },
];

export const dashboardMetrics = [
  { label: "Revenue in Pipeline", value: "$356K", trend: "+12.4%" },
  { label: "Active Deals", value: "18", trend: "+4 this week" },
  { label: "Conversion Rate", value: "32%", trend: "+2.1 pts" },
  { label: "Tasks Due Today", value: "7", trend: "2 overdue" },
];
