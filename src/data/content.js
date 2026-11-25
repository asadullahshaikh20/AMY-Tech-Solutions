// All business content is sourced from the AMY Tech Solutions business plan
// (Technology Entrepreneurship Course submission).

export const COMPANY = {
  name: 'AMY Tech Solutions',
  city: 'Sukkur, Sindh, Pakistan',
  pitch:
    "One remote tech team for your website, app, pitch deck, office network, and chatbot under one monthly plan, so you're not managing five different freelancers.",
  vision: 'To be a dependable remote technology partner for small businesses in Pakistan, and later, in other markets.',
  mission:
    'To make web, mobile, design, networking, and chatbot services affordable and easy to access for small businesses through one subscription.',
};

export const TEAM = [
  {
    key: 'mukesh',
    name: 'Mukesh',
    studentId: '023-23-0042',
    role: 'AI/ML & Chatbot Lead Developer',
    tagline: 'Primary client contact',
    initials: 'MK',
    gradient: 'from-orbit-500 to-orbit-600',
    responsibilities: [
      'First point of contact for every client and consultation',
      'Designs and trains AI/ML chatbots for WhatsApp and web',
      'Lead-generation and customer-support bot automation',
    ],
    skills: ['Python', 'NLP', 'LLM APIs', 'WhatsApp Business API', 'Client Relations'],
  },
  {
    key: 'yakoob',
    name: 'Yakoob',
    studentId: '023-22-0038',
    role: 'Network/IT Support Specialist',
    tagline: 'Technical content writer',
    initials: 'YK',
    gradient: 'from-sky-500 to-brand-700',
    responsibilities: [
      'On-site LAN/Wi-Fi installation across Sukkur and Sindh',
      'Router configuration, network security and office IT support',
      'Technical writing, website copy and pitch-deck narratives',
    ],
    skills: ['LAN/Wi-Fi', 'Router & Firewall Setup', 'Troubleshooting', 'Technical Writing', 'Content Strategy'],
  },
  {
    key: 'asadullah',
    name: 'Asadullah',
    studentId: '023-23-0080',
    role: 'Lead UI/UX Designer',
    tagline: 'Full-stack web engineer',
    initials: 'AS',
    gradient: 'from-brand-500 to-indigo-600',
    responsibilities: [
      'UI/UX design for websites, web apps and dashboards',
      'Full-stack development with React, Next.js and Node',
      'Visual design of investor pitch decks and proposals',
    ],
    skills: ['UI/UX', 'React', 'Next.js', 'Node.js', 'Figma', 'Presentation Design'],
  },
];

export const TEAM_BY_KEY = Object.fromEntries(TEAM.map((m) => [m.key, m]));

export const SERVICES = [
  {
    key: 'web',
    icon: 'Globe',
    title: 'Web & Web App Development',
    short: 'Responsive websites, eCommerce stores and custom web portals.',
    owner: 'asadullah',
    stack: ['React', 'Next.js', 'Node.js', 'Tailwind'],
    features: [
      'Mobile-first business websites that load fast on 3G/4G',
      'eCommerce stores with cash-on-delivery and online payments',
      'Custom portals: booking systems, inventory, client dashboards',
      'SEO basics, Google Business profile and analytics setup',
    ],
    deliverables: ['Live website on your domain', 'Admin access and handover guide', '30 days of post-launch fixes'],
    useCase: 'A Sukkur clothing retailer moves from WhatsApp-only orders to an online catalogue with order tracking.',
  },
  {
    key: 'ai',
    icon: 'Bot',
    title: 'AI & ML Chatbot Systems',
    short: '24/7 support and lead-generation bots for WhatsApp and the web.',
    owner: 'mukesh',
    stack: ['LLM APIs', 'WhatsApp API', 'Python', 'NLP'],
    features: [
      'Answers customer FAQs instantly, day and night',
      'Captures leads (name, number, requirement) into a sheet or CRM',
      'Bilingual replies in English and Urdu (Roman Urdu supported)',
      'Hands over to a human when the question needs one',
    ],
    deliverables: ['Trained bot on your FAQs and price list', 'Website widget or WhatsApp number integration', 'Monthly conversation report'],
    useCase: 'A tuition academy answers fee and timing queries automatically and books trial classes overnight.',
  },
  {
    key: 'deck',
    icon: 'Presentation',
    title: 'Pitch-Deck & Presentation Design',
    short: 'Investor decks and business proposals built to win the room.',
    owner: 'asadullah',
    stack: ['Storytelling', 'Data Visuals', 'Figma', 'PowerPoint'],
    features: [
      'Problem, solution, market and financials structured for investors',
      'Copywriting support from Yakoob for a clear narrative',
      'Charts and financial tables that are easy to read',
      'Editable PowerPoint/Google Slides plus a PDF export',
    ],
    deliverables: ['10 to 15 slide investor deck', 'Editable source file and PDF', 'One revision round included'],
    useCase: 'A student startup turns its course project into a deck for a university incubator pitch day.',
  },
  {
    key: 'network',
    icon: 'Network',
    title: 'Computer Networking & Office IT',
    short: 'On-site LAN/Wi-Fi deployment, router setup and security in Sukkur.',
    owner: 'yakoob',
    stack: ['LAN', 'Wi-Fi Mesh', 'Firewalls', 'CCTV/NVR'],
    features: [
      'Office LAN cabling and structured Wi-Fi coverage planning',
      'Router, switch and access-point configuration',
      'Guest Wi-Fi isolation, strong passwords and basic firewall rules',
      'Printer and shared-drive setup for the whole team',
    ],
    deliverables: ['Working network with coverage test', 'Network diagram and credentials sheet', 'Remote support channel'],
    useCase: 'A consultancy with 12 staff gets reliable Wi-Fi on every desk and a separate guest network for clients.',
  },
  {
    key: 'support',
    icon: 'LifeBuoy',
    title: 'Ongoing Technical Support & Maintenance',
    short: 'Updates, monitoring and fixes after delivery, under a clear SLA.',
    owner: 'yakoob',
    stack: ['Uptime Monitoring', 'Backups', 'Security Patches'],
    features: [
      'Content and price updates on request through the dashboard',
      'Uptime monitoring with alerts and quick recovery',
      'Regular backups and security updates',
      'Turnaround from 24 to 72 hours depending on your plan',
    ],
    deliverables: ['Dashboard access to submit and track requests', 'Monthly maintenance summary', 'Priority SLA on the Pro plan'],
    useCase: 'A clinic keeps its timings, doctors list and booking form current without hiring an IT person.',
  },
];

export const PLANS = [
  {
    key: 'basic',
    name: 'Basic',
    pkr: 1500,
    usd: 15,
    blurb: 'For businesses that already have a site and need someone dependable to look after it.',
    activeLimit: 1,
    turnaround: '48–72 hours',
    features: [
      '1 active task at a time',
      'Website maintenance & basic updates',
      'Standard email/dashboard support',
      'Turnaround: 48–72 hours',
    ],
  },
  {
    key: 'growth',
    name: 'Growth',
    pkr: 3000,
    usd: 30,
    popular: true,
    blurb: 'For growing shops and startups that need a website and automation working together.',
    activeLimit: 2,
    turnaround: '24–48 hours',
    features: [
      '2 active tasks simultaneously',
      'Full web development + AI chatbot setup',
      'Basic office IT remote support',
      'Turnaround: 24–48 hours',
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    pkr: 6000,
    usd: 60,
    blurb: 'For businesses that want a complete tech department on call, online and on-site.',
    activeLimit: 3,
    turnaround: 'Priority SLA',
    features: [
      'Unlimited task queue (3 active simultaneously)',
      'Custom full-stack web app + tailored AI/ML bot',
      'On-site Sukkur network setup & priority SLA',
      'Direct WhatsApp hotline to Mukesh, Yakoob & Asadullah',
    ],
  },
];

export const PLAN_BY_KEY = Object.fromEntries(PLANS.map((p) => [p.key, p]));

export const ONE_TIME = [
  { key: 'chatbot', name: 'Custom AI Chatbot', pkr: 5000, usd: 50, note: 'Trained on your FAQs, web or WhatsApp' },
  { key: 'deck', name: 'Investor Pitch-Deck', pkr: 3500, usd: 35, note: '10 to 15 slides, editable + PDF' },
  { key: 'website', name: 'Small Business Website', pkr: 8000, usd: 80, note: 'Up to 5 pages, mobile-first' },
  { key: 'network', name: 'On-Site Network Setup', pkr: 4000, usd: 40, note: 'Plus hardware cost, Sukkur region', plusHardware: true },
];

export const MILESTONES = [
  { when: 'Month 1', phase: 'Launch', title: 'Business registration & brand launch', detail: 'AMY Tech Solutions is registered in Sukkur, the brand identity goes live and direct outreach to local retailers begins.', metric: 'PKR 15,000 seed budget deployed' },
  { when: 'Month 2', phase: 'Launch', title: 'Client dashboard live', detail: 'The request-tracking dashboard is deployed so every client can submit tasks and watch them move from Submitted to Completed.', metric: 'Signature feature shipped' },
  { when: 'Month 4', phase: 'Traction', title: 'First 5 paying clients', detail: 'Referrals, social media demos and university entrepreneurship programmes bring in the first five paying clients.', metric: '5 clients' },
  { when: 'Month 6', phase: 'Traction', title: 'First chatbot & networking projects delivered', detail: "Mukesh delivers the first production AI chatbots and Yakoob completes the first on-site office network installations in Sukkur.", metric: 'AI + network delivery proven' },
  { when: 'Month 10', phase: 'Traction', title: 'Break-even on monthly costs', detail: 'Subscription revenue covers hosting, software and marketing costs every month. Profit is reinvested; founders take no salary in Year 1.', metric: 'Year 1 projected profit: PKR 48,000' },
  { when: 'Year 2 · M6', phase: 'Scale', title: '20 active subscribers', detail: 'A stable base of Basic, Growth and Pro subscribers. Small founder stipends begin.', metric: 'Year 2 projected revenue: PKR 180,000' },
  { when: 'Year 2 · M9', phase: 'Scale', title: 'International clients (US/UK)', detail: 'AMY starts taking on remote clients from the US and UK through freelance and remote-work platforms, priced in USD.', metric: 'USD pricing live' },
  { when: 'Year 3', phase: 'Scale', title: '45+ active subscribers', detail: 'AMY scales to 45 or more subscribers and brings in freelancers for overflow work as needed.', metric: 'Year 3 projected revenue: PKR 370,000' },
];

export const CASE_STUDIES = [
  {
    sector: 'Retail',
    title: 'From WhatsApp orders to an online store',
    challenge: 'A family-run garment shop takes every order by WhatsApp voice note, loses track of stock and misses messages after closing time.',
    approach: [
      'Asadullah builds a mobile-first catalogue with cash-on-delivery checkout',
      'Mukesh adds a WhatsApp bot that answers size, price and delivery questions',
      'Yakoob writes product copy in English and Urdu',
    ],
    plan: 'Growth',
    services: ['web', 'ai'],
    outcomes: ['Orders captured 24/7', 'One dashboard for every change request', 'No separate freelancers to manage'],
  },
  {
    sector: 'Startup',
    title: 'A student startup gets pitch-ready',
    challenge: 'A team of student founders has a working prototype but no deck, no landing page and only two weeks before an incubator demo day.',
    approach: [
      'Yakoob shapes the problem/solution narrative and financial story',
      'Asadullah designs a 12-slide investor deck and a one-page landing site',
      'Both are tracked as two parallel tasks on the dashboard',
    ],
    plan: 'One-time + Basic',
    services: ['deck', 'web'],
    outcomes: ['Deck and landing page delivered together', 'Editable files handed over', 'Basic plan keeps the site current'],
  },
  {
    sector: 'Consultancy',
    title: 'An office network that just works',
    challenge: 'A 12-person consultancy has Wi-Fi dead zones, a shared password everyone knows, and no one to call when the printer drops off.',
    approach: [
      'Yakoob surveys the office and installs a mesh Wi-Fi with a guest network',
      'Router and firewall configured with separate staff and client access',
      'Ongoing remote support through the Pro plan priority SLA',
    ],
    plan: 'Pro',
    services: ['network', 'support'],
    outcomes: ['Full coverage on every desk', 'Clients isolated from the staff network', 'Direct WhatsApp hotline to the team'],
  },
];

export const COMPARISON = {
  columns: ['AMY Tech', 'Freelance platforms', 'Local software houses', 'DIY builders'],
  rows: [
    { label: 'One point of contact', values: [true, false, true, false] },
    { label: 'Fixed monthly pricing', values: [true, false, false, true] },
    { label: 'Web + AI + design + networking', values: [true, false, 'Partial', false] },
    { label: 'Support after delivery', values: [true, false, 'Limited', false] },
    { label: 'Live request dashboard', values: [true, false, false, false] },
    { label: 'On-site visits in Sukkur', values: [true, false, 'Sometimes', false] },
  ],
};

export const CORE_VALUES = [
  { title: 'Reliability', text: 'One accountable team, not a different freelancer for every task.' },
  { title: 'Transparency', text: 'Clear pricing and visible project status through the dashboard.' },
  { title: 'Practical AI', text: 'AI tools to work faster, not as a selling point on their own.' },
  { title: 'Follow-through', text: 'Support continues after a project is delivered.' },
];

export const CONTACT_TIMES = ['Morning (9am to 12pm)', 'Afternoon (12pm to 4pm)', 'Evening (4pm to 8pm)'];
export const BUSINESS_TYPES = ['Retail', 'Startup', 'Consultancy', 'Other'];
export const REQUESTED_SERVICES = [
  'Basic plan subscription',
  'Growth plan subscription',
  'Pro plan subscription',
  'Web & Web App Development',
  'AI & ML Chatbot',
  'Pitch-Deck Design',
  'Office Networking & IT',
  'Ongoing Support & Maintenance',
  'Not sure yet, need advice',
];
