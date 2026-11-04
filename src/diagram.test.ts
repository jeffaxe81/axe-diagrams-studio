import { describe, expect, it } from "vitest";
import { DEFAULT_SPEC, diagramSvg, generateDiagram } from "./diagram";

describe("geração de topologias", () => {
  it("inclui PABX, SBC, Neo e armazenamento quando selecionados", () => {
    const graph = generateDiagram(DEFAULT_SPEC);
    const ids = graph.nodes.map(n => n.id);
    expect(ids).toContain("pabx");
    expect(ids).toContain("sbc");
    expect(ids).toContain("neo");
    expect(ids).toContain("backup");
    expect(ids).toContain("site-2");
  });
  it("respeita a desativação de componentes opcionais", () => {
    const graph = generateDiagram({ ...DEFAULT_SPEC, includeNeo: false, includeSbc: false, includeRecord: false, includeBackup: false, remoteSites: 0 });
    expect(graph.nodes.map(n => n.id)).toEqual(["wan", "pabx"]);
    expect(graph.edges).toHaveLength(1);
  });
  it("limita quantidade de unidades remotas", () => {
    expect(generateDiagram({ ...DEFAULT_SPEC, remoteSites: 100 }).nodes.filter(n => n.id.startsWith("site-"))).toHaveLength(8);
  });
  it("gera documento SVG válido e escapa títulos", () => {
    const graph = generateDiagram(DEFAULT_SPEC);
    const svg = diagramSvg("Teste & <cliente>", graph.nodes, graph.edges);
    expect(svg).toContain("<svg");
    expect(svg).toContain("Teste &amp; &lt;cliente&gt;");
  });
  it("gera o modelo de infraestrutura", () => {
    const graph = generateDiagram({ ...DEFAULT_SPEC, template: "infra" });
    expect(graph.nodes.map(n => n.id)).toContain("db");
    expect(graph.nodes.map(n => n.id)).toContain("fw");
  });
});
