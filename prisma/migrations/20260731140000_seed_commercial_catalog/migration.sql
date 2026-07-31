INSERT INTO "Plan" ("id", "key", "name", "priceCents", "recurring", "durationDays", "highlighted", "active", "updatedAt") VALUES
  ('commercial-plan-free', 'free', 'Gratuito', 0, false, NULL, false, true, CURRENT_TIMESTAMP),
  ('commercial-plan-essential', 'essential', 'Essencial', 1490, true, NULL, false, true, CURRENT_TIMESTAMP),
  ('commercial-plan-pro', 'pro', 'Pro', 2990, true, NULL, true, true, CURRENT_TIMESTAMP),
  ('commercial-plan-complete', 'complete', 'Completo', 4990, true, NULL, false, true, CURRENT_TIMESTAMP),
  ('commercial-plan-sprint', 'sprint', 'Sprint 7 dias', 1490, false, 7, false, true, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET "name" = EXCLUDED."name", "priceCents" = EXCLUDED."priceCents", "recurring" = EXCLUDED."recurring", "durationDays" = EXCLUDED."durationDays", "highlighted" = EXCLUDED."highlighted", "active" = true, "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "FeatureDefinition" ("id", "key", "name", "active", "updatedAt") VALUES
  ('commercial-feature-ai-simple', 'ai.simple_action', 'Ações simples de IA', true, CURRENT_TIMESTAMP),
  ('commercial-feature-analysis-full', 'analysis.job.full', 'Análises completas', true, CURRENT_TIMESTAMP),
  ('commercial-feature-resume-job', 'resume.by_job', 'Currículo por vaga', true, CURRENT_TIMESTAMP),
  ('commercial-feature-interview', 'interview.complete', 'Entrevistas completas', true, CURRENT_TIMESTAMP),
  ('commercial-feature-github', 'profile.github.analysis', 'Análise de GitHub', true, CURRENT_TIMESTAMP),
  ('commercial-feature-university', 'university.subject.insight', 'Insight de disciplina', true, CURRENT_TIMESTAMP),
  ('commercial-feature-growth', 'career.growth.plan.generate', 'Plano de crescimento profissional', true, CURRENT_TIMESTAMP),
  ('commercial-feature-applications', 'job.application.create', 'Candidaturas', true, CURRENT_TIMESTAMP),
  ('commercial-feature-study', 'study.tool.use', 'Ferramentas de estudo', true, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET "name" = EXCLUDED."name", "active" = true, "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "PlanEntitlement" ("id", "planId", "featureDefinitionId", "limit", "active", "updatedAt")
SELECT 'entitlement-' || v.plan_key || '-' || replace(v.feature_key, '.', '-'), p."id", f."id", v.feature_limit, true, CURRENT_TIMESTAMP
FROM (VALUES
 ('free','ai.simple_action',5),('free','analysis.job.full',0),('free','resume.by_job',0),('free','interview.complete',1),('free','profile.github.analysis',0),('free','university.subject.insight',0),('free','career.growth.plan.generate',0),('free','job.application.create',5),('free','study.tool.use',10),
 ('essential','ai.simple_action',30),('essential','analysis.job.full',5),('essential','resume.by_job',2),('essential','interview.complete',2),('essential','profile.github.analysis',0),('essential','university.subject.insight',2),('essential','career.growth.plan.generate',1),('essential','job.application.create',NULL),('essential','study.tool.use',40),
 ('pro','ai.simple_action',120),('pro','analysis.job.full',20),('pro','resume.by_job',15),('pro','interview.complete',10),('pro','profile.github.analysis',10),('pro','university.subject.insight',10),('pro','career.growth.plan.generate',3),('pro','job.application.create',NULL),('pro','study.tool.use',150),
 ('complete','ai.simple_action',300),('complete','analysis.job.full',50),('complete','resume.by_job',40),('complete','interview.complete',25),('complete','profile.github.analysis',25),('complete','university.subject.insight',25),('complete','career.growth.plan.generate',10),('complete','job.application.create',NULL),('complete','study.tool.use',NULL),
 ('sprint','ai.simple_action',30),('sprint','analysis.job.full',5),('sprint','resume.by_job',5),('sprint','interview.complete',3),('sprint','profile.github.analysis',0),('sprint','university.subject.insight',3),('sprint','career.growth.plan.generate',1),('sprint','job.application.create',NULL),('sprint','study.tool.use',40)
) AS v(plan_key, feature_key, feature_limit)
JOIN "Plan" p ON p."key" = v.plan_key
JOIN "FeatureDefinition" f ON f."key" = v.feature_key
ON CONFLICT ("planId", "featureDefinitionId") DO UPDATE SET "limit" = EXCLUDED."limit", "active" = true, "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "Product" ("id", "code", "name", "kind", "priceCents", "recurring", "planKey", "creditType", "creditQuantity", "active", "updatedAt") VALUES
  ('commercial-product-first-analysis', 'analysis.first', 'Primeira análise', 'first_analysis', 4900, false, NULL, NULL, NULL, true, CURRENT_TIMESTAMP),
  ('commercial-product-full-analysis', 'analysis.full', 'Análise completa', 'diagnostic', 990, false, NULL, NULL, NULL, true, CURRENT_TIMESTAMP),
  ('commercial-product-analysis-credits', 'credits.analysis.5', '5 análises completas', 'credit_pack', 3990, false, NULL, 'analysis.job.full', 5, true, CURRENT_TIMESTAMP),
  ('commercial-product-pro-monthly', 'plan.pro.monthly', 'Pro mensal (30 dias)', 'subscription_monthly', 2990, false, 'pro', NULL, NULL, true, CURRENT_TIMESTAMP),
  ('commercial-product-pro-annual', 'plan.pro.annual', 'Pro anual (365 dias)', 'subscription_annual', 29900, false, 'pro', NULL, NULL, true, CURRENT_TIMESTAMP),
  ('commercial-product-free', 'plan.free', 'Gratuito', 'subscription', 0, false, 'free', NULL, NULL, true, CURRENT_TIMESTAMP),
  ('commercial-product-essential', 'plan.essential', 'Essencial', 'subscription', 1490, true, 'essential', NULL, NULL, true, CURRENT_TIMESTAMP),
  ('commercial-product-pro', 'plan.pro', 'Pro', 'subscription', 2990, true, 'pro', NULL, NULL, true, CURRENT_TIMESTAMP),
  ('commercial-product-complete', 'plan.complete', 'Completo', 'subscription', 4990, true, 'complete', NULL, NULL, true, CURRENT_TIMESTAMP),
  ('commercial-product-sprint', 'plan.sprint', 'Sprint 7 dias', 'subscription', 1490, false, 'sprint', NULL, NULL, true, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE SET "name" = EXCLUDED."name", "kind" = EXCLUDED."kind", "priceCents" = EXCLUDED."priceCents", "recurring" = EXCLUDED."recurring", "planKey" = EXCLUDED."planKey", "creditType" = EXCLUDED."creditType", "creditQuantity" = EXCLUDED."creditQuantity", "active" = true, "updatedAt" = CURRENT_TIMESTAMP;
