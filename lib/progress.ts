"use client";

import { supabase } from "./supabase";

export interface Question {
  id: string;
  stage: number;
  order_in_stage: number;
  title: string | null;
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

const STAGE_SIZES: Record<number, number> = { 1: 6, 2: 9, 3: 12, 4: 3 };

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

export const COOLDOWN_MS = 20 * 60 * 60 * 1000;

function lastAnswerTime(progress: UserProgressRow[]): number | null {
  if (progress.length === 0) return null;
  return progress.reduce((latest, p) => {
    const t = new Date(p.answered_at).getTime();
    return t > latest ? t : latest;
  }, 0);
}

export function canPlayToday(progress: UserProgressRow[]): boolean {
  const last = lastAnswerTime(progress);
  if (last === null) return true;
  return Date.now() - last >= COOLDOWN_MS;
}

export interface RetentionStats {
  answered_total: number;
  current_stage: number;
  days_since_first_answer: number;
  streak_days: number;
}

export function getRetentionStats(
  progress: UserProgressRow[],
  questions: Question[]
): RetentionStats {
  const answered_total = progress.length;

  const stageUnlocks = getStageUnlocks(progress, questions);
  const firstIncomplete = stageUnlocks.find((s) => !s.complete);
  const current_stage = firstIncomplete ? firstIncomplete.stage : 4;

  let days_since_first_answer = 0;
  if (progress.length > 0) {
    const first = progress.reduce((earliest, p) => {
      const t = new Date(p.answered_at).getTime();
      return t < earliest ? t : earliest;
    }, Number.POSITIVE_INFINITY);
    const DAY_MS = 24 * 60 * 60 * 1000;
    days_since_first_answer = Math.floor((Date.now() - first) / DAY_MS);
  }

  const streak_days = computeStreakDays(progress);

  return { answered_total, current_stage, days_since_first_answer, streak_days };
}

function computeStreakDays(progress: UserProgressRow[]): number {
  if (progress.length === 0) return 0;
  const answeredDays = new Set(
    progress.map((p) => new Date(p.answered_at).toDateString())
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Streak counts backwards from today (or yesterday if they haven't played today yet).
  let cursor: Date;
  if (answeredDays.has(today.toDateString())) cursor = today;
  else if (answeredDays.has(yesterday.toDateString())) cursor = yesterday;
  else return 0;

  let streak = 0;
  while (answeredDays.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function msUntilNextQuestion(progress: UserProgressRow[]): number {
  const last = lastAnswerTime(progress);
  if (last === null) return 0;
  return Math.max(0, COOLDOWN_MS - (Date.now() - last));
}

export function formatNextAvailableLabel(progress: UserProgressRow[]): string {
  const ms = msUntilNextQuestion(progress);
  if (ms <= 0) return "";

  const ONE_HOUR = 60 * 60 * 1000;
  if (ms < ONE_HOUR) {
    const minutes = Math.ceil(ms / (60 * 1000));
    return `in ${minutes} ${minutes === 1 ? "Minute" : "Minuten"}`;
  }

  const last = lastAnswerTime(progress)!;
  const next = new Date(last + COOLDOWN_MS);
  const hour = next.getHours();

  // Awkward-to-show absolute times at night: fall back to relative hours.
  if (hour >= 22 || hour < 6) {
    const hours = Math.floor(ms / ONE_HOUR);
    return `in ${hours} ${hours === 1 ? "Stunde" : "Stunden"}`;
  }

  const now = new Date();
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round(
    (startOfDay(next) - startOfDay(now)) / (24 * 60 * 60 * 1000)
  );

  const hh = String(hour).padStart(2, "0");
  const mm = String(next.getMinutes()).padStart(2, "0");
  const time = `${hh}:${mm}`;

  let day: string;
  if (dayDiff <= 0) day = "heute";
  else if (dayDiff === 1) day = "morgen";
  else day = `in ${dayDiff} Tagen`;

  return `${day} um ${time} Uhr`;
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
