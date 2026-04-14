"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { Question, UserProgressRow } from "@/lib/progress";

interface HistoryGridProps {
  questions: Question[];
  progress: UserProgressRow[];
}

export default function HistoryGrid({ questions, progress }: HistoryGridProps) {
  const [selectedQ, setSelectedQ] = useState<Question | null>(null);

  const progressMap = new Map(progress.map((p) => [p.question_id, p]));

  const answeredQuestions = questions.filter((q) => progressMap.has(q.id));

  if (answeredQuestions.length === 0) return null;

  const selectedProgress = selectedQ
    ? progressMap.get(selectedQ.id)
    : undefined;

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        History
      </h3>

      <div className="grid grid-cols-5 gap-2">
        {answeredQuestions.map((q) => {
          const p = progressMap.get(q.id)!;
          return (
            <button
              key={q.id}
              onClick={() => setSelectedQ(selectedQ?.id === q.id ? null : q)}
              className={cn(
                "aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all border-2",
                p.correct
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : "bg-red-50 border-red-300 text-red-600",
                selectedQ?.id === q.id && "ring-2 ring-amber-400 ring-offset-2"
              )}
            >
              <span className="text-[10px] text-gray-400">S{q.stage}</span>
              <span>{p.correct ? "✓" : "✗"}</span>
            </button>
          );
        })}
      </div>

      {/* Expanded detail */}
      {selectedQ && selectedProgress && (
        <div className="mt-4 bg-white rounded-2xl shadow-md p-5 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-amber-600 font-medium">
              Stage {selectedQ.stage} &middot; Q{selectedQ.order_in_stage}
            </p>
            <button
              onClick={() => setSelectedQ(null)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              &times;
            </button>
          </div>
          <h4 className="text-base font-semibold text-gray-800 mb-3">
            {selectedQ.prompt}
          </h4>
          <div className="flex flex-col gap-1 mb-3">
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
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <p className="text-sm text-gray-700">{selectedQ.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
