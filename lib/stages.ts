export const STAGE_NAMES: Record<number, string> = {
  1: "Blinde Flecken",
  2: "Küchen-Code",
  3: "Pille trifft Teller",
  4: "Die Kehrseite",
};

export const STAGE_EMOJIS: Record<number, string> = {
  1: "👁",
  2: "🍳",
  3: "💊",
  4: "⚖️",
};

export function getStageName(stage: number): string {
  return STAGE_NAMES[stage] ?? `Stage ${stage}`;
}

export function getStageEmoji(stage: number): string {
  return STAGE_EMOJIS[stage] ?? "";
}
