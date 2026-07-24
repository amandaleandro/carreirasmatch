# Roadmap de Melhorias Contínuas do Sistema

Este documento consolida as tarefas planejadas para evolução contínua da arquitetura, segurança, rotas e telas do **Carreiras Match / ChanceCreate**.

---

## 🟢 Fase 1: Segurança e Testes (Concluída)
- [x] **Correção no Rate Limiter (`src/lib/rate-limit.ts`)**: Corrigido bug crítico onde requisições permitidas não atualizavam o contador de consumo da janela deslizante.
- [x] **Validação do Webhook Mercado Pago (`src/lib/webhook-secret.ts`)**: Garantida a validação de assinatura `HMAC-SHA256` com `timingSafeEqual`.
- [x] **Suíte de Testes Unitários**: 100% de aprovação nos 209 testes (Vitest).

---

## 🟡 Fase 2: Documentação e Mapeamento de Rotas (Concluída)
- [x] **Mapeamento de Rotas (`docs/ROUTES_MAPPING.md`)**: Inventário de 65+ rotas públicas, candidatórias, corporativas e administrativas.
- [x] **Guia de Design System e UX (`docs/DESIGN_SYSTEM_AND_UX.md`)**: Padrão de componentes, cores, skeletons e micro-interações.
- [x] **Documento de Arquitetura (`docs/ARCHITECTURE.md`)**: Diagramas e mapeamento da stack Next.js 16 + React 19 + Prisma 7 + PostgreSQL 17 + Groq + Mercado Pago.

---

## 🔵 Fase 3: Organização Estrutural de Componentes & Refatoração (Próxima Etapa)
- [ ] **Taxonomia de Componentes**: Organizar os 126 componentes de `src/components/` em subpastas semânticas (`admin/`, `candidate/`, `company/`, `partner/`, `shared/`).
- [ ] **Polimento de Telas**:
  - Atualizar barras de progresso e skeletons no fluxo de análise ATS (`src/components/resume-optimizer.tsx`).
  - Aprimorar visualização de fit score no Kanban de empresas (`src/components/company-candidate-kanban.tsx`).
