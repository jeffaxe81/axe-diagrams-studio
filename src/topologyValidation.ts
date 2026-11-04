import type { DiagramProject } from "./diagram";

export interface TopologyFinding {
  code: string;
  level: "error" | "warning";
  message: string;
}

export function validateProject(input: unknown): {valid:true;project:DiagramProject} | {valid:false;error:string} {
  if (!input || typeof input !== "object") return {valid:false,error:"O arquivo não contém um projeto válido."};
  const p = input as Partial<DiagramProject>;
  if (p.version !== 1 || !p.spec || !Array.isArray(p.nodes) || !Array.isArray(p.edges)) {
    return {valid:false,error:"Formato do projeto incompatível com a versão 1."};
  }
  const spec = p.spec;
  if (typeof spec.title !== "string" || !["telecom","infra"].includes(spec.template) ||
      !Number.isInteger(spec.remoteSites) || spec.remoteSites < 0 || spec.remoteSites > 8 ||
      ["includeSbc","includeNeo","includeRecord","includeBackup"].some(key => typeof spec[key as keyof typeof spec] !== "boolean")) {
    return {valid:false,error:"Questionário técnico contém campos inválidos."};
  }
  if (p.nodes.length > 1000 || p.edges.length > 5000) return {valid:false,error:"Arquivo excede os limites de equipamentos ou conexões."};
  for (const n of p.nodes) {
    if (!n || typeof n.id !== "string" || !n.id || !n.position ||
        !Number.isFinite(n.position.x) || !Number.isFinite(n.position.y) ||
        !n.data || typeof n.data.label !== "string" || typeof n.data.kind !== "string") {
      return {valid:false,error:"Equipamento com identificação, posição ou dados inválidos."};
    }
  }
  for (const e of p.edges) {
    if (!e || typeof e.id !== "string" || !e.id || typeof e.source !== "string" || typeof e.target !== "string") {
      return {valid:false,error:"Conexão inválida no arquivo."};
    }
  }
  return {valid:true,project:p as DiagramProject};
}

export function inspectTopology(project: DiagramProject): TopologyFinding[] {
  const findings: TopologyFinding[] = [];
  const ids = new Set<string>();
  for (const n of project.nodes) {
    if (ids.has(n.id)) findings.push({code:"duplicate-node",level:"error",message:`ID de equipamento duplicado: ${n.id}`});
    ids.add(n.id);
    if (!String(n.data.label ?? "").trim()) findings.push({code:"empty-label",level:"warning",message:`Equipamento ${n.id} sem identificação.`});
  }
  const edges = new Set<string>();
  const degree = new Map([...ids].map(id => [id,0]));
  for (const e of project.edges) {
    if (!ids.has(e.source) || !ids.has(e.target)) {
      findings.push({code:"broken-link",level:"error",message:`Conexão ${e.id} aponta para equipamento inexistente.`});
      continue;
    }
    if (e.source === e.target) findings.push({code:"loop",level:"warning",message:`Conexão ${e.id} liga um equipamento a si mesmo.`});
    const key = [e.source,e.target].sort().join("|");
    if (edges.has(key)) findings.push({code:"duplicate-link",level:"warning",message:`Conexão repetida entre ${e.source} e ${e.target}.`});
    edges.add(key);
    degree.set(e.source,(degree.get(e.source) ?? 0)+1);
    degree.set(e.target,(degree.get(e.target) ?? 0)+1);
  }
  for (const n of project.nodes) {
    if ((degree.get(n.id) ?? 0) === 0) findings.push({code:"isolated-node",level:"warning",message:`Equipamento isolado: ${n.data.label || n.id}.`});
  }
  return findings;
}
