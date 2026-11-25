export const STATUSES = [
  { key: 'submitted', label: 'Submitted', dot: 'bg-slate-400', ring: 'border-slate-500/40' },
  { key: 'progress', label: 'In Progress', dot: 'bg-brand-500', ring: 'border-brand-500/40' },
  { key: 'review', label: 'Quality Review', dot: 'bg-orbit-500', ring: 'border-orbit-500/40' },
  { key: 'done', label: 'Completed', dot: 'bg-emerald-500', ring: 'border-emerald-500/40' },
];

export const STATUS_LABEL = Object.fromEntries(STATUSES.map((s) => [s.key, s.label]));

export const CATEGORIES = [
  { key: 'web', label: 'Web', badge: 'bg-brand-600/20 text-brand-300 border-brand-600/40', assignee: 'asadullah' },
  { key: 'ai', label: 'AI Bot', badge: 'bg-orbit-500/15 text-orbit-300 border-orbit-500/40', assignee: 'mukesh' },
  { key: 'deck', label: 'Pitch Deck', badge: 'bg-violet-500/15 text-violet-300 border-violet-500/40', assignee: 'asadullah' },
  { key: 'network', label: 'Network', badge: 'bg-sky-500/15 text-sky-300 border-sky-500/40', assignee: 'yakoob' },
  { key: 'other', label: 'Other', badge: 'bg-slate-500/15 text-slate-300 border-slate-500/40', assignee: 'mukesh' },
];

export const CATEGORY_BY_KEY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));

export const PRIORITIES = [
  { key: 'low', label: 'Low', badge: 'text-slate-300 bg-slate-500/15' },
  { key: 'medium', label: 'Medium', badge: 'text-sky-300 bg-sky-500/15' },
  { key: 'high', label: 'High', badge: 'text-orbit-300 bg-orbit-500/15' },
  { key: 'urgent', label: 'Urgent', badge: 'text-rose-300 bg-rose-500/20' },
];

export const PRIORITY_BY_KEY = Object.fromEntries(PRIORITIES.map((p) => [p.key, p]));

const hoursAgo = (h) => new Date(Date.now() - h * 3600_000).toISOString();

const seed = (id, title, description, category, priority, status, assignee, createdH, history) => ({
  id,
  ref: `AMY-${id}`,
  title,
  description,
  category,
  priority,
  status,
  assignee,
  createdAt: hoursAgo(createdH),
  updatedAt: hoursAgo(history[history.length - 1][0]),
  history: history.map(([h, text]) => ({ at: hoursAgo(h), text })),
});

/** Sample tickets for the demo client workspace. */
export function createSampleTasks() {
  return [
    seed(1041, 'Add Eid collection page to store', 'Create a new collection page for the Eid range with 24 products, size filters and a banner on the homepage.', 'web', 'high', 'progress', 'asadullah', 30, [
      [30, 'Request submitted by client'],
      [26, 'Assigned to Asadullah'],
      [20, 'Moved to In Progress'],
    ]),
    seed(1042, 'WhatsApp bot: answer delivery charges', 'Train the WhatsApp bot to answer delivery charges for Sukkur, Rohri, Larkana and Karachi, and collect the address for COD orders.', 'ai', 'medium', 'review', 'mukesh', 52, [
      [52, 'Request submitted by client'],
      [48, 'Assigned to Mukesh'],
      [40, 'Moved to In Progress'],
      [6, 'Moved to Quality Review'],
    ]),
    seed(1043, 'Shop Wi-Fi drops near billing counter', 'The Wi-Fi signal is weak at the billing counter and the POS disconnects 3 to 4 times a day. Need an on-site check.', 'network', 'urgent', 'submitted', 'yakoob', 3, [
      [3, 'Request submitted by client'],
      [3, 'Auto-assigned to Yakoob'],
    ]),
    seed(1044, 'Investor deck for expansion loan', 'A 12-slide deck for a bank meeting about opening a second branch in Larkana. Include sales figures from the last 2 years.', 'deck', 'medium', 'submitted', 'asadullah', 8, [
      [8, 'Request submitted by client'],
      [8, 'Auto-assigned to Asadullah'],
    ]),
    seed(1045, 'Update prices on homepage banner', 'Change the sale banner from 20% off to 30% off and update the end date to the 30th.', 'web', 'low', 'done', 'asadullah', 96, [
      [96, 'Request submitted by client'],
      [90, 'Moved to In Progress'],
      [80, 'Moved to Quality Review'],
      [76, 'Moved to Completed'],
    ]),
    seed(1046, 'Separate guest Wi-Fi for customers', 'Set up a password-protected guest network so customers cannot access the POS and CCTV network.', 'network', 'high', 'done', 'yakoob', 160, [
      [160, 'Request submitted by client'],
      [150, 'Moved to In Progress'],
      [130, 'Moved to Quality Review'],
      [125, 'Moved to Completed'],
    ]),
    seed(1047, 'Monthly sales report email template', 'Design a simple branded email template for sending monthly sales summaries to the two shop partners.', 'other', 'low', 'done', 'mukesh', 220, [
      [220, 'Request submitted by client'],
      [200, 'Moved to In Progress'],
      [190, 'Moved to Quality Review'],
      [186, 'Moved to Completed'],
    ]),
  ];
}
