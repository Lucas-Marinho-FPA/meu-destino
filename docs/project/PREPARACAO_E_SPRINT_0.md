> **Documento histórico com revisão (v0.2, 08/11/2026).** O texto original de 06/11/2026 (v0.1) está preservado sem alterações a partir da seção "Meu Destino — Etapa de Preparação e Plano da Sprint 0". Várias decisões pendentes daqui já foram respondidas (ver `docs/decisions/DECISIONS.md`). A revisão logo abaixo diz o que foi feito, o que foi comprovado e o que segue para a Sprint 1.

# Revisão de 08/11/2026 — situação da Sprint 0

## R1. O que foi investigado
- Análise documental do PRD: consistência (C1–C9), lacunas (L1–L13), requisitos × hipóteses (H1–H8). Feita em 06/11.
- **Prototipação navegável** (frente paralela à Sprint 0): rodadas 1–5 no Canvas, migração para o GitHub e correções da validação manual. Serviu para definir e testar interface e regras de negócio com dados simulados.
- **Não foram executados** os experimentos E0–E8: nenhum projeto Android, APK, captura, OCR, overlay ou teste em aparelho. A revisão de políticas (E8) também não foi feita.

## R2. O que foi comprovado (com evidência)
- As regras de negócio e os fluxos do produto funcionam como especificado **no protótipo web**: 456 verificações unitárias e 59–60 jornadas no navegador (`docs/project/MIGRACAO.md`). Exceção: a falha aberta F-01 (tempo útil > tempo total), vista no Galaxy S25+.
- O protótipo web abre e funciona no navegador do Galaxy S25+ pelo GitHub Pages (validação manual de 08/11).
- **Nada foi comprovado sobre captura, OCR, overlay ou bolinha flutuante.** A interface de captura do protótipo é simulada.

## R3. O que continua sendo hipótese
- **H1–H8, todas:** leitura da tela de oferta do Uber Driver e do 99 Motorista; ausência de bloqueio de captura (FLAG_SECURE); aceitação pelas políticas do Google Play e pelos termos das plataformas; precisão e tempo do OCR; overlay sem bloquear toques; sobrevivência em segundo plano; identificação da plataforma; geocodificação dos endereços.
- Também continua como hipótese o parágrafo "[HIPÓTESE]" da §4.2 (regras de Acessibilidade, MediaProjection no Android 14+, overlays no Android 12+). Nada disso foi verificado em fonte oficial nesta fase.

## R4. O que depende de teste no aparelho (Galaxy S25+)
- **E0:** build e instalação do APK de prova.
- **E1:** captura por MediaProjection, quadro legível × preto, consentimento a cada sessão.
- **E2:** leitura passiva por Accessibility, avaliando técnica e política separadamente.
- **E3:** captura **acionada pelo motorista**. É o caminho da bolinha flutuante, que agora faz parte da definição do MVP (D-30).
- **E4:** OCR local sobre capturas reais.
- **E5:** bolinha flutuante e overlay sobre os apps de motorista, sem bloquear toques.
- **E6:** ciclo de vida, bateria e memória durante o expediente.
- **E7:** fluxo ponta a ponta.

Dependências: versão do Android do Galaxy S25+ e quais apps são usados (Uber, 99 ou ambos), que respondem o resto da L11; dataset de capturas reais anonimizadas (D2, proposta ≥ 30 por plataforma).

## R5. Riscos que permanecem para a captura
- R1: mudanças de layout das plataformas quebram o OCR.
- R2: captura inviável ou não permitida. Nesse caso o MVP (D-30) fica sem caminho: o plano B precisa ser decidido com o dono do produto, e a entrada manual é a alternativa já prevista na D-06.
- R3: risco à conta do motorista se os termos proibirem ferramentas de terceiros.
- Consentimento de captura a cada sessão pode exigir toques extras por expediente (a confirmar em E1).
- Bloqueio de captura (FLAG_SECURE) resultaria em quadro preto (a confirmar em E1).
- Consumo de bateria e encerramento do processo pelo sistema durante horas de uso (a confirmar em E6).

## R6. O que deve alimentar a Sprint 1
- Experimentos **E0–E8** como frente "prova técnica de captura" da Sprint 1 (D-31). Os critérios de aprovação da §7 continuam válidos como referência. As metas de latência, precisão e bateria seguem como **proposta**, pendente de aprovação.
- **E3 + E5** em prioridade: a bolinha flutuante é o mecanismo do MVP.
- **E8 antes de qualquer uso real contínuo**, com fontes oficiais datadas.
- Protocolo de privacidade: só observar, sem tocar nos controles das plataformas; anonimizar capturas antes de qualquer commit, pois o repositório é **público**.
- Código de prova isolado do app (ex.: `spikes/`), para não contaminar a arquitetura da Sprint 1.
- Decisões ainda abertas que afetam a Sprint 1: L11 (completar), L13 (distribuição), P-16 (captura automática sem toque).

---

# Meu Destino — Etapa de Preparação e Plano da Sprint 0

**Versão:** 0.1 (proposta, aguardando aprovação)
**Data:** 06/11/2026
**Base:** MEU_DESTINO_DOCUMENTO_MESTRE_v1.0.md e ROADMAP_E_SPRINTS_v1.0.md
**Status:** Nenhuma alteração de repositório foi feita. Nenhum código foi escrito.

Legenda usada neste documento:
- **[FATO]** — consta no PRD/Roadmap ou foi verificado.
- **[HIPÓTESE]** — conhecimento técnico prévio ainda não comprovado neste projeto; precisa de evidência na Sprint 0.
- **[PROPOSTA]** — sugestão minha que depende da sua aprovação.
- **[DECISÃO PENDENTE]** — precisa de resposta sua antes do desenvolvimento.

---

## 0. Estado real do ambiente

- **[FATO]** Não existe repositório do projeto no ambiente de trabalho (o diretório atual não é um repositório git; nenhum arquivo do Meu Destino existe).
- **[FATO]** Não há projeto Android, código, protótipos, ADRs nem backlog criados.
- **[FATO]** Os únicos artefatos são os dois documentos do Context.
- Este ambiente é Linux em nuvem: dá para compilar um projeto Android e rodar testes unitários aqui, mas **não há dispositivo Android físico**. Os experimentos de captura, overlay e alternância de apps exigem execução no seu celular (ver dependência D1).

---

## 1. Análise de consistência do Documento Mestre

O documento é coerente na visão, nos princípios e no escopo. Encontrei os seguintes pontos de atenção — nenhum deles altera decisões, mas vários precisam ser resolvidos antes de sprints específicas.

### 1.1 Inconsistências / tensões internas

| # | Ponto | Onde | Impacto | Sprint afetada |
|---|---|---|---|---|
| C1 | **Offline-first vs. consulta territorial do destino.** O OCR entrega o destino como **texto** (endereço/bairro). Para verificar se ele cai num círculo de zona é preciso **coordenada**, ou seja, geocodificação — que o próprio PRD admite depender de internet. Sem solução, a classificação "Destino não desejado" não funciona offline e pode falhar em tempo real. | §6 A, §6 B, §8 | Alto | 2, 3, 7 |
| C2 | **Quilometragem produtiva depende de saber quais ofertas foram aceitas.** O app não pode aceitar/recusar nem interagir com o app externo, então não sabe automaticamente se a corrida aconteceu. Falta definir como a corrida realizada é registrada. | §6 A, C, F | Alto | 4, 6 |
| C3 | **Categorias de km sem mecanismo de medição.** Reposicionamento e não operacional precisam vir de algum lugar (GPS contínuo? marcação manual?). O PRD proíbe presumir que o resto é reposicionamento, mas não define a fonte. | §6 C | Médio/Alto | 4, 6 |
| C4 | **Classificação da oportunidade sem limiares.** As 5 classes existem, mas não há regra de corte (ex.: R$/km mínimo, R$/h mínimo, o que gera "com atenção"). | §6 A | Médio | 2 |
| C5 | **"Exceções explicitamente configuradas" na sobreposição de zonas** não estão definidas (o que é uma exceção, como se cadastra). | §6 B | Médio | 3 |
| C6 | **Depreciação estimada e provisões** (manutenção, pneus) sem método de cálculo definido. | §6 F | Médio | 6 |
| C7 | **Design System na Sprint 1 vs. protótipos aprovados.** O PRD diz que protótipos são a referência visual, mas o roadmap não tem etapa explícita de prototipação. Sem protótipos aprovados, a Sprint 1 vai inventar componentes. | §5, §9 | Médio | 1 |
| C8 | **Mapas e geocodificação "sujeitos à escolha de provedor".** MapLibre é só a biblioteca; os **tiles** e a **pesquisa de endereço** precisam de um provedor gratuito cujos termos permitam uso em app. Ainda não escolhido. | §8 | Médio | 3 |
| C9 | **Card flutuante + "nenhuma interferência nos controles"**: o overlay precisa não bloquear toques no app externo. Isso tem implicações técnicas concretas no Android (ver Sprint 0, E5). | §4, §6 A | Alto | 0, 7 |

### 1.2 Pontos coerentes e bem definidos
- Fórmulas de km total, R$/km, R$/h, consumo e custo por km.
- Regra de tanque cheio para consumo real.
- Separação oferta × recebido × despesa efetiva × custo estimado; proibição de dupla contagem; não chamar de lucro.
- Prioridade de sobreposição de zonas e uso de círculos.
- Fora de escopo claro.

---

## 2. Decisões de produto já fechadas

1. Plataforma inicial **Android**, app **nativo** (Kotlin, Jetpack Compose, MVVM + Clean Architecture modular).
2. **Offline-first**, processamento local, **sem servidor próprio obrigatório** no MVP.
3. **Nenhum aceite/recusa automático** e nenhuma interação com controles de apps externos.
4. Persistência local: Room/SQLite + DataStore.
5. OCR **on-device** (ML Kit) e câmera via CameraX.
6. Overlay via WindowManager.
7. Navegação em 3 áreas: Operação, Território, Financeiro.
8. Identidade visual escura com os 7 tokens de cor definidos.
9. Fórmulas de km total, R$/km, R$/h, consumo (entre tanques cheios), custo combustível/km, receita por km e resultado operacional estimado.
10. 5 classificações de oportunidade (nomes fixos).
11. Zonas: 4 tipos, círculos com raio, prioridade vermelha > amarela > verde > neutra, avaliação separada de origem e destino.
12. 4 categorias de quilometragem e conciliação obrigatória com hodômetro.
13. Categorias e estados de manutenção; alertas por km e tempo na abertura do expediente; estimativas de data identificadas como estimativas.
14. Descarte de imagens temporárias por padrão.
15. Veículo único no MVP.
16. Lista fechada de itens fora do escopo.
17. Captura automática é **requisito de produto condicionado** à validação técnica e de políticas (não é decisão técnica fechada).
18. Integrações por **adaptadores por plataforma** normalizando para um modelo comum de oferta.
19. Ordem de sprints 0 a 8 e regra de que nenhuma sprint começa sem autorização.

---

## 3. Lacunas técnicas a resolver antes do desenvolvimento

| ID | Lacuna | Resolver até | Como resolver |
|---|---|---|---|
| L1 | Mecanismo de captura de ofertas permitido e funcional | Fim da Sprint 0 | Experimentos E1–E3 + revisão de políticas E8 |
| L2 | Qualidade do OCR em telas de oferta (Uber/99) | Fim da Sprint 0 | Experimento E4 |
| L3 | Overlay visível sem bloquear o app externo | Fim da Sprint 0 | Experimento E5 |
| L4 | Estabilidade em segundo plano (Doze, OEM killers, bateria) | Fim da Sprint 0 | Experimento E6 |
| L5 | Destino em texto → coordenada, offline (C1) | Antes da Sprint 2 (decisão) / Sprint 3 (implementação) | **[DECISÃO PENDENTE]** — ver §9 |
| L6 | Registro de corrida realizada (C2) | Antes da Sprint 4 | **[DECISÃO PENDENTE]** — ver §9 |
| L7 | Fonte das categorias de km (C3) | Antes da Sprint 4 | **[DECISÃO PENDENTE]** — ver §9 |
| L8 | Limiares de classificação (C4) | Antes da Sprint 2 | **[DECISÃO PENDENTE]** |
| L9 | Provedor gratuito de tiles e geocodificação (C8) | Antes da Sprint 3 | Análise de termos de uso + ADR |
| L10 | Métodos de depreciação e provisão (C6) | Antes da Sprint 6 | **[DECISÃO PENDENTE]** |
| L11 | Aparelho-alvo e versão mínima do Android (minSdk) | Antes da Sprint 0 | **[DECISÃO PENDENTE]** — informar modelo e versão do seu celular |
| L12 | Exceções de sobreposição de zonas (C5) | Antes da Sprint 3 | **[DECISÃO PENDENTE]** |
| L13 | Distribuição: APK direto (sideload) vs. Google Play no MVP. Muda o peso das políticas da Play Store. | Fim da Sprint 0 | **[DECISÃO PENDENTE]**, informada pelo relatório E8 |

---

## 4. Requisitos obrigatórios × hipóteses não comprovadas

### 4.1 Requisitos obrigatórios (não dependem de prova externa)
- Instalar, iniciar e persistir configurações.
- Cálculos e classificação com entrada **manual** de dados da oferta (o motor de decisão funciona independentemente da captura).
- Cadastro e consulta de zonas por coordenada.
- Hodômetro por foto **ou** manual; expediente; validação de coerência.
- Abastecimentos, ciclos e consumo.
- Manutenções, ciclos e alertas por km/tempo.
- Receitas, despesas, custos estimados sem duplicidade.
- Conciliação de quilometragem e resumos diário/mensal.
- Privacidade, permissões transparentes, offline nas funções essenciais.
- Não automatizar aceite/recusa; não interferir em apps externos.
- APK, testes de regressão e documentação.

### 4.2 Hipóteses não comprovadas
| ID | Hipótese | Risco se falsa |
|---|---|---|
| H1 | É tecnicamente possível obter o conteúdo da tela de oferta do Uber Driver e do 99 Motorista (por captura de tela ou árvore de acessibilidade). | Captura automática inviável; fluxo vira manual/semiautomático |
| H2 | Esses apps **não** bloqueiam captura (ex.: FLAG_SECURE, que gera quadros pretos). | Igual a H1 |
| H3 | O mecanismo de captura é aceitável pelas políticas do Google Play e pelos termos de uso das plataformas. | Risco de conta do motorista e/ou rejeição na loja |
| H4 | O OCR local extrai valor, distância, tempo, origem e destino com precisão útil e em tempo hábil (a oferta fica visível por poucos segundos). | Card chega tarde ou com dados errados |
| H5 | Um overlay pode ser exibido sobre esses apps sem bloquear toques e sem ser ocultado por eles. | Card inutilizável ou interferência proibida |
| H6 | O serviço em segundo plano sobrevive horas de expediente sem ser morto pelo sistema/fabricante e com consumo de bateria aceitável. | Captura intermitente |
| H7 | É possível identificar a plataforma (Uber × 99) pela tela capturada. | Adaptador errado |
| H8 | Endereços do OCR podem ser convertidos em coordenadas com qualidade suficiente para checar zonas. | "Destino não desejado" impreciso |

**[HIPÓTESE]** Do meu conhecimento prévio (a confirmar em E8 com fontes oficiais atuais): o Google Play restringe fortemente o uso de Accessibility Service para fins que não sejam de acessibilidade; o Android 14+ exige consentimento do usuário a cada sessão de captura de tela (MediaProjection) e serviço em primeiro plano com tipo declarado; o Android 12+ bloqueia toques que atravessam overlays de outro app em certas condições; e apps podem pedir ao sistema que oculte overlays de terceiros sobre suas janelas. Nada disso será tratado como fato até ser documentado.

---

## 5. Estrutura documental proposta para o repositório

Mantém exatamente a estrutura do §12 do PRD. Acrescentei apenas pastas de evidência da Sprint 0 e um arquivo de decisões pendentes, que são documentação, não funcionalidade. **[PROPOSTA]**

```text
meu-destino/
├── CLAUDE.md                          # regras permanentes para o agente (escopo, disciplina, comandos)
├── README.md                          # como compilar/instalar
├── docs/
│   ├── product/PRD.md                 # cópia versionada do Documento Mestre v1.0
│   ├── product/PRODUCT_VISION.md
│   ├── product/MVP_SCOPE.md           # escopo congelado + fora de escopo
│   ├── product/OPEN_DECISIONS.md      # [proposta] decisões pendentes (seção 9 deste doc)
│   ├── architecture/ARCHITECTURE.md
│   ├── architecture/DATABASE_SCHEMA.md
│   ├── architecture/INTEGRATIONS.md
│   ├── architecture/ADR/
│   │   └── ADR-000-template.md
│   ├── ux/DESIGN_SYSTEM.md
│   ├── ux/SCREEN_FLOWS.md
│   ├── ux/PROTOTYPES.md
│   ├── project/ROADMAP.md
│   ├── project/SPRINTS.md             # uma seção por sprint, no modelo obrigatório
│   ├── project/ACCEPTANCE_CRITERIA.md
│   ├── project/CHANGE_CONTROL.md
│   ├── backlog/IDEAS_BACKLOG.md
│   ├── qa/TEST_PLAN.md
│   └── spikes/sprint-0/               # [proposta] evidências da Sprint 0
│       ├── SPRINT_0_REPORT.md
│       ├── POLICY_REVIEW.md
│       ├── E1..E7-*.md                # um relatório por experimento
│       └── evidence/                  # métricas, logs; imagens só anonimizadas
├── spikes/sprint0-poc/                # [proposta] app descartável de prova; não é o app final
└── app/                               # app real, criado somente na Sprint 1
```

Observação: o código da Sprint 0 fica **isolado** em `spikes/` para não contaminar a arquitetura da Sprint 1.

---

## 6. Sprint 0 — Prova de viabilidade

**Status:** Não iniciada (aguardando autorização)

**Objetivo:** Produzir decisão técnica fundamentada sobre captura, OCR e overlay antes de comprometer o produto com captura automática.

**Escopo autorizado (proposto):**
- App Android mínimo de prova (`spikes/sprint0-poc`).
- Experimentos E0–E8 abaixo.
- Relatório técnico com evidências, decisão e alternativas.

**Fora do escopo:**
- Design System, telas finais, banco de dados do produto, motor de decisão, zonas, financeiro.
- Qualquer interação com botões do Uber/99 (nenhum clique, gesto ou automação).
- Engenharia reversa, leitura de memória, interceptação de rede ou APIs privadas das plataformas.
- Publicação na Play Store.

### Experimentos

| ID | Experimento | O que medir | Saída |
|---|---|---|---|
| **E0** | Setup: projeto mínimo, build de APK, instalação no seu aparelho; definição de minSdk/targetSdk | Build reproduzível; APK instala | Ambiente pronto |
| **E1** | **Captura por MediaProjection** (captura de tela autorizada pelo usuário) com o Uber Driver e o 99 Motorista em primeiro plano | Quadro capturado é legível ou preto (FLAG_SECURE)? Frequência de consentimento exigida pelo sistema; indicador visível ao usuário; latência por quadro; CPU/bateria | Viável / Inviável por plataforma |
| **E2** | **Leitura via Accessibility Service** — apenas leitura passiva do texto exposto, sem nenhuma ação | O texto da oferta aparece na árvore de acessibilidade? Latência do evento; risco de política | Viável técnica × viável de política (avaliado separadamente) |
| **E3** | **Alternativa semiautomática**: o motorista dispara a análise (ex.: compartilhar captura de tela para o app, ou botão/atalho que faz uma única captura) | Toques necessários; tempo total até o resultado | Plano B documentado |
| **E4** | **OCR local (ML Kit, modelo embutido, offline)** sobre um conjunto de capturas reais de ofertas | Precisão por campo (valor, km até passageiro, km da viagem, tempos, origem, destino); latência; tamanho do APK; identificação da plataforma (H7) | Taxa de acerto e regras de extração |
| **E5** | **Overlay** (janela sobreposta) sobre os apps externos | Aparece? É ocultado pelo app externo? Toques no app externo continuam funcionando com o card visível? Card não focável/não tocável vs. tocável | Configuração segura do card |
| **E6** | **Alternância de apps e ciclo de vida**: serviço em primeiro plano durante 2–4 h, troca de apps, tela desligada, modo economia | Sobrevivência do processo; consumo de bateria/h; memória | Limites conhecidos por fabricante |
| **E7** | **Fluxo ponta a ponta** (melhor mecanismo viável): oferta na tela → captura → OCR → card | Latência total; taxa de "dados insuficientes" | Demonstração gravada |
| **E8** | **Revisão de políticas e termos**: políticas atuais do Google Play (Acessibilidade, permissões de captura, overlay, serviço em primeiro plano, divulgação proeminente) e termos de uso de motoristas Uber e 99 | Citações e links das fontes oficiais, com data de consulta | POLICY_REVIEW.md com risco por mecanismo |

### Protocolo de teste com apps reais (segurança e privacidade)
- Testes com ofertas reais só ocorrem com você operando normalmente; o app de prova **apenas observa**.
- Dataset de OCR: capturas feitas por você, com dados pessoais de passageiros anonimizados antes de entrarem no repositório.
- Se E8 indicar que algum mecanismo viola termos/políticas, o experimento correspondente é suspenso e o fato é registrado — sem contorno.

### Dependências e riscos
- **D1 — Aparelho físico:** você precisa instalar o APK e executar os testes no seu Android, com os apps de motorista instalados. Eu forneço APK, roteiro passo a passo e formulário de coleta de resultados.
- **D2 — Dataset:** mínimo de **30 capturas** de ofertas por plataforma (variando valor, distância e layout). **[PROPOSTA]**
- **D3 — Decisão L11** (modelo e versão do Android).
- **R1:** plataformas podem mudar layout a qualquer atualização → OCR frágil (mitigação: adaptadores e limiar de confiança).
- **R2:** captura automática pode ser inviável ou não permitida → produto segue com plano B (E3) ou entrada manual; o restante do MVP não depende disso.
- **R3:** risco à conta do motorista se os termos proibirem ferramentas de terceiros — tratado em E8 antes de uso real contínuo.

### Plano de implementação
1. E0 e E8 em paralelo (E8 não depende de código).
2. Coleta do dataset (D2) e E4 com imagens estáticas — dá para avançar mesmo antes dos testes ao vivo.
3. E1, E2, E5 no aparelho.
4. E6 em um expediente real.
5. E3 e E7 com o melhor mecanismo encontrado.
6. Relatório final + ADR-001 (mecanismo de captura) + ADR-002 (OCR).

---

## 7. Critérios objetivos de aprovação da Sprint 0

A Sprint 0 é **aprovada** quando todos os itens abaixo estiverem presentes — independentemente de a captura automática ser viável. Ela avalia a qualidade da decisão, não o sucesso da captura.

1. APK de prova compila de forma reproduzível e instala no aparelho-alvo (evidência: log de build + confirmação sua).
2. Cada experimento E1–E7 tem relatório com resultado **Viável / Viável com restrições / Inviável / Não testado (motivo)**, por plataforma (Uber, 99).
3. E8 entregue com fontes oficiais citadas e datadas para cada mecanismo testado.
4. E4 reporta precisão **por campo** sobre o dataset completo, com a lista de erros.
5. E5 demonstra (vídeo ou relato verificável) que, com o card visível, os toques no app externo funcionam normalmente — ou documenta que isso não é possível.
6. E6 reporta consumo de bateria/h e sobrevivência em sessão de ≥2 h.
7. Relatório final com: mecanismo recomendado, plano B, riscos remanescentes e impacto em Sprints 2, 3 e 7.
8. ADR-001 e ADR-002 aprovados por você.
9. Nenhum código interage com controles de apps externos (verificável por revisão do código-fonte).

**Metas de referência para a viabilidade do fluxo automático [PROPOSTA — aprovar ou ajustar]:**
- Latência oferta → card ≤ **2 s** no percentil 90.
- Precisão de OCR ≥ **95%** em valor e distâncias; ≥ **85%** em origem/destino.
- Consumo adicional de bateria ≤ **5% por hora** de expediente.
- Se essas metas não forem atingidas, o fluxo automático é classificado como "viável com restrições" ou "inviável", e o relatório recomenda o plano B.

---

## 8. Protótipos UX/UI necessários antes das telas

Proposta: uma fase de prototipação **antes da Sprint 1**, em paralelo com a Sprint 0 (não depende do resultado técnico, exceto o card flutuante e as telas de permissão de captura).

| # | Protótipo | Módulo | Necessário antes da Sprint |
|---|---|---|---|
| P0 | **Design System**: tokens de cor, tipografia, espaçamento, raios, componentes base (botão, campo, cartão, chip de status, alerta, gráfico simples) | — | 1 |
| P1 | Estrutura de navegação (Operação / Território / Financeiro) e mapa de telas | — | 1 |
| P2 | Primeiro uso: cadastro do veículo, parâmetros de cálculo, explicação de permissões | Config | 1 |
| P3 | Configurações (parâmetros de classificação, privacidade, guardar comprovantes) | Config | 1/2 |
| P4 | Início do expediente com alertas de manutenção | C / E | 4 |
| P5 | Foto do hodômetro → leitura OCR → confirmação/correção manual | C | 4 |
| P6 | Encerramento do expediente e conciliação de km | C | 4 |
| P7 | **Card flutuante** nos 5 estados de classificação + "dados insuficientes" | A | 2 (visual) / 7 (integrado) |
| P8 | Análise manual de oferta e histórico de ofertas | A | 2 |
| P9 | Mapa de zonas, criar/editar zona (endereço ou ponto, raio, tipo), lista de zonas | B | 3 |
| P10 | Registro e histórico de abastecimentos; consumo | D | 5 |
| P11 | Manutenções: lista com estados, registro, programação | E | 5 |
| P12 | Receitas e despesas | F | 6 |
| P13 | Resumo diário e mensal com gráficos | G | 6 |
| P14 | Telas de permissão de captura/overlay (divulgação proeminente) | A | 7 — conteúdo depende do resultado da Sprint 0 |

---

## 9. Decisões pendentes (preciso de resposta)

1. **L11 — Aparelho:** modelo e versão do Android do seu celular; você usa Uber, 99 ou ambos?
2. **L13 — Distribuição do MVP:** APK direto para uso próprio, ou já mirar Google Play? (Afeta quão restritivas são as políticas na prática.)
3. **L5 — Destino em texto → coordenada:** opções para avaliar (decidir antes da Sprint 2):
   a. Geocodificação online quando houver rede; offline cai em "Dados insuficientes" para o destino.
   b. Cache local de endereços/bairros já geocodificados + correspondência por nome de bairro.
   c. Zonas também cadastradas por **nome de bairro**, além do círculo — **isso é mudança de escopo**, por isso está registrada como ideia (IDEA-003), não como decisão.
4. **L6 — Corrida realizada:** como registrar que uma oferta virou corrida? (ex.: marcar no histórico com um toque; ou lançamento do valor recebido no fim do dia.)
5. **L7 — Categorias de km:** a fonte será marcação manual, GPS do app durante o expediente, ou combinação? (GPS contínuo impacta bateria e privacidade.)
6. **L8 — Limiares:** valores de R$/km e R$/h mínimos (configuráveis por você?) e o que caracteriza "com atenção".
7. **Metas da Sprint 0** (§7): aprovar ou ajustar.
8. **Fase de prototipação** antes da Sprint 1: aprovar.

---

## 10. Ideias identificadas (para o backlog — NÃO incorporadas)

| ID | Descrição | Problema | Benefício | Complexidade | Dependências | Impacto no MVP | Versão sugerida |
|---|---|---|---|---|---|---|---|
| IDEA-001 | Exportar/importar backup local (arquivo) | Sem sincronização, perda do celular = perda dos dados | Proteção dos registros | Baixa/Média | Sprint 1 (banco) | Nenhum se adiado; risco de perda de dados | Avaliar para pós-MVP ou como item de estabilidade na Sprint 8 |
| IDEA-002 | Cache local de geocodificação | Destino em texto exige rede | Mais funcionamento offline | Média | L5, L9 | Pode ser necessário para C1 | Decidir na resolução de L5 |
| IDEA-003 | Zonas por nome de bairro | OCR fornece texto, não coordenada | Consulta territorial sem geocodificar | Média | Sprint 3 | **Altera escopo** (MVP prevê só círculos) | Requer aprovação explícita |
| IDEA-004 | Rastreamento GPS do expediente para categorizar km | Categorias de km sem fonte | Conciliação mais automática | Alta | L7 | Bateria/privacidade | Depende de L7 |

---

## 11. Plano de execução

| Etapa | Entregáveis | Depende de | Critério de aceite |
|---|---|---|---|
| **Prep-1** — Aprovação desta preparação | Este documento aprovado; respostas às decisões 1, 2, 7 e 8 | Você | Decisões registradas em OPEN_DECISIONS.md |
| **Prep-2** — Criação do repositório (só documentação) | Estrutura do §5, CLAUDE.md, PRD versionado, templates de sprint/ADR, IDEAS_BACKLOG com IDEA-001..004 | Prep-1 + autorização | Estrutura criada; nenhum código de app; commit inicial |
| **Sprint 0** — Viabilidade | APK de prova, relatórios E0–E8, ADR-001/002, relatório final | Prep-2, D1, D2, L11 | Critérios do §7 |
| **Prototipação** (em paralelo à Sprint 0) | P0–P13 (P14 após Sprint 0) | Prep-1 | Protótipos aprovados por você e registrados em PROTOTYPES.md |
| **Gate antes da Sprint 1** | Decisões L5, L6, L8 respondidas; protótipos P0–P3 aprovados | Sprint 0 + Prototipação | Autorização explícita da Sprint 1 |
| Sprints 1–8 | Conforme ROADMAP | Gates acima | Conforme ROADMAP e PRD §11 |

**Próximo passo:** aguardo sua aprovação deste documento e as respostas da seção 9. Nenhuma alteração de repositório será feita antes disso.
