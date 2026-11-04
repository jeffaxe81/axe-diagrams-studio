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
