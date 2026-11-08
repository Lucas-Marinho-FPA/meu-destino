# Meu Destino — Backlog de ideias

Ideias **não autorizadas**. Nenhuma está implementada. Mudanças só com aprovação explícita (PRD §10).

| ID | Descrição | Problema | Benefício | Complexidade | Dependências | Impacto no MVP | Versão sugerida |
|---|---|---|---|---|---|---|---|
| IDEA-001 | Exportar/importar backup local (arquivo) | Sem sincronização, perder o celular significa perder os dados | Protege os registros | Baixa/Média | Sprint 1 (banco) | Nenhum se adiado; risco de perda de dados | Sprint 8 ou pós-MVP |
| IDEA-002 | Cache local de geocodificação | Destino em texto exige rede | Mais funcionamento offline | Média | L5, L9 | Pode ajudar o D-01 sem rede | Ao resolver L9 |
| IDEA-003 | Zonas por nome de bairro | OCR fornece texto, não coordenada | Consulta territorial sem geocodificar | Média | Sprint 3 | **Altera escopo** (MVP prevê só círculos) | Requer aprovação |
| IDEA-004 | Rastreamento GPS do expediente para categorizar km | Categorias de km sem fonte automática | Conciliação mais automática | Alta | L7 | Bateria e privacidade | Depende de L7 |
| IDEA-005 | Foto do próprio veículo pelo motorista (câmera) como alternativa à imagem de catálogo | Imagem licenciada de cada modelo/geração/cor é difícil de garantir offline | Identificação visual fiel, sem licenciamento | Baixa | CameraX (Sprint 1/4) | Pequeno; muda o D-25 se adotado | Avaliar antes da Sprint 1 |
| IDEA-006 | Pacote de imagens de catálogo por modelo, baixado uma vez na instalação/atualização | Embutir muitas imagens aumenta o APK | APK menor mantendo o offline no uso | Média | Licenciamento; política de rede | Exige download inicial (avaliar com o offline-first) | Pós-MVP |
| IDEA-007 | Atalho de registro rápido (notificação persistente ou botão do card) para "Registrar corrida" | Reduzir toques durante o expediente | Menos interação | Média | Sprint 7 (overlay); políticas do Android | Nenhum até a Sprint 7 | Sprint 7+ |
| IDEA-008 | Sugerir automaticamente a última oferta analisada ao abrir "Registrar corrida" | Digitação durante o expediente | Menos campos | Baixa | — | Risco de registrar oferta não realizada sem conferência | Avaliar com o dono do produto |
| IDEA-009 | PWA com Service Worker (cache dos arquivos do app e instalação na tela inicial) | Sem Service Worker, recarregar a página sem conexão depende do cache do navegador | Reabertura offline garantida e instalação | Média | Política de atualização de versão e de cache | Nenhum até a decisão; é a forma web de cumprir o offline-first | Decidir (P-11) |
