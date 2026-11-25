import { useCallback, useEffect, useRef, useState } from 'react';
import Navbar, { NAV_LINKS } from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Services from './components/Services.jsx';
import Pricing from './components/Pricing.jsx';
import Showcase from './components/Showcase.jsx';
import About from './components/About.jsx';
import Roadmap from './components/Roadmap.jsx';
import CaseStudies from './components/CaseStudies.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import Portal from './components/portal/Portal.jsx';
import ChatWidget from './components/ChatWidget.jsx';
import Toasts from './components/Toasts.jsx';
import usePersistentState from './hooks/usePersistentState.js';
import useScrollReveal from './hooks/useScrollReveal.js';
import { api } from './lib/api.js';
import { scrollToId, uid } from './lib/format.js';

const PORTAL_HASH = '#client-portal';

export default function App() {
  const [view, setView] = useState(() => (window.location.hash === PORTAL_HASH ? 'dashboard' : 'site'));
  const [currency, setCurrency] = usePersistentState('currency', 'PKR');
  // Requests submitted from this browser (server keeps the master copy for the team).
  const [myBookings, setMyBookings] = usePersistentState('my-bookings', []);
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out
  const [toasts, setToasts] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState(null);
  const [bookingPrefill, setBookingPrefill] = useState(null);
  const [pendingScroll, setPendingScroll] = useState(null);
  const [activeSection, setActiveSection] = useState('top');
  const toastTimers = useRef({});

  useScrollReveal(view === 'site');

  useEffect(() => {
    api
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null));
  }, []);

  // Keep the URL in sync so the portal view survives a refresh and can be linked to.
  useEffect(() => {
    const target = view === 'dashboard' ? PORTAL_HASH : '';
    if (window.location.hash !== target) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${target}`);
    }
  }, [view]);

  useEffect(() => {
    const onHash = () => setView(window.location.hash === PORTAL_HASH ? 'dashboard' : 'site');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (view !== 'site' || !pendingScroll) return;
    const id = pendingScroll;
    const raf = requestAnimationFrame(() => {
      if (id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
      else scrollToId(id);
      setPendingScroll(null);
    });
    return () => cancelAnimationFrame(raf);
  }, [view, pendingScroll]);

  useEffect(() => {
    if (view !== 'site') return;
    const ids = ['top', ...NAV_LINKS.map((l) => l.id).filter((id) => id !== 'dashboard'), 'demo', 'roadmap'];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5] }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [view]);

  const dismissToast = useCallback((id) => {
    clearTimeout(toastTimers.current[id]);
    delete toastTimers.current[id];
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const notify = useCallback(
    (toast) => {
      const id = uid('t');
      setToasts((t) => [...t.slice(-2), { id, type: 'success', ...toast }]);
      toastTimers.current[id] = setTimeout(() => dismissToast(id), toast.type === 'error' ? 6500 : 4500);
    },
    [dismissToast]
  );

  const navigate = useCallback(
    (id) => {
      if (view !== 'site') {
        setView('site');
        setPendingScroll(id);
      } else if (id === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        scrollToId(id);
      }
    },
    [view]
  );

  const openPortal = useCallback(() => {
    setView('dashboard');
    window.scrollTo({ top: 0 });
  }, []);

  const book = useCallback(
    (service, note) => {
      setBookingPrefill({ service, note, nonce: Date.now() });
      navigate('contact');
    },
    [navigate]
  );

  /** Sends a consultation request to the server. Returns the saved record, or throws with a user-facing message. */
  const addBooking = useCallback(
    async (data) => {
      const { booking } = await api.createBooking(data);
      setMyBookings((b) => [booking, ...b].slice(0, 20));
      notify({ title: 'Consultation request received', message: `Ref ${booking.ref}. Mukesh will contact ${booking.name} soon.` });
      return booking;
    },
    [setMyBookings, notify]
  );

  const askBot = useCallback((prompt) => {
    setPendingPrompt(prompt);
    setChatOpen(true);
  }, []);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-snow">
        Skip to content
      </a>
      <Navbar
        view={view}
        user={user}
        activeSection={activeSection}
        onNavigate={navigate}
        onPortal={openPortal}
        onBook={() => book()}
        currency={currency}
        onCurrency={setCurrency}
      />

      <main id="main">
        {view === 'site' ? (
          <>
            <Hero currency={currency} onPlans={() => scrollToId('pricing')} onDemo={openPortal} onNavigate={navigate} />
            <Services onRequest={(service) => book(service)} />
            <Pricing currency={currency} onCurrency={setCurrency} onChoosePlan={book} />
            <Showcase onAsk={askBot} onOpenDashboard={openPortal} />
            <About />
            <Roadmap />
            <CaseStudies onStart={() => book()} />
            <Contact prefill={bookingPrefill} bookings={myBookings} onSubmit={addBooking} onClear={() => setMyBookings([])} />
          </>
        ) : (
          <Portal user={user} setUser={setUser} notify={notify} onBack={() => navigate('top')} />
        )}
      </main>

      {view === 'site' && <Footer onNavigate={navigate} onPortal={openPortal} onOpenChat={() => setChatOpen(true)} />}

      <ChatWidget
        open={chatOpen}
        setOpen={setChatOpen}
        currency={currency}
        onBooked={addBooking}
        onOpenDashboard={() => {
          setChatOpen(false);
          openPortal();
        }}
        pendingPrompt={pendingPrompt}
        clearPendingPrompt={() => setPendingPrompt(null)}
      />
      <Toasts toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
