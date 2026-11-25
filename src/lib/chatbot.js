import { ONE_TIME, PLANS, PLAN_BY_KEY } from '../data/content.js';
import { formatMoney, priceOf } from './format.js';

export const DEFAULT_CHIPS = ['Show plans & prices', 'Get a quote', 'Book a call with Mukesh', 'Network setup in Sukkur'];

const has = (text, re) => re.test(text);

const PRICE_WORDS = /\b(price|prices|pricing|cost|costs|how much|quote|estimate|calculat\w*|charges?|rate|rates|fee|fees|budget|kitna|kitne)\b/;

function detectItems(t) {
  const plan = /\bbasic\b/.test(t) ? 'basic' : /\bgrowth\b/.test(t) ? 'growth' : /\bpro\b/.test(t) ? 'pro' : null;
  const extras = [];
  if (/\b(chat ?bot|bot|ai assistant)\b/.test(t)) extras.push('chatbot');
  if (/\b(pitch|deck|presentation|slides?)\b/.test(t)) extras.push('deck');
  if (/\b(website|web ?site|site|landing page|online store|e-?commerce|shop)\b/.test(t)) extras.push('website');
  if (/\b(network|wi-?fi|lan|router|internet)\b/.test(t)) extras.push('network');
  const m = t.match(/(\d{1,2})\s*(months?|mo\b|mahine)/);
  const months = m ? Math.min(24, Math.max(1, Number(m[1]))) : 1;
  return { plan, extras, months };
}

function buildQuote({ plan, extras, months }, currency) {
  const lines = [];
  let total = 0;
  if (plan) {
    const p = PLAN_BY_KEY[plan];
    const amt = priceOf(p, currency) * months;
    total += amt;
    lines.push(`• ${p.name} plan × ${months} month${months > 1 ? 's' : ''}: ${formatMoney(amt, currency)}`);
  }
  for (const key of extras) {
    const item = ONE_TIME.find((o) => o.key === key);
    total += priceOf(item, currency);
    lines.push(`• ${item.name}: ${formatMoney(priceOf(item, currency), currency)}${item.plusHardware ? ' + hardware' : ''}`);
  }
  let tip = '';
  if (!plan && extras.length >= 2) {
    const growth = PLAN_BY_KEY.growth;
    tip = `\n\nTip: the Growth plan (${formatMoney(priceOf(growth, currency), currency)}/mo) covers web development and chatbot setup on an ongoing basis, often cheaper than several one-time projects.`;
  }
  return `Here's your estimate:\n${lines.join('\n')}\n\nTotal: ${formatMoney(total, currency)}${
    extras.includes('network') ? ' (network hardware billed at cost)' : ''
  }${tip}\n\nWant me to book a free call with Mukesh to confirm the scope?`;
}

function plansOverview(currency) {
  const rows = PLANS.map((p) => `• ${p.name}: ${formatMoney(priceOf(p, currency), currency)}/mo (${p.features[0].toLowerCase()}, ${p.turnaround} turnaround)`);
  return `AMY has three monthly plans:\n${rows.join('\n')}\n\nGrowth is the most popular: it includes full web development plus AI chatbot setup. Prefer a single deliverable? Ask me about one-time projects.`;
}

function oneTimeOverview(currency) {
  const rows = ONE_TIME.map((o) => `• ${o.name}: ${formatMoney(priceOf(o, currency), currency)}${o.plusHardware ? ' + hardware' : ''}`);
  return `One-time fixed-scope projects:\n${rows.join('\n')}\n\nNo subscription needed. You pay once for that deliverable.`;
}

/**
 * Rule-based intent engine for the AMY AI demo bot.
 * Returns { text, chips?, action? } where action can be 'book' or 'open-dashboard'.
 */
export function getBotReply(input, { currency }) {
  const t = input.toLowerCase().trim();

  if (has(t, /^(hi|hello|hey|salam|assalam|aoa|asalam|salaam|good (morning|afternoon|evening))\b/) && t.split(/\s+/).length <= 4) {
    const salam = /\b(salam|assalam|aoa|asalam|salaam)\b/.test(t);
    return {
      text: `${salam ? 'Wa alaikum salam!' : 'Hello!'} I'm AMY AI, the assistant Mukesh built to show what our chatbots can do. I can explain our services, calculate a quote, or book you a free consultation. What do you need?`,
      chips: DEFAULT_CHIPS,
    };
  }

  if (has(t, /\b(book|booking|meeting|meet|appointment|consult\w*|schedule|call me|callback|contact mukesh|talk to|speak to)\b/)) {
    return { text: "Great, let's book your free consultation with Mukesh. It takes 3 quick questions.\n\nFirst, what's your name?", action: 'book' };
  }

  const items = detectItems(t);
  const wantsPrice = has(t, PRICE_WORDS);

  if (wantsPrice && (items.plan || items.extras.length)) {
    return { text: buildQuote(items, currency), chips: ['Book a call with Mukesh', 'Compare all plans', 'Switch currency'] };
  }

  if (has(t, /\b(quote|estimate|calculat\w*)\b/)) {
    return {
      text: 'Happy to calculate it. Tell me what you need, for example:\n"Quote for Growth plan for 3 months plus a pitch deck"\n"How much for a website and a chatbot?"',
      chips: ['Growth plan for 3 months + pitch deck', 'Website and chatbot price', 'Pro plan for 6 months'],
    };
  }

  if (has(t, /\b(one[- ]?time|single project|once|without subscription|no subscription)\b/)) {
    return { text: oneTimeOverview(currency), chips: ['Website and chatbot price', 'Book a call with Mukesh'] };
  }

  if (has(t, /\b(plans?|pricing|packages?|subscriptions?|tiers?|compare)\b/) || wantsPrice) {
    return { text: plansOverview(currency), chips: ['Get a quote', 'One-time projects', 'Book a call with Mukesh'] };
  }

  if (has(t, /\b(usd|dollars?|international|abroad|usa|uk|currenc\w*|pay|payments?|jazzcash|easypaisa|bank)\b/)) {
    return {
      text: `Prices are set in PKR for clients in Pakistan and in USD for international clients (Basic $15, Growth $30, Pro $60 per month). Use the PKR/USD switch at the top of the page or in Pricing. You're currently viewing ${currency}. Payment details are shared after your consultation.`,
      chips: ['Show plans & prices', 'Book a call with Mukesh'],
    };
  }

  if (has(t, /\b(network\w*|wi-?fi|lan|router|internet|cabling|cctv|firewall|it support)\b/)) {
    return {
      text: `Networking is Yakoob's area. He handles on-site LAN and Wi-Fi installation in Sukkur and across Sindh: coverage planning, router and switch configuration, guest-network isolation, basic firewall rules, and printer/shared-drive setup.\n\nOne-time setup is ${formatMoney(currency === 'USD' ? 40 : 4000, currency)} plus hardware at cost. The Pro plan includes on-site network setup with a priority SLA.`,
      chips: ['Get a network quote', 'Book a site visit', 'Show plans & prices'],
    };
  }

  if (has(t, /\b(chat ?bots?|bot|ai|ml|whatsapp|automation|automate)\b/)) {
    return {
      text: `That's Mukesh's speciality, and you're talking to one right now! AMY builds AI chatbots for WhatsApp and websites that answer FAQs 24/7, capture leads (name, number, requirement), reply in English or Roman Urdu, and hand over to a human when needed.\n\nA custom chatbot is ${formatMoney(currency === 'USD' ? 50 : 5000, currency)} one-time, or included in the Growth and Pro plans.`,
      chips: ['Growth plan (includes chatbot) for 3 months', 'Book a call with Mukesh'],
    };
  }

  if (has(t, /\b(web\w*|site|e-?commerce|online store|shop|portal|app|react|next\.?js|seo|domain|hosting)\b/)) {
    return {
      text: `Asadullah leads web work: mobile-first business websites, eCommerce stores with COD and online payments, and custom portals built with React, Next.js and Node.\n\nA small business website (up to 5 pages) is ${formatMoney(currency === 'USD' ? 80 : 8000, currency)} one-time. The Growth plan includes full web development on an ongoing basis.`,
      chips: ['Website and chatbot price', 'Show plans & prices', 'Book a call with Mukesh'],
    };
  }

  if (has(t, /\b(pitch|deck|presentation|slides?|investor|proposal|incubator)\b/)) {
    return {
      text: `Pitch decks are a team effort: Yakoob shapes the story and copy, and Asadullah designs the slides. You get a 10 to 15 slide investor deck, editable source files plus a PDF, and one revision round for ${formatMoney(currency === 'USD' ? 35 : 3500, currency)}.`,
      chips: ['Pitch deck + website price', 'Book a call with Mukesh'],
    };
  }

  if (has(t, /\b(support|maintenance|maintain|sla|turnaround|how long|fast|urgent|downtime|update)\b/)) {
    return {
      text: 'Support continues after delivery, which most freelancers do not offer. Turnaround depends on your plan:\n• Basic: 48–72 hours\n• Growth: 24–48 hours\n• Pro: priority SLA + a direct WhatsApp hotline to the founders\n\nEvery request is tracked on your client dashboard.',
      chips: ['Open the client dashboard', 'Show plans & prices'],
    };
  }

  if (has(t, /\b(dashboard|portal|track|tracking|kanban|status|request)\b/)) {
    return {
      text: 'The client dashboard is where you submit requests and watch them move from Submitted → In Progress → Quality Review → Completed, with the assigned team member on every card. Want to try the live demo?',
      chips: ['Open the client dashboard'],
      action: has(t, /\bopen\b/) ? 'open-dashboard' : undefined,
    };
  }

  if (has(t, /\b(team|founders?|who|mukesh|yakoob|asadullah|people|owner|students?)\b/)) {
    return {
      text: 'AMY is named after its three co-founders:\n• Asadullah (023-23-0080): UI/UX & full-stack web\n• Mukesh (023-23-0042): AI/ML chatbots & main client contact\n• Yakoob (023-22-0038): network/IT support & content writing\n\nThe company started as a Technology Entrepreneurship Course project.',
      chips: ['Book a call with Mukesh', 'What services do you offer?'],
    };
  }

  if (has(t, /\b(where|location|located|sukkur|sindh|office|visit|on-?site|address|karachi|larkana|rohri)\b/)) {
    return {
      text: 'AMY is a remote agency based in Sukkur, Sindh. Most work is delivered online through calls, the dashboard and cloud tools. On-site visits for network installation and hardware issues cover Sukkur and the wider Sindh region.',
      chips: ['Network setup in Sukkur', 'Book a call with Mukesh'],
    };
  }

  if (has(t, /\b(services?|offer|do you do|what can you|help with)\b/)) {
    return {
      text: 'One team, five services:\n1. Web & web app development\n2. AI & ML chatbots\n3. Pitch-deck & presentation design\n4. Office networking & IT in Sukkur\n5. Ongoing support & maintenance\n\nAll available under one monthly plan or as one-time projects.',
      chips: ['Show plans & prices', 'Get a quote'],
    };
  }

  if (has(t, /\b(thanks?|thank you|shukriya|great|awesome|perfect|ok|okay)\b/)) {
    return { text: "You're welcome! Anything else I can help with?", chips: DEFAULT_CHIPS };
  }

  if (has(t, /\b(bye|goodbye|allah hafiz|khuda hafiz)\b/)) {
    return { text: 'Allah Hafiz! You can reopen me any time from the chat bubble.' };
  }

  return {
    text: "I didn't quite catch that. I can help with plans and prices, quotes, our five services, network visits in Sukkur, or booking a call with Mukesh.",
    chips: DEFAULT_CHIPS,
  };
}

/** Maps chip labels to the message the user "sends". */
export const CHIP_MESSAGES = {
  'Show plans & prices': 'Show me your plans and prices',
  'Compare all plans': 'Compare all plans',
  'Get a quote': 'I want a quote',
  'Get a network quote': 'How much for a network setup?',
  'Book a call with Mukesh': 'Book a consultation with Mukesh',
  'Book a site visit': 'Book a consultation for a network site visit',
  'Network setup in Sukkur': 'Do you do office network setup in Sukkur?',
  'One-time projects': 'What are your one-time project prices?',
  'Switch currency': 'Which currencies do you accept?',
  'Open the client dashboard': 'Open the client dashboard',
  'What services do you offer?': 'What services do you offer?',
  'Growth plan for 3 months + pitch deck': 'Quote for Growth plan for 3 months plus a pitch deck',
  'Website and chatbot price': 'How much for a website and a chatbot?',
  'Pro plan for 6 months': 'Price for Pro plan for 6 months',
  'Growth plan (includes chatbot) for 3 months': 'Price for Growth plan for 3 months',
  'Pitch deck + website price': 'Price for a pitch deck and a website',
};
