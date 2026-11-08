# MEU DESTINO

## Documento Mestre de Produto e Handoff Técnico

**Versão:** 1.2 (validação manual, 08/11/2026; antes: 1.1 das rodadas 1–5)\
**Arquivo:** cópia oficial no repositório (`docs/product/PRD.md`). Origem: `MEU_DESTINO_DOCUMENTO_MESTRE_v1.0.md` do Projeto, conteúdo v1.1.\
**Status:** Base de referência para aprovação e prototipação\
**Plataforma inicial:** Android\
**Estratégia:** MVP-first, offline-first, arquitetura modular e
extensível

> **O que mudou na v1.1:** apenas decisões aprovadas pelo dono do produto nas rodadas 1–5. Cada mudança está marcada com **[v1.1]** e listada no §14. Itens ainda sem decisão estão no §15 e **não** fazem parte do escopo aprovado.

------------------------------------------------------------------------

## 1. Visão executiva

Meu Destino é um copiloto inteligente de operação e gestão financeira
para motoristas de aplicativos de transporte. Ajuda o motorista a
avaliar corridas, administrar preferências territoriais, controlar a
quilometragem real, acompanhar abastecimentos e manutenções e
compreender o resultado financeiro da operação.

**Posicionamento:** "Sua rota. Sua rentabilidade. Suas decisões."

O produto será inicialmente utilizado pelo próprio idealizador, mas
deverá nascer com arquitetura preparada para futura comercialização e
expansão para diferentes plataformas de transporte.

## 2. Problemas que resolve

1.  Dificuldade de avaliar rapidamente a rentabilidade real de uma
    oferta.
2.  Falta de consideração do deslocamento até o passageiro e do tempo
    total.
3.  Dificuldade de evitar regiões indesejadas ou com condições
    inadequadas.
4.  Falta de conciliação entre quilômetros das corridas e hodômetro
    real.
5.  Desconhecimento dos custos de combustível, manutenção e operação.
6.  Histórico de manutenção e abastecimento disperso.
7.  Ausência de visão consolidada diária e mensal da atividade.

## 3. Pilares do produto

-   **Decisão inteligente:** análise de valor, distância, tempo e
    destino.
-   **Gestão territorial:** zonas preferenciais, condicionais, proibidas
    e neutras.
-   **Gestão do veículo:** hodômetro, abastecimento, manutenção e
    despesas.
-   **Inteligência financeira:** receitas, custos, despesas e resultados
    diários/mensais.

## 4. Princípios inegociáveis

-   Facilidade de uso e baixa digitação.
-   Preferência por fotografia, OCR e captura automática quando
    tecnicamente viáveis.
-   Interface limpa, moderna, legível e adequada a celulares.
-   Funcionamento offline para funções essenciais.
-   Processamento local sempre que possível.
-   Nenhum aceite ou recusa automática de corridas.
-   Nenhuma interferência nos controles do aplicativo de transporte.
-   Separação entre receita ofertada, receita recebida, despesa efetiva
    e custo estimado.
-   Privacidade desde a concepção.
-   Arquitetura modular e testável.
-   Entregar primeiro um MVP utilizável; ideias novas não ampliam
    automaticamente o escopo.
-   **[v1.1]** O motorista não precisa classificar ofertas (aceitei/recusei/terminei) para que os indicadores funcionem. Os indicadores usam apenas as corridas efetivamente registradas.
-   **[v1.1]** Uma única camada de cálculo alimenta todas as telas; nenhuma tela calcula seus próprios números.

## 5. Identidade visual e UX

Direção aprovada: visual escuro, moderno, minimalista e tecnológico, com
azul-marinho arroxeado, lilás, violeta e verde menta.

  Token      Cor         Uso
  ---------- ----------- -----------------------
  Midnight   `#19182F`   Fundo principal
  Indigo     `#292648`   Superfícies e cartões
  Lavender   `#B58AF5`   Identidade e ações
  Violet     `#8D79D9`   Elementos secundários
  Mint       `#69D6AE`   Indicadores positivos
  Amber      `#F0C66F`   Atenção
  Coral      `#FF7787`   Restrições e alertas

Princípios: cantos arredondados, tipografia clara, hierarquia evidente,
gráficos simples, poucos elementos simultâneos e sem cartões
excessivamente quadrados ou bordas pesadas.

**[v1.1] Referência visual:** os mockups aprovados (rodada 3) e o protótipo navegável publicado (canvas "Meu Destino — Protótipo navegável da jornada") são a referência visual e funcional. Os valores exatos de cor usados no protótipo ainda precisam ser reconciliados com a tabela acima (pendência P-10, §15).

**[v1.1] Navegação principal (substitui a de 3 áreas):** 4 abas — 1. **Operação** (expediente, ofertas, registro de corridas); 2. **Financeiro** (Financeiro do dia, Custos, Resultados, Metas, DRE); 3. **Histórico** (Evolutivos, Ofertas, Expedientes); 4. **Configurações** (Veículo, Combustível, Território, Custos, Manutenção, Metas e limites, Preferências). Território passou a ficar dentro de Configurações. Não há aba "Planejamento".

**[v1.1] Regras de interação aprovadas:**
- Toda tela secundária tem voltar no topo, que retorna à origem e preserva a posição de rolagem.
- Formulário alterado pede confirmação antes de sair.
- Resumos mostram primeiro o essencial; detalhes ficam disponíveis sob demanda ("menos informação, mais significado").
- Regra de cor econômica: aumento de custo = vermelho, redução de custo = verde; para receita e resultado, o inverso.

## 6. Escopo funcional do MVP

### Módulo A --- Operação inteligente

-   Captura autorizada de ofertas, condicionada à prova técnica e às
    políticas aplicáveis.
-   OCR local para valor, distância, tempo, origem e destino.
-   Identificação da plataforma quando possível.
-   Normalização dos dados para um modelo comum.
-   Cálculo de rentabilidade.
-   Consulta territorial.
-   Classificação da oportunidade.
-   Card flutuante compacto.
-   Histórico básico das ofertas analisadas.

Fórmulas:

`Km total = Km até o passageiro + Km da viagem`

`R$/km = Valor da oferta / Km total`

`R$/h = Valor da oferta / (tempo total em minutos / 60)`

Classificações: - Favorável. - Favorável com atenção. - Desfavorável
financeiramente. - Destino não desejado. - Dados insuficientes.

A captura automática é um requisito de produto ainda sujeito a validação
técnica. Não presumir que qualquer mecanismo de captura ou
acessibilidade será permitido. Não automatizar aceite ou recusa.

**[v1.2] Ofertas × corridas realizadas (D-27, 08/11/2026; substitui a regra da rodada 5):**
- O Meu Destino não detecta o aceite. Toda oferta do expediente fica registrada como **a conferir**, e nunca é receita por si só.
- Durante a operação o motorista **não precisa marcar nada**.
- No **STOP (Encerrar)** a conferência lista todas as ofertas do expediente. Para cada uma, o motorista marca:
  - **Realizada:** os valores da oferta valem como recebidos, mas podem ser corrigidos (valor, km, duração);
  - **Cancelada:** taxa de cancelamento opcional.
- Ofertas não marcadas viram **Não aceita** ao confirmar, com trilha.
- **Realizada** entra na receita, na quantidade de corridas, no km produtivo, no tempo útil e nos indicadores.
- **Cancelada** não entra na receita de corridas, nas corridas, no km produtivo nem no tempo útil. Fica registrada para análise; a taxa, se houver, entra uma única vez como receita de taxas.
- A classificação pode ser corrigida a qualquer momento, inclusive depois do fechamento, com trilha e reconsolidação do dia sem duplicar.
- A marcação antecipada (antes do STOP) é opcional (I-05).
- Os indicadores do expediente são referência histórica, não garantia de rentabilidade de uma corrida futura.

**[v1.1] Meta do expediente (rodada 2):** limites configuráveis em R$/km, com os valores aprovados 2,50 / 2,99 / 3,00 (no protótipo: vermelho abaixo de 2,50 e meta 3,00). A média do expediente é ponderada por km produtivo. O valor exigido na próxima corrida é `(meta × (km + d) − receita) / d`, em que d = km médio por corrida.

### Módulo B --- Gestão territorial

-   Pesquisa de endereço.
-   Marcação de ponto no mapa.
-   Raio ajustável.
-   Cadastro, edição e exclusão de zonas.
-   Avaliação separada de origem e destino.
-   Tratamento de sobreposição.

Tipos: - Verde: preferencial. - Amarela: condicional. - Vermelha:
proibida. - Neutra: sem classificação.

Prioridade inicial de sobreposição: vermelha, amarela, verde e neutra,
respeitando exceções explicitamente configuradas. MVP utiliza círculos e
raios, sem polígonos livres.

**[v1.1]** Geocodificação online é o padrão (rodada 2). Sem rede, o destino cai em "dados insuficientes" para a consulta territorial. Não há limite de 3 km no raio (rodada 3).

### Módulo C --- Jornada e hodômetro

-   Foto do hodômetro no início e no fim do expediente.
-   OCR local, leitura apresentada para confirmação.
-   Correção manual como alternativa.
-   Registro de data, hora, valor e expediente.
-   Validação de coerência entre leituras.
-   Descarte das imagens temporárias após processamento, salvo opção
    explícita de guardar comprovante.

Categorias de quilometragem: - Produtiva: deslocamento até passageiro e
trajeto da corrida. - Reposicionamento: deslocamento operacional sem
passageiro. - Não operacional: uso pessoal ou não relacionado à
atividade. - Não conciliada: diferença ainda não explicada.

A soma das categorias deve ser conciliada com o hodômetro real. Não
presumir que todo km restante seja reposicionamento.

**[v1.1] Regras aprovadas (rodadas 2 e 3):**
- O hodômetro inicial é **trava obrigatória** para iniciar o expediente.
- Km do expediente, km produtivos, km não produtivos e km pessoais entre expedientes seguem a regra oficial da rodada 2. Correções retroativas preservam o valor original e o corrigido.
- Data e hora vêm do relógio do aparelho, funcionam offline e registram o fuso. A criação e a alteração ficam registradas, e uma correção de data gera trilha; a data original nunca muda em silêncio.
- Recuperação de expediente: se o app foi fechado sem encerrar, o expediente é retomado ao reabrir.

**[v1.2] Encerramento como conferência (D-27):** o fechamento confere as ofertas do expediente (Realizada / Cancelada / Não aceita) e o hodômetro final consolida o dia no histórico, usando exatamente os registros conferidos, com trilha. Correções feitas após o fechamento reconsolidam o dia sem duplicar valores.

**[v1.2] Tempo de operação (D-29):** tempo total = início → STOP, pelo relógio do aparelho; tempo útil = soma das durações das corridas realizadas; tempo não útil = total − útil. Indicadores: ganho por hora de expediente, ganho por hora útil, % produtivo e % não produtivo. Duração ausente não é estimada: o indicador é marcado como parcial.

### Módulo D --- Abastecimentos

Registro de: - Data e hodômetro. - Combustível. - Litros. - Preço por
litro. - Valor total. - Tanque cheio ou parcial. - Foto do comprovante
opcional e OCR quando viável.

Consumo real deve ser calculado preferencialmente entre abastecimentos
de tanque cheio. Abastecimentos parciais são acumulados no ciclo e não
tratados isoladamente como medição definitiva.

`Consumo (km/L) = distância entre dois tanques cheios / litros consumidos no ciclo`

**[v1.1] Custo de combustível por km (substitui "preço por litro / consumo"; definido pelo dono do produto na rodada 4):**

`Custo de combustível por km = total gasto com combustível no ciclo / km percorridos no ciclo` (ciclo = tanque cheio → tanque cheio)

- Cada km rodado é custeado pelo ciclo em que foi percorrido.
- Km de um ciclo ainda aberto usam o último custo/km medido. Sem nenhum ciclo medido, usam o consumo de referência do veículo, e a interface identifica o valor como estimativa.
- Nunca usar a média simples dos preços de gasolina e etanol.
- Compra (abastecimento), consumo, estoque e custo estimado são conceitos distintos.

**[v1.1] Motorizações (rodada 3; híbrido redefinido na rodada 4):** Gasolina, Etanol, Flex, Diesel, Híbrido convencional e Elétrico.
- **Flex:** o combustível é escolhido em cada abastecimento; não há dois estoques separados.
- **Híbrido convencional:** só abastecimento, consumo em km/L, sem custo elétrico.
- **Elétrico:** recarga com hodômetro, kWh, preço/kWh, total automático e data/hora automáticas; indicadores km/kWh e custo/km. O consumo só é "medido" entre duas cargas até 100%; nos demais casos é "estimado".
- O consumo de referência vale até existir um ciclo medido. A média histórica e o último ciclo são exibidos separadamente.
- PMP (preço médio pago) = Σ valores / Σ litros. O estoque estimado parte da premissa de tanque cheio ao preço do 1º abastecimento, sem lançar despesa fictícia.

### Módulo E --- Manutenção preventiva e histórico

Categorias: motor, óleo e filtros, freios, pneus, suspensão,
ar-condicionado, elétrica, transmissão, revisão geral, reparos
extraordinários, melhorias e acessórios.

Registro: - Serviço e categoria. - Data e quilometragem. - Peças e
materiais. - Mão de obra. - Valor total. - Oficina/fornecedor
opcional. - Observações e comprovante opcional.

Programação: - Próxima quilometragem. - Intervalo em km. - Próxima
data. - Intervalo em meses. - Antecedência personalizada do alerta.

Estados: - Em dia. - Próxima. - Vencida. - Inspeção recomendada.

Na abertura do aplicativo para iniciar o expediente, verificar
manutenções por quilometragem e por tempo. Mostrar avisos objetivos,
como "faltam 500 km para o intervalo configurado". Previsões de data
devem usar a média recente de uso e ser identificadas como estimativas.

Itens de segurança, como freios e pneus, exigem inspeção física;
quilometragem não comprova condição segura. Intervalos devem respeitar
recomendações do fabricante e avaliação profissional. Ao registrar nova
manutenção, encerrar o ciclo anterior e criar novo ciclo, preservando
histórico.

### Módulo F --- Receitas, despesas e custos

Receitas: - Valor da oferta. - Valor confirmado/recebido. - Ajustes
manuais.

Manter oferta e recebimento em campos distintos.

Despesas efetivas: - Combustível. - Manutenção. - Pneus. -
Estacionamento. - Pedágio. - Lavagem. - Reparos. - Despesas
extraordinárias. - Outras despesas operacionais.

Custos estimados: - Combustível estimado quando não houver medição real
suficiente. - Manutenção provisionada. - Pneus provisionados. -
Depreciação estimada.

Evitar dupla contagem: uma manutenção efetivamente paga não pode ser
subtraída novamente como provisão do mesmo evento.

**[v1.1] Custos fixos (rodada 4):** o valor mensal é rateado pelos dias reais do mês (exemplo aprovado: R$ 600 em um mês de 30 dias = R$ 20 por dia). A semana é a soma dos seus dias e o mês usa o valor integral. O rateio respeita a competência, isto é, o mês de início de cada custo. Os métodos de provisão e depreciação seguem pendentes (§15).

**[v1.1] Financeiro em dois momentos (rodada 5):**
- **Durante o expediente:** a tela informa que o expediente está em andamento e que os valores contam só as corridas já marcadas como realizadas, com conferência e fechamento definitivo no STOP. Ela mostra os ganhos registrados, o número de corridas, os km das corridas (o km total vem do hodômetro no fechamento), R$/km, R$/h, R$/corrida, os custos **estimados** (combustível pelo custo/km e fixos rateados), os custos **registrados** (despesas e manutenções lançadas) e o resultado parcial estimado. Nada fica escondido até o encerramento.
- **Após a conferência:** a tela indica "Fechado e conferido", com hora, e os valores ficam consolidados no histórico.
- Durante o expediente, o combustível é estimado sobre os km produtivos das corridas realizadas, porque o km total ainda não existe. Isso está identificado na tela e está pendente de confirmação formal (P-03).
- **[v1.2] Transparência dos custos:** o resumo mostra separadamente combustível (estimado), custos fixos rateados (estimado), despesas e manutenção (registrado) e o resultado. A **memória de cálculo** detalha, para cada componente, o valor, a base de cálculo, a quantidade ou km e o tipo (estimado ou registrado), além dos fixos considerados e dos abastecimentos do dia. Os abastecimentos aparecem como desembolso **não** descontado do resultado (D-28). Custos fixos de exemplo ficam sinalizados.

**[v1.1] Dados de exemplo × dados reais:** dados de demonstração são marcados como "exemplo", sinalizados nas telas de números e podem ser removidos sem afetar os registros reais.

### Módulo G --- Relatórios

Resumo diário e mensal: - Receita bruta. - Quantidade de corridas. -
Horas de operação. - Km total e composição por categoria. -
Abastecimentos e consumo. - Manutenções e despesas. - Custos
estimados. - Resultado operacional estimado. - Receita e resultado por
km e por hora.

Gráficos de evolução de receita, despesas, quilometragem, consumo e
resultado. Relatórios devem ser recalculáveis a partir dos registros
originais após correções.

`Receita por km total = receita / km total`

`Resultado operacional estimado = receita - despesas operacionais efetivas - custos estimados não duplicados`

Apresentar custos estimados e desembolsos efetivos separadamente. Não
chamar o resultado gerencial de lucro contábil ou líquido.

**[v1.1] Evolutivos (rodadas 3 e 4):**
- Todos os indicadores estão disponíveis em Dia, Semana, Mês, Últimos 3 meses, Ano (acumulado) e Histórico.
- Períodos em andamento são marcados com * e ficam fora da comparação.
- O gráfico de custos é multissérie (total, fixos, variáveis, combustível, manutenção): tocar numa série destaca, tocar de novo restaura, e tocar num ponto mostra o total e a composição.

## 6A. **[v1.1]** Cadastro e identificação do veículo (rodadas 3 e 5)

- Veículo único no MVP.
- Campos: marca, modelo, ano, cor, placa, motorização, combustível (derivado da motorização), capacidade do tanque e/ou bateria, hodômetro no cadastro e consumo de referência.
- Em Configurações → Veículo, o próprio cartão do veículo é clicável e abre os detalhes. Os detalhes mostram a identificação visual, marca/modelo, ano, cor, placa, motorização, combustível, capacidade, hodômetro atual e no cadastro e o consumo de referência. A edição parte dos detalhes; não existe botão separado de edição na tela-resumo.
- **Imagem do veículo:** deve representar o modelo e a geração cadastrados, na cor informada, a partir de fonte com direitos de uso. A imagem fica **armazenada localmente** (sem carregamento pela internet durante o uso). Sem imagem adequada, aparece uma ilustração genérica na cor do veículo, identificada como ilustração. Nunca se apresenta a foto de outro modelo como se fosse o veículo do motorista.

## 7. Fora do escopo do MVP

-   Inteligência coletiva de regiões.
-   Banco compartilhado de riscos.
-   Reconhecimento automático de buracos ou pavimentação.
-   Classificação automática de segurança pública.
-   Previsão de demanda e reposicionamento avançado.
-   Gestão de múltiplos veículos.
-   Sincronização entre dispositivos.
-   Assinaturas e planos comerciais.
-   Painel administrativo em nuvem.
-   Automação de aceite/recusa.
-   Integrações não validadas.

Registrar essas possibilidades no backlog, sem implementá-las no MVP.

## 8. Arquitetura técnica proposta

Android nativo: - Kotlin. - Jetpack Compose. - MVVM + Clean Architecture
modular. - Room/SQLite. - DataStore. - MapLibre, sujeito à escolha de
provedor e condições de uso de mapas. - Android Location Services. -
WindowManager para overlay. - CameraX para fotografia. - ML Kit
on-device para OCR. - JUnit e testes instrumentados. - Gradle.

Módulos lógicos: - presentation - domain - data - capture -
integrations - location - services - core - tests - docs

Integrações devem usar adaptadores específicos de plataforma que
normalizam dados para um modelo comum de oferta. Não presumir acesso
oficial a APIs privadas das plataformas.

Offline-first: cálculos, registros, zonas salvas, OCR local e relatórios
com dados disponíveis devem funcionar sem internet. Pesquisa de endereço
e mapas completos podem depender de conectividade. Não utilizar servidor
próprio obrigatório no MVP.

Privacidade: dados financeiros locais, imagens processadas localmente,
descarte de capturas temporárias, permissões transparentes e nenhuma
interação automática com apps externos.

**[v1.1]** As regras validadas no protótipo (camada única de cálculo, modelo de registros, ciclos de combustível e rateio de fixos) estão descritas em `docs/architecture/ARCHITECTURE.md` e devem ser portadas para o módulo `domain` com os mesmos cenários de teste.

## 9. Roadmap e sprints

**Sprint 0 --- Prova de viabilidade** - Projeto Android mínimo. - Testar
captura autorizada. - Testar OCR local. - Testar overlay sobre app
externo. - Testar alternância entre apps. - Avaliar permissões,
políticas, latência e consumo. - Documentar evidências e alternativas.

Critério: decisão técnica fundamentada antes de comprometer o produto
com captura automática.

**Sprint 1 --- Fundação e Design System** - Estrutura modular, banco
local, navegação, identidade visual, componentes e configurações. -
Critério: app instalável, navegável e com persistência.

**Sprint 2 --- Motor de decisão** - Modelo de oferta, fórmulas, regras e
testes. - Critério: cenários de cálculo aprovados.

**Sprint 3 --- Gestão territorial** - Mapa, zonas, raios, origem/destino
e sobreposições. - Critério: cenários geográficos aprovados.

**Sprint 4 --- Controle do veículo** - Cadastro, foto do hodômetro, OCR,
confirmação, expediente e histórico. - Critério: registro confiável com
alternativa manual.

**Sprint 5 --- Abastecimentos e manutenção** - Abastecimentos, ciclos de
tanque, consumo, histórico e alertas. - Critério: ciclos e alertas
corretos.

**Sprint 6 --- Financeiro** - Receitas, despesas, custos, conciliação e
relatórios. - Critério: resultados reconciliados sem duplicidade.

**Sprint 7 --- Captura e overlay integrados** - Adaptador da primeira
plataforma tecnicamente validada, OCR, confiança, card e ciclo de
vida. - Critério: oferta de teste processada sem interferir nos
controles externos.

**Sprint 8 --- Estabilização** - Testes integrados, bateria, memória,
offline, permissões, correções, documentação e APK. - Critério:
requisitos obrigatórios aprovados e versão instalável entregue.

**[v1.1]** O status atualizado de cada etapa está em `docs/project/ROADMAP.md`.

## 10. Controle de escopo

Após aprovação do PRD e dos protótipos, congelar o escopo do MVP.

Toda ideia nova deve ser registrada em `docs/backlog/IDEAS_BACKLOG.md`
com: - ID. - Descrição. - Problema. - Benefício. - Complexidade. -
Dependências. - Impacto no MVP. - Versão sugerida.

Mudanças somente após avaliação e aprovação explícita.

Correções de defeitos, segurança, estabilidade e cumprimento de
requisitos obrigatórios fazem parte da entrega e não são expansão de
escopo.

## 11. Critérios gerais de aceite

O MVP deverá: - Instalar e iniciar. - Persistir configurações. -
Calcular indicadores corretamente. - Cadastrar e consultar zonas. -
Registrar hodômetro por foto ou manualmente. - Iniciar e encerrar
expediente. - Registrar abastecimentos e ciclos válidos. - Registrar
manutenções e alertas por km/tempo. - Registrar despesas e receitas. -
Conciliar quilometragem. - Gerar resumo diário e mensal. - Respeitar
permissões e privacidade. - Não automatizar aceite/recusa. - Passar por
testes de regressão. - Entregar APK e documentação.

**[v1.1]** E também: - Registrar corridas realizadas sem classificar ofertas. - Atualizar os indicadores imediatamente a cada registro, correção ou exclusão. - Fechar o expediente por conferência, sem duplicar valores. - Identificar estimativas e medições. - Separar dados de exemplo de dados reais.

Requisitos externos não viáveis devem ser documentados com evidências e
alternativa aprovada. Nunca declarar como concluído o que não foi
demonstrado.

## 12. Estrutura documental do repositório

``` text
meu-destino/
├── CLAUDE.md
├── docs/
│   ├── product/PRD.md
│   ├── product/PRODUCT_VISION.md
│   ├── product/MVP_SCOPE.md
│   ├── architecture/ARCHITECTURE.md
│   ├── architecture/DATABASE_SCHEMA.md
│   ├── architecture/INTEGRATIONS.md
│   ├── architecture/ADR/
│   ├── ux/DESIGN_SYSTEM.md
│   ├── ux/SCREEN_FLOWS.md
│   ├── ux/PROTOTYPES.md
│   ├── project/ROADMAP.md
│   ├── project/SPRINTS.md
│   ├── project/ACCEPTANCE_CRITERIA.md
│   ├── project/CHANGE_CONTROL.md
│   ├── backlog/IDEAS_BACKLOG.md
│   └── qa/TEST_PLAN.md
└── app/
```

**[v1.1 · migração 07/11/2026]** O repositório Git `meu-destino` passou a ser a fonte oficial de código e documentação. A estrutura real está no `README.md`. Os documentos ficam em `docs/product/`, `docs/architecture/`, `docs/decisions/`, `docs/backlog/` e `docs/project/`. O app Android (`app/`) ainda não existe: o repositório contém o protótipo web navegável.

## 13. Definição de sucesso

O motorista consegue iniciar a jornada, registrar quilometragem com
pouco esforço, receber análises úteis, consultar zonas, acompanhar
abastecimentos e manutenções, receber alertas preventivos, controlar
despesas e entender o resultado operacional diário e mensal.

**O MVP deve ser funcional, confiável, simples e utilizável na rotina
real. Não construir todas as possibilidades futuras agora. Construir a
primeira versão certa.**

## 14. **[v1.1]** Registro resumido das decisões incorporadas

| Rodada | Decisão | Seção |
|---|---|---|
| 2 | Geocodificação online como padrão | §6 B |
| 2 | Ofertas capturadas nunca contam automaticamente como corridas | §6 A |
| 2 | Regra oficial de km; hodômetro como trava; correções retroativas preservando o original | §6 C |
| 2 | Limites configuráveis 2,50 / 2,99 / 3,00, média ponderada e fórmula da próxima corrida | §6 A |
| 2 | Captura automática segue obrigatória como requisito, com alternativa manual | §6 A |
| 3 | Mockups como referência visual; navegação de 4 abas; sem Planejamento | §5 |
| 3 | Cadastro do veículo com 6 motorizações; Flex escolhe combustível por abastecimento | §6 D, 6A |
| 3 | Voltar em toda tela secundária; confirmação de formulário alterado | §5 |
| 3 | Data e hora automáticas do aparelho, com trilha de correção | §6 C |
| 3 | Evolutivos multissérie e os 6 períodos | §6 G |
| 4 | Camada única de cálculo e integração imediata entre os módulos | §4 |
| 4 | Custo de combustível por km = gasto do ciclo ÷ km do ciclo | §6 D |
| 4 | Híbrido convencional sem custo elétrico; elétrico medido entre cargas de 100% | §6 D |
| 4 | Rateio diário de custos fixos pelos dias reais do mês | §6 F |
| 4 | Dados persistidos localmente; exemplo separado do real | §6 F |
| 5 | Sem marcação de aceite/recusa; registro das corridas realizadas | §6 A |
| 5 | Financeiro transparente durante o expediente; encerramento como conferência | §6 C, §6 F |
| 5 | Cartão do veículo clicável, detalhes, cor e imagem local com alternativa | §6A |
| Validação 08/11 | Conferência no STOP com todas as ofertas do expediente (substitui o registro manual) | §6 A, §6 C |
| Validação 08/11 | Abastecimento como desembolso informativo; custos com memória de cálculo | §6 F |
| Validação 08/11 | Tempo total, útil e não útil | §6 C |

O detalhamento (origem, justificativa e o que foi substituído) está em `docs/decisions/DECISIONS.md`.

## 15. **[v1.1]** Pendências de decisão (não fazem parte do escopo aprovado)

Lista completa e atualizada em `docs/project/HANDOFF.md`. As principais:
- Métodos de provisão e depreciação; demais regras de custos fixos além do rateio diário.
- DRE: R$/km de referência no Financeiro após o fechamento (km total) × tela de encerramento (km produtivo).
- Horários de operação: o tempo do expediente ainda é simulado no protótipo.
- Custo de combustível durante o expediente sobre km produtivos (P-03).
- Imagens licenciadas dos modelos de veículo.
- Critério dos "50%" de "Favorável com atenção", limites de trânsito, risco e terreno.
- Lacunas técnicas L5–L13 da Preparação (aparelho-alvo, distribuição, provedores de mapa etc.).
