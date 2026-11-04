import { describe, expect, it } from "vitest";
import { fitLabel } from "./referenceBlockDiagram";
import { DEFAULT_SPEC, generateDiagram, type DiagramProject } from "./diagram";
import { referenceBlockDiagram } from "./referenceBlockDiagram";

describe("technical sheet presentation", () => {
  it("preserves short labels", () => {
    expect(fitLabel("Site Central", 20)).toBe("Site Central");
  });
  it("shortens long labels without exceeding their allocated space", () => {
    const text = fitLabel("Nome de unidade remota muito extenso", 19);
    expect(text.length).toBeLessThanOrEqual(19);
    expect(text.endsWith("…")).toBe(true);
  });
  it("escapes user-entered SVG text and limits long names", () => {
    const spec = {...DEFAULT_SPEC, mainSiteName:"Central & <regional>", remoteSite1Name:"Unidade muito longa de teste para região"};
    const generated = generateDiagram(spec);
    const project: DiagramProject = {version:1,spec,nodes:generated.nodes,edges:generated.edges};
    const svg = referenceBlockDiagram(project);
    expect(svg).toContain("Central &amp; &lt;regional&gt;");
    expect(svg).not.toContain("Unidade muito longa de teste para região");
  });
});
