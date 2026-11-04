import { useEffect, useMemo, useState } from "react";
import { addEdge, Background, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState, type Connection, type Edge } from "@xyflow/react";
import {
  DEFAULT_SPEC, exportJson, exportPdf, exportSvg, generateDiagram, readSavedProject, saveProject,
  type DiagramNode, type DiagramProject, type DiagramSpec, type Template,
} from "./diagram";

export default function App() {
  const initial = useMemo(() => {
    const saved = readSavedProject();
    const spec = saved?.spec ?? DEFAULT_SPEC;
    const generated = generateDiagram(spec);
    return { spec, nodes: saved?.nodes ?? generated.nodes, edges: saved?.edges ?? generated.edges };
  }, []);
  const [spec, setSpec] = useState<DiagramSpec>(initial.spec);
  const [nodes, setNodes, onNodesChange] = useNodesState<DiagramNode>(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initial.edges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [message, setMessage] = useState("Projeto salvo automaticamente neste navegador.");
  const selected = nodes.find(n => n.id === selectedId);
  const project: DiagramProject = { version: 1, spec, nodes, edges };
  useEffect(() => { saveProject({ version: 1, spec, nodes, edges }); }, [spec, nodes, edges]);
  function patchSpec(patch: Partial<DiagramSpec>): void { setSpec(current => ({ ...current, ...patch })); }
  function rebuild(): void {
    const result = generateDiagram(spec);
    setNodes(result.nodes); setEdges(result.edges); setSelectedId(null);
    setVersion(v => v + 1);
    setMessage("Diagrama gerado. Arraste os elementos e ajuste os rótulos.");
  }
  function createNode(): void {
    const id = "custom-" + Date.now();
    const node: DiagramNode = {
      id, position: { x: 260, y: 240 },
      data: { label: "Novo equipamento", kind: "server" },
      style: { borderRadius: 12, border: "1.5px solid #90a7c3", padding: 17, background: "#e9eafc", width: 184, textAlign: "center", fontWeight: 650 },
    };
    setNodes(list => [...list, node]); setSelectedId(id);
  }
  function connect(connection: Connection): void {
    setEdges(existing => addEdge({ ...connection, type: "smoothstep", animated: false }, existing));
  }
  function renameSelected(label: string): void {
    setNodes(current => current.map(n => n.id === selectedId ? { ...n, data: { ...n.data, label } } : n));
  }
  function removeSelected(): void {
    if (!selectedId) return;
    setNodes(current => current.filter(n => n.id !== selectedId));
    setEdges(current => current.filter(e => e.source !== selectedId && e.target !== selectedId));
    setSelectedId(null);
  }
  async function importFile(file: File | undefined): Promise<void> {
    if (!file) return;
    try {
      const value: unknown = JSON.parse(await file.text());
      if (!value || typeof value !== "object") throw new Error("Arquivo inválido.");
      const parsed = value as Partial<DiagramProject>;
      if (parsed.version !== 1 || !parsed.spec || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) throw new Error("Formato incompatível.");
      setSpec(parsed.spec); setNodes(parsed.nodes); setEdges(parsed.edges);
      setSelectedId(null); setVersion(v => v + 1);
      setMessage("Projeto importado com sucesso.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Erro ao importar arquivo."); }
  }
  return (
    <div className="app">
      <header className="topbar">
        <div><span className="brand">AXE</span> <strong>Diagram Studio</strong><span className="version">MVP 0.1</span></div>
        <span className="status">● Local • salvamento automático</span>
      </header>
      <div className="workspace">
        <aside className="sidebar">
          <div className="side-title"><span className="eyebrow">ASSISTENTE DE ENGENHARIA</span><h1>Configure seu diagrama</h1><p>Responda às perguntas e gere um desenho editável.</p></div>
          <label>Título do projeto<input value={spec.title} onChange={e => patchSpec({ title: e.target.value })} /></label>
          <label>Tipo de diagrama<select value={spec.template} onChange={e => patchSpec({ template: e.target.value as Template })}><option value="telecom">Telecom / PABX</option><option value="infra">Infraestrutura / TI</option></select></label>
          <label>Unidades remotas (0 a 8)<input type="number" min={0} max={8} value={spec.remoteSites} onChange={e => patchSpec({ remoteSites: Number(e.target.value) })}/></label>
          <div className="checklist">
            <span className="field-title">Componentes adicionais</span>
            {spec.template === "telecom" && <>
              <label><input type="checkbox" checked={spec.includeSbc} onChange={e => patchSpec({ includeSbc: e.target.checked })}/> SBC / SSW de borda</label>
              <label><input type="checkbox" checked={spec.includeNeo} onChange={e => patchSpec({ includeNeo: e.target.checked })}/> Neo Interact</label>
              <label><input type="checkbox" checked={spec.includeRecord} onChange={e => patchSpec({ includeRecord: e.target.checked })}/> Servidor de gravação</label>
            </>}
            <label><input type="checkbox" checked={spec.includeBackup} onChange={e => patchSpec({ includeBackup: e.target.checked })}/> Backup / Storage</label>
          </div>
          <button className="primary" onClick={rebuild}>Gerar diagrama</button>
          <div className="separator"/>
          <span className="field-title">Edição manual</span>
          <button onClick={createNode}>+ Adicionar equipamento</button>
          {selected && <div className="selection">
            <label>Equipamento selecionado<input value={String(selected.data.label)} onChange={e => renameSelected(e.target.value)}/></label>
            <button className="danger" onClick={removeSelected}>Remover equipamento</button>
          </div>}
          {!selected && <p className="hint">Clique em um equipamento para alterar o nome. Arraste os blocos e ligue as alças para criar conexões.</p>}
          <div className="separator"/>
          <span className="field-title">Exportar projeto</span>
          <div className="actions">
            <button onClick={() => exportSvg(spec.title, nodes, edges)}>SVG</button>
            <button onClick={() => exportJson(project)}>JSON</button>
            <button onClick={() => exportPdf(spec.title, nodes, edges).catch(err => setMessage(String(err)))}>PDF</button>
          </div>
          <label className="import">Importar JSON<input type="file" accept=".json,application/json" onChange={e => {void importFile(e.target.files?.[0]); e.target.value = "";}} /></label>
          <p className="hint">SVG é compatível como imagem no Visio. Exportação VSDX editável está no roadmap.</p>
        </aside>
        <main className="canvas-area">
          <div className="canvas-heading"><div><span className="eyebrow">PRANCHETA TÉCNICA</span><h2>{spec.title || "Sem título"}</h2></div><span className="count">{nodes.length} elementos • {edges.length} conexões</span></div>
          <div className="flow-wrap">
            <ReactFlow key={version} nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeClick={(_e, n) => setSelectedId(n.id)} onPaneClick={() => setSelectedId(null)} onConnect={connect} fitView fitViewOptions={{ padding: 0.18 }} nodesDraggable nodesConnectable deleteKeyCode={["Backspace", "Delete"]}>
              <Background gap={22} color="#e4eaf1" /><Controls /><MiniMap zoomable pannable />
            </ReactFlow>
          </div>
          <div className="footer"><span>{message}</span><span>Arrastar • conectar • editar • exportar</span></div>
        </main>
      </div>
    </div>
  );
}
