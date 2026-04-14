"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserId } from "./providers";
import {
  fetchAllData,
  canPlayToday,
  getStageUnlocks,
  formatNextAvailableLabel,
} from "@/lib/progress";
import { trackEvent } from "@/lib/posthog";
import StageProgress from "@/components/StageProgress";
import HistoryGrid from "@/components/HistoryGrid";
import type { Question, UserProgressRow } from "@/lib/progress";

export default function HomePage() {
  const userId = useUserId();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [progress, setProgress] = useState<UserProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [allDone, setAllDone] = useState(false);
  const [, setNowTick] = useState(0);

  useEffect(() => {
    if (!userId) return;

    fetchAllData(userId).then(({ questions: q, progress: p }) => {
      setQuestions(q);
      setProgress(p);
      setAllDone(p.length >= q.length);
      setLoading(false);
    });
  }, [userId]);

  useEffect(() => {
    const id = setInterval(() => setNowTick((n) => n + 1), 30 * 1000);
    return () => clearInterval(id);
  }, []);

  const canPlay = canPlayToday(progress);
  const nextLabel = formatNextAvailableLabel(progress);

  const handlePlay = () => {
    if (!canPlay) {
      trackEvent("daily_gate_hit");
      return;
    }
    router.push("/play");
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-[#1d3557] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stages = getStageUnlocks(progress, questions);

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-md mx-auto w-full gap-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">Daily Snack</h1>
        <p className="text-sm text-gray-500 mt-1">
          Jeden Tag etwas Neues lernen
        </p>
      </div>

      {/* Stage Progress */}
      <StageProgress stages={stages} />

      {/* CTA */}
      {allDone ? (
        <div className="bg-emerald-50 rounded-2xl p-6 text-center border border-emerald-200 w-full">
          <p className="text-lg font-semibold text-emerald-700 mb-1">
            Geschafft!
          </p>
          <p className="text-sm text-emerald-600">
            Danke fürs Testen! Sie haben alle 30 Fragen beantwortet.
          </p>
        </div>
      ) : canPlay ? (
        <button
          onClick={handlePlay}
          className="w-full py-4 rounded-xl bg-[#1d3557] hover:bg-[#2a4a7a] text-white font-semibold text-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
        >
          Heutige Frage
        </button>
      ) : (
        <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200 w-full">
          <p className="text-lg font-semibold text-gray-700">
            Nächste Frage {nextLabel}
          </p>
        </div>
      )}

      {/* History */}
      <HistoryGrid questions={questions} progress={progress} />
    </main>
  );
}
