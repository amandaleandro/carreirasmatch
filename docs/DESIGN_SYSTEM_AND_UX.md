# Guia de Design System, Telas e Experiência do Usuário (UX/UI)

Este documento estabelece o guia oficial de interface, estados visuais e componentes do **Carreiras Match / ChanceCreate**.

---

## 1. Princípios Visuais & Paleta de Cores

O design system adota uma estética moderníssima com suporte nativo a **Dark Mode**, **Glassmorphism**, gradients dinâmicos e tipografia limpa.

### Tokens de Cores Primárias
- **Primary / Brand Accent**: HSL `221.2 83.2% 53.3%` (`#2563eb` - Indigo/Blue Vibrant)
- **Secondary / Action**: HSL `262.1 83.3% 57.8%` (`#7c3aed` - Purple Vivid)
- **Success / Match**: HSL `142.1 70.6% 45.3%` (`#16a34a` - Emerald)
- **Warning / Attention**: HSL `37.7 92.1% 50.2%` (`#f59e0b` - Amber)
- **Danger / Destructive**: HSL `0 84.2% 60.2%` (`#ef4444` - Rose/Red)

---

## 2. Padrões de Layout e Micro-interações

### A. Skeletons & Estados de Carregamento de IA
- Todas as rotas que invocam os modelos Groq/LLM (`/analise`, `/interviews`, `/action-plan`) devem exibir **skeletons pulsantes** e mensagens de progresso dinâmicas em vez de spinners estáticos.

### B. Cards com Elevação e Glassmorphism
- Uso de bordas sutis (`border border-slate-200 dark:border-slate-800`), sombras suaves (`shadow-sm hover:shadow-md transition-all duration-200`) e fundos semi-transparentes em telas de dashboard.

### C. Feedback Visual de Match e Qualidade
- **Score Circular**: Componente `CircularScore` com codificação por cores:
  - 80-100%: Verde Emerald (Excelente fit)
  - 60-79%: Amarelo Amber (Bom fit com pontos de ajuste)
  - <60%: Vermelho Rose (Requer atenção no currículo)

---

## 3. Diretrizes para Modificação de Telas

1. **Dashboard do Candidato (`src/app/dashboard/page.tsx`)**:
   - Manter topo com score atual, resumo de candidaturas ativas no Kanban e oportunidades recomendadas.

2. **Área da Empresa (`src/app/empresa/...`)**:
   - Manter visualização em Kanban para triagem rápida dos candidatos com visualização imediata do score ATS.

3. **Responsividade**:
   - Todos os componentes de tabela, Kanban e modais devem ser adaptáveis para mobile (breakpoint `md: 768px`).
