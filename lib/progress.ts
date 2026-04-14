"use client";

import { supabase } from "./supabase";

export interface Question {
  id: string;
  stage: number;
  order_in_stage: number;
  prompt: string;
  options: string[];
  correct_idx: number;
  explanation: string;
}

export interface UserProgressRow {
  id: string;
  user_id: string;
  question_id: string;
  chosen_idx: number;
  correct: boolean;
  answered_at: string;
}

const STAGE_SIZES: Record<number, number> = { 1: 3, 2: 5, 3: 8, 4: 4 };

export function getStageUnlocks(progress: UserProgressRow[], allQuestions: Question[]) {
  const stages = [1, 2, 3, 4];
  const answeredIds = new Set(progress.map((p) => p.question_id));

  return stages.map((stage) => {
    const stageQuestions = allQuestions.filter((q) => q.stage === stage);
    const answeredCount = stageQuestions.filter((q) => answeredIds.has(q.id)).length;
    const total = STAGE_SIZES[stage];

    // A stage is unlocked if all previous stages are complete
    const previousComplete =
      stage === 1 ||
      allQuestions
        .filter((q) => q.stage === stage - 1)
        .every((q) => answeredIds.has(q.id));

    return {
      stage,
      total,
      answered: answeredCount,
      unlocked: previousComplete,
      complete: answeredCount >= total,
    };
  });
}

export async function getNextQuestion(
  userId: string
): Promise<Question | null> {
  const [questionsRes, progressRes] = await Promise.all([
    supabase.from("questions").select("*").order("stage").order("order_in_stage"),
    supabase.from("user_progress").select("*").eq("user_id", userId),
  ]);

  if (questionsRes.error) throw questionsRes.error;
  if (progressRes.error) throw progressRes.error;

  const questions: Question[] = questionsRes.data;
  const progress: UserProgressRow[] = progressRes.data;
  const answeredIds = new Set(progress.map((p) => p.question_id));

  // All done?
  if (answeredIds.size >= questions.length) return null;

  // Find current stage: lowest stage where answered < stage size
  for (const stage of [1, 2, 3, 4]) {
    const stageQuestions = questions.filter((q) => q.stage === stage);
    const answeredInStage = stageQuestions.filter((q) =>
      answeredIds.has(q.id)
    ).length;

    if (answeredInStage < STAGE_SIZES[stage]) {
      // Check if previous stage is complete (stage unlock)
      if (stage > 1) {
        const prevStageQuestions = questions.filter(
          (q) => q.stage === stage - 1
        );
        const prevAnswered = prevStageQuestions.filter((q) =>
          answeredIds.has(q.id)
        ).length;
        if (prevAnswered < STAGE_SIZES[stage - 1]) {
          return null; // Previous stage not complete
        }
      }

      // Return next unanswered question in this stage
      const next = stageQuestions.find((q) => !answeredIds.has(q.id));
      return next || null;
    }
  }

  return null;
}

export function canPlayToday(progress: UserProgressRow[]): boolean {
  if (progress.length === 0) return true;

  const today = new Date().toDateString();
  const lastAnswer = progress.reduce((latest, p) => {
    const d = new Date(p.answered_at);
    return d > latest ? d : latest;
  }, new Date(0));

  return lastAnswer.toDateString() !== today;
}

export async function fetchAllData(userId: string) {
  const [questionsRes, progressRes] = await Promise.all([
    supabase.from("questions").select("*").order("stage").order("order_in_stage"),
    supabase.from("user_progress").select("*").eq("user_id", userId),
  ]);

  if (questionsRes.error) throw questionsRes.error;
  if (progressRes.error) throw progressRes.error;

  return {
    questions: questionsRes.data as Question[],
    progress: progressRes.data as UserProgressRow[],
  };
}

export async function submitAnswer(
  userId: string,
  questionId: string,
  chosenIdx: number,
  correct: boolean
) {
  const { error } = await supabase.from("user_progress").insert({
    user_id: userId,
    question_id: questionId,
    chosen_idx: chosenIdx,
    correct,
  });
  if (error) throw error;
}
