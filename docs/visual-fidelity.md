# Fidelidade visual — referência Diag_b.pdf

## Referência analisada
O documento possui oito folhas: (1) diagrama em blocos, (2) distribuição de VMs, (3–4) relatórios de VMs, (5) conexões e VLANs, (6) bastidor principal, (7–8) racks remotos. Esta evolução segue a organização e as convenções, sem reproduzir logomarcas ou ilustrações proprietárias.

## Entrega MVP 0.2
- Molduras, título, revisão, nome do cliente, número de folha em padrão A3 paisagem.
- Desenhos vetoriais dos sites, serviços, appliances, rede local e infraestrutura.
- Distribuição conceitual de VMs em quatro hosts.
- Tabelas de recursos com campos pendentes, sem inventar CPU/RAM/disco.
- Heartbeat, NICs e etiquetas de rede.
- Bastidores com unidades de rack e representação frontal simplificada.
- Modo de pranchas técnicas e editor livre separados.
- Exportação SVG da folha ativa e caderno PDF A3 com cinco folhas.

## Limitações
- Pranchas são geradas do questionário; edição manual do canvas mantém exportação SVG/PDF específica.
- Distribuição de VMs e posições U são ilustrativas até existir inventário estruturado.
- A primeira folha mostra duas unidades remotas, contabilizando as adicionais.
- PDF contém renderização raster em alta resolução das pranchas; SVG é vetorial.
- Interoperabilidade VSDX nativa não foi implementada.

## Próximas tarefas
- Modelo de engenharia persistente para hosts, VMs, racks e links.
- Propriedades editáveis de CPU, RAM, discos, U, interfaces, VLANs e portas.
- Pranchas derivadas do mesmo modelo editável.
- Layout automático ortogonal e validação de colisões.
- Exportação para Visio com elementos editáveis.
- Testes de regressão visual automatizados.

## Atualização da Folha 1 — fidelidade estrutural V0.3

A Folha 1 deixa de mostrar uma única fileira de blocos genéricos. A nova composição reproduz, por meio de elementos SVG próprios, as relações espaciais do exemplo fornecido:

- Rede de entrada STFC no topo, com **até quatro gateways** dispostos horizontalmente.
- **Switch 00 e Switch 01** empilhados, com portas visíveis e conexões até os gateways.
- Servidores físicos representados em linhas de appliances, junto a uma indicação de virtualização (Folha 2).
- Terminais de operação, supervisão e telefonia ligados ao **barramento LAN azul**.
- Recursos de gravação, armazenamento e Neo Interact quando selecionados.
- **Dois sites remotos lado a lado**, cada um com gateway, switch, roteador, UPS e LAN.
- Roteador de borda, WEB e legendas para diferenciar conexões físicas, de rede e STFC.
- Campos de entrada para nome do site principal, nomes das duas unidades remotas e quantidade de gateways.

Os símbolos são recriações originais, **não cópias das ilustrações específicas de fabricante**. Nenhum quantitativo de canais, VLAN ou equipamento específico é presumido como dado contratado. A distribuição dos aparelhos permanece demonstrativa e somente a composição da Folha 1 foi reprojetada nesta etapa.

A Folha 1 ainda é gerada pelo questionário, não por movimentos feitos no editor livre. A unificação do modelo de engenharia editável continua no roadmap.
