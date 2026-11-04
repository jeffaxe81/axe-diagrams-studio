import type { DiagramProject, DiagramSpec } from "./diagram";

/** Folha 01: composição de engenharia inspirada na organização do Diag_b.pdf.
 * Formas são originais e SVG nativo, sem imagens proprietárias.
 * Coordenadas no espaço da folha 1600 × 1000, dentro do carimbo existente.
 */
type BlockSpec = DiagramSpec & {
  customer?: string;
  trunkType?: string;
  lanLabel?: string;
  mainSiteName?: string;
  remoteSite1Name?: string;
  remoteSite2Name?: string;
  gatewayCount?: number;
};
const INK = "#242c35";
const BLUE = "#1749cd";
const RED = "#c32c2c";
const GRAY = "#66717e";
const EDGE = "#8d99a4";
const PAPER = "#ffffff";
const METAL = "#e4e7eb";
const DARK = "#374453";

function escapeSvg(value: unknown): string {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")
    .replace(/[\u0000-\u001f]/g, " ");
}
function R(x: number, y: number, w: number, h: number, fill = PAPER, stroke = INK, weight = 1, radius = 0, dash = ""): string {
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
    '" rx="' + radius + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + weight + '"' +
    (dash ? ' stroke-dasharray="' + dash + '"' : "") + '/>';
}
function L(x1: number, y1: number, x2: number, y2: number, color = INK, width = 1, dash = ""): string {
  return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
    '" stroke="' + color + '" stroke-width="' + width + '"' +
    (dash ? ' stroke-dasharray="' + dash + '"' : "") + '/>';
}
function P(d: string, color = BLUE, width = 2.2, dash = ""): string {
  return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + width +
    '" stroke-linecap="round" stroke-linejoin="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + '/>';
}
function T(x: number, y: number, value: unknown, size = 12, color = INK, anchor = "start", bold = false): string {
  return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" fill="' + color +
    '" text-anchor="' + anchor + '" font-weight="' + (bold ? 700 : 400) + '">' +
    escapeSvg(value) + '</text>';
}
function ellipse(cx: number, cy: number, rx: number, ry: number, fill = "#eef5fe", stroke = BLUE, dash = ""): string {
  return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry +
    '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.3"' +
    (dash ? ' stroke-dasharray="' + dash + '"' : "") + '/>';
}
function C(cx: number, cy: number, r: number, fill = PAPER, stroke = INK): string {
  return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r +
    '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1"/>';
}
function tag(x: number, y: number, value: string, color = RED): string {
  return T(x, y, value, 11, color, "middle", true);
}
function cloud(x: number, y: number, label: string, w = 170): string {
  const sx = w / 170;
  const shape = 'M 30 66 C 3 67 0 32 29 31 C 30 10 55 2 75 18 C 94 -5 126 13 128 31 C 162 25 182 54 151 69 Z';
  return '<g transform="translate(' + x + ' ' + y + ') scale(' + sx + ' 1)">' +
    '<path d="' + shape + '" fill="#fff" stroke="' + BLUE + '" stroke-width="1.3" stroke-dasharray="5 3"/>' +
    T(86, 50, label, 17, BLUE, "middle", true) + "</g>";
}
function smallGateway(x: number, y: number, label: string, w = 132, h = 93): string {
  let s = R(x, y, w, h, METAL, INK, 1.5, 1) +
    R(x + 6, y + 9, w - 12, 16, "#bcc4ca", "#75828c", .8) +
    T(x + w / 2, y + 21, "DTCV / E1", 11, INK, "middle", true) +
    R(x + 9, y + 32, w - 18, h - 42, "#eef0f2", EDGE, .9);
  for (let i = 0; i < 4; i++) {
    const px = x + 15 + i * (w - 38) / 4;
    s += R(px, y + 40, 17, h - 57, "#c6cbd0", DARK, .7) +
      C(px + 8, y + 45, 2.3, i % 2 ? "#e49f31" : "#3eb36b", "#5b6b60") +
      R(px + 3, y + h - 30, 11, 12, "#eef1f3", INK, .6);
  }
  s += T(x + w / 2, y + h + 16, label, 12, INK, "middle", true);
  return s;
}
function smallSwitch(x: number, y: number, w: number, number: string, height = 35): string {
  let s = R(x, y, w, height, "#d1d6dc", INK, 1.5, 2) +
    R(x + 6, y + 6, w - 12, height - 12, "#edf0f2", EDGE, .6) +
    T(x + 14, y + height / 2 + 4, "SWITCH " + number, Math.max(11, Math.min(14, height * .38)), INK, "start", true);
  const start = x + (w >= 300 ? 163 : 82);
  const count = Math.max(4, Math.floor((x + w - 19 - start) / 13));
  for (let i = 0; i < count; i++) {
    const xx = start + i * 13;
    s += R(xx, y + height / 2 - 5, 9, 10, "#f4f5f6", "#68727c", .8) +
      L(xx + 2, y + height / 2 + 7, xx + 7, y + height / 2 + 7, i % 3 ? "#55a36e" : "#d2a54f", 1.2);
  }
  return s;
}
function server(x: number, y: number, name: string, w = 214, h = 32): string {
  let s = R(x, y, w, h, "#d3d8dd", INK, 1.1, 1) +
    R(x + 7, y + 5, w - 14, h - 10, "#edf0f2", "#84909a", .6) +
    C(x + 18, y + h / 2, 5, "#aab4be", "#6a737d") +
    C(x + w - 17, y + h / 2, 3.2, "#389f61", "#42614e");
  for (let i = 0; i < 7; i++) s += L(x + 32, y + 10 + i * 1.8, x + 93, y + 10 + i * 1.8, "#86919a", .85);
  s += T(x + w + 9, y + h / 2 + 5, name, 12, INK, "start", true);
  return s;
}
function display(x: number, y: number, label: string): string {
  return R(x + 8, y, 44, 31, "#eff2f5", BLUE, 1.6, 1) +
    R(x + 12, y + 4, 36, 23, "#dceaf8", BLUE, 1) +
    P("M " + (x + 30) + " " + (y + 31) + " v 8 h -21 h 42", BLUE, 1.4) +
    T(x + 30, y + 57, label, 11, BLUE, "middle", true);
}
function phone(x: number, y: number, label: string): string {
  return R(x + 12, y, 32, 47, "#dde8f6", BLUE, 1.7, 6) +
    R(x + 17, y + 7, 22, 19, "#b9d4f9", BLUE, .8, 1) +
    R(x + 18, y + 30, 20, 9, "#fff", BLUE, .8, 1) +
    T(x + 27, y + 62, label, 10, BLUE, "middle", true);
}
function router(x: number, y: number, name: string): string {
  return ellipse(x + 24, y + 12, 26, 12, "#e7eaf0", BLUE) +
    P("M " + (x + 12) + " " + (y + 12) + " h 23 m -9 -4 l 9 4 -9 4", BLUE, 1) +
    T(x + 24, y + 39, name, 11, INK, "middle");
}
function ups(x: number, y: number): string {
  return R(x, y, 34, 53, "#e2e6e8", DARK, 1.2, 5) +
    C(x + 17, y + 14, 7, "#f6f8f9", GRAY) +
    T(x + 17, y + 42, "UPS", 9, INK, "middle", true);
}
function lanBus(x: number, y: number, width: number, title: string): string {
  return R(x, y, width, 18, PAPER, BLUE, 2.5, 9) + T(x + width / 2, y + 13, title, 12, BLUE, "middle", true);
}
function remote(x: number, name: string, ordinal: number, trunkLabel: string): string {
  let s = R(x, 133, 245, 323, "none", "#87919b", 1.2, 0, "5 4") +
    T(x + 10, 148, "SITE " + ordinal + " — " + name, 12, RED, "start", true) +
    T(x + 123, 170, "STFC", 16, BLUE, "middle", true) +
    tag(x + 123, 184, trunkLabel) +
    P("M " + (x + 123) + " 188 V 198", RED, 1.2);
  s += smallGateway(x + 52, 204, "GATEWAY E1 / FXS", 141, 76);
  s += L(x + 123, 280, x + 123, 301, BLUE, 1.6);
  s += smallSwitch(x + 33, 305, 180, String(ordinal + 1).padStart(2, "0"), 26);
  s += L(x + 123, 331, x + 123, 345, BLUE, 1.6);
  s += router(x + 49, 353, "ROTEADOR") + ups(x + 182, 347);
  s += lanBus(x + 95, 394, 118, "LAN");
  s += P("M " + (x + 74) + " 365 H " + (x + 112) + " V 394", BLUE, 1.7);
  s += T(x + 15, 437, "Sobrevivência local / IP", 11, GRAY);
  return s;
}

/** Returns the vector body inserted into sheetFrame() by technicalSheets.ts. */
export function referenceBlockDiagram(project: DiagramProject): string {
  const spec = project.spec as BlockSpec;
  const mainName = spec.mainSiteName?.trim() || "SITE PRINCIPAL";
  const remote1 = spec.remoteSite1Name?.trim() || "UNIDADE REMOTA 01";
  const remote2 = spec.remoteSite2Name?.trim() || "UNIDADE REMOTA 02";
  const remoteCount = Math.max(0, Math.min(8, Math.floor(spec.remoteSites || 0)));
  const gatewayCount = Math.max(1, Math.min(4, Math.floor(spec.gatewayCount ?? 4)));
  const label = spec.trunkType?.trim() || "STFC / SIP (A DEFINIR)";
  const lan = spec.lanLabel?.trim() || "LAN CORPORATIVA";
  let s = "";
  // Primary site and two remote sites share the same engineering sheet composition.
  s += R(62, 133, 940, 709, "none", "#92979c", 1.1) +
    T(79, 155, mainName, 16, INK, "start", true) +
    T(983, 155, "CENTRAL", 10, GRAY, "end");
  s += cloud(343, 169, "STFC", 165) +
    T(425, 261, label, 12, RED, "middle", true);
  for (let i = 0; i < gatewayCount; i++) {
    const x = 112 + i * 166;
    const center = x + 70;
    s += P("M 425 238 V 258 H " + center + " V 286", RED, 1.2);
    s += smallGateway(x, 287, "GATEWAY " + String(i).padStart(2, "0"), 139, 87);
    s += P("M " + center + " 374 V 406", INK, 1.4);
  }
  s += T(84, 289, "TRONCOS", 11, RED, "start", true) +
    tag(87, 305, "SIP / E1");
  // Two real horizontal switches, like the reference blueprint.
  s += smallSwitch(94, 405, 655, "00", 33);
  s += smallSwitch(94, 450, 655, "01", 33);
  s += P("M 421 438 V 450", INK, 1.8);
  // Legacy PABX and telephony core on the right.
  if (spec.includeSbc) {
    s += R(783, 269, 144, 74, "#fff", "#a5aebb", 1.1, 0, "3 3") +
      smallGateway(817, 277, "SSW / SBC", 80, 47) +
      P("M 856 343 V 465 H 740", BLUE, 1.6);
  }
  s += R(780, 362, 166, 68, "none", "#b6c1ce", 1, 0, "3 3") +
    T(863, 376, "RAMAL / IP", 11, INK, "middle", true) +
    phone(837, 383, "PABX") +
    P("M 863 430 V 475", BLUE, 1.4);
  s += P("M 749 466 H 783", BLUE, 2);
  // Wide Gigabit LAN bus, endpoints attached vertically.
  s += lanBus(615, 485, 761, lan);
  s += P("M 749 483 V 485", BLUE, 2.5);
  s += T(617, 468, "REDE GIGABIT / SWITCH 00-01", 12, BLUE, "start", true);
  // Physical host visualization at the bottom left of the main site.
  s += T(103, 529, "SERVIDORES / VIRTUALIZAÇÃO", 12, INK, "start", true);
  const physical = [
    "Virtualização 00", "Virtualização 01", "Virtualização 02",
    "Virtualização 03", spec.includeBackup ? "Storage / Backup" : "Servidor de Serviços",
  ];
  physical.forEach((name, i) => {
    const y = 550 + i * 49;
    s += server(102, y, name, 201, 30);
    s += P("M 306 " + (y + 15) + " H 386 V 483", INK, 1.05);
  });
  // Workstations, softphone/telephony and record services on the blue LAN.
  s += display(481, 571, "OPERAÇÃO") +
    display(581, 571, "SUPERVISÃO") +
    phone(692, 566, "PA IP 01") +
    phone(771, 566, "PA IP 02") +
    phone(850, 566, spec.includeNeo ? "NEO / WEB" : "PA IP 03");
  [511,611,720,799,878].forEach(x=>{s+=P("M "+x+" 503 V 565",BLUE,1.5);});
  s += T(476, 666, "TERMINAIS E ESTAÇÕES", 12, GRAY, "start", true);
  if (spec.includeRecord) {
    s += server(511, 715, "RECORD / GRAVAÇÃO", 168, 35) +
      P("M 595 503 V 690 H 595 V 715", BLUE, 1.5);
  }
  if (spec.includeNeo) {
    s += R(716, 704, 203, 74, "#f3f8ff", BLUE, 1.2, 2) +
      T(817, 731, "NEO INTERACT", 14, BLUE, "middle", true) +
      T(817, 750, "Atendimento / WebRTC", 12, INK, "middle") +
      P("M 817 628 V 704", BLUE, 1.4);
  }
  s += T(90, 819, "* DISTRIBUIÇÃO DA VIRTUALIZAÇÃO: VER FOLHA 2", 16, RED, "start", true);
  // Two compact remote sites on the upper right, side by side.
  if (remoteCount >= 1) s += remote(1025, remote1, 1, "TRONCO A DEFINIR");
  if (remoteCount >= 2) s += remote(1281, remote2, 2, "TRONCO A DEFINIR");
  if (remoteCount > 2) s += T(1280, 462, "+ " + (remoteCount - 2) + " unidade(s) adicional(is) — ver topologia", 12, RED, "middle", true);
  // Gateway between the head-end LAN and web interconnection.
  s += router(1370, 477, "ROTEADOR") +
    P("M 1376 494 H 1377", BLUE, 2);
  s += cloud(1402, 563, "WEB", 126);
  s += P("M 1395 502 V 565 H 1455", BLUE, 1.9);
  if (remoteCount >= 1) s += P("M 1099 394 V 466 H 1454 V 565", BLUE, 1.5, "4 3");
  if (remoteCount >= 2) s += P("M 1355 394 V 450 H 1480 V 565", BLUE, 1.5, "4 3");
  // Technical legend: blue and black links have separate meanings.
  s += T(1090, 683, "INTEGRAÇÃO PRINCIPAL ↔ SITES REMOTOS", 13, INK, "start", true) +
    P("M 1090 703 H 1170", BLUE, 2.5) +
    T(1185, 707, "LAN / TRÁFEGO IP", 11, GRAY) +
    P("M 1090 726 H 1170", INK, 1.8) +
    T(1185, 730, "CONEXÃO FÍSICA", 11, GRAY) +
    P("M 1090 749 H 1170", RED, 1.8) +
    T(1185, 753, "ENTRONCAMENTO STFC", 11, GRAY);
  s += T(1090, 802, "Portas, endereços, recursos e quantitativos", 11, GRAY) +
    T(1090, 818, "dependem do dimensionamento do projeto.", 11, GRAY);
  return s;
}
