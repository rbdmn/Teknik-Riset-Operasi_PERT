"use client";

import { useState, useCallback } from "react";
import { ActivityFormRow, ActivityWithResult, PertApiResponse } from "@/types";
import ActivityForm from "@/components/ActivityForm";
import NetworkDiagram from "@/components/NetworkDiagram";
import NodeDetailPanel from "@/components/NodeDetailPanel";
import ResultTable from "@/components/ResultTable";
import SummaryCard from "@/components/SummaryCard";

// ── Tipe state hasil kalkulasi ───────────────────────────────
interface PertState {
  results: ActivityWithResult[];
  projectDuration: number;
  criticalPath: string[];
}

// ── Definisi istilah O / M / P ───────────────────────────────
const TERMS = [
  {
    letter: "O",
    name: "Optimistic",
    desc: "Estimasi waktu terbaik jika semua berjalan lancar",
  },
  {
    letter: "M",
    name: "Most Likely",
    desc: "Estimasi waktu paling realistis dan sering terjadi",
  },
  {
    letter: "P",
    name: "Pessimistic",
    desc: "Estimasi waktu terburuk jika ada hambatan",
  },
];

// ── Komponen utama ───────────────────────────────────────────
export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [pertState, setPertState] = useState<PertState | null>(null);
  const [selectedNode, setSelectedNode] = useState<ActivityWithResult | null>(
    null,
  );
  // UI-only: ikuti mode toggle dari ActivityForm agar ResultTable menyesuaikan
  const [isWeeklyMode, setIsWeeklyMode] = useState(false);

  // ── Kirim form ke API, update state ──────────────────────
  const handleCalculate = useCallback(async (rows: ActivityFormRow[]) => {
    setIsLoading(true);
    setApiError(null);
    setSelectedNode(null);

    const activities = rows.map((r) => ({
      id: r.id,
      nama: r.nama.trim(),
      predecessors: r.predecessors,
      o: parseFloat(r.o),
      m: parseFloat(r.m),
      p: parseFloat(r.p),
    }));

    try {
      const res = await fetch("/api/pert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activities }),
      });

      const json: PertApiResponse = await res.json();

      if (!res.ok || !json.success) {
        setApiError(json.error ?? `Error ${res.status}`);
        setPertState(null);
        return;
      }

      setPertState({
        results: json.data!,
        projectDuration: json.projectDuration!,
        criticalPath: json.criticalPath!,
      });

      setTimeout(() => {
        document
          .getElementById("hasil-pert")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setApiError("Gagal menghubungi server. Periksa koneksi dan coba lagi.");
      setPertState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNodeClick = useCallback((act: ActivityWithResult) => {
    setSelectedNode(act);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252422" }}>
      {/* ════════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════════ */}
      <section
        style={{
          width: "100%",
          minHeight: 420,
          backgroundColor: "#252422",
          borderBottom: "1px solid rgba(204,197,185,0.15)",
          padding: "60px 48px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            gap: 48,
            alignItems: "flex-start",
          }}
        >
          {/* ── Kolom Kiri ────────────────────────────────── */}
          <div style={{ flex: "1.2", minWidth: 0 }}>
            {/* Label kecil */}
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.15em",
                color: "#eb5e28",
                fontWeight: 600,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Teknik Riset Operasi
            </div>

            {/* Judul utama */}
            <h1
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: "#fffcf2",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              PERT <span style={{ color: "#eb5e28" }}>Network</span>
              <br />
              Diagram <span style={{ color: "#eb5e28" }}>Generator</span>
            </h1>

            {/* Deskripsi */}
            <p
              style={{
                fontSize: 14,
                color: "#ccc5b9",
                maxWidth: 420,
                lineHeight: 1.7,
                marginTop: 16,
                marginBottom: 0,
              }}
            >
              Program analisis jalur kritis berbasis metode PERT untuk
              merencanakan dan mengoptimalkan alur peluncuran produk retail.
            </p>

            {/* Divider */}
            <div
              style={{
                borderTop: "1px solid rgba(204,197,185,0.15)",
                margin: "28px 0",
              }}
            />

            {/* 3 Definisi O / M / P */}
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              {TERMS.map(({ letter, name, desc }) => (
                <div
                  key={letter}
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <div
                    style={{ display: "flex", alignItems: "baseline", gap: 6 }}
                  >
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#eb5e28",
                        lineHeight: 1,
                      }}
                    >
                      {letter}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#fffcf2",
                      }}
                    >
                      {name}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#ccc5b9",
                      margin: 0,
                      lineHeight: 1.5,
                      maxWidth: 160,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Kolom Kanan: Card Kelompok ────────────────── */}
          <div
            style={{
              flex: "0.8",
              backgroundColor: "#403d39",
              border: "1px solid rgba(204,197,185,0.15)",
              borderRadius: 12,
              padding: "20px 24px",
              flexShrink: 0,
            }}
          >
            {/* Header card */}
            <div
              style={{
                fontSize: 12,
                color: "#ccc5b9",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 500,
                marginBottom: 16,
              }}
            >
              Anggota Kelompok
            </div>

            {/* Anggota 1 */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 15, color: "#fffcf2", fontWeight: 500 }}>
                Nama Anggota Satu
              </div>
              <div style={{ fontSize: 12, color: "#ccc5b9", marginTop: 2 }}>
                123456789
              </div>
            </div>

            {/* Anggota 2 */}
            <div
              style={{
                borderTop: "1px solid rgba(204,197,185,0.1)",
                paddingTop: 12,
              }}
            >
              <div style={{ fontSize: 15, color: "#fffcf2", fontWeight: 500 }}>
                Nama Anggota Dua
              </div>
              <div style={{ fontSize: 12, color: "#ccc5b9", marginTop: 2 }}>
                987654321
              </div>
            </div>

            {/* Info proyek */}
            <div
              style={{
                borderTop: "1px solid rgba(204,197,185,0.1)",
                marginTop: 16,
                paddingTop: 16,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#ccc5b9",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 4,
                }}
              >
                Studi Kasus
              </div>
              <div style={{ fontSize: 13, color: "#fffcf2" }}>
                Alur Peluncuran Produk Baru — Retail
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          KONTEN UTAMA
      ════════════════════════════════════════════════════ */}
      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "40px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Form */}
        <ActivityForm
          onCalculate={handleCalculate}
          onModeChange={setIsWeeklyMode}
          isLoading={isLoading}
        />

        {/* Error Banner */}
        {apiError && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              backgroundColor: "#403d39",
              border: "1px solid rgba(235,94,40,0.4)",
              borderRadius: 10,
              padding: "14px 18px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#eb5e28"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0, marginTop: 1 }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#eb5e28" }}>
                Kalkulasi gagal
              </div>
              <div style={{ fontSize: 13, color: "#ccc5b9", marginTop: 3 }}>
                {apiError}
              </div>
            </div>
            <button
              onClick={() => setApiError(null)}
              style={{
                background: "none",
                border: "none",
                color: "#ccc5b9",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Hasil setelah kalkulasi */}
        {pertState && (
          <div
            id="hasil-pert"
            style={{ display: "flex", flexDirection: "column", gap: 24 }}
          >
            <div style={{ borderTop: "1px solid rgba(204,197,185,0.1)" }} />

            <SummaryCard
              activities={pertState.results}
              projectDuration={pertState.projectDuration}
              criticalPath={pertState.criticalPath}
            />

            <div style={{ borderTop: "1px solid rgba(204,197,185,0.1)" }} />

            <div style={{ position: "relative" }}>
              <NetworkDiagram
                activities={pertState.results}
                onNodeClick={handleNodeClick}
              />
              <NodeDetailPanel
                activity={selectedNode}
                onClose={handleClosePanel}
              />
              {selectedNode && (
                <div
                  onClick={handleClosePanel}
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 40,
                    backgroundColor: "rgba(37,36,34,0.5)",
                  }}
                />
              )}
            </div>

            <div style={{ borderTop: "1px solid rgba(204,197,185,0.1)" }} />

            <ResultTable
              activities={pertState.results}
              hideOMP={isWeeklyMode}
            />
          </div>
        )}

        {/* Placeholder sebelum hitung */}
        {!pertState && !isLoading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "64px 0",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                border: "1px solid rgba(204,197,185,0.15)",
                backgroundColor: "#403d39",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ccc5b9"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#ccc5b9" }}>
              Hasil akan muncul di sini
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#ccc5b9",
                opacity: 0.5,
                marginTop: 6,
              }}
            >
              Isi form di atas lalu tekan{" "}
              <span style={{ color: "#eb5e28", opacity: 1 }}>Hitung PERT</span>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "64px 0",
            }}
          >
            <svg
              className="animate-spin"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: "#eb5e28", marginBottom: 14 }}
            >
              <circle
                style={{ opacity: 0.25 }}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                style={{ opacity: 0.75 }}
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <div style={{ fontSize: 13, color: "#ccc5b9" }}>
              Menghitung PERT...
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
