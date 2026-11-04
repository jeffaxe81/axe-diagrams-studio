import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

type Equipment = Node<{ label: string; kind: string }>;
const titles: Record<string, string> = {
  cloud: "REDE EXTERNA",
  gateway: "GATEWAY / SBC",
  pabx: "COMUNICAÇÃO",
  app: "APLICAÇÃO",
  record: "GRAVAÇÃO",
  storage: "ARMAZENAMENTO",
  site: "UNIDADE REMOTA",
  server: "SERVIDOR",
  border: "REDE",
};
function Symbol({ kind }: {kind: string}) {
  if (kind === "cloud") return (
    <svg viewBox="0 0 88 58" aria-hidden="true">
      <path d="M19 45C6 45 6 27 20 25C22 9 47 5 55 22C74 15 85 32 73 45Z" fill="#eef5ff" stroke="#1c50b4" strokeWidth="2"/>
      <path d="M25 34h39M35 26l-9 8 9 8M54 26l9 8-9 8" fill="none" stroke="#1c50b4" strokeWidth="1.6"/>
    </svg>
  );
  if (kind === "site") return (
    <svg viewBox="0 0 88 58" aria-hidden="true">
      <path d="M8 49V18L44 3l36 15v31Z" fill="#f1f4f7" stroke="#354652" strokeWidth="1.8"/>
      <rect x="18" y="27" width="52" height="18" fill="#d8e1e8" stroke="#526474"/>
      <rect x="38" y="32" width="13" height="13" fill="#fff" stroke="#526474"/>
    </svg>
  );
  if (kind === "app") return (
    <svg viewBox="0 0 88 58" aria-hidden="true">
      <rect x="8" y="6" width="72" height="44" rx="3" fill="#e8f1fb" stroke="#25303a" strokeWidth="2"/>
      <rect x="8" y="6" width="72" height="10" fill="#c9dbf5"/>
      <circle cx="16" cy="11" r="2" fill="#be4848"/><circle cx="24" cy="11" r="2" fill="#61a574"/>
      <rect x="18" y="23" width="45" height="3" fill="#8aa0b6"/>
      <rect x="18" y="31" width="29" height="3" fill="#8aa0b6"/>
      <rect x="18" y="39" width="37" height="3" fill="#8aa0b6"/>
    </svg>
  );
  const isStorage = kind === "storage" || kind === "record";
  return (
    <svg viewBox="0 0 88 58" aria-hidden="true">
      <rect x="4" y="9" width="80" height="41" rx="2" fill="#e1e4e8" stroke="#344452" strokeWidth="1.8"/>
      <rect x="9" y="14" width="70" height="31" rx="1" fill="#f0f2f4" stroke="#697984"/>
      {kind === "gateway" ? <>
        {Array.from({length:5}, (_,i) => <rect key={i} x={16+i*11} y="24" width="8" height="11" fill="#d2dae0" stroke="#4a5968"/>)}
      </> : isStorage ? <>
        {Array.from({length:3},(_,i) => <rect key={i} x={14+i*16} y="20" width="12" height="20" fill="#c1ccd6" stroke="#667683"/>)}
      </> : <>
        {Array.from({length:7},(_,i) => <path key={i} d={"M14 " + (20+i*3) + " H52"} stroke="#8997a3" strokeWidth="1.3"/>)}
      </>}
      <circle cx="71" cy="29" r="3.5" fill="#43a772" stroke="#287c53"/>
    </svg>
  );
}
export function EquipmentNode({ data, selected }: NodeProps<Equipment>) {
  const kind = data.kind || "server";
  return (
    <div className={"equip-node equip-" + kind + (selected ? " is-selected" : "")}>
      <Handle type="target" position={Position.Left} className="equip-handle"/>
      <div className="equip-category">{titles[kind] || "EQUIPAMENTO"}</div>
      <Symbol kind={kind}/>
      <div className="equip-label">{data.label}</div>
      <div className="equip-detail">CONEXÃO / RECURSO TÉCNICO</div>
      <Handle type="source" position={Position.Right} className="equip-handle"/>
    </div>
  );
}
