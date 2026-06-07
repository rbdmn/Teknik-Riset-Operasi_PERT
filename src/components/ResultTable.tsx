"use client";

import { ActivityWithResult } from "@/types";

interface Props {
  activities: ActivityWithResult[];
  hideOMP?: boolean;
}

function fmt(n: number, dec = 2): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(dec);
}

const COLUMNS = [
  { key: "id",       label: "ID",     align: "center" },
  { key: "nama",     label: "Nama",   align: "left"   },
  { key: "o",        label: "O",      align: "center", dim: true },
  { key: "m",        label: "M",      align: "center", dim: true },
  { key: "p",        label: "P",      align: "center", dim: true },
  { key: "te",       label: "TE",     align: "center" },
  { key: "variance", label: "σ²",     align: "center" },
  { key: "es",       label: "ES",     align: "center" },
  { key: "ef",       label: "EF",     align: "center" },
  { key: "ls",       label: "LS",     align: "center" },
  { key: "lf",       label: "LF",     align: "center" },
  { key: "slack",    label: "Slack",  align: "center" },
  { key: "status",   label: "Status", align: "center" },
];

const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: 11,
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "#ccc5b9",
  backgroundColor: "rgba(37,36,34,0.4)",
  whiteSpace: "nowrap",
};

export default function ResultTable({ activities, hideOMP = false }: Props) {
  const criticalCount  = activities.filter((a) => a.isCritical).length;
  const visibleColumns = hideOMP
    ? COLUMNS.filter((c) => !["o", "m", "p"].includes(c.key))
    : COLUMNS;

  return (
    <div
      style={{
        backgroundColor: "#403d39",
        border: "1px solid rgba(204,197,185,0.15)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid rgba(204,197,185,0.1)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: "#fffcf2" }}>
          Tabel Hasil PERT
        </span>
        <span style={{ fontSize: 12, color: "#ccc5b9" }}>
          {criticalCount} kritis / {activities.length} total
        </span>
      </div>

      {/* Tabel */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  style={{ ...thStyle, textAlign: col.align as "center" | "left" }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activities.map((act) => (
              <tr
                key={act.id}
                style={{
                  backgroundColor: act.isCritical ? "rgba(235,94,40,0.08)" : "transparent",
                  borderBottom: "1px solid rgba(204,197,185,0.08)",
                  borderLeft: act.isCritical ? "2px solid #eb5e28" : "2px solid transparent",
                }}
              >
                {/* ID */}
                <td style={{ padding: "10px 12px", textAlign: "center" }}>
                  <span
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 26, height: 26, borderRadius: "50%",
                      backgroundColor: act.isCritical ? "#eb5e28" : "rgba(204,197,185,0.2)",
                      color: "#fffcf2", fontSize: 11, fontWeight: 700,
                    }}
                  >
                    {act.id}
                  </span>
                </td>

                {/* Nama */}
                <td style={{ padding: "10px 12px", color: "#fffcf2", maxWidth: 220 }}>
                  <span style={{ lineHeight: 1.4 }}>{act.nama}</span>
                </td>

                {/* O, M, P — dimmed; disembunyikan jika hideOMP */}
                {!hideOMP && (["o", "m", "p"] as const).map((f) => (
                  <td key={f} style={{ padding: "10px 12px", textAlign: "center", color: "#ccc5b9", fontSize: 12 }}>
                    {fmt(act[f])}
                  </td>
                ))}

                {/* TE */}
                <td style={{ padding: "10px 12px", textAlign: "center" }}>
                  <span style={{ color: act.isCritical ? "#eb5e28" : "#fffcf2", fontWeight: 600 }}>
                    {fmt(act.te)}
                  </span>
                </td>

                {/* σ² */}
                <td style={{ padding: "10px 12px", textAlign: "center", color: "#ccc5b9" }}>
                  {fmt(act.variance)}
                </td>

                {/* ES, EF, LS, LF */}
                {(["es", "ef", "ls", "lf"] as const).map((f) => (
                  <td key={f} style={{ padding: "10px 12px", textAlign: "center", color: "#fffcf2" }}>
                    {fmt(act[f])}
                  </td>
                ))}

                {/* Slack */}
                <td style={{ padding: "10px 12px", textAlign: "center" }}>
                  <span style={{ color: act.isCritical ? "#eb5e28" : "#ccc5b9", fontWeight: act.isCritical ? 600 : 400 }}>
                    {fmt(act.slack)}
                  </span>
                </td>

                {/* Status */}
                <td style={{ padding: "10px 12px", textAlign: "center" }}>
                  {act.isCritical ? (
                    <span
                      style={{
                        backgroundColor: "rgba(235,94,40,0.15)",
                        color: "#eb5e28",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 500,
                        padding: "3px 8px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Kritis
                    </span>
                  ) : (
                    <span
                      style={{
                        backgroundColor: "rgba(204,197,185,0.1)",
                        color: "#ccc5b9",
                        borderRadius: 4,
                        fontSize: 11,
                        padding: "3px 8px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Normal
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
