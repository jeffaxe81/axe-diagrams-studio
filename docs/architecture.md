# Arquitetura inicial

## Objetivo técnico
- Frontend local: React + TypeScript + Vite, com canvas interativo React Flow.
- Modelo serializável em JSON, independente de interface.
- Mecanismo determinístico de geração: questionário técnico -> nós + conexões.
- Persistência local via localStorage (MVP), sem servidor e sem envio de dados para a nuvem.
- Exportação JSON (edição/backup), SVG (vetorial), PDF (impressão/compartilhamento).

## Limitações conhecidas desta fundação
- O SVG exportado é uma representação independente da visualização React Flow; as conexões são linhas diretas.
- O PDF exportado contém uma imagem de alta resolução do diagrama, não objetos editáveis.
- O SVG pode ser inserido no Microsoft Visio como gráfico, mas ainda não vira formas/conectores nativos editáveis.
- Ainda não há leitura/escrita VSDX, catálogo completo de símbolos de engenharia, auto-layout inteligente ou armazenamento multiusuário.
- A ferramenta ainda não reproduz visualmente o nível de detalhe do Diag_b.pdf. Isto está previsto para as próximas etapas.

## Evolução prevista
- Expandir modelo tipado: site, rack, host, VM, interface, VLAN, tronco, canal, porta, entidade lógica, conexão.
- Diagramas multicamadas: físico, lógico, serviços, rede e armazenamento.
- Regras de consistência e biblioteca de templates profissionais.
- Layout inteligente (ELK), agrupamentos e conectores ortogonais.
- Exportação de VSDX editável, sujeita a validação de fidelidade/interoperabilidade.
- Backups exportáveis, persistência local aprimorada (IndexedDB), autenticação apenas na futura versão colaborativa.

## Executar localmente
Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Abra o endereço local exibido pelo Vite (normalmente http://127.0.0.1:5173).

Validar:
```bash
npm run build
npm run test
```
