import { Activity, ActivityWithResult, PertResult } from "@/types";
import { buildActivityWithResult, calculatePertTimes } from "./pert";

// ============================================================
// Topological Sort (Kahn's Algorithm)
// Pastikan urutan aktivitas sesuai ketergantungan (A sebelum B, dst)
// Return null jika ada siklus (cycle detected)
// ============================================================
function topologicalSort(activities: Activity[]): string[] | null {
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>(); // id → successors

  // Inisialisasi
  for (const act of activities) {
    if (!inDegree.has(act.id)) inDegree.set(act.id, 0);
    if (!adjList.has(act.id)) adjList.set(act.id, []);
  }

  // Bangun adjacency list & hitung in-degree
  for (const act of activities) {
    for (const predId of act.predecessors) {
      // predId → act.id (pred harus selesai sebelum act)
      const successors = adjList.get(predId) ?? [];
      successors.push(act.id);
      adjList.set(predId, successors);

      inDegree.set(act.id, (inDegree.get(act.id) ?? 0) + 1);
    }
  }

  // Kahn's BFS: mulai dari node dengan in-degree = 0
  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const sorted: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);

    for (const neighbor of adjList.get(current) ?? []) {
      const newDegree = (inDegree.get(neighbor) ?? 0) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  // Jika sorted tidak mencakup semua node → ada siklus
  if (sorted.length !== activities.length) return null;

  return sorted;
}

// ============================================================
// Forward Pass
// Hitung ES (Earliest Start) dan EF (Earliest Finish) tiap node
// ES node = max(EF semua pendahulunya)
// EF = ES + TE
// ============================================================
function forwardPass(
  sortedIds: string[],
  actMap: Map<string, Activity>,
  teMap: Map<string, number>
): Map<string, { es: number; ef: number }> {
  const result = new Map<string, { es: number; ef: number }>();

  for (const id of sortedIds) {
    const act = actMap.get(id)!;
    const te = teMap.get(id)!;

    // ES = max EF dari semua pendahulu; 0 jika tidak ada pendahulu
    let es = 0;
    for (const predId of act.predecessors) {
      const predEF = result.get(predId)?.ef ?? 0;
      if (predEF > es) es = predEF;
    }

    const ef = es + te;
    result.set(id, { es, ef });
  }

  return result;
}

// ============================================================
// Backward Pass
// Hitung LF (Latest Finish) dan LS (Latest Start) tiap node
// LF node = min(LS semua successornya)
// LS = LF - TE
// ============================================================
function backwardPass(
  sortedIds: string[],
  actMap: Map<string, Activity>,
  teMap: Map<string, number>,
  forwardResult: Map<string, { es: number; ef: number }>,
  projectDuration: number
): Map<string, { ls: number; lf: number }> {
  const result = new Map<string, { ls: number; lf: number }>();

  // Bangun successor list dari predecessors
  const successorMap = new Map<string, string[]>();
  for (const id of sortedIds) {
    successorMap.set(id, []);
  }
  for (const [id, act] of actMap) {
    for (const predId of act.predecessors) {
      const succs = successorMap.get(predId) ?? [];
      succs.push(id);
      successorMap.set(predId, succs);
    }
  }

  // Traverse terbalik (dari akhir ke awal)
  for (const id of [...sortedIds].reverse()) {
    const te = teMap.get(id)!;
    const successors = successorMap.get(id) ?? [];

    // LF = min LS successor; jika tidak ada successor → pakai projectDuration
    let lf = projectDuration;
    for (const succId of successors) {
      const succLS = result.get(succId)?.ls ?? projectDuration;
      if (succLS < lf) lf = succLS;
    }

    const ls = lf - te;
    result.set(id, { ls, lf });
  }

  return result;
}

// ============================================================
// Fungsi utama: jalankan seluruh kalkulasi PERT + Graph
// Input  : Activity[]
// Output : ActivityWithResult[] | null (null jika ada siklus)
// ============================================================
export function runPertGraph(activities: Activity[]): {
  results: ActivityWithResult[] | null;
  projectDuration: number;
  criticalPath: string[];
  error?: string;
} {
  if (activities.length === 0) {
    return { results: [], projectDuration: 0, criticalPath: [] };
  }

  // Topological Sort
  const sortedIds = topologicalSort(activities);
  if (!sortedIds) {
    return {
      results: null,
      projectDuration: 0,
      criticalPath: [],
      error: "Terdapat ketergantungan siklik (circular dependency) antar aktivitas.",
    };
  }

  // Map id → Activity untuk akses cepat
  const actMap = new Map<string, Activity>(activities.map((a) => [a.id, a]));

  // Hitung TE & Variance
  const pertTimesMap = calculatePertTimes(activities);
  const teMap = new Map<string, number>(
    [...pertTimesMap.entries()].map(([id, v]) => [id, v.te])
  );

  // Forward Pass
  const fwdResult = forwardPass(sortedIds, actMap, teMap);

  // Project Duration = max EF dari semua node
  let projectDuration = 0;
  for (const { ef } of fwdResult.values()) {
    if (ef > projectDuration) projectDuration = ef;
  }

  // Backward Pass
  const bwdResult = backwardPass(
    sortedIds,
    actMap,
    teMap,
    fwdResult,
    projectDuration
  );

  // Gabungkan semua hasil → ActivityWithResult[]
  const results: ActivityWithResult[] = [];
  const criticalPath: string[] = [];

  for (const id of sortedIds) {
    const activity = actMap.get(id)!;
    const pertTimes = pertTimesMap.get(id)!;
    const { es, ef } = fwdResult.get(id)!;
    const { ls, lf } = bwdResult.get(id)!;

    // Slack = LS - ES (atau LF - EF, keduanya sama)
    const slack = parseFloat((ls - es).toFixed(4));
    const isCritical = slack <= 0.0001; // toleransi floating point

    const graphResult: Pick<
      PertResult,
      "es" | "ef" | "ls" | "lf" | "slack" | "isCritical"
    > = { es, ef, ls, lf, slack: Math.max(0, slack), isCritical };

    const actWithResult = buildActivityWithResult(activity, pertTimes, graphResult);
    results.push(actWithResult);

    if (isCritical) criticalPath.push(id);
  }

  return { results, projectDuration, criticalPath };
}
