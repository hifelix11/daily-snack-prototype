"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/posthog";
import { getStageName } from "@/lib/stages";
import type { Question } from "@/lib/progress";

interface ResultViewProps {
  question: Question;
  chosenIdx: number;
  correct: boolean;
  onGoHome: () => void;
}

export default function ResultView({
  question,
  chosenIdx,
  correct,
  onGoHome,
}: ResultViewProps) {
  useEffect(() => {
    trackEvent("explanation_viewed", {
      question_id: question.id,
      stage: question.stage,
      correct,
    });
  }, [question.id, question.stage, correct]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      {/* Result badge */}
      <div className="flex justify-center">
        <div
          className={
            correct
              ? "bg-emerald-100 text-emerald-700 px-6 py-3 rounded-full font-semibold text-lg"
              : "bg-red-100 text-red-700 px-6 py-3 rounded-full font-semibold text-lg"
          }
        >
          {correct ? "Correct!" : "Not quite!"}
        </div>
      </div>

      {/* Question + answer recap */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <p className="text-sm text-amber-600 font-medium mb-2">
          {getStageName(question.stage)} &middot; Question {question.order_in_stage}
        </p>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {question.prompt}
        </h3>

        <div className="flex flex-col gap-2 mb-4">
          {question.options.map((option, idx) => (
            <div
              key={idx}
              className={
                idx === question.correct_idx
                  ? "px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-700 font-medium"
                  : idx === chosenIdx
                    ? "px-4 py-2 rounded-lg bg-red-50 border border-red-300 text-red-600"
                    : "px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-500"
              }
            >
              {option}
              {idx === question.correct_idx && " ✓"}
              {idx === chosenIdx && idx !== question.correct_idx && " ✗"}
            </div>
          ))}
        </div>

        {/* Explanation */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <p className="text-sm font-medium text-amber-700 mb-1">
            Did you know?
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {question.explanation}
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onGoHome}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold text-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
      >
        Back to Home
      </button>
    </div>
  );
}
