# Frentes paralelas ao desenvolvimento do CarreirasMatch

Documento operacional derivado do Plano Mestre 2026. A intenção é permitir que produto, QA, monetização e crescimento avancem sem alterar arquivos que estejam sendo implementados em outra frente.

## Estado observado em 30/07/2026

As mudanças não commitadas concentram-se em:

- módulo universitário e catálogo curricular;
- sincronização de currículos via SIGAA;
- plano de crescimento profissional;
- navegação e objetivos de onboarding;
- migrações Prisma relacionadas a universidade e evolução profissional.

Esta frente deve evitar alterações nesses arquivos até que a implementação principal seja revisada.

## Trabalho paralelo recomendado

### QA e segurança

- testar login obrigatório em todas as rotas novas;
- garantir que uma matrícula só possa ser lida, alterada ou excluída pelo próprio usuário;
- verificar que `universityCourseId` pertence a um curso existente antes do `upsert`;
- restringir `currentSemester` a valores válidos e coerentes com a grade;
- impedir geração repetida de insights sem controle de consumo de IA;
- tratar concorrência na criação de `CurriculumSubjectInsight`;
- testar falhas do SIGAA, timeout, HTML inesperado e duplicidade de cursos;
- confirmar que dados pessoais e acadêmicos não aparecem em logs.

### Achado adicional no sincronizador

O sincronizador atualmente remove todas as `CurriculumSubject` de um curso antes de recriá-las. Como `CurriculumSubjectInsight` usa `onDelete: Cascade`, uma sincronização de grade também elimina os insights já gerados e força novo consumo de IA.

Antes do piloto, o sincronizador deve preservar disciplinas estáveis por curso — por exemplo, usando uma chave de origem ou fazendo reconciliação por nome/período — e remover apenas disciplinas que realmente deixaram de existir. Esta correção deve ser feita na frente de sincronização, após o Claude terminar a alteração atual do scraper.

### Monetização

As ações abaixo devem ser definidas antes de liberar uso amplo:

| Recurso | Feature key sugerida | Controle |
| --- | --- | --- |
| Insight de disciplina manual | `university.subject.insight` | créditos ou limite mensal |
| Insight de disciplina do catálogo | `university.curriculum.insight` | limite mensal por usuário |
| Plano de crescimento | `career.growth.plan.generate` | limite mensal |
| Busca de cursos | `university.course.search` | livre, com rate limit |
| Cadastro de matrícula | `university.enrollment.write` | livre |

Cada operação de IA deve seguir `reservar → executar → confirmar`; em erro, o consumo deve ser revertido.

### Métricas

Eventos mínimos para o módulo universitário:

| Evento | Quando ocorre | Propriedades |
| --- | --- | --- |
| `university_viewed` | abertura da área | `hasEnrollment`, `hasCatalogCourse` |
| `university_enrollment_started` | início do cadastro | `entryPoint` |
| `university_enrollment_saved` | matrícula salva | `hasCatalogCourse`, `currentSemester` |
| `university_course_searched` | busca de curso | `queryLength`, `resultCount` |
| `university_subject_added` | disciplina manual adicionada | `source` |
| `university_subject_insight_requested` | insight solicitado | `source`, `featureKey` |
| `university_subject_insight_completed` | insight concluído | `source`, `latencyMs`, `costCents` |
| `university_subject_insight_failed` | insight falhou | `source`, `errorType` |
| `university_career_action_clicked` | ação de carreira aberta | `actionType`, `subjectId` |

Métrica norte: usuários que transformaram uma disciplina em uma ação profissional, como projeto, competência, currículo atualizado ou vaga salva.

## Critério de liberação

O módulo pode entrar em piloto quando:

1. `npm run lint` e `npx tsc --noEmit` passarem;
2. houver testes de autorização e isolamento por usuário;
3. as operações de IA tiverem limite e auditoria de consumo;
4. o sincronizador tiver relatório de cursos criados, atualizados, desativados e falhos;
5. houver estado vazio, erro recuperável e feedback de carregamento na interface;
6. o piloto tiver uma instituição, um curso e uma turma identificados;
7. os eventos de ativação e conclusão estiverem instrumentados.

## Próximas decisões de produto

- O aluno poderá trocar de curso sem perder histórico de disciplinas anteriores?
- A disciplina do catálogo será copiada para o currículo do aluno ou apenas referenciada?
- O insight será regenerável após mudança do modelo de IA?
- Instituições poderão editar competências e projetos sugeridos?
- O plano universitário será B2C, institucional ou ambos?
