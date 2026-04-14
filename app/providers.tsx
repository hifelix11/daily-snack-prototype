"use client";

import { useEffect, useState, createContext, useContext } from "react";
import {
  getCurrentUser,
  onAuthChange,
  signInWithMagicLink,
} from "@/lib/supabase";
import {
  initPostHog,
  identifyUser,
  resetUser,
  trackEvent,
} from "@/lib/posthog";

const AuthContext = createContext<string | null>(null);

export function useUserId() {
  return useContext(AuthContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initPostHog();
    trackEvent("app_opened");

    getCurrentUser()
      .then((user) => {
        setUserId(user?.id ?? null);
        if (user) identifyUser(user.id, { email: user.email });
      })
      .finally(() => setLoading(false));

    const unsubscribe = onAuthChange((user) => {
      // Detect sign-out: previously had a user, now null → reset PostHog.
      setUserId((prev) => {
        if (prev && !user) resetUser();
        return user?.id ?? null;
      });
      if (user) identifyUser(user.id, { email: user.email });
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-[#1d3557] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!userId) {
    return <SignInScreen />;
  }

  return <AuthContext.Provider value={userId}>{children}</AuthContext.Provider>;
}

function SignInScreen() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await signInWithMagicLink(email.trim());
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Der Link konnte nicht gesendet werden."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-md p-8 border border-gray-100 text-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            E-Mail prüfen
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Wir haben einen Anmeldelink an{" "}
            <span className="font-medium text-[#1d3557]">{email}</span> gesendet.
            Klick auf den Link, um fortzufahren — auf diesem oder einem
            anderen Gerät.
          </p>
          <button
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
            className="mt-6 text-sm text-gray-500 hover:text-gray-700"
          >
            Andere E-Mail verwenden
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-md p-8 border border-gray-100">
        <h1 className="text-xl font-semibold text-gray-800 mb-1 text-center">
          Daily Snack
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Einfach mit deiner LaVita E-Mail-Adresse anmelden, um auf allen
          Geräten den gleichen Fortschritt zu sehen.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ihre.email@beispiel.de"
            required
            autoFocus
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-800 focus:border-[#1d3557] focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={submitting || !email}
            className="w-full py-3 rounded-xl bg-[#1d3557] hover:bg-[#2a4a7a] text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Wird gesendet…" : "Anmeldelink senden"}
          </button>
          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}
        </form>
      </div>
    </main>
  );
}
