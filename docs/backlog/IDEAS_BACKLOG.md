# Meu Destino — Backlog

**Atualizado em:** 08/11/2026 (consolidação da sessão).

Duas partes:
1. **Problemas e necessidades em aberto:** o que precisa de diagnóstico, correção ou decisão. Os IDs são os mesmos do HANDOFF §7 (F-xx, P-xx, T-xx), para não haver duplicidade.
2. **Ideias:** propostas **não autorizadas**. Nenhuma está implementada. Mudanças só com aprovação explícita (PRD §10). Nada daqui entra automaticamente no escopo da Sprint 1.

## 1. Problemas e necessidades em aberto

| ID | Tema | Tipo | Situação | Onde deve ser tratado |
|---|---|---|---|---|
| **F-01** | **Tempo útil maior que o tempo total** (Galaxy S25+, 08/11: total 1h16, útil 2h36) | Falha | **PENDENTE** — diagnóstico e correção na evolução do aplicativo; regra D-32 ainda não atendida | Sprint 3 (D-31); proposta de correção: P-18 / PT-01..03 |
| P-13 | Tempo perdido com cancelamentos (canceladas não têm duração registrada) | Necessidade | Aguarda decisão | Sprint 3 |
| P-14 | Registro de corridas que não forem capturadas (falha de captura no app real); hoje não há registro manual na Operação (D-27) | Necessidade | Aguarda decisão | Sprint 2/3 |
| P-15 | Custos fixos de exemplo (R$ 1.580/mês) carregados por padrão e dominando o resultado diário | Necessidade | Aguarda decisão. Pelo MVP (D-30), o app real não deve depender de exemplos | Sprint 1 (dados iniciais) / 6 |
| P-11 | Funcionamento offline depois de recarregar (sem Service Worker no protótipo) | Necessidade | Aguarda decisão (ver IDEA-009). No Android, o offline vem da arquitetura nativa | Protótipo / Sprint 1 |
| P-00 | Fotografia real do veículo e estratégia de armazenamento | Necessidade | Aguarda decisão (IDEA-005, IDEA-006) | Sprint 4 |
| P-01 | DRE: provisões e depreciação | Pendência de produto | Aguarda decisão | Sprint 6 |
| P-02 / P-03 / P-06 | Metodologia definitiva de custos: fixos além do rateio, combustível (incl. estimativa durante o expediente), ganho por km de corrida × resultado por km total | Pendência de produto | Aguarda decisão | Sprints 5–6 |
| P-04 | Pausas e intervalos dentro do expediente | Pendência de produto | Aguarda decisão | Sprint 3 |
| P-16 | Captura automática sem toque: continua como requisito futuro (D-06) ou o MVP com bolinha flutuante basta? | Pendência de produto | Aguarda decisão | Sprint 1 (resultado da investigação) |
| P-17 | Gestão territorial (zonas) e motor de classificação de ofertas na nova sequência e no MVP | Pendência de planejamento | Aguarda decisão | Antes da Sprint 2 |
| P-07, P-08, P-09, P-10, P-12, P-18 | Regra dos 50%; decisões I-03..I-06; lacunas L5–L13; tokens de cor; licença; forma de corrigir a F-01 | Pendências | Aguardam decisão | Ver HANDOFF §7 |

## 2. Ideias (não autorizadas)

| ID | Descrição | Problema | Benefício | Complexidade | Dependências | Impacto no MVP | Versão sugerida |
|---|---|---|---|---|---|---|---|
| IDEA-001 | Exportar/importar backup local (arquivo) | Sem sincronização, perder o celular significa perder os dados | Protege os registros | Baixa/Média | Sprint 1 (banco) | Nenhum se adiado; risco de perda de dados | Sprint 8 ou pós-MVP |
| IDEA-002 | Cache local de geocodificação | Destino em texto exige rede | Mais funcionamento offline | Média | L5, L9 | Pode ajudar o D-01 sem rede | Ao resolver L9 |
| IDEA-003 | Zonas por nome de bairro | OCR fornece texto, não coordenada | Consulta territorial sem geocodificar | Média | Sprint 3 | **Altera escopo** (MVP prevê só círculos) | Requer aprovação |
| IDEA-004 | Rastreamento GPS do expediente para categorizar km | Categorias de km sem fonte automática | Conciliação mais automática | Alta | L7 | Bateria e privacidade | Depende de L7 |
| IDEA-005 | Foto do próprio veículo pelo motorista (câmera) como alternativa à imagem de catálogo | Imagem licenciada de cada modelo/geração/cor é difícil de garantir offline | Identificação visual fiel, sem licenciamento | Baixa | CameraX (Sprint 1/4) | Pequeno; muda o D-25 se adotado | Avaliar antes da Sprint 1 |
| IDEA-006 | Pacote de imagens de catálogo por modelo, baixado uma vez na instalação/atualização | Embutir muitas imagens aumenta o APK | APK menor mantendo o offline no uso | Média | Licenciamento; política de rede | Exige download inicial (avaliar com o offline-first) | Pós-MVP |
| IDEA-007 | *(Contexto desatualizado: "Registrar corrida" saiu na D-27; reavaliar junto com P-14)* Atalho de registro rápido (notificação persistente ou botão do card) para "Registrar corrida" | Reduzir toques durante o expediente | Menos interação | Média | Sprint 7 (overlay); políticas do Android | Nenhum até a Sprint 7 | Sprint 7+ |
| IDEA-008 | *(Contexto desatualizado: substituída na prática pela D-27, em que a realizada usa os dados da oferta; manter só como histórico)* Sugerir automaticamente a última oferta analisada ao abrir "Registrar corrida" | Digitação durante o expediente | Menos campos | Baixa | — | Risco de registrar oferta não realizada sem conferência | Avaliar com o dono do produto |
| IDEA-009 | PWA com Service Worker (cache dos arquivos do app e instalação na tela inicial) | Sem Service Worker, recarregar a página sem conexão depende do cache do navegador | Reabertura offline garantida e instalação | Média | Política de atualização de versão e de cache | Nenhum até a decisão; é a forma web de cumprir o offline-first | Decidir (P-11) |
| IDEA-010 | Validação de sobreposição de corridas na conferência (horário da oferta + duração não pode cruzar outra realizada nem o STOP) | Dados de tempo impossíveis (F-01) | Tempo útil sempre ≤ total; protege contra durações erradas | Média | P-18 | Corrige a F-01 se aprovada (= PT-01) | Sprint 3 |
| IDEA-011 | "Registrar corrida esquecida" na conferência, para corridas que a captura não pegou | Captura pode falhar no uso real | Receita completa sem voltar ao registro manual durante a operação | Baixa | P-14 | Pequeno | Sprint 3 |
| IDEA-012 | Começar sem dados de exemplo no app real, com o exemplo opcional só para demonstração | Fixos de exemplo distorcem o resultado | Resultado real desde o primeiro uso | Baixa | P-15 | Alinhado à D-30 | Sprint 1 |
| IDEA-013 | Medir o tempo perdido em cancelamentos (hora do cancelamento informada na conferência) | Tempo não útil sem detalhamento | Análise de cancelamentos | Média | P-13 | Nenhum até a decisão | Sprint 3+ |
