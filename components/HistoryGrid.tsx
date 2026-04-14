"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { getStageName } from "@/lib/stages";
import {
  getStageUnlocks,
  canPlayToday,
  formatNextAvailableLabel,
} from "@/lib/progress";
import type { Question, UserProgressRow } from "@/lib/progress";

interface HistoryGridProps {
  questions: Question[];
  progress: UserProgressRow[];
}

export default function HistoryGrid({ questions, progress }: HistoryGridProps) {
  const [selectedQ, setSelectedQ] = useState<Question | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const progressMap = new Map(progress.map((p) => [p.question_id, p]));
  const unlockedStages = new Set(
    getStageUnlocks(progress, questions)
      .filter((s) => s.unlocked)
      .map((s) => s.stage)
  );

  const sortedQuestions = [...questions].sort(
    (a, b) => a.stage - b.stage || a.order_in_stage - b.order_in_stage
  );

  if (sortedQuestions.length === 0) return null;

  const selectedProgress = selectedQ
    ? progressMap.get(selectedQ.id)
    : undefined;

  const handleTileClick = (
    q: Question,
    { answered, locked }: { answered: boolean; locked: boolean }
  ) => {
    if (answered) {
      setSelectedQ(selectedQ?.id === q.id ? null : q);
      return;
    }
    if (locked) {
      setToast(
        `Noch gesperrt — schließen Sie zuerst „${getStageName(q.stage - 1)}" ab.`
      );
      return;
    }
    if (canPlayToday(progress)) {
      setToast('Tippen Sie auf „Heutige Frage", um weiterzumachen.');
    } else {
      setToast(`Nächste Frage ${formatNextAvailableLabel(progress)}`);
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Verlauf
      </h3>

      <div className="grid grid-cols-4 gap-2">
        {sortedQuestions.map((q) => {
          const p = progressMap.get(q.id);
          const locked = !unlockedStages.has(q.stage) && !p;
          const answered = !!p;

          return (
            <button
              key={q.id}
              onClick={() => handleTileClick(q, { answered, locked })}
              className={cn(
                "aspect-square rounded-xl flex flex-col items-center justify-center gap-1 p-2 text-xs font-medium transition-all border-2",
                answered && "bg-emerald-100 border-emerald-400 text-emerald-700",
                !answered && !locked &&
                  "bg-white border-gray-200 text-gray-500",
                locked && "bg-gray-100 border-gray-200 text-gray-300",
                selectedQ?.id === q.id && "ring-2 ring-[#1d3557] ring-offset-2"
              )}
            >
              {locked ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              ) : (
                <>
                  <span className="text-[11px] leading-tight text-center line-clamp-2">
                    {q.title ?? "—"}
                  </span>
                  <span className="text-lg leading-none">
                    {answered && "✓"}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Detail overlay */}
      {selectedQ && selectedProgress && (
        <div
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedQ(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[#1d3557] font-medium">
                {getStageName(selectedQ.stage)} &middot; Frage {selectedQ.order_in_stage}
              </p>
              <button
                onClick={() => setSelectedQ(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center"
                aria-label="Schließen"
              >
                &times;
              </button>
            </div>
            <h4 className="text-base font-semibold text-gray-800 mb-3">
              {selectedQ.prompt}
            </h4>
            <div className="flex flex-col gap-1 mb-5">
              {selectedQ.options.map((opt, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm",
                    idx === selectedQ.correct_idx
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : idx === selectedProgress.chosen_idx
                        ? "bg-red-50 text-red-600"
                        : "bg-gray-50 text-gray-500"
                  )}
                >
                  {opt}
                  {idx === selectedQ.correct_idx && " ✓"}
                </div>
              ))}
            </div>
            <p className="text-base text-gray-800 leading-relaxed">
              {selectedQ.explanation}
            </p>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed inset-x-0 bottom-6 flex justify-center px-4 z-50 pointer-events-none">
          <div className="bg-[#1d3557] text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg max-w-sm text-center animate-in fade-in slide-in-from-bottom-2 duration-200">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
