import { NextRequest, NextResponse } from "next/server";
import { Activity, PertApiResponse } from "@/types";
import { runPertGraph } from "@/lib/graph";

// ============================================================
// POST /api/pert
// Body  : { activities: Activity[] }
// Return: PertApiResponse
// ============================================================
export async function POST(request: NextRequest): Promise<NextResponse<PertApiResponse>> {
  try {
    const body = await request.json();
    const activities: Activity[] = body?.activities;

    // --- Validasi keberadaan data ---
    if (!activities || !Array.isArray(activities)) {
      return NextResponse.json(
        { success: false, error: "Body harus berisi array 'activities'." },
        { status: 400 }
      );
    }

    if (activities.length === 0) {
      return NextResponse.json(
        { success: false, error: "Minimal harus ada 1 aktivitas." },
        { status: 400 }
      );
    }

    // --- Validasi tiap aktivitas ---
    const ids = new Set<string>();
    for (const act of activities) {
      // Cek field wajib
      if (!act.id || typeof act.id !== "string" || act.id.trim() === "") {
        return NextResponse.json(
          { success: false, error: "Setiap aktivitas harus memiliki 'id' yang valid." },
          { status: 400 }
        );
      }
      if (!act.nama || typeof act.nama !== "string" || act.nama.trim() === "") {
        return NextResponse.json(
          { success: false, error: `Aktivitas '${act.id}' harus memiliki 'nama'.` },
          { status: 400 }
        );
      }

      // Cek duplikat ID
      if (ids.has(act.id)) {
        return NextResponse.json(
          { success: false, error: `ID aktivitas '${act.id}' duplikat.` },
          { status: 400 }
        );
      }
      ids.add(act.id);

      // Cek tipe angka
      if (typeof act.o !== "number" || typeof act.m !== "number" || typeof act.p !== "number") {
        return NextResponse.json(
          { success: false, error: `Aktivitas '${act.id}': O, M, P harus berupa angka.` },
          { status: 400 }
        );
      }

      // Cek O ≤ M ≤ P
      if (!(act.o <= act.m && act.m <= act.p)) {
        return NextResponse.json(
          {
            success: false,
            error: `Aktivitas '${act.id}': Waktu harus memenuhi O ≤ M ≤ P (O=${act.o}, M=${act.m}, P=${act.p}).`,
          },
          { status: 400 }
        );
      }

      // Cek nilai tidak negatif
      if (act.o < 0 || act.m < 0 || act.p < 0) {
        return NextResponse.json(
          { success: false, error: `Aktivitas '${act.id}': O, M, P tidak boleh negatif.` },
          { status: 400 }
        );
      }

      // Cek predecessors adalah array
      if (!Array.isArray(act.predecessors)) {
        return NextResponse.json(
          { success: false, error: `Aktivitas '${act.id}': 'predecessors' harus berupa array.` },
          { status: 400 }
        );
      }
    }

    // Cek semua predecessor ID merujuk ke aktivitas yang ada
    for (const act of activities) {
      for (const predId of act.predecessors) {
        if (!ids.has(predId)) {
          return NextResponse.json(
            {
              success: false,
              error: `Aktivitas '${act.id}': predecessor '${predId}' tidak ditemukan dalam daftar aktivitas.`,
            },
            { status: 400 }
          );
        }
      }
    }

    // --- Jalankan kalkulasi PERT + Graph ---
    const { results, projectDuration, criticalPath, error } = runPertGraph(activities);

    if (error || !results) {
      return NextResponse.json(
        { success: false, error: error ?? "Kalkulasi gagal." },
        { status: 422 }
      );
    }

    // --- Return hasil ---
    return NextResponse.json({
      success: true,
      data: results,
      projectDuration,
      criticalPath,
    });
  } catch (err) {
    console.error("[POST /api/pert] Error:", err);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
