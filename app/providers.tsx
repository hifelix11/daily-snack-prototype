"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { ensureAnonAuth } from "@/lib/supabase";
import { initPostHog, identifyUser, trackEvent } from "@/lib/posthog";

const AuthContext = createContext<string | null>(null);

export function useUserId() {
  return useContext(AuthContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initPostHog();
    trackEvent("app_opened");

    ensureAnonAuth()
      .then((id) => {
        setUserId(id);
        identifyUser(id);
      })
      .catch((err) => {
        console.error("Auth error:", err);
        setError("Fehler beim Initialisieren. Bitte neu laden.");
      });
  }, []);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#1d3557] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Wird geladen…</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={userId}>{children}</AuthContext.Provider>;
}
