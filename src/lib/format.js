export function formatMoney(amount, currency) {
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }
  return `PKR ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
}

/** Price of an item that carries both `pkr` and `usd` fields. */
export function priceOf(item, currency) {
  return currency === 'USD' ? item.usd : item.pkr;
}

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function shortRef(prefix) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function timeAgo(iso) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Accepts Pakistani mobile numbers (03xx..., +92 3xx...) and international numbers. */
export function isValidPhone(value) {
  const digits = value.replace(/[\s\-()]/g, '');
  return /^(\+?\d{10,15})$/.test(digits);
}
