export const STAGE_NAMES: Record<number, string> = {
  1: "Blinde Flecken",
  2: "Küchen-Code",
  3: "Pille trifft Teller",
  4: "Die Kehrseite",
};

export function getStageName(stage: number): string {
  return STAGE_NAMES[stage] ?? `Stage ${stage}`;
}
