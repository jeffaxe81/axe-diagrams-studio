import {describe, expect, it} from "vitest";
import {DEFAULT_SPEC, generateDiagram, type DiagramProject} from "./diagram";
import {buildTechnicalSheets} from "./technicalSheets";

function project(overrides: Partial<typeof DEFAULT_SPEC> = {}): DiagramProject {
  const spec = {...DEFAULT_SPEC,...overrides};
  const graph = generateDiagram(spec);
  return {version:1,spec,nodes:graph.nodes,edges:graph.edges};
}
describe("pranchas técnicas", () => {
  it("gera cinco folhas de engenharia numeradas", () => {
    const sheets = buildTechnicalSheets(project());
    expect(sheets).toHaveLength(5);
    expect(sheets.map(s=>s.id)).toEqual(["blocks","virtualization","resources","connections","racks"]);
    expect(sheets[0]!.svg).toContain("FOLHA 1 / 5");
    expect(sheets[4]!.svg).toContain("FOLHA 5 / 5");
    expect(sheets.every(s=>s.svg.startsWith("<svg") && s.svg.endsWith("</svg>"))).toBe(true);
  });
  it("inclui duas regiões remotas sem extrapolar o modelo de prancha", () => {
    const sheets = buildTechnicalSheets(project({remoteSites:3}));
    expect(sheets[0]!.svg).toContain("UNIDADE REMOTA 01");
    expect(sheets[0]!.svg).toContain("UNIDADE REMOTA 02");
    expect(sheets[0]!.svg).toContain("+ 1 unidade(s) adicional(is)");
  });
  it("não inventa capacidade ou recursos de virtualização", () => {
    const report = buildTechnicalSheets(project())[2]!.svg;
    expect(report).toContain("RAM (GB)");
    expect(report).toContain("TOTAL / A DIMENSIONAR");
    expect(report).toContain("—");
  });
  it("insere identificação do cliente e revisão com escape seguro", () => {
    const p = project();
    p.spec = {...p.spec,customer:"Empresa <A&B>", revision:'"R2"'} as typeof p.spec;
    const sheets = buildTechnicalSheets(p);
    expect(sheets[0]!.svg).toContain("Empresa &lt;A&amp;B&gt;");
    expect(sheets[0]!.svg).toContain("&quot;R2&quot;");
    expect(sheets[0]!.svg).not.toContain("<A&B>");
  });
  it("gera vistas técnicas para racks, conexões e virtualização", () => {
    const sheets = buildTechnicalSheets(project());
    expect(sheets[1]!.svg).toContain("HYPERVISOR / XCP");
    expect(sheets[3]!.svg).toContain("NIC 0 / NIC 1");
    expect(sheets[4]!.svg).toContain("BASTIDOR PRINCIPAL");
    expect(sheets[4]!.svg).toContain("40U");
  });
  it("mantém tags arbitrárias fora do SVG", () => {
    const p = project({title:"</text><script>alert(1)</script>"});
    const svg = buildTechnicalSheets(p)[0]!.svg;
    expect(svg).toContain("&lt;/text&gt;&lt;script&gt;");
    expect(svg).not.toContain("<script>");
  });
});
