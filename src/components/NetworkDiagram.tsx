"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ActivityWithResult } from "@/types";

// ── Kustom Node ──────────────────────────────────────────────
function PertNode({ data }: NodeProps) {
  const d = data as {
    id: string; nama: string; te: number;
    es: number; ef: number; ls: number; lf: number;
    isCritical: boolean;
  };

  const fmt = (n: number) => String(Math.round(n));

  const nodeBg     = d.isCritical ? "#eb5e28"              : "#403d39";
  const nodeBorder = d.isCritical ? "#eb5e28"              : "rgba(204,197,185,0.4)";
  const labelColor = d.isCritical ? "#fffcf2"              : "#ccc5b9";
  const valueColor = "#fffcf2";

  return (
    <div
      style={{
        backgroundColor: nodeBg,
        border: `2px solid ${nodeBorder}`,
        borderRadius: 10,
        width: 176,
        fontFamily: "monospace",
        fontSize: 11,
        userSelect: "none",
        overflow: "hidden",
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: nodeBorder, border: "none", width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: nodeBorder, border: "none", width: 8, height: 8 }}
      />

      {/* Header: ID + nama */}
      <div
        style={{
          padding: "7px 10px",
          backgroundColor: d.isCritical ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          borderBottom: `1px solid ${d.isCritical ? "rgba(255,255,255,0.15)" : "rgba(204,197,185,0.15)"}`,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 13, color: "#fffcf2" }}>
          {d.id}
        </span>
        <span
          style={{
            fontSize: 10,
            color: "#fffcf2",
            opacity: 0.85,
            maxWidth: 110,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {d.nama}
        </span>
      </div>

      {/* TE */}
      <div
        style={{
          padding: "5px 10px",
          textAlign: "center",
          borderBottom: `1px solid ${d.isCritical ? "rgba(255,255,255,0.12)" : "rgba(204,197,185,0.12)"}`,
        }}
      >
        <span style={{ color: labelColor, fontSize: 10 }}>TE = </span>
        <span style={{ color: valueColor, fontWeight: 700, fontSize: 13 }}>
          {fmt(d.te)}
        </span>
        <span style={{ color: labelColor, fontSize: 10 }}> hari</span>
      </div>

      {/* ES / EF — LS / LF */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
          padding: "6px 8px",
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
      >
        {[
          { label: "ES", value: d.es, align: "left"  },
          { label: "EF", value: d.ef, align: "right" },
          { label: "LS", value: d.ls, align: "left"  },
          { label: "LF", value: d.lf, align: "right" },
        ].map(({ label, value, align }) => (
          <div key={label} style={{ textAlign: align as "left" | "right" }}>
            <div style={{ color: labelColor, fontSize: 9, textTransform: "uppercase" }}>
              {label}
            </div>
            <div style={{ color: valueColor, fontWeight: 600, fontSize: 11 }}>
              {fmt(value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const NODE_TYPES = { pertNode: PertNode };

// ── Auto-layout (tidak diubah) ───────────────────────────────
function computeLayout(activities: ActivityWithResult[]): Map<string, { x: number; y: number }> {
  const tierMap = new Map<string, number>();
  const actMap  = new Map(activities.map((a) => [a.id, a]));

  const getTier = (id: string, visited = new Set<string>()): number => {
    if (tierMap.has(id)) return tierMap.get(id)!;
    if (visited.has(id)) return 0;
    visited.add(id);
    const act  = actMap.get(id)!;
    const tier = act.predecessors.length === 0
      ? 0
      : Math.max(...act.predecessors.map((p) => getTier(p, new Set(visited)) + 1));
    tierMap.set(id, tier);
    return tier;
  };

  activities.forEach((a) => getTier(a.id));

  const byTier = new Map<number, string[]>();
  for (const [id, tier] of tierMap) {
    const arr = byTier.get(tier) ?? [];
    arr.push(id);
    byTier.set(tier, arr);
  }

  const X_GAP = 220;
  const Y_GAP = 140;
  const positions = new Map<string, { x: number; y: number }>();

  for (const [tier, ids] of byTier) {
    const totalHeight = (ids.length - 1) * Y_GAP;
    ids.forEach((id, i) => {
      positions.set(id, {
        x: tier * X_GAP,
        y: i * Y_GAP - totalHeight / 2,
      });
    });
  }

  return positions;
}

// ── Konversi ActivityWithResult → RF Nodes & Edges ───────────
function buildNodesEdges(activities: ActivityWithResult[]) {
  const positions   = computeLayout(activities);
  const criticalSet = new Set(activities.filter((a) => a.isCritical).map((a) => a.id));

  const nodes: Node[] = activities.map((act) => ({
    id:       act.id,
    type:     "pertNode",
    position: positions.get(act.id) ?? { x: 0, y: 0 },
    data: {
      id: act.id, nama: act.nama, te: act.te,
      es: act.es, ef: act.ef, ls: act.ls, lf: act.lf,
      isCritical: act.isCritical,
    },
  }));

  const edges: Edge[] = [];
  for (const act of activities) {
    for (const predId of act.predecessors) {
      const isCriticalEdge = criticalSet.has(predId) && criticalSet.has(act.id);
      edges.push({
        id:     `${predId}-${act.id}`,
        source:  predId,
        target:  act.id,
        type:   "smoothstep",
        animated: isCriticalEdge,
        style: {
          stroke:      isCriticalEdge ? "#eb5e28" : "rgba(204,197,185,0.35)",
          strokeWidth: isCriticalEdge ? 2 : 1.5,
        },
        markerEnd: {
          type:  MarkerType.ArrowClosed,
          color: isCriticalEdge ? "#eb5e28" : "rgba(204,197,185,0.35)",
        },
      });
    }
  }

  return { nodes, edges };
}

// ── Komponen utama ───────────────────────────────────────────
interface Props {
  activities: ActivityWithResult[];
  onNodeClick: (activity: ActivityWithResult) => void;
}

export default function NetworkDiagram({ activities, onNodeClick }: Props) {
  const { nodes: initNodes, edges: initEdges } = useMemo(
    () => buildNodesEdges(activities),
    [activities]
  );

  const [nodes, , onNodesChange] = useNodesState(initNodes);
  const [edges, , onEdgesChange] = useEdgesState(initEdges);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const act = activities.find((a) => a.id === node.id);
      if (act) onNodeClick(act);
    },
    [activities, onNodeClick]
  );

  return (
    <div
      style={{
        backgroundColor: "#403d39",
        border: "1px solid rgba(204,197,185,0.15)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Canvas */}
      <div style={{ height: 480, backgroundColor: "#252422" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.3}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          style={{ backgroundColor: "#252422" }}
        >
          {/* Grid dots */}
          <Background
            color="rgba(204,197,185,0.12)"
            gap={24}
          />

          {/* Controls */}
          <Controls
            showInteractive={false}
            style={{
              backgroundColor: "#403d39",
              border: "1px solid rgba(204,197,185,0.2)",
              borderRadius: 8,
            }}
          />

          {/* MiniMap */}
          <MiniMap
            nodeColor={(n) =>
              (n.data as { isCritical: boolean }).isCritical ? "#eb5e28" : "#ccc5b9"
            }
            maskColor="rgba(37,36,34,0.7)"
            style={{
              backgroundColor: "#403d39",
              border: "1px solid rgba(204,197,185,0.15)",
              borderRadius: 8,
            }}
          />

          {/* Legend — pojok kanan atas */}
          <Panel position="top-right">
            <div
              style={{
                backgroundColor: "rgba(64,61,57,0.9)",
                border: "1px solid rgba(204,197,185,0.15)",
                borderRadius: 8,
                padding: "8px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {[
                { color: "#eb5e28", label: "Jalur Kritis" },
                { color: "#ccc5b9", label: "Non-Kritis"   },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 8, height: 8, borderRadius: "50%",
                      backgroundColor: color, flexShrink: 0,
                      display: "inline-block",
                    }}
                  />
                  <span style={{ fontSize: 11, color: "#ccc5b9" }}>{label}</span>
                </div>
              ))}
              <div
                style={{
                  fontSize: 10, color: "#ccc5b9", opacity: 0.6,
                  borderTop: "1px solid rgba(204,197,185,0.12)",
                  paddingTop: 5, marginTop: 1,
                }}
              >
                Klik node untuk detail
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
