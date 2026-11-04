import { useEffect, useMemo, useState } from "react";
import { addEdge, Background, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState, type Connection, type Edge } from "@xyflow/react";
import {
  DEFAULT_SPEC, exportJson, exportPdf, exportSvg, generateDiagram, readSavedProject, saveProject,
  type DiagramNode, type DiagramProject, type DiagramSpec, type Template,
} from "./diagram";
import { EquipmentNode } from "./EquipmentNode";
import { validateProject, inspectTopology } from "./topologyValidation";
import { buildTechnicalSheets, downloadTechnicalSvg, exportTechnicalPdf } from "./technicalSheets";

type ProjectSpec = DiagramSpec & {
  customer?: string;
  revision?: string;
  trunkType?: string;
  lanLabel?: string;
  mainSiteName?: string;
  remoteSite1Name?: string;
  remoteSite2Name?: string;
  gatewayCount?: number;
};
const nodeTypes = {equipment: EquipmentNode};

export default function App() {
  const initial = useMemo(() => {
    const saved = readSavedProject();
    const spec = (saved?.spec ?? DEFAULT_SPEC) as ProjectSpec;
    const generated = generateDiagram(spec);
    return { spec, nodes: saved?.nodes ?? generated.nodes, edges: saved?.edges ?? generated.edges };
  }, []);
  const [spec, setSpec] = useState<ProjectSpec>(initial.spec);
  const [nodes, setNodes, onNodesChange] = useNodesState<DiagramNode>(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initial.edges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [mode, setMode] = useState<"sheets" | "editor">("sheets");
  const [sheetIndex, setSheetIndex] = useState(0);
  const [message, setMessage] = useState("Dados salvos localmente neste navegador.");
  const [exporting, setExporting] = useState(false);
  const selected = nodes.find(n => n.id === selectedId);
  const project: DiagramProject = {version:1, spec, nodes, edges};
  const sheets = useMemo(() => buildTechnicalSheets({version:1,spec,nodes,edges}),[spec,nodes,edges]);
  const activeSheet = sheets[sheetIndex] ?? sheets[0]!;
  const findings = useMemo(() => inspectTopology(project), [spec, nodes, edges]);
  const visualNodes = useMemo(() => nodes.map(n => ({...n,type:"equipment",style:undefined})),[nodes]);

  useEffect(() => {saveProject({version:1,spec,nodes,edges});},[spec,nodes,edges]);
  function patchSpec(patch: Partial<ProjectSpec>): void {
    setSpec(current => ({...current,...patch}));
  }
  function rebuild(): void {
    const result = generateDiagram(spec);
    setNodes(result.nodes); setEdges(result.edges); setSelectedId(null);
    setVersion(v => v+1);
    setMessage("Nova topologia gerada. As folhas de engenharia foram atualizadas.");
  }
  function createNode(): void {
    const id = "custom-" + Date.now();
    const node: DiagramNode = {
      id, position:{x:260,y:240},data:{label:"Novo equipamento",kind:"server"}
    };
    setNodes(list => [...list,node]);setSelectedId(id);setMode("editor");
  }
  function connect(connection: Connection): void {
    setEdges(existing => addEdge({
      ...connection,type:"smoothstep",animated:false,style:{stroke:"#1c50b4",strokeWidth:2}
    },existing));
  }
  function renameSelected(label: string): void {
    setNodes(current => current.map(n => n.id===selectedId ? {...n,data:{...n.data,label}} : n));
  }
  function removeSelected(): void {
    if(!selectedId) return;
    setNodes(current => current.filter(n => n.id!==selectedId));
    setEdges(current => current.filter(e => e.source!==selectedId && e.target!==selectedId));
    setSelectedId(null);
  }
  async function importFile(file: File | undefined): Promise<void> {
    if(!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if(!parsed || typeof parsed !== "object") throw new Error("Arquivo inválido.");
      const value = parsed as Partial<DiagramProject>;
      const validation = validateProject(value);
      if (!validation.valid) throw new Error(validation.error);
      setSpec(value.spec as ProjectSpec);setNodes(value.nodes);setEdges(value.edges);
      setSelectedId(null);setVersion(v=>v+1);
      setMessage("Projeto importado.");
    } catch(e) {
      setMessage(e instanceof Error ? e.message : "Erro ao importar JSON.");
    }
  }
  async function pdfSheets(): Promise<void> {
    setExporting(true);
    try {
      await exportTechnicalPdf(sheets);
      setMessage("Caderno de cinco folhas exportado em PDF A3.");
    } catch(e) {
      setMessage(e instanceof Error ? e.message : "Falha ao exportar PDF.");
    } finally {setExporting(false);}
  }
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbrand"><span className="brand">AXE</span> <strong>Diagram Studio</strong><span className="version">ENGENHARIA · 0.3</span></div>
        <span className="status">● Sistema local • edição técnica • 5 pranchas</span>
      </header>
      <div className="workspace">
        <aside className="sidebar">
          <div className="side-title">
            <span className="eyebrow">QUESTIONÁRIO DE PROJETO</span>
            <h1>Gerador técnico</h1>
            <p>Configure a arquitetura e gere desenhos com padrão de engenharia, semelhantes à referência fornecida.</p>
          </div>
          <label>Título do projeto
            <input value={spec.title} onChange={e => patchSpec({title:e.target.value})}/>
          </label>
          <div className="two-columns">
            <label>Cliente / órgão
              <input placeholder="Ex.: SSP / CE" value={spec.customer ?? ""} onChange={e=>patchSpec({customer:e.target.value})}/>
            </label>
            <label>Revisão
              <input placeholder="A" value={spec.revision ?? "A"} onChange={e=>patchSpec({revision:e.target.value})}/>
            </label>
          </div>
          <label>Tipo de topologia
            <select value={spec.template} onChange={e => patchSpec({template:e.target.value as Template})}>
              <option value="telecom">Telecom / PABX / SBC</option>
              <option value="infra">Infraestrutura / TI</option>
            </select>
          </label>
          <label>Entroncamento de telefonia
            <input placeholder="Ex.: SIP Trunk virtual" value={spec.trunkType ?? ""} onChange={e => patchSpec({trunkType:e.target.value})}/>
          </label>
          <label>Identificação da rede / VLAN
            <input placeholder="Ex.: LAN corporativa / VLAN a definir" value={spec.lanLabel ?? ""} onChange={e => patchSpec({lanLabel:e.target.value})}/>
          </label>
          <label>Unidades remotas (0 a 8)
            <input type="number" min={0} max={8} value={spec.remoteSites} onChange={e=>patchSpec({remoteSites:Math.max(0,Math.min(8,Number(e.target.value)||0))})}/>
          </label>
          <div className="block-layout-fields">
            <span className="field-title">Folha 1 · disposição semelhante à referência</span>
            <label>Nome do site principal
              <input placeholder="Site principal" value={spec.mainSiteName ?? ""} onChange={e=>patchSpec({mainSiteName:e.target.value})}/>
            </label>
            <label>Gateways na central (1 a 4)
              <input type="number" min={1} max={4} value={spec.gatewayCount ?? 4}
                onChange={e=>patchSpec({gatewayCount:Math.max(1,Math.min(4,Number(e.target.value)||1))})}/>
            </label>
            {spec.remoteSites >= 1 && <label>Identificação da unidade remota 01
              <input placeholder="Ex.: Juazeiro do Norte" value={spec.remoteSite1Name ?? ""} onChange={e=>patchSpec({remoteSite1Name:e.target.value})}/>
            </label>}
            {spec.remoteSites >= 2 && <label>Identificação da unidade remota 02
              <input placeholder="Ex.: Sobral" value={spec.remoteSite2Name ?? ""} onChange={e=>patchSpec({remoteSite2Name:e.target.value})}/>
            </label>}
          </div>
          <div className="checklist">
            <span className="field-title">Componentes</span>
            {spec.template==="telecom" && <>
              <label><input type="checkbox" checked={spec.includeSbc} onChange={e=>patchSpec({includeSbc:e.target.checked})}/> SBC / SSW de borda</label>
              <label><input type="checkbox" checked={spec.includeNeo} onChange={e=>patchSpec({includeNeo:e.target.checked})}/> Neo Interact</label>
              <label><input type="checkbox" checked={spec.includeRecord} onChange={e=>patchSpec({includeRecord:e.target.checked})}/> Gravação / Record</label>
            </>}
            <label><input type="checkbox" checked={spec.includeBackup} onChange={e=>patchSpec({includeBackup:e.target.checked})}/> Backup / Storage</label>
          </div>
          <button className="primary" onClick={rebuild}>Gerar / atualizar topologia</button>
          <div className="separator"/>
          <span className="field-title">Edição de equipamentos</span>
          <button className="wide" onClick={createNode}>+ Adicionar equipamento</button>
          {selected ? <div className="selection">
            <label>Nome do equipamento
              <input value={String(selected.data.label)} onChange={e=>renameSelected(e.target.value)}/>
            </label>
            <button className="danger" onClick={removeSelected}>Excluir equipamento</button>
          </div> : <p className="hint">Use o modo Editor para arrastar equipamentos, alterar nomes e conectar as interfaces.</p>}
          <div className="separator"/>
          <span className="field-title">Diagnóstico da topologia</span>
          <div className="topology-diagnostics" aria-live="polite">
            {findings.length === 0 ? <p className="diagnostic-ok">Nenhuma inconsistência estrutural detectada.</p> : findings.map((finding, index) =>
              <p className={finding.level === "error" ? "diagnostic-error" : "diagnostic-warning"} key={`${finding.code}-${index}`}>
                <strong>{finding.level === "error" ? "Erro" : "Atenção"}:</strong> {finding.message}
              </p>
            )}
          </div>
          <div className="separator"/>
          <span className="field-title">Exportações</span>
          <button className="primary wide export-main" disabled={exporting} onClick={()=>void pdfSheets()}>
            {exporting ? "Gerando caderno..." : "Exportar caderno técnico · PDF A3"}
          </button>
          <div className="actions">
            <button onClick={()=>downloadTechnicalSvg(activeSheet)}>SVG da folha</button>
            <button onClick={()=>exportJson(project)}>JSON</button>
          </div>
          <div className="actions">
            <button onClick={()=>exportSvg(spec.title,nodes,edges)}>SVG editor</button>
            <button onClick={()=>exportPdf(spec.title,nodes,edges).catch(e=>setMessage(String(e)))}>PDF editor</button>
          </div>
          <label className="import">Importar projeto JSON
            <input type="file" accept=".json,application/json" onChange={e=>{void importFile(e.target.files?.[0]);e.target.value="";}}/>
          </label>
          <p className="hint">Pranchas geradas pelo questionário; alterações manuais do Editor continuam disponíveis no projeto JSON e na exportação do Editor.</p>
        </aside>
        <main className="canvas-area">
          <div className="canvas-heading">
            <div><span className="eyebrow">PROJETO DE ENGENHARIA</span><h2>{spec.title || "Projeto sem título"}</h2></div>
            <div className="view-toggle">
              <button className={mode==="sheets" ? "active" : ""} onClick={()=>setMode("sheets")}>Pranchas técnicas</button>
              <button className={mode==="editor" ? "active" : ""} onClick={()=>setMode("editor")}>Editor livre</button>
            </div>
          </div>
          {mode==="sheets" ? <>
            <div className="sheet-tabbar" role="tablist" aria-label="Folhas do caderno">
              {sheets.map((sheet,i) => (
                <button key={sheet.id} role="tab" aria-selected={sheetIndex===i} className={sheetIndex===i?"selected":""}
                  onClick={()=>setSheetIndex(i)}>
                  <span className="sheet-number">{String(i+1).padStart(2,"0")}</span>{sheet.title}
                </button>
              ))}
            </div>
            <div className="sheet-stage">
              <div className="sheet-topline"><strong>{activeSheet.title}</strong><span>Folha {sheetIndex+1} de {sheets.length} · visualização vetorial</span></div>
              <div className="sheet-preview" dangerouslySetInnerHTML={{__html:activeSheet.svg}}/>
            </div>
          </> : <>
            <div className="flow-wrap">
              <ReactFlow key={version} nodes={visualNodes} edges={edges}
                nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
                onNodeClick={(_event,n)=>setSelectedId(n.id)} onPaneClick={()=>setSelectedId(null)}
                onConnect={connect} fitView fitViewOptions={{padding:.18}}
                nodesDraggable nodesConnectable deleteKeyCode={["Backspace","Delete"]}>
                <Background gap={22} color="#e4eaf1"/><Controls/><MiniMap zoomable pannable/>
              </ReactFlow>
            </div>
          </>}
          <div className="footer"><span>{message}</span><span>{nodes.length} equipamentos · {edges.length} conexões</span></div>
        </main>
      </div>
    </div>
  );
}
