// ============================================================
// Aktivitas: data mentah yang diisi user di form
// ============================================================
export interface Activity {
  id: string;           // unik per aktivitas, contoh: "A", "B", "C"
  nama: string;         // nama aktivitas, contoh: "Finalisasi desain kemasan"
  predecessors: string[]; // daftar ID pendahulu, kosong [] jika tidak ada
  o: number;            // Optimistic time (hari)
  m: number;            // Most Likely time (hari)
  p: number;            // Pessimistic time (hari)
}

// ============================================================
// Hasil kalkulasi PERT per aktivitas
// ============================================================
export interface PertResult {
  te: number;           // Expected Time = (O + 4M + P) / 6
  variance: number;     // Variance = ((P - O) / 6)^2
  es: number;           // Earliest Start
  ef: number;           // Earliest Finish = ES + TE
  ls: number;           // Latest Start = LF - TE
  lf: number;           // Latest Finish
  slack: number;        // Slack = LS - ES (= 0 jika kritis)
  isCritical: boolean;  // true jika Slack = 0 (jalur kritis)
}

// ============================================================
// Gabungan Activity + PertResult (digunakan setelah kalkulasi)
// ============================================================
export type ActivityWithResult = Activity & PertResult;

// ============================================================
// State form per baris aktivitas (termasuk field string sementara)
// ============================================================
export interface ActivityFormRow {
  id: string;
  nama: string;
  predecessors: string[];
  o: string;    // string agar bisa kosong saat user mengetik
  m: string;
  p: string;
}

// ============================================================
// Error validasi per baris form
// ============================================================
export interface ValidationError {
  activityId: string;
  field: "nama" | "o" | "m" | "p" | "predecessors" | "cycle";
  message: string;
}

// ============================================================
// Response dari API /api/pert
// ============================================================
export interface PertApiResponse {
  success: boolean;
  data?: ActivityWithResult[];
  projectDuration?: number;   // total durasi proyek (hari)
  criticalPath?: string[];    // daftar ID aktivitas jalur kritis
  error?: string;
}
