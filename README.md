# AXE Diagram Studio

Gerador inteligente de diagramas técnicos para projetos de infraestrutura, telecomunicações e soluções corporativas.

## Objetivo

Converter respostas a um questionário técnico em diagramas editáveis, claros e padronizados, permitindo ajustes manuais após a geração.

## Funcionalidades planejadas

- Questionário orientado para levantamento técnico (sites, servidores, VMs, redes, PABX, SBC/SSW, links e integrações).
- Geração de topologias a partir de um modelo de dados estruturado.
- Edição visual de equipamentos, blocos, conexões, rótulos e agrupamentos.
- Biblioteca de modelos reutilizáveis, com estilo próximo a diagramas profissionais de engenharia.
- Persistência local inicial para trabalhar offline.
- Exportação SVG e PDF; interoperabilidade com Visio prevista como evolução.
- Futuras integrações com outros sistemas, sem dependência obrigatória para uso local.

## Princípios

1. **Local primeiro:** a primeira versão deve rodar no computador do usuário.
2. **Modelo de dados separado da apresentação:** o arquivo do projeto não depende da ferramenta de desenho.
3. **Editável:** os diagramas gerados podem ser ajustados sem refazer o questionário.
4. **Extensível:** novos modelos de diagrama e conjuntos de equipamentos podem ser adicionados por módulos.
5. **Qualidade técnica:** conexões, rótulos e posicionamento seguem convenções documentadas.

## Desenvolvimento

A aplicação inicial será uma interface web local com TypeScript, React e React Flow. Veja `docs/architecture.md` e `docs/roadmap.md` após a criação do scaffold.

> Repositório exclusivo do AXE Diagram Studio. Os projetos AXE PABX, AXE Voice e AXE Despacho permanecem separados.
