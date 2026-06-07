"use client";

import { ActivityWithResult } from "@/types";

interface Props {
  activity: ActivityWithResult | null;
  onClose: () => void;
}

function fmt(n: number, dec = 2): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(dec);
}

// ── Blok kalkulasi step-by-step ──────────────────────────────
function FormulaBlock({
  label,
  lines,
  resultLine,
}: {
  label: string;
  lines: string[];
  resultLine: string;
}) {
  return (
    <div
      style={{
        backgroundColor: "rgba(37,36,34,0.6)",
        borderRadius: 8,
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          fontSize: 10, color: "#ccc5b9", textTransform: "uppercase",
          letterSpacing: "0.06em", marginBottom: 6, fontWeight: 500,
        }}
      >
        {label}
      </div>
      {lines.map((line, i) => (
        <div
          key={i}
          style={{ fontFamily: "monospace", fontSize: 12, color: "#ccc5b9", lineHeight: 1.7 }}
        >
          {line}
        </div>
      ))}
      {/* Baris hasil — highlight paprika */}
      <div
        style={{
          fontFamily: "monospace", fontSize: 12, color: "#eb5e28",
          fontWeight: 600, lineHeight: 1.7, marginTop: 2,
        }}
      >
        {resultLine}
      </div>
    </div>
  );
}

export default function NodeDetailPanel({ activity: act, onClose }: Props) {
  const visible = act !== null;

  if (!act) {
    return (
      <div
        style={{
          position: "fixed", top: 0, right: 0, height: "100%", width: 300,
          backgroundColor: "#403d39", zIndex: 50,
          transform: "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
        }}
      />
    );
  }

  const te       = act.te;
  const variance = act.variance;

  const teLines = [
    "TE = (O + 4M + P) / 6",
    `   = (${fmt(act.o)} + 4×${fmt(act.m)} + ${fmt(act.p)}) / 6`,
    `   = (${fmt(act.o)} + ${fmt(4 * act.m)} + ${fmt(act.p)}) / 6`,
    `   = ${fmt(act.o + 4 * act.m + act.p)} / 6`,
  ];
  const teResult = `   = ${fmt(te)} hari`;

  const varLines = [
    "σ² = ((P − O) / 6)²",
    `   = ((${fmt(act.p)} − ${fmt(act.o)}) / 6)²`,
    `   = (${fmt(act.p - act.o)} / 6)²`,
    `   = ${fmt((act.p - act.o) / 6, 4)}²`,
  ];
  const varResult = `   = ${fmt(variance)}`;

  const slackResult = `   = ${fmt(act.slack)}`;

  return (
    <div
      style={{
        position: "fixed", top: 0, right: 0, height: "100%", width: 300,
        backgroundColor: "#403d39",
        borderLeft: `3px solid ${act.isCritical ? "#eb5e28" : "#ccc5b9"}`,
        zIndex: 50,
        transform: visible ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s ease-in-out",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div
        style={{
          position: "sticky", top: 0, zIndex: 10,
          backgroundColor: "#403d39",
          borderBottom: "1px solid rgba(204,197,185,0.12)",
          padding: "16px 18px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                width: 28, height: 28, borderRadius: "50%",
                backgroundColor: act.isCritical ? "#eb5e28" : "rgba(204,197,185,0.2)",
                color: "#fffcf2", fontSize: 12, fontWeight: 700,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {act.id}
            </span>
            {act.isCritical && (
              <span
                style={{
                  backgroundColor: "#eb5e28", color: "#fffcf2",
                  borderRadius: 4, fontSize: 11, fontWeight: 500,
                  padding: "2px 7px",
                }}
              >
                JALUR KRITIS
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, color: "#fffcf2", fontWeight: 500, lineHeight: 1.4 }}>
            {act.nama}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#ccc5b9", fontSize: 20, lineHeight: 1, padding: 2, flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fffcf2")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc5b9")}
        >
          ×
        </button>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* O / M / P */}
        <div>
          <div style={{ fontSize: 10, color: "#ccc5b9", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, fontWeight: 500 }}>
            Estimasi Waktu
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
            {[
              { label: "O", value: act.o },
              { label: "M", value: act.m },
              { label: "P", value: act.p },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  backgroundColor: "rgba(37,36,34,0.6)",
                  border: "1px solid rgba(204,197,185,0.1)",
                  borderRadius: 6, padding: "8px 0", textAlign: "center",
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 600, color: "#fffcf2" }}>{fmt(value)}</div>
                <div style={{ fontSize: 10, color: "#ccc5b9", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TE */}
        <FormulaBlock label="Expected Time (TE)" lines={teLines} resultLine={teResult} />

        {/* Variance */}
        <FormulaBlock label="Variance (σ²)" lines={varLines} resultLine={varResult} />

        {/* ES / EF */}
        <div>
          <div style={{ fontSize: 10, color: "#ccc5b9", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, fontWeight: 500 }}>
            Forward Pass
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { label: "Earliest Start (ES)", value: act.es },
              { label: "Earliest Finish (EF)", value: act.ef },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  backgroundColor: "rgba(235,94,40,0.1)",
                  border: "1px solid rgba(235,94,40,0.2)",
                  borderRadius: 6, padding: "10px 8px", textAlign: "center",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 600, color: "#fffcf2" }}>{fmt(value)}</div>
                <div style={{ fontSize: 10, color: "rgba(235,94,40,0.7)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* LS / LF */}
        <div>
          <div style={{ fontSize: 10, color: "#ccc5b9", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, fontWeight: 500 }}>
            Backward Pass
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { label: "Latest Start (LS)", value: act.ls },
              { label: "Latest Finish (LF)", value: act.lf },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  backgroundColor: "rgba(204,197,185,0.08)",
                  border: "1px solid rgba(204,197,185,0.15)",
                  borderRadius: 6, padding: "10px 8px", textAlign: "center",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 600, color: "#fffcf2" }}>{fmt(value)}</div>
                <div style={{ fontSize: 10, color: "#ccc5b9", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Slack */}
        <FormulaBlock
          label="Slack"
          lines={[
            "Slack = LS − ES",
            `      = ${fmt(act.ls)} − ${fmt(act.es)}`,
          ]}
          resultLine={slackResult}
        />

        {/* Slack status row */}
        <div
          style={{
            backgroundColor: act.isCritical ? "rgba(235,94,40,0.15)" : "rgba(204,197,185,0.08)",
            borderRadius: 6,
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 500,
            color: act.isCritical ? "#eb5e28" : "#ccc5b9",
            textAlign: "center",
          }}
        >
          {act.isCritical
            ? "Slack = 0 → Aktivitas ini berada di Jalur Kritis"
            : `Slack = ${fmt(act.slack)} → Aktivitas non-kritis`}
        </div>

        {/* Pendahulu */}
        {act.predecessors.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: "#ccc5b9", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, fontWeight: 500 }}>
              Pendahulu
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {act.predecessors.map((p) => (
                <span
                  key={p}
                  style={{
                    backgroundColor: "rgba(235,94,40,0.15)",
                    border: "1px solid rgba(235,94,40,0.25)",
                    color: "#eb5e28",
                    borderRadius: 4,
                    fontSize: 12, fontWeight: 600,
                    padding: "3px 10px",
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
