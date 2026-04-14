"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/posthog";
import { getStageName } from "@/lib/stages";
import type { Question } from "@/lib/progress";

interface ResultViewProps {
  question: Question;
  correct: boolean;
  onGoHome: () => void;
}

export default function ResultView({
  question,
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
      {correct && (
        <div className="flex justify-center">
          <div className="bg-emerald-100 text-emerald-700 px-6 py-3 rounded-full font-semibold text-lg">
            Richtig!
          </div>
        </div>
      )}

      {/* Explanation */}
      <div>
        <p className="text-sm text-[#1d3557] font-medium mb-3">
          {getStageName(question.stage)} &middot; Frage {question.order_in_stage}
        </p>
        <p className="text-lg text-gray-800 leading-relaxed">
          {question.explanation}
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onGoHome}
        className="w-full py-4 rounded-xl bg-[#1d3557] hover:bg-[#2a4a7a] text-white font-semibold text-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
      >
        Zurück zur Startseite
      </button>
    </div>
  );
}
