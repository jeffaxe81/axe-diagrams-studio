import { describe, expect, it } from "vitest";
import { DEFAULT_SPEC, generateDiagram, type DiagramProject } from "./diagram";
import { inspectTopology, validateProject } from "./topologyValidation";

const project = (): DiagramProject => {
  const topology = generateDiagram(DEFAULT_SPEC);
  return {version:1,spec:{...DEFAULT_SPEC},...topology};
};

describe("topology validation", () => {
  it("accepts generated projects", () => {
    expect(validateProject(project()).valid).toBe(true);
    expect(inspectTopology(project())).toEqual([]);
  });
  it("rejects malformed imported nodes", () => {
    const value = project();
    value.nodes[0] = {...value.nodes[0]!, position:{x:NaN,y:0}};
    expect(validateProject(value).valid).toBe(false);
  });
  it("rejects invalid specs and excessive projects", () => {
    const value = project();
    expect(validateProject({...value,spec:{...value.spec,remoteSites:100}}).valid).toBe(false);
    expect(validateProject({...value,nodes:Array(1001).fill(value.nodes[0])}).valid).toBe(false);
  });
  it("detects broken links and isolated equipment", () => {
    const value = project();
    value.edges.push({id:"invalid",source:"missing",target:"pabx"});
    value.nodes.push({id:"alone",position:{x:0,y:0},data:{label:"Isolado",kind:"server"}});
    const codes = inspectTopology(value).map(f => f.code);
    expect(codes).toContain("broken-link");
    expect(codes).toContain("isolated-node");
  });
  it("detects duplicate connections and self-links", () => {
    const value = project();
    const e = value.edges[0]!;
    value.edges.push({...e,id:"other"});
    value.edges.push({id:"self",source:"pabx",target:"pabx"});
    const codes = inspectTopology(value).map(f => f.code);
    expect(codes).toContain("duplicate-link");
    expect(codes).toContain("loop");
  });
});
