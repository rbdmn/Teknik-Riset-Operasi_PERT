"use client";

import { ActivityWithResult } from "@/types";

interface Props {
  activities: ActivityWithResult[];
  projectDuration: number;
  criticalPath: string[];
}

function fmt(n: number, dec = 2): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(dec);
}

export default function SummaryCard({ activities, projectDuration, criticalPath }: Props) {
  const totalActivities  = activities.length;
  const criticalCount    = criticalPath.length;
  const nonCriticalCount = totalActivities - criticalCount;

  const criticalActs  = activities.filter((a) => a.isCritical);
  const totalVariance = criticalActs.reduce((sum, a) => sum + a.variance, 0);
  const stdDev        = Math.sqrt(totalVariance);

  const actMap = new Map(activities.map((a) => [a.id, a]));

  const metrics = [
    {
      label: "Durasi Proyek",
      value: `${fmt(projectDuration)}`,
      unit: "hari",
      sub: `σ = ${fmt(stdDev)} hari`,
    },
    {
      label: "Aktivitas Kritis",
      value: String(criticalCount),
      unit: "",
      sub: `dari ${totalActivities} aktivitas`,
    },
    {
      label: "Aktivitas Normal",
      value: String(nonCriticalCount),
      unit: "",
      sub: "slack > 0",
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "#403d39",
        border: "1px solid rgba(204,197,185,0.15)",
        borderRadius: 12,
        padding: "20px 24px",
      }}
    >
      {/* ── 3 Metric Cards ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {metrics.map((m) => (
          <div
            key={m.label}
            style={{
              backgroundColor: "rgba(37,36,34,0.5)",
              border: "1px solid rgba(204,197,185,0.1)",
              borderRadius: 8,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {/* dot + label */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 6, height: 6, borderRadius: "50%",
                  backgroundColor: "#eb5e28", flexShrink: 0,
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: 11, color: "#ccc5b9",
                  textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500,
                }}
              >
                {m.label}
              </span>
            </div>
            {/* value */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 600, color: "#eb5e28", lineHeight: 1 }}>
                {m.value}
              </span>
              {m.unit && (
                <span style={{ fontSize: 13, color: "#ccc5b9" }}>{m.unit}</span>
              )}
            </div>
            {/* sub */}
            <div style={{ fontSize: 11, color: "#ccc5b9", opacity: 0.7 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Jalur Kritis ───────────────────────────────────── */}
      <div>
        <div
          style={{
            fontSize: 11, color: "#ccc5b9", textTransform: "uppercase",
            letterSpacing: "0.06em", fontWeight: 500, marginBottom: 10,
          }}
        >
          Jalur Kritis
        </div>

        {criticalPath.length === 0 ? (
          <p style={{ fontSize: 13, color: "#ccc5b9", fontStyle: "italic" }}>
            Belum ada jalur kritis terdeteksi.
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              maxWidth: "100%",
              alignItems: "center",
            }}
          >
            {criticalPath.map((id, i) => {
              const act = actMap.get(id);
              return (
                <div
                  key={id}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  {/* Badge aktivitas */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: "rgba(235,94,40,0.15)",
                      border: "1px solid rgba(235,94,40,0.3)",
                      borderRadius: 6,
                      padding: "6px 10px",
                      maxWidth: 200,
                    }}
                  >
                    {/* Lingkaran ID */}
                    <span
                      style={{
                        width: 20, height: 20, borderRadius: "50%",
                        backgroundColor: "#eb5e28", color: "#fffcf2",
                        fontSize: 10, fontWeight: 700,
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {id}
                    </span>
                    {/* Nama */}
                    <span
                      style={{
                        fontSize: 11, color: "#fffcf2",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {act?.nama ?? id}
                    </span>
                    {/* TE */}
                    <span style={{ fontSize: 10, color: "#ccc5b9", flexShrink: 0 }}>
                      {fmt(act?.te ?? 0)}
                    </span>
                  </div>

                  {/* Arrow antar badge */}
                  {i < criticalPath.length - 1 && (
                    <span
                      style={{
                        fontSize: 12, color: "#ccc5b9",
                        alignSelf: "center", flexShrink: 0,
                      }}
                    >
                      →
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
