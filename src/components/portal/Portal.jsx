import { useCallback } from 'react';
import { api } from '../../lib/api.js';
import AuthScreen from './AuthScreen.jsx';
import ClientPortal from './ClientPortal.jsx';
import TeamPortal from './TeamPortal.jsx';
import { FullPageLoader } from './ui.jsx';

/** Routes the portal view: loading → sign-in → client or team workspace. */
export default function Portal({ user, setUser, notify, onBack }) {
  const onUnauthorized = useCallback(() => {
    setUser(null);
    notify({ type: 'info', title: 'Your session ended', message: 'Please sign in again.' });
  }, [setUser, notify]);

  const onLogout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* clear local state regardless */
    }
    setUser(null);
    notify({ type: 'info', title: 'Signed out' });
  }, [setUser, notify]);

  if (user === undefined) return <FullPageLoader label="Connecting to the AMY portal…" />;

  if (!user) {
    return (
      <AuthScreen
        onBack={onBack}
        onAuthed={(u) => {
          setUser(u);
          notify({ title: `Welcome, ${u.name}` });
        }}
      />
    );
  }

  if (user.role === 'team') return <TeamPortal user={user} notify={notify} onLogout={onLogout} onUnauthorized={onUnauthorized} />;

  return (
    <ClientPortal
      user={user}
      setUser={setUser}
      notify={notify}
      onLogout={onLogout}
      onUnauthorized={onUnauthorized}
      isDemo={!!user.isDemo}
    />
  );
}
