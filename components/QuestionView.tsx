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
  const [timeMs, setTimeMs] = useState<number>(0);
  const startTime = useRef(Date.now());

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    const ms = Date.now() - startTime.current;
    setSelected(idx);
    setTimeMs(ms);
    const correct = idx === question.correct_idx;

    trackEvent("answer_submitted", {
      question_id: question.id,
      title: question.title,
      stage: question.stage,
      correct,
      chosen_idx: idx,
      time_to_answer_ms: ms,
    });
  };

  const handleContinue = () => {
    if (selected === null) return;
    onAnswer(selected, selected === question.correct_idx, timeMs);
  };

  const answered = selected !== null;

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
        {question.options.map((option, idx) => {
          const isCorrectAnswer = idx === question.correct_idx;
          const isWrongPick = answered && selected === idx && !isCorrectAnswer;
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={cn(
                "w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 font-medium",
                !answered &&
                  "border-gray-200 bg-white hover:border-[#1d3557] hover:bg-blue-50 active:scale-[0.98]",
                answered &&
                  isCorrectAnswer &&
                  "border-emerald-500 bg-emerald-50 text-emerald-700",
                isWrongPick && "border-red-400 bg-red-50 text-red-700",
                answered &&
                  !isCorrectAnswer &&
                  !isWrongPick &&
                  "border-gray-100 bg-gray-50 text-gray-400"
              )}
              disabled={answered}
            >
              {option}
            </button>
          );
        })}
      </div>

      {answered && (
        <button
          onClick={handleContinue}
          className="w-full py-4 rounded-xl bg-[#1d3557] hover:bg-[#2a4a7a] text-white font-semibold text-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          Weiter
        </button>
      )}
    </div>
  );
}
