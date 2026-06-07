import { Activity, ActivityWithResult, PertResult } from "@/types";

// ============================================================
// Hitung Expected Time (TE)
// Formula: TE = (O + 4M + P) / 6
// ============================================================
export function calculateTE(o: number, m: number, p: number): number {
  return (o + 4 * m + p) / 6;
}

// ============================================================
// Hitung Variance (σ²)
// Formula: σ² = ((P - O) / 6)²
// ============================================================
export function calculateVariance(o: number, p: number): number {
  return Math.pow((p - o) / 6, 2);
}

// ============================================================
// Hitung TE dan Variance untuk semua aktivitas
// Return map: id → Partial<PertResult> (hanya te & variance)
// ES/EF/LS/LF/Slack/isCritical diisi oleh graph.ts
// ============================================================
export function calculatePertTimes(
  activities: Activity[]
): Map<string, Pick<PertResult, "te" | "variance">> {
  const result = new Map<string, Pick<PertResult, "te" | "variance">>();

  for (const act of activities) {
    const te = calculateTE(act.o, act.m, act.p);
    const variance = calculateVariance(act.o, act.p);
    result.set(act.id, { te, variance });
  }

  return result;
}

// ============================================================
// Fungsi utama: hitung semua nilai PERT dari array Activity[]
// Dipanggil setelah graph.ts mengisi ES/EF/LS/LF/Slack/isCritical
// ============================================================
export function buildActivityWithResult(
  activity: Activity,
  pertTimes: Pick<PertResult, "te" | "variance">,
  graphResult: Pick<PertResult, "es" | "ef" | "ls" | "lf" | "slack" | "isCritical">
): ActivityWithResult {
  return {
    ...activity,
    ...pertTimes,
    ...graphResult,
  };
}
