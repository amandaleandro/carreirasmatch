-- Backfill: opt in existing users who already have a phone number into
-- WhatsApp marketing. Decisão do produto (2026-07-27): sem isso, a régua de
-- WhatsApp inteira (conversão + alerta de vaga) tinha ~1 usuário elegível.
-- Novos cadastros já entram opt-in automaticamente (ver src/app/api/register/route.ts);
-- isso cobre quem já tinha telefone cadastrado antes dessa mudança. Usuário
-- pode desligar a qualquer momento em /settings ou respondendo PARAR.
UPDATE "User"
SET "whatsappMarketingOptIn" = true
WHERE phone IS NOT NULL AND phone <> '' AND "whatsappMarketingOptIn" = false;
