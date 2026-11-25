import { useEffect, useRef, useState } from 'react';
import { Bot, MessageCircle, RotateCcw, Send, X } from 'lucide-react';
import { CHIP_MESSAGES, DEFAULT_CHIPS, getBotReply } from '../lib/chatbot.js';
import { CONTACT_TIMES } from '../data/content.js';
import { isValidPhone, uid } from '../lib/format.js';

const WELCOME = {
  id: 'welcome',
  from: 'bot',
  text: "Assalam o Alaikum! I'm AMY AI 👋\nI can explain our plans, calculate a quote in PKR or USD, or book a free call with Mukesh.",
  chips: DEFAULT_CHIPS,
};

export default function ChatWidget({ open, setOpen, currency, onBooked, onOpenDashboard, pendingPrompt, clearPendingPrompt }) {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [booking, setBooking] = useState(null); // { step, name, phone }
  const [unread, setUnread] = useState(true);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const timers = useRef([]);
  const currencyRef = useRef(currency);
  currencyRef.current = currency;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (open) {
      setUnread(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const botSay = (reply, delay = 650) => {
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: uid('m'), from: 'bot', ...reply }]);
      if (reply.action === 'open-dashboard') {
        const t2 = setTimeout(onOpenDashboard, 900);
        timers.current.push(t2);
      }
    }, delay + Math.min(600, reply.text.length * 2));
    timers.current.push(t);
  };

  const handleBookingStep = (text) => {
    const lower = text.toLowerCase();
    if (/^(cancel|stop|exit|nevermind|never mind)$/.test(lower)) {
      setBooking(null);
      botSay({ text: 'No problem, booking cancelled. Anything else?', chips: DEFAULT_CHIPS });
      return;
    }
    if (booking.step === 'name') {
      if (text.length < 2 || text.length > 60) {
        botSay({ text: 'Please share your name (2 to 60 characters).' });
        return;
      }
      setBooking({ ...booking, step: 'phone', name: text });
      botSay({ text: `Nice to meet you, ${text}! What's your phone or WhatsApp number? (e.g. 0300 1234567 or +92 300 1234567)` });
      return;
    }
    if (booking.step === 'phone') {
      if (!isValidPhone(text)) {
        botSay({ text: "That number doesn't look right. Please enter 10 to 15 digits, for example 0300 1234567. Type \"cancel\" to stop." });
        return;
      }
      setBooking({ ...booking, step: 'time', phone: text });
      botSay({ text: 'Got it. When should Mukesh call you?', chips: CONTACT_TIMES });
      return;
    }
    if (booking.step === 'time') {
      const time = CONTACT_TIMES.find((c) => c.toLowerCase().startsWith(lower.split(' ')[0])) || text.slice(0, 60);
      const current = booking;
      setBooking(null);
      setTyping(true);
      onBooked({
        name: current.name,
        phone: current.phone,
        businessType: 'Not specified',
        service: 'Free consultation (booked via AMY AI)',
        time,
        message: '',
        source: 'AMY AI chatbot',
      })
        .then((record) => {
          botSay({
            text: `You're booked, ${current.name}! ✅\nReference: ${record.ref}\nMukesh will contact you at ${current.phone} in the ${time.split(' (')[0].toLowerCase()}.\n\nAnything else I can help with?`,
            chips: ['Show plans & prices', 'Open the client dashboard'],
          }, 200);
        })
        .catch((err) => {
          setBooking({ ...current, step: 'time' });
          botSay({ text: `Sorry, I couldn't save your booking: ${err.message}\nPick a time to try again, or use the form in the Contact section.`, chips: CONTACT_TIMES }, 200);
        });
    }
  };

  const send = (raw) => {
    const text = raw.trim();
    if (!text || typing) return;
    setMessages((m) => [...m, { id: uid('m'), from: 'user', text }]);
    setInput('');
    if (booking) {
      handleBookingStep(text);
      return;
    }
    const reply = getBotReply(text, { currency: currencyRef.current });
    if (reply.action === 'book') setBooking({ step: 'name' });
    botSay(reply);
  };

  const sendChip = (label) => send(booking ? label : CHIP_MESSAGES[label] || label);

  const reset = () => {
    timers.current.forEach(clearTimeout);
    setTyping(false);
    setBooking(null);
    setMessages([WELCOME]);
  };

  useEffect(() => {
    if (pendingPrompt && open) {
      const t = setTimeout(() => {
        clearPendingPrompt();
        send(pendingPrompt);
      }, 250);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt, open]);

  const lastBot = [...messages].reverse().find((m) => m.from === 'bot');

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="AMY AI chat assistant"
          className="fixed inset-x-0 bottom-0 z-50 flex h-[min(38rem,85dvh)] flex-col overflow-hidden rounded-t-3xl border border-ink-700 bg-snow shadow-2xl shadow-black/25 animate-fade-up sm:inset-x-auto sm:bottom-24 sm:right-6 sm:w-[24rem] sm:rounded-3xl"
        >
          <header className="on-navy flex items-center gap-3 bg-navy px-4 py-3">
            <span className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-orbit-500 to-orbit-600 text-snow">
              <Bot size={20} />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink-900 bg-emerald-400" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold text-white">AMY AI</p>
              <p className="truncate text-xs text-slate-300">Online · Chatbot demo built by Mukesh</p>
            </div>
            <button onClick={reset} className="rounded-lg p-2 text-slate-300 hover:bg-ink-800 hover:text-white" aria-label="Restart conversation" title="Restart">
              <RotateCcw size={16} />
            </button>
            <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-300 hover:bg-ink-800 hover:text-white" aria-label="Close chat">
              <X size={18} />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 scrollbar-thin" aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.from === 'user' ? 'rounded-br-md bg-brand-600 text-snow' : 'rounded-bl-md border border-ink-700 bg-ink-800 text-slate-200'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start" aria-label="AMY AI is typing">
                <div className="flex gap-1 rounded-2xl rounded-bl-md border border-ink-700 bg-ink-800 px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            {!typing && lastBot?.chips && messages[messages.length - 1] === lastBot && (
              <div className="flex flex-wrap gap-2 pt-1">
                {lastBot.chips.map((c) => (
                  <button
                    key={c}
                    onClick={() => sendChip(c)}
                    className="rounded-full border border-brand-600/50 bg-brand-600/10 px-3 py-1.5 text-xs font-medium text-brand-300 transition hover:bg-brand-600 hover:text-snow"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 border-t border-ink-700 p-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input"
              placeholder={
                booking?.step === 'name' ? 'Your name…' : booking?.step === 'phone' ? '0300 1234567' : booking?.step === 'time' ? 'Pick a time above or type it…' : 'Ask about plans, quotes, networking…'
              }
              aria-label="Message AMY AI"
              maxLength={300}
            />
            <button type="submit" disabled={!input.trim() || typing} className="btn-primary !px-3.5" aria-label="Send message">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close AMY AI chat' : 'Open AMY AI chat'}
        className={`fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-orbit-500 to-orbit-600 text-snow shadow-xl shadow-orbit-600/40 transition hover:scale-105 sm:bottom-6 sm:right-6 ${
          open ? 'max-sm:hidden' : ''
        }`}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && unread && (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full border-2 border-ink-950 bg-brand-500 text-[10px] font-bold">1</span>
        )}
      </button>
    </>
  );
}
