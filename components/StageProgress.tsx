"use client";

import { cn } from "@/lib/cn";

interface StageInfo {
  stage: number;
  total: number;
  answered: number;
  unlocked: boolean;
  complete: boolean;
}

interface StageProgressProps {
  stages: StageInfo[];
}

export default function StageProgress({ stages }: StageProgressProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        Your Progress
      </h3>
      {stages.map((s) => {
        const pct = s.total > 0 ? (s.answered / s.total) * 100 : 0;
        return (
          <div key={s.stage} className="flex items-center gap-3">
            <div className="flex items-center gap-2 w-20 shrink-0">
              {!s.unlocked ? (
                <svg
                  className="w-4 h-4 text-gray-400"
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
              ) : s.complete ? (
                <svg
                  className="w-4 h-4 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : null}
              <span
                className={cn(
                  "text-sm font-medium",
                  s.unlocked ? "text-gray-700" : "text-gray-400"
                )}
              >
                Stage {s.stage}
              </span>
            </div>

            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  !s.unlocked
                    ? "bg-gray-300"
                    : s.complete
                      ? "bg-emerald-400"
                      : "bg-amber-400"
                )}
                style={{ width: `${pct}%` }}
              />
            </div>

            <span
              className={cn(
                "text-xs font-medium w-10 text-right",
                s.unlocked ? "text-gray-600" : "text-gray-400"
              )}
            >
              {s.answered}/{s.total}
            </span>
          </div>
        );
      })}
    </div>
  );
}
