import { useEffect, useRef, useState } from 'react';
import { CalendarCheck, CheckCircle2, Clock, MapPin, MessageCircle, ShieldCheck, Trash2 } from 'lucide-react';
import { BUSINESS_TYPES, CONTACT_TIMES, REQUESTED_SERVICES } from '../data/content.js';
import { isValidPhone, timeAgo } from '../lib/format.js';

const EMPTY = { name: '', businessType: 'Retail', phone: '', service: REQUESTED_SERVICES[1], time: CONTACT_TIMES[0], message: '' };

export default function Contact({ prefill, bookings, onSubmit, onClear }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [lastRef, setLastRef] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const nameRef = useRef(null);

  useEffect(() => {
    if (!prefill) return;
    setForm((f) => ({
      ...f,
      service: prefill.service || f.service,
      message: prefill.note ? prefill.note : f.message,
    }));
    setLastRef(null);
    const t = setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 700);
    return () => clearTimeout(t);
  }, [prefill]);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Please enter your name.';
    if (!isValidPhone(form.phone)) errs.phone = 'Enter a valid number, e.g. 0300 1234567 or +92 300 1234567.';
    setErrors(errs);
    if (Object.keys(errs).length) {
      (errs.name ? nameRef.current : document.getElementById('c-phone'))?.focus();
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const record = await onSubmit({ ...form, name: form.name.trim(), message: form.message.trim(), source: 'Website form', website: honeypot });
      setLastRef(record.ref);
      setForm(EMPTY);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative py-20 sm:py-28">
      <div className="relative mx-auto grid max-w-[90rem] gap-10 px-4 sm:px-6 xl:px-10 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <span className="section-eyebrow">Free consultation</span>
          <h2 className="text-4xl font-light leading-[1.1] tracking-tight sm:text-5xl">Tell us what you need. We'll call you back.</h2>
          <p className="mt-4 text-slate-400">
            Every engagement starts with a short, free consultation with Mukesh to define the work. After that you're added to the dashboard and can
            start submitting requests.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              { Icon: MapPin, title: 'Sukkur, Sindh, Pakistan', text: 'Remote-first, with on-site visits across Sukkur and the Sindh region.' },
              { Icon: Clock, title: 'Callback within 24 hours', text: 'Pick a morning, afternoon or evening slot that suits you.' },
              { Icon: MessageCircle, title: 'Call or WhatsApp', text: 'We contact you on the number you share. Pro clients get a direct hotline.' },
              { Icon: ShieldCheck, title: 'No obligation', text: 'The consultation is free. You decide on a plan afterwards.' },
            ].map(({ Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-600/15 text-brand-400">
                  <Icon size={20} />
                </span>
                <span>
                  <span className="block font-semibold text-white">{title}</span>
                  <span className="text-sm text-slate-400">{text}</span>
                </span>
              </li>
            ))}
          </ul>

          {bookings.length > 0 && (
            <div className="glass mt-10 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Your consultation requests</h3>
                <button onClick={onClear} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-300">
                  <Trash2 size={13} /> Clear
                </button>
              </div>
              <ul className="mt-3 space-y-2">
                {bookings.slice(0, 4).map((b) => (
                  <li key={b.ref} className="flex items-center justify-between gap-3 rounded-xl bg-ink-900/70 px-3 py-2.5 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-white">
                        {b.ref} · {b.service}
                      </span>
                      <span className="block truncate text-xs text-slate-400">
                        {b.name} · {String(b.time).split(' (')[0]} · via {b.source}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-slate-500">{timeAgo(b.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <form id="booking-form" onSubmit={submit} noValidate className="glass relative rounded-3xl p-6 sm:p-8">
          {lastRef && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 animate-fade-up" role="status">
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={20} />
              <p className="text-sm text-emerald-100">
                Request <strong>{lastRef}</strong> received and sent to the AMY team. Mukesh will call you in your preferred time slot.
              </p>
            </div>
          )}
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <CalendarCheck className="text-orbit-400" size={22} /> Book a free consultation
          </h3>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="c-name" className="label">Your name *</label>
              <input id="c-name" ref={nameRef} className="input" value={form.name} onChange={set('name')} autoComplete="name" placeholder="Full name" aria-invalid={!!errors.name} maxLength={60} />
              {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
            </div>

            <fieldset className="sm:col-span-2">
              <legend className="label">Business type</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {BUSINESS_TYPES.map((b) => (
                  <label
                    key={b}
                    className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-400 ${
                      form.businessType === b ? 'border-brand-500 bg-brand-600/20 text-white' : 'border-ink-700 bg-ink-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <input type="radio" name="businessType" value={b} checked={form.businessType === b} onChange={set('businessType')} className="sr-only" />
                    {b}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="c-phone" className="label">Phone / WhatsApp *</label>
              <input id="c-phone" type="tel" inputMode="tel" className="input" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="0300 1234567" aria-invalid={!!errors.phone} maxLength={20} />
              {errors.phone && <p className="mt-1 text-xs text-rose-400">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="c-time" className="label">Preferred contact time</label>
              <select id="c-time" className="input" value={form.time} onChange={set('time')}>
                {CONTACT_TIMES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="c-service" className="label">Requested service</label>
              <select id="c-service" className="input" value={form.service} onChange={set('service')}>
                {REQUESTED_SERVICES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="c-msg" className="label">Anything we should know? (optional)</label>
              <textarea id="c-msg" rows={3} className="input resize-none" value={form.message} onChange={set('message')} placeholder="e.g. We sell handmade ajrak online and need a store with WhatsApp ordering." maxLength={500} />
            </div>
          </div>

          {/* Hidden from people; bots that fill every field get rejected by the server. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="c-website">Website</label>
            <input id="c-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          </div>
          {submitError && (
            <p role="alert" className="mt-5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {submitError}
            </p>
          )}
          <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full !py-3.5 text-base">
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Sending…
              </>
            ) : (
              <>
                <CalendarCheck size={18} /> Request my free consultation
              </>
            )}
          </button>
          <p className="mt-3 text-center text-xs text-slate-500">We only use your details to contact you about this request.</p>
        </form>
      </div>
    </section>
  );
}
