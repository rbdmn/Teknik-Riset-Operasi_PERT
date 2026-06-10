"use client";

import { useState } from "react";
import { ActivityFormRow, ValidationError } from "@/types";

// ── Default 6 aktivitas retail ──────────────────────────────
const DEFAULT_ACTIVITIES: ActivityFormRow[] = [
  { id: "A", nama: "Finalisasi desain kemasan produk baru",            predecessors: [],          o: "2", m: "4",  p: "8"  },
  { id: "B", nama: "Produksi massal tahap pertama",                    predecessors: ["A"],        o: "5", m: "8",  p: "14" },
  { id: "C", nama: "Pembuatan konten iklan dan materi promosi",        predecessors: ["A"],        o: "3", m: "5",  p: "9"  },
  { id: "D", nama: "Distribusi dan pengiriman barang ke gudang cabang",predecessors: ["B"],        o: "4", m: "6",  p: "10" },
  { id: "E", nama: "Pelatihan staf toko mengenai keunggulan produk",   predecessors: ["B"],        o: "2", m: "3",  p: "5"  },
  { id: "F", nama: "Peluncuran produk di toko dan media sosial",       predecessors: ["C","D","E"],o: "1", m: "2",  p: "3"  },
];

type InputMode = "omp" | "weekly";

interface Props {
  onCalculate: (rows: ActivityFormRow[]) => void;
  onModeChange: (isWeekly: boolean) => void;
  isLoading: boolean;
}

// ── Generate ID baru yang belum dipakai ──────────────────────
function generateId(existing: ActivityFormRow[]): string {
  const used = new Set(existing.map((r) => r.id));
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (const l of letters) {
    if (!used.has(l)) return l;
  }
  for (const l of letters) {
    for (const l2 of letters) {
      const id = l + l2;
      if (!used.has(id)) return id;
    }
  }
  return `ACT${existing.length + 1}`;
}

// ── Validasi ─────────────────────────────────────────────────
function validate(
  rows: ActivityFormRow[],
  mode: InputMode,
  weeklyVals: Record<string, string>
): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const row of rows) {
    if (!row.nama.trim())
      errors.push({ activityId: row.id, field: "nama", message: "Nama wajib diisi." });

    if (mode === "omp") {
      const o = parseFloat(row.o);
      const m = parseFloat(row.m);
      const p = parseFloat(row.p);
      if (row.o === "" || isNaN(o) || o < 0)
        errors.push({ activityId: row.id, field: "o", message: "O harus angka ≥ 0." });
      if (row.m === "" || isNaN(m) || m < 0)
        errors.push({ activityId: row.id, field: "m", message: "M harus angka ≥ 0." });
      if (row.p === "" || isNaN(p) || p < 0)
        errors.push({ activityId: row.id, field: "p", message: "P harus angka ≥ 0." });
      if (!isNaN(o) && !isNaN(m) && !isNaN(p) && !(o <= m && m <= p))
        errors.push({ activityId: row.id, field: "p", message: "Harus O ≤ M ≤ P." });
    } else {
      const w = parseFloat(weeklyVals[row.id] ?? "");
      if (isNaN(w) || w <= 0)
        errors.push({ activityId: row.id, field: "o", message: "Durasi harus > 0 minggu." });
    }
  }
  return errors;
}

// ── Shared input style ───────────────────────────────────────
const inputStyle: React.CSSProperties = {
  backgroundColor: "rgba(255,252,242,0.05)",
  border: "1px solid rgba(204,197,185,0.2)",
  borderRadius: 6,
  color: "#fffcf2",
  padding: "6px 10px",
  fontSize: 13,
  outline: "none",
  width: "100%",
};

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  border: "1px solid rgba(235,94,40,0.6)",
  backgroundColor: "rgba(235,94,40,0.08)",
};

// ── Multi-select dropdown ────────────────────────────────────
function PredecessorSelect({
  rowId, selected, allRows, onChange,
}: {
  rowId: string; selected: string[];
  allRows: ActivityFormRow[]; onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const available = allRows.filter((r) => r.id !== rowId);
  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  };

  return (
    <div style={{ position: "relative", minWidth: 140 }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          ...inputStyle,
          minHeight: 34,
          display: "flex", flexWrap: "wrap", alignItems: "center",
          gap: 4, cursor: "pointer", paddingRight: 24, position: "relative",
        }}
      >
        {selected.length === 0 ? (
          <span style={{ color: "rgba(204,197,185,0.5)", fontSize: 12 }}>— tidak ada —</span>
        ) : (
          selected.map((id) => (
            <span key={id} style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              backgroundColor: "rgba(235,94,40,0.2)", color: "#eb5e28",
              borderRadius: 4, fontSize: 11, fontWeight: 600, padding: "2px 6px",
            }}>
              {id}
              <button type="button" onClick={(e) => { e.stopPropagation(); toggle(id); }}
                style={{ background: "none", border: "none", color: "#eb5e28", cursor: "pointer", padding: 0, lineHeight: 1, fontSize: 12 }}>
                ×
              </button>
            </span>
          ))
        )}
        <span style={{ position: "absolute", right: 8, color: "#ccc5b9", fontSize: 10 }}>
          {open ? "▲" : "▼"}
        </span>
      </div>

      {open && (
        <div style={{
          position: "absolute", zIndex: 50, top: "calc(100% + 4px)", left: 0,
          minWidth: "100%", backgroundColor: "#403d39",
          border: "1px solid rgba(204,197,185,0.2)", borderRadius: 6,
          maxHeight: 200, overflowY: "auto",
        }}>
          {available.length === 0 ? (
            <div style={{ padding: "8px 12px", fontSize: 12, color: "#ccc5b9" }}>Tidak ada pilihan</div>
          ) : (
            available.map((r) => (
              <label key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", cursor: "pointer", fontSize: 12, color: "#fffcf2" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(235,94,40,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggle(r.id)} style={{ accentColor: "#eb5e28" }} />
                <span style={{ fontWeight: 600, color: "#eb5e28", minWidth: 16 }}>{r.id}</span>
                <span style={{ color: "#ccc5b9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.nama || "(tanpa nama)"}
                </span>
              </label>
            ))
          )}
        </div>
      )}
      {open && <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />}
    </div>
  );
}

// ── Ikon Trash SVG ───────────────────────────────────────────
function TrashIcon({ disabled }: { disabled: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ opacity: disabled ? 0.2 : 1 }}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

// ── Komponen utama ───────────────────────────────────────────
export default function ActivityForm({ onCalculate, onModeChange, isLoading }: Props) {
  const [rows, setRows]         = useState<ActivityFormRow[]>(DEFAULT_ACTIVITIES);
  const [errors, setErrors]     = useState<ValidationError[]>([]);
  const [inputMode, setInputMode] = useState<InputMode>("omp");
  const [weeklyValues, setWeeklyValues] = useState<Record<string, string>>({});

  // ── Helpers ────────────────────────────────────────────────
  const updateRow = (idx: number, patch: Partial<ActivityFormRow>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    const newId = generateId(rows);
    setRows((prev) => [...prev, { id: newId, nama: "", predecessors: [], o: "", m: "", p: "" }]);
    if (inputMode === "weekly") {
      setWeeklyValues((prev) => ({ ...prev, [newId]: "" }));
    }
  };

  const removeRow = (idx: number) => {
    const removedId = rows[idx].id;
    setRows((prev) =>
      prev.filter((_, i) => i !== idx).map((r) => ({
        ...r,
        predecessors: r.predecessors.filter((p) => p !== removedId),
      }))
    );
    setWeeklyValues((prev) => {
      const next = { ...prev };
      delete next[removedId];
      return next;
    });
  };

  const resetDefault = () => {
    setRows(DEFAULT_ACTIVITIES);
    setErrors([]);
    setWeeklyValues({});
  };

  // ── Toggle mode input ──────────────────────────────────────
  const handleModeSwitch = (mode: InputMode) => {
    if (mode === inputMode) return;
    if (mode === "weekly") {
      // Pre-populate dari nilai M yang sudah ada (M hari ÷ 7 → minggu)
      const initial: Record<string, string> = {};
      for (const row of rows) {
        const m = parseFloat(row.m);
        initial[row.id] = (!isNaN(m) && m > 0)
          ? String(Math.round(m / 7))
          : "";
      }
      setWeeklyValues(initial);
    }
    setInputMode(mode);
    setErrors([]);
    onModeChange(mode === "weekly");
  };

  // ── Kalkulasi ──────────────────────────────────────────────
  const handleCalculate = () => {
    const errs = validate(rows, inputMode, weeklyValues);
    setErrors(errs);
    if (errs.length > 0) return;

    if (inputMode === "weekly") {
      // Konversi durasi minggu → O / M / P sebelum kirim ke API
      const converted = rows.map((row) => {
        const w = parseFloat(weeklyValues[row.id] ?? "0");
        const dHari = w * 7;
        return {
          ...row,
          o: String(Math.round(dHari * 0.8)),
          m: String(Math.round(dHari)),
          p: String(Math.round(dHari * 1.3)),
        };
      });
      onCalculate(converted);
    } else {
      onCalculate(rows);
    }
  };

  const getError = (id: string, field: ValidationError["field"]) =>
    errors.find((e) => e.activityId === id && e.field === field)?.message;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{
      backgroundColor: "#403d39",
      border: "1px solid rgba(204,197,185,0.15)",
      borderRadius: 12,
      padding: "20px 24px",
    }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#eb5e28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          <span style={{ color: "#fffcf2", fontSize: 15, fontWeight: 600 }}>
            Aktivitas Peluncuran
          </span>
        </div>
        <button
          onClick={resetDefault}
          style={{ background: "none", border: "none", color: "#ccc5b9", fontSize: 12, cursor: "pointer", padding: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          Reset ke default
        </button>
      </div>

      {/* ── Toggle Mode Input ─────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          display: "inline-flex",
          backgroundColor: "#252422",
          borderRadius: 8,
          padding: 3,
        }}>
          {([
            { key: "omp",    label: "O / M / P"  },
            { key: "weekly", label: "Per Minggu"  },
          ] as { key: InputMode; label: string }[]).map(({ key, label }) => {
            const active = inputMode === key;
            return (
              <button
                key={key}
                onClick={() => handleModeSwitch(key)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 6,
                  fontSize: 13,
                  cursor: "pointer",
                  border: "none",
                  transition: "background-color 0.15s, color 0.15s",
                  backgroundColor: active ? "#eb5e28" : "transparent",
                  color: active ? "#fffcf2" : "#ccc5b9",
                  fontWeight: active ? 500 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#fffcf2";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#ccc5b9";
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Card Rows ───────────────────────────────────────── */}
      <div>
        {rows.map((row, idx) => {
          const errNama = getError(row.id, "nama");
          const errO    = getError(row.id, "o");
          const errM    = getError(row.id, "m");
          const errP    = getError(row.id, "p");
          const hasErr  = !!(errNama || errO || errM || errP);

          return (
            <div
              key={row.id}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                backgroundColor: hasErr ? "rgba(235,94,40,0.06)" : "rgba(37,36,34,0.6)",
                border: hasErr ? "1px solid rgba(235,94,40,0.3)" : "1px solid rgba(204,197,185,0.1)",
                borderRadius: 8, padding: "10px 14px", marginBottom: 6,
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!hasErr) (e.currentTarget as HTMLDivElement).style.backgroundColor = "rgba(37,36,34,0.9)";
              }}
              onMouseLeave={(e) => {
                if (!hasErr) (e.currentTarget as HTMLDivElement).style.backgroundColor = "rgba(37,36,34,0.6)";
              }}
            >
              {/* Badge ID */}
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                backgroundColor: "#eb5e28", color: "#fffcf2",
                fontWeight: 600, fontSize: 12, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {row.id}
              </div>

              {/* Nama */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <input
                  type="text"
                  value={row.nama}
                  onChange={(e) => updateRow(idx, { nama: e.target.value })}
                  placeholder="Nama aktivitas..."
                  style={errNama ? { ...inputErrorStyle, width: "100%" } : { ...inputStyle, width: "100%" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#eb5e28")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errNama ? "rgba(235,94,40,0.6)" : "rgba(204,197,185,0.2)")}
                />
                {errNama && <p style={{ color: "#eb5e28", fontSize: 10, marginTop: 3 }}>{errNama}</p>}
              </div>

              {/* Pendahulu */}
              <PredecessorSelect
                rowId={row.id} selected={row.predecessors}
                allRows={rows} onChange={(ids) => updateRow(idx, { predecessors: ids })}
              />

              {/* ── Mode OMP: 3 input O / M / P ─────────────── */}
              {inputMode === "omp" && (
                (["o", "m", "p"] as const).map((field) => {
                  const val = row[field] as string;
                  const err = getError(row.id, field);
                  return (
                    <div key={field} style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                      <span style={{ fontSize: 10, color: "#ccc5b9", textAlign: "center" }}>
                        {field.toUpperCase()}
                      </span>
                      <input
                        type="number" min={0} value={val}
                        onChange={(e) => updateRow(idx, { [field]: e.target.value })}
                        style={{ ...(err ? inputErrorStyle : inputStyle), width: 54, textAlign: "center", padding: "5px 6px" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#eb5e28")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = err ? "rgba(235,94,40,0.6)" : "rgba(204,197,185,0.2)")}
                      />
                      {err && <p style={{ color: "#eb5e28", fontSize: 9, textAlign: "center", marginTop: 1 }}>{err}</p>}
                    </div>
                  );
                })
              )}

              {/* ── Mode Weekly: 1 input Durasi (minggu) ─────── */}
              {inputMode === "weekly" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, color: "#ccc5b9", textAlign: "center" }}>
                    Durasi
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <input
                      type="number" min={0} step={0.5}
                      value={weeklyValues[row.id] ?? ""}
                      placeholder="0"
                      onChange={(e) =>
                        setWeeklyValues((prev) => ({ ...prev, [row.id]: e.target.value }))
                      }
                      style={{
                        ...(errO ? inputErrorStyle : inputStyle),
                        width: 60, textAlign: "center", padding: "5px 6px",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#eb5e28")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = errO ? "rgba(235,94,40,0.6)" : "rgba(204,197,185,0.2)")}
                    />
                    <span style={{ fontSize: 10, color: "#ccc5b9", flexShrink: 0 }}>mgg</span>
                  </div>
                  {errO && <p style={{ color: "#eb5e28", fontSize: 9, textAlign: "center", marginTop: 1 }}>{errO}</p>}
                </div>
              )}

              {/* Trash */}
              <button
                onClick={() => removeRow(idx)}
                disabled={rows.length <= 1}
                title="Hapus aktivitas"
                style={{
                  background: "none", border: "none",
                  cursor: rows.length <= 1 ? "not-allowed" : "pointer",
                  color: "#ccc5b9", padding: 4,
                  display: "flex", alignItems: "center",
                  transition: "color 0.15s", flexShrink: 0,
                }}
                onMouseEnter={(e) => { if (rows.length > 1) (e.currentTarget as HTMLButtonElement).style.color = "#eb5e28"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ccc5b9"; }}
              >
                <TrashIcon disabled={rows.length <= 1} />
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <button
          onClick={addRow}
          style={{ background: "none", border: "none", color: "#ccc5b9", fontSize: 13, cursor: "pointer", padding: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#eb5e28")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc5b9")}
        >
          + Tambah Aktivitas
        </button>

        {errors.length > 0 && (
          <p style={{ color: "#eb5e28", fontSize: 12, flex: 1, textAlign: "center", margin: "0 12px" }}>
            {errors.length} kesalahan ditemukan
          </p>
        )}

        <button
          onClick={handleCalculate}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? "#9a3d1a" : "#eb5e28",
            color: "#fffcf2", border: "none", borderRadius: 8,
            padding: "8px 20px", fontWeight: 500, fontSize: 13,
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "background-color 0.15s",
            display: "flex", alignItems: "center", gap: 6,
          }}
          onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#d4521f"; }}
          onMouseLeave={(e) => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#eb5e28"; }}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Menghitung...
            </>
          ) : "Hitung PERT"}
        </button>
      </div>
    </div>
  );
}
