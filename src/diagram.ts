import { MarkerType, type Edge, type Node } from "@xyflow/react";
import jsPDF from "jspdf";

export type Template = "telecom" | "infra";
export interface DiagramSpec {
  title: string;
  template: Template;
  remoteSites: number;
  includeSbc: boolean;
  includeNeo: boolean;
  includeRecord: boolean;
  includeBackup: boolean;
}
export type DiagramNode = Node<{ label: string; kind: string }>;
export interface DiagramProject {
  version: 1;
  spec: DiagramSpec;
  nodes: DiagramNode[];
  edges: Edge[];
}
export const STORAGE_KEY = "axe-diagram-studio-v1";
export const DEFAULT_SPEC: DiagramSpec = {
  title: "Topologia de comunicação",
  template: "telecom",
  remoteSites: 2,
  includeSbc: true,
  includeNeo: true,
  includeRecord: true,
  includeBackup: true,
};
const colors: Record<string, string> = {
  cloud: "#e2ebff", border: "#d5e0ef", gateway: "#d7f4ec",
  pabx: "#d9eafe", app: "#f5e6ff", record: "#ffe9d5",
  storage: "#e7f2de", site: "#f0f2f7", server: "#e9eafc",
};
const nodeWidth = 184;
const nodeHeight = 74;
function node(id: string, label: string, kind: string, x: number, y: number): DiagramNode {
  return {
    id,
    position: { x, y },
    data: { label, kind },
    style: {
      width: nodeWidth, minHeight: nodeHeight,
      border: "1.5px solid #90a7c3",
      borderRadius: 12,
      padding: "17px 12px",
      background: colors[kind] || "#fff",
      color: "#152842", textAlign: "center",
      fontWeight: 650, fontSize: 14, boxShadow: "0 4px 12px #192a4411",
    },
  };
}
function edge(id: string, source: string, target: string, label?: string): Edge {
  return {
    id, source, target, label, type: "smoothstep",
    style: { stroke: "#597590", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#597590" },
  };
}
export function generateDiagram(spec: DiagramSpec): { nodes: DiagramNode[]; edges: Edge[] } {
  const nodes: DiagramNode[] = [];
  const edges: Edge[] = [];
  const add = (id: string, label: string, kind: string, x: number, y: number) => nodes.push(node(id, label, kind, x, y));
  const link = (from: string, to: string, label?: string) => edges.push(edge("e-" + from + "-" + to, from, to, label));
  if (spec.template === "infra") {
    add("wan", "Internet / Rede corporativa", "cloud", 40, 90);
    add("fw", "Firewall / Gateway", "gateway", 310, 90);
    add("apps", "Servidor de aplicações", "server", 580, 90);
    add("db", "Banco de dados", "storage", 850, 90);
    link("wan", "fw", "HTTPS"); link("fw", "apps"); link("apps", "db", "TCP");
    if (spec.includeBackup) { add("backup", "Storage / Backup", "storage", 850, 290); link("db", "backup"); }
  } else {
    add("wan", "Operadora / Tronco SIP", "cloud", 40, 90);
    let previous = "wan";
    if (spec.includeSbc) {
      add("sbc", "SBC / SSW de borda", "gateway", 300, 90);
      link(previous, "sbc", "SIP/TLS"); previous = "sbc";
    }
    add("pabx", "PABX / Comunicação", "pabx", 560, 90);
    link(previous, "pabx", "SIP");
    if (spec.includeNeo) { add("neo", "Neo Interact / Atendimento", "app", 820, 90); link("pabx", "neo", "API"); }
    if (spec.includeRecord) { add("record", "Gravação / Record", "record", 560, 290); link("pabx", "record", "Áudio"); }
    if (spec.includeBackup) {
      add("backup", "Storage / Backup", "storage", 820, 290);
      link(spec.includeRecord ? "record" : "pabx", "backup", "Dados");
    }
  }
  const count = Math.max(0, Math.min(8, Math.floor(spec.remoteSites || 0)));
  for (let i = 0; i < count; i++) {
    const id = "site-" + (i + 1);
    const x = 40 + (i % 4) * 260;
    const y = 490 + Math.floor(i / 4) * 140;
    add(id, "Unidade remota " + (i + 1), "site", x, y);
    link(spec.template === "infra" ? "fw" : "pabx", id, "IP");
  }
  return { nodes, edges };
}
export function readSavedProject(): DiagramProject | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return null;
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return null;
    const project = parsed as Partial<DiagramProject>;
    if (project.version !== 1 || !project.spec || !Array.isArray(project.nodes) || !Array.isArray(project.edges)) return null;
    return project as DiagramProject;
  } catch { return null; }
}
export function saveProject(project: DiagramProject): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(project)); }
  catch { /* Private mode or unavailable storage: editing still works. */ }
}
function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
export function diagramSvg(title: string, nodes: DiagramNode[], edges: Edge[]): string {
  const width = Math.max(1120, ...nodes.map(n => n.position.x + nodeWidth + 50));
  const height = Math.max(400, ...nodes.map(n => n.position.y + nodeHeight + 80));
  const byId = new Map(nodes.map(n => [n.id, n]));
  const lines = edges.map(e => {
    const a = byId.get(e.source), b = byId.get(e.target);
    if (!a || !b) return "";
    const x1 = a.position.x + nodeWidth / 2, y1 = a.position.y + nodeHeight / 2;
    const x2 = b.position.x + nodeWidth / 2, y2 = b.position.y + nodeHeight / 2;
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#64748b" stroke-width="2.5" marker-end="url(#arrow)"/>';
  }).join("");
  const boxes = nodes.map(n => {
    const x = n.position.x, y = n.position.y;
    const label = escapeXml(String(n.data.label));
    const color = colors[String(n.data.kind)] || "#ffffff";
    return '<rect x="' + x + '" y="' + y + '" width="' + nodeWidth + '" height="' + nodeHeight + '" rx="12" fill="' + color + '" stroke="#90a7c3" stroke-width="1.5"/>'
      + '<text x="' + (x + nodeWidth/2) + '" y="' + (y + nodeHeight/2 + 5) + '" text-anchor="middle" font-size="13" font-weight="600" fill="#152842">' + label + '</text>';
  }).join("");
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">'
    + '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#64748b"/></marker></defs>'
    + '<rect width="100%" height="100%" fill="#fff"/><text x="40" y="36" font-size="20" font-family="Arial" font-weight="700" fill="#14233f">' + escapeXml(title) + '</text>'
    + '<g font-family="Arial, sans-serif">' + lines + boxes + '</g></svg>';
}
function downloadBlob(name: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportSvg(title: string, nodes: DiagramNode[], edges: Edge[]): void {
  downloadBlob("axe-diagram.svg", new Blob([diagramSvg(title, nodes, edges)], { type: "image/svg+xml;charset=utf-8" }));
}
export function exportJson(project: DiagramProject): void {
  downloadBlob("axe-diagram.json", new Blob([JSON.stringify(project, null, 2)], { type: "application/json" }));
}
export async function exportPdf(title: string, nodes: DiagramNode[], edges: Edge[]): Promise<void> {
  const svg = diagramSvg(title, nodes, edges);
  const image = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Falha ao renderizar o diagrama para PDF."));
      image.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth * 2; canvas.height = image.naturalHeight * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponível.");
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const fit = Math.min(277 / canvas.width, 190 / canvas.height);
    const w = canvas.width * fit, h = canvas.height * fit;
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", (297 - w)/2, (210 - h)/2, w, h);
    pdf.save("axe-diagram.pdf");
  } finally { URL.revokeObjectURL(url); }
}
