"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/cn";
import { trackEvent } from "@/lib/posthog";
import { getStageName } from "@/lib/stages";
import type { Question } from "@/lib/progress";

interface QuestionViewProps {
  question: Question;
  onAnswer: (chosenIdx: number, correct: boolean, timeMs: number) => void;
}

export default function QuestionView({ question, onAnswer }: QuestionViewProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const startTime = useRef(Date.now());

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const timeMs = Date.now() - startTime.current;
    const correct = idx === question.correct_idx;

    trackEvent("answer_submitted", {
      question_id: question.id,
      stage: question.stage,
      correct,
      chosen_idx: idx,
      time_to_answer_ms: timeMs,
    });

    setTimeout(() => {
      onAnswer(idx, correct, timeMs);
    }, 300);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <p className="text-sm text-[#1d3557] font-medium mb-2">
          {getStageName(question.stage)} &middot; Frage {question.order_in_stage}
        </p>
        <h2 className="text-lg font-semibold text-gray-800 leading-snug">
          {question.prompt}
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            className={cn(
              "w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 font-medium",
              selected === null &&
                "border-gray-200 bg-white hover:border-[#1d3557] hover:bg-blue-50 active:scale-[0.98]",
              selected === idx &&
                idx === question.correct_idx &&
                "border-emerald-500 bg-emerald-50 text-emerald-700",
              selected === idx &&
                idx !== question.correct_idx &&
                "border-red-400 bg-red-50 text-red-700",
              selected !== null &&
                selected !== idx &&
                "border-gray-100 bg-gray-50 text-gray-400"
            )}
            disabled={selected !== null}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
