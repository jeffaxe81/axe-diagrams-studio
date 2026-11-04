import type { DiagramProject, DiagramSpec } from "./diagram";

export type SheetId = "blocks" | "virtualization" | "resources" | "connections" | "racks";
export interface TechnicalSheet {
  id: SheetId;
  title: string;
  filename: string;
  svg: string;
}
type ExtendedSpec = DiagramSpec & {
  customer?: string;
  revision?: string;
  trunkType?: string;
  lanLabel?: string;
};
const W = 1600;
const H = 1000;
const INK = "#25303a";
const BLUE = "#1c50b4";
const RED = "#b93434";
const GRAY = "#707b84";
const LIGHT = "#c5cbd1";

function esc(value: unknown): string {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")
    .replace(/[\u0000-\u001f]/g, " ");
}
function rect(x: number, y: number, width: number, height: number, fill = "none", stroke = INK, sw = 1, dash = ""): string {
  return '<rect x="' + x + '" y="' + y + '" width="' + width + '" height="' + height +
    '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + sw + '"' +
    (dash ? ' stroke-dasharray="' + dash + '"' : "") + '/>';
}
function line(x1: number, y1: number, x2: number, y2: number, color = INK, sw = 1.5, dash = ""): string {
  return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
    '" stroke="' + color + '" stroke-width="' + sw + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + '/>';
}
function path(d: string, color = BLUE, sw = 2, dash = ""): string {
  return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + sw +
    '" stroke-linejoin="round" stroke-linecap="square"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + '/>';
}
function text(x: number, y: number, value: unknown, size = 17, color = INK, anchor = "start", bold = false): string {
  return '<text x="' + x + '" y="' + y + '" fill="' + color + '" font-size="' + size +
    '" text-anchor="' + anchor + '" font-weight="' + (bold ? "700" : "400") + '">' + esc(value) + '</text>';
}
function circle(x: number, y: number, r: number, fill = "white", stroke = INK): string {
  return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.2"/>';
}
function cloud(x: number, y: number, label: string): string {
  const d = 'M ' + (x + 37) + ' ' + (y + 67) +
    ' C ' + (x - 8) + ' ' + (y + 67) + ', ' + (x - 5) + ' ' + (y + 19) + ', ' + (x + 29) + ' ' + (y + 25) +
    ' C ' + (x + 36) + ' ' + (y - 11) + ', ' + (x + 88) + ' ' + (y - 15) + ', ' + (x + 104) + ' ' + (y + 23) +
    ' C ' + (x + 151) + ' ' + (y + 15) + ', ' + (x + 162) + ' ' + (y + 67) + ', ' + (x + 119) + ' ' + (y + 67) + ' Z';
  return '<path d="' + d + '" fill="#fff" stroke="' + BLUE + '" stroke-width="2" stroke-dasharray="6 3"/>'
    + text(x + 79, y + 44, label, 15, BLUE, "middle", true);
}
function appliance(x: number, y: number, w: number, h: number, label: string, type: "server"|"switch"|"gateway"|"storage" = "server"): string {
  let s = rect(x, y, w, h, "#e7e9ec", INK, 1.8);
  s += rect(x + 8, y + 8, Math.max(w - 16, 1), h - 16, "#d6dade", GRAY, 1);
  if (type === "switch") {
    for (let i = 0; i < Math.min(18, Math.floor((w - 35) / 14)); i++) {
      s += rect(x + 14 + i * 14, y + h / 2 - 5, 10, 10, "#eff4f6", "#67727a", .8);
    }
  } else if (type === "gateway") {
    for (let i = 0; i < 6; i++) s += rect(x + 18 + i * 18, y + h / 2 - 8, 13, 16, "#f3f5f6", INK, 1);
  } else {
    for (let i = 0; i < 9; i++) s += line(x + 18, y + 12 + i * (h - 24) / 10, x + Math.min(w * .52, w - 65), y + 12 + i * (h - 24) / 10, "#737d86", 1.3);
    s += circle(x + w - 27, y + h / 2, 4, "#2b956e", "#206347");
  }
  s += text(x + w / 2, y + h + 23, label, 14, INK, "middle", true);
  return s;
}
function systemBox(x: number, y: number, w: number, h: number, label: string, fill = "#ffffff", color = INK): string {
  return rect(x, y, w, h, fill, color, 1.6) + text(x + w / 2, y + h / 2 + 5, label, 15, color, "middle", true);
}
function ethernet(x: number, y: number, w: number, label: string): string {
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="18" rx="9" fill="#ffffff" stroke="' + BLUE + '" stroke-width="2.4"/>'
    + text(x + w / 2, y + 14, label, 12, BLUE, "middle", true);
}
function dottedRegion(x: number, y: number, w: number, h: number, title: string): string {
  return rect(x, y, w, h, "none", "#939ba4", 1.4, "6 4") +
    rect(x + 10, y - 10, Math.min(w - 20, title.length * 8 + 18), 22, "#fff", "none", 0) +
    text(x + 18, y + 5, title, 16, INK, "start", true);
}
function sheetFrame(spec: ExtendedSpec, title: string, index: number, total: number, body: string, note: string): string {
  const customer = spec.customer?.trim() || "CLIENTE A DEFINIR";
  const revision = spec.revision?.trim() || "A";
  const out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">'
    + '<rect width="100%" height="100%" fill="#fff"/>'
    + '<g font-family="Arial, Helvetica, sans-serif">'
    + rect(20, 18, 1560, 958, "#fff", "#272727", 1.6)
    + rect(42, 40, 1516, 909, "none", "#565656", .8)
    + line(42, 98, 1558, 98, LIGHT, 1)
    + line(42, 863, 1558, 863, LIGHT, 1)
    + text(63, 72, title.toUpperCase(), 25, INK, "start", true)
    + text(1534, 72, "AXE DIAGRAM STUDIO  /  PROJETO TÉCNICO", 15, GRAY, "end", true)
    + body
    + text(63, 888, note, 12, RED)
    + text(63, 916, "LEGENDA:   AZUL = COMUNICAÇÃO / DADOS     VERMELHO = OBSERVAÇÃO / ALTERAÇÃO     TRACEJADO = LIMITE LÓGICO", 11, GRAY)
    + rect(930, 873, 605, 67, "#fff", INK, 1.2)
    + rect(930, 873, 155, 67, "#f4f6f8", INK, 1)
    + text(1007, 907, "AXE", 28, BLUE, "middle", true)
    + text(1007, 926, "DIAGRAM STUDIO", 10, INK, "middle", true)
    + line(1085, 908, 1535, 908, INK, 1)
    + line(1420, 873, 1420, 940, INK, 1)
    + text(1097, 896, spec.title || "Projeto sem título", 15, INK, "start", true)
    + text(1097, 927, customer, 12, GRAY)
    + text(1431, 890, "REVISÃO  " + revision, 12, INK, "start", true)
    + text(1431, 925, "FOLHA " + index + " / " + total, 12, INK, "start", true)
    + '</g></svg>';
  return out;
}
function mainSite(x: number, y: number, project: DiagramProject): string {
  const spec = project.spec as ExtendedSpec;
  let s = dottedRegion(x, y, 944, 720, "SITE PRINCIPAL — NÚCLEO DE COMUNICAÇÃO");
  s += cloud(x + 275, y + 54, "STFC / SIP");
  s += text(x + 355, y + 143, spec.trunkType || "Entroncamento a definir", 14, RED, "middle");
  s += path("M " + (x + 353) + " " + (y + 121) + " V " + (y + 191));
  if (spec.includeSbc) {
    s += appliance(x + 254, y + 194, 196, 62, "SBC / SSW", "gateway");
    s += path("M " + (x + 353) + " " + (y + 279) + " V " + (y + 326));
  }
  s += appliance(x + 520, y + 194, 215, 62, "PABX / SIP", "server");
  s += path("M " + (x + 450) + " " + (y + 225) + " H " + (x + 520));
  s += appliance(x + 120, y + 350, 540, 48, "SWITCHES DE DISTRIBUIÇÃO", "switch");
  s += path("M " + (x + 628) + " " + (y + 279) + " V " + (y + 350));
  s += ethernet(x + 100, y + 442, 750, spec.lanLabel || "LAN / REDE CORPORATIVA");
  s += path("M " + (x + 395) + " " + (y + 398) + " V " + (y + 442));
  const labels = ["SERVIDOR VIRTUALIZAÇÃO", "SERVIDOR DE SERVIÇOS", spec.includeRecord ? "SERVIDOR DE GRAVAÇÃO" : "SERVIDOR DE DADOS", spec.includeBackup ? "STORAGE / BACKUP" : "ARMAZENAMENTO"];
  for (let i = 0; i < labels.length; i++) {
    const bx = x + 85 + i * 208;
    s += appliance(bx, y + 518, 175, 63, labels[i], i === 3 ? "storage" : "server");
    s += path("M " + (bx + 87) + " " + (y + 518) + " V " + (y + 469));
  }
  s += text(x + 82, y + 675, "Distribuição de serviços e recursos: ver folha 2", 14, RED, "start", true);
  return s;
}
function remoteSite(x: number, y: number, width: number, height: number, name: string): string {
  let s = dottedRegion(x, y, width, height, name);
  const m = x + width / 2;
  s += text(m, y + 52, "STFC / SIP", 15, BLUE, "middle", true);
  s += path("M " + m + " " + (y + 60) + " V " + (y + 80), RED, 1.5);
  s += appliance(m - 94, y + 85, 188, 55, "GATEWAY / SOBREVIVÊNCIA", "gateway");
  s += appliance(m - 94, y + 183, 188, 39, "SWITCH LOCAL", "switch");
  s += path("M " + m + " " + (y + 162) + " V " + (y + 183));
  s += ethernet(m - 96, y + 262, 192, "LAN LOCAL");
  s += path("M " + m + " " + (y + 244) + " V " + (y + 262));
  s += text(m, y + 312, "Rede e telefonia remota", 13, GRAY, "middle");
  return s;
}
function blocks(spec: ExtendedSpec, project: DiagramProject): string {
  let s = mainSite(65, 126, project);
  const count = Math.max(0, Math.min(8, Number(spec.remoteSites) || 0));
  const shown = Math.min(2, count);
  for (let i = 0; i < shown; i++) {
    const y = 135 + i * 357;
    s += remoteSite(1035, y, 490, 325, "UNIDADE REMOTA " + String(i + 1).padStart(2, "0"));
    s += path("M 1009 " + (y + 160) + " H 1026 V " + (y + 276) + " H 1035", BLUE, 1.7, "5 4");
  }
  if (count > shown) s += text(1278, 835, "+ " + (count - shown) + " unidade(s) adicional(is) no projeto", 15, RED, "middle");
  if (count === 0) s += text(1278, 330, "SEM UNIDADES REMOTAS", 17, GRAY, "middle");
  return s;
}
function vmLabels(spec: DiagramSpec): string[] {
  if (spec.template === "infra") return ["Aplicação", "Banco de dados", "Monitoramento", "Servidor web", ...(spec.includeBackup ? ["Backup"] : [])];
  const vms = ["PABX", "SSW / SIP", "Matriz VoIP", "BD / WEB"];
  if (spec.includeNeo) vms.push("Neo Interact");
  if (spec.includeRecord) vms.push("Gravação");
  if (spec.includeBackup) vms.push("Backup");
  return vms;
}
function vmGroups(spec: DiagramSpec): string[][] {
  const groups: string[][] = [[], [], [], []];
  vmLabels(spec).forEach((v, i) => groups[i % 4].push(v));
  return groups;
}
function virtualMachine(x: number, y: number, label: string): string {
  return rect(x, y, 254, 68, "#fff", GRAY, 1)
    + circle(x + 36, y + 33, 19, "#e3e8ed", GRAY)
    + text(x + 36, y + 38, "VM", 12, INK, "middle", true)
    + text(x + 70, y + 39, label, 15, INK, "start", true);
}
function virtualization(spec: DiagramSpec): string {
  let s = text(800, 153, "DISTRIBUIÇÃO DOS SERVIÇOS NA VIRTUALIZAÇÃO", 22, INK, "middle", true);
  const groups = vmGroups(spec);
  for (let i = 0; i < 4; i++) {
    const x = 84 + i * 375;
    s += text(x + 143, 212, "SERVIDOR DE VIRTUALIZAÇÃO " + String(i).padStart(2, "0"), 16, INK, "middle", true)
      + systemBox(x + 47, 229, 188, 34, "HYPERVISOR / XCP", "#e3e6ea")
      + rect(x, 280, 290, 394, "none", RED, 1.8)
      + text(x + 17, 305, "MÁQUINAS VIRTUAIS", 14, RED, "start", true);
    const vms = groups[i]!;
    if (!vms.length) s += text(x + 145, 403, "Sem VM atribuída", 15, GRAY, "middle");
    for (let j = 0; j < vms.length; j++) s += virtualMachine(x + 17, 332 + j * 82, vms[j]!);
  }
  s += text(105, 763, "A distribuição é um modelo inicial e pode ser alterada pelo responsável técnico.", 16, RED);
  s += text(105, 799, "Parâmetros físicos e redundância devem ser confirmados no dimensionamento.", 15, GRAY);
  return s;
}
function resources(spec: DiagramSpec): string {
  const groups = vmGroups(spec);
  let s = text(800, 141, "RELATÓRIO DE MÁQUINAS VIRTUAIS", 24, BLUE, "middle", true);
  for (let g = 0; g < 4; g++) {
    const x = 85 + (g % 2) * 755;
    const y = 190 + Math.floor(g / 2) * 315;
    const rows = groups[g]!.length;
    s += text(x + 338, y, "SERVIDOR VIRTUALIZAÇÃO " + String(g).padStart(2, "0"), 17, INK, "middle")
      + rect(x, y + 25, 680, 43, "#abc2e6", "#899eb6", 1)
      + text(x + 16, y + 53, "Máquina Virtual", 16, INK, "start", true)
      + text(x + 370, y + 53, "vCPU", 15, INK, "middle", true)
      + text(x + 455, y + 53, "RAM (GB)", 15, INK, "middle", true)
      + text(x + 550, y + 53, "Disco (GB)", 15, INK, "middle", true)
      + text(x + 641, y + 53, "Tipo", 15, INK, "middle", true);
    for (const px of [350, 400, 510, 602]) s += line(x + px, y + 25, x + px, y + 68 + (Math.max(3, rows) + 1) * 38, "#c2ccd8", .7);
    for (let j = 0; j < Math.max(3, rows); j++) {
      const ry = y + 68 + 38 * j;
      s += rect(x, ry, 680, 38, j % 2 ? "#f3f6f2" : "#e9efe4", "#d5dfd1", .7);
      if (groups[g]![j]) {
        s += text(x + 16, ry + 25, groups[g]![j]!, 14);
        for (const px of [370, 455, 550, 641]) s += text(x + px, ry + 25, "—", 16, GRAY, "middle");
      }
    }
    const ty = y + 68 + Math.max(3, rows) * 38;
    s += rect(x, ty, 680, 38, "#dbe8d8", "#bbcdb8", 1)
      + text(x + 16, ty + 25, "TOTAL / A DIMENSIONAR", 14, BLUE, "start", true);
    for (const px of [370, 455, 550, 641]) s += text(x + px, ty + 25, "—", 16, GRAY, "middle");
  }
  s += text(88, 838, "Valores em branco: o sistema ainda não recebeu o dimensionamento de vCPU, RAM e disco.", 15, RED);
  return s;
}
function connections(spec: ExtendedSpec): string {
  const groups = vmGroups(spec);
  let s = text(800, 148, "MAPA DE CONEXÕES E INTERFACES", 23, BLUE, "middle", true);
  for (let i = 0; i < 4; i++) {
    const x = 80 + i * 371;
    s += dottedRegion(x, 193, 311, 425, "SERVIDOR " + String(i).padStart(2, "0"))
      + systemBox(x + 32, 238, 246, 44, "NIC 0 / NIC 1 — HEARTBEAT", "#f5f5f5")
      + line(x + 155, 282, x + 155, 317, INK, 1.4)
      + line(x + 34, 317, x + 276, 317, INK, 1.5);
    const list = groups[i]!;
    for (let j = 0; j < list.length; j++) {
      const px = x + 21 + (j % 2) * 143, py = 359 + Math.floor(j / 2) * 91;
      s += systemBox(px, py, 126, 52, list[j]!.slice(0, 17), "#ffffff");
      s += path("M " + (px + 63) + " " + py + " V 339 H " + (x + 155) + " V 317", INK, 1.2);
      s += text(px + 63, py + 75, "Eth —", 12, GRAY, "middle");
    }
    s += systemBox(x + 94, 567, 124, 34, "NIC 2", "#ecf0f4")
      + path("M " + (x + 156) + " 602 V 674", INK, 3);
  }
  s += ethernet(70, 677, 1440, spec.lanLabel || "SWITCHES / VLAN CLIENTE — TAG E IPS A DEFINIR");
  for (let i = 0; i < 3; i++) {
    const x = 80 + i * 371 + 311, next = x + 60;
    s += path("M " + x + " 239 H " + next, BLUE, 1.8, "5 4")
      + text((x + next)/2, 222, "HB", 12, BLUE, "middle");
  }
  s += text(100, 770, "Conexões em azul: rede de dados / heartbeat. Linhas escuras: interfaces físicas ou virtuais.", 15, INK);
  s += text(100, 804, "VLAN, endereços IP, TAG, portas de switch e NIC devem ser preenchidos após validação.", 15, RED);
  return s;
}
function rack(x: number, y: number, label: string, units: number, equipment: {u: number, span: number, name: string, type: "server"|"switch"|"gateway"|"storage"}[]): string {
  const h = 612, w = 248, base = y + 42, unitH = 548 / units;
  let s = rect(x, y, w, h, "#ebedef", INK, 2.6)
    + rect(x + 18, base, w - 36, 548, "#fbfbfb", GRAY, 1.7)
    + rect(x + 4, y + 10, 11, h - 20, "#a7acb1", INK, 1)
    + rect(x + w - 15, y + 10, 11, h - 20, "#a7acb1", INK, 1)
    + text(x + w/2, y - 17, label, 19, INK, "middle", true);
  for (let u = 0; u < units; u++) {
    const ly = base + (u + 1) * unitH;
    s += line(x + 19, ly, x + w - 19, ly, "#d0d3d7", .7);
    if (u % 5 === 0 || u === units - 1) s += text(x + 8, ly - 2, units - u, 8, "#333", "middle");
  }
  for (const e of equipment) {
    const ey = base + (units - e.u - e.span) * unitH;
    const eh = e.span * unitH;
    s += rect(x + 23, ey + 1, w - 46, eh - 2, "#aeb5bb", INK, 1.1)
      + rect(x + 29, ey + 5, w - 58, Math.max(5, eh - 10), "#dbe0e4", GRAY, .7);
    if (e.type === "switch") {
      for (let p = 0; p < 14; p++) s += rect(x + 35 + p * 12, ey + eh / 2 - 3, 8, 6, "#79858a", INK, .35);
    } else {
      for (let p = 0; p < 6; p++) s += line(x + 38, ey + 8 + p * 3.2, x + 100, ey + 8 + p * 3.2, GRAY, 1);
      s += circle(x + w - 42, ey + eh / 2, 3.2, "#43aa73");
    }
    s += text(x + w + 24, ey + eh / 2 + 5, e.name + " (" + e.span + "U)", 14);
  }
  s += rect(x + 7, y + 615, w - 14, 28, "#fff", INK, 1)
    + text(x + w/2, y + 634, '19"  /  ' + units + "U", 15, INK, "middle");
  return s;
}
function racks(_spec: ExtendedSpec): string {
  let s = text(800, 145, "DISTRIBUIÇÃO FÍSICA DE BASTIDORES", 23, BLUE, "middle", true);
  const core: {u:number,span:number,name:string,type:"server"|"switch"|"gateway"|"storage"}[] = [
    {u:37,span:2,name:"Servidor Virtualização 00",type:"server"},
    {u:34,span:2,name:"Servidor Virtualização 01",type:"server"},
    {u:31,span:2,name:"Servidor Virtualização 02",type:"server"},
    {u:28,span:2,name:"Servidor Virtualização 03",type:"server"},
    {u:22,span:3,name:"Storage",type:"storage"},
    {u:6,span:1,name:"Switch 01",type:"switch"},
    {u:4,span:1,name:"Switch 00",type:"switch"}
  ];
  const remote: {u:number,span:number,name:string,type:"server"|"switch"|"gateway"|"storage"}[] = [
    {u:18,span:3,name:"Gateway / SSW",type:"gateway"},
    {u:12,span:1,name:"Switch de rede",type:"switch"}
  ];
  s += rack(305, 189, "BASTIDOR PRINCIPAL", 40, core);
  s += rack(925, 189, "BASTIDOR REMOTO / EDGE", 24, remote);
  s += text(95, 821, "A ocupação apresentada é ilustrativa: ajustar modelos, altura U, ventilação e posição real.", 16, RED);
  return s;
}
export function buildTechnicalSheets(project: DiagramProject): TechnicalSheet[] {
  const spec = project.spec as ExtendedSpec;
  const entries: {id:SheetId, title:string, name:string, body:string, note:string}[] = [
    {id:"blocks",title:"Diagrama em bloco",name:"01-diagrama-blocos",body:blocks(spec,project),note:"Desenho conceitual: validar topologia, canais e interfaces."},
    {id:"virtualization",title:"Distribuição da virtualização",name:"02-virtualizacao",body:virtualization(spec),note:"Distribuição demonstrativa: validar hosts e serviços."},
    {id:"resources",title:"Relatório de máquinas virtuais",name:"03-relatorio-vms",body:resources(spec),note:"Dimensionamento técnico não informado; não considerar valores implícitos."},
    {id:"connections",title:"Conexões",name:"04-conexoes",body:connections(spec),note:"Pontos de rede e identificação de interfaces a conferir em campo."},
    {id:"racks",title:"Bastidores",name:"05-bastidores",body:racks(spec),note:"Posições U e modelos de equipamentos são ilustrativos."},
  ];
  return entries.map((entry, i) => ({
    id:entry.id,title:entry.title,filename:entry.name,
    svg:sheetFrame(spec,entry.title,i + 1,entries.length,entry.body,entry.note)
  }));
}
export function downloadTechnicalSvg(sheet: TechnicalSheet): void {
  const blob = new Blob([sheet.svg], {type:"image/svg+xml;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = sheet.filename + ".svg"; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function exportTechnicalPdf(sheets: TechnicalSheet[]): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const pdf = new jsPDF({orientation:"landscape",unit:"mm",format:"a3",compress:true});
  for (let i = 0; i < sheets.length; i++) {
    if (i) pdf.addPage();
    const sheet = sheets[i]!;
    const source = URL.createObjectURL(new Blob([sheet.svg], {type:"image/svg+xml;charset=utf-8"}));
    try {
      const img = new Image();
      await new Promise<void>((resolve,reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Não foi possível renderizar a folha " + (i+1)));
        img.src = source;
      });
      const canvas = document.createElement("canvas");
      canvas.width = 2400; canvas.height = 1500;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas indisponível para exportação");
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      pdf.addImage(canvas.toDataURL("image/png"),"PNG",0,17.25,420,262.5);
    } finally { URL.revokeObjectURL(source); }
  }
  pdf.save("axe-diagram-studio-caderno-tecnico.pdf");
}
