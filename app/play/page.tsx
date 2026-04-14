"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserId } from "../providers";
import {
  getNextQuestion,
  canPlayToday,
  fetchAllData,
  submitAnswer,
  formatNextAvailableLabel,
} from "@/lib/progress";
import { trackEvent } from "@/lib/posthog";
import QuestionView from "@/components/QuestionView";
import ResultView from "@/components/ResultView";
import type { Question, UserProgressRow } from "@/lib/progress";

type Phase = "loading" | "question" | "result" | "gate" | "done";

export default function PlayPage() {
  const userId = useUserId();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [question, setQuestion] = useState<Question | null>(null);
  const [correct, setCorrect] = useState<boolean>(false);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [allProgress, setAllProgress] = useState<UserProgressRow[]>([]);
  const [, setNowTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setNowTick((n) => n + 1), 30 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      const { questions, progress } = await fetchAllData(userId);
      setAllQuestions(questions);
      setAllProgress(progress);

      if (!canPlayToday(progress)) {
        trackEvent("daily_gate_hit");
        setPhase("gate");
        return;
      }

      const next = await getNextQuestion(userId);
      if (!next) {
        trackEvent("all_questions_completed");
        setPhase("done");
        return;
      }

      trackEvent("question_viewed", {
        question_id: next.id,
        stage: next.stage,
      });
      setQuestion(next);
      setPhase("question");
    })();
  }, [userId]);

  const handleAnswer = async (idx: number, isCorrect: boolean) => {
    if (!userId || !question) return;

    setCorrect(isCorrect);

    await submitAnswer(userId, question.id, idx, isCorrect);

    // Check if stage just completed
    const stageQuestions = allQuestions.filter(
      (q) => q.stage === question.stage
    );
    const answeredInStage = allProgress.filter((p) =>
      stageQuestions.some((sq) => sq.id === p.question_id)
    ).length;
    // +1 for the question just answered
    if (answeredInStage + 1 >= stageQuestions.length) {
      trackEvent("stage_completed", { stage: question.stage });
    }

    // Check if all questions done
    if (allProgress.length + 1 >= allQuestions.length) {
      trackEvent("all_questions_completed");
    }

    setPhase("result");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  if (phase === "loading") {
    return (
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-[#1d3557] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (phase === "gate") {
    const nextLabel = formatNextAvailableLabel(allProgress);
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto gap-6">
        <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200">
          <p className="text-lg font-semibold text-gray-700">
            Nächste Frage {nextLabel}
          </p>
        </div>
        <button
          onClick={handleGoHome}
          className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
        >
          Zurück zur Startseite
        </button>
      </main>
    );
  }

  if (phase === "done") {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto gap-6">
        <div className="bg-emerald-50 rounded-2xl p-6 text-center border border-emerald-200">
          <p className="text-lg font-semibold text-emerald-700 mb-1">
            Geschafft!
          </p>
          <p className="text-sm text-emerald-600">
            Danke fürs Testen! Sie haben alle 30 Fragen beantwortet.
          </p>
        </div>
        <button
          onClick={handleGoHome}
          className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
        >
          Zurück zur Startseite
        </button>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      {phase === "question" && question && (
        <QuestionView question={question} onAnswer={handleAnswer} />
      )}
      {phase === "result" && question && (
        <ResultView
          question={question}
          correct={correct}
          onGoHome={handleGoHome}
        />
      )}
    </main>
  );
}
