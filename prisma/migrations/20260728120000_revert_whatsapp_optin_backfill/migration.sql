-- Reverte o backfill de 20260727140000_backfill_whatsapp_optin: aquela
-- migration ligou whatsappMarketingOptIn=true pra toda a base com telefone,
-- sem nenhum consentimento real (o cadastro nunca mostrou opção de WhatsApp
-- até essa correção). O disparo de marketing seguinte pra essa base causou
-- denúncias em massa e o número da Evolution API foi banido.
-- Não há coluna que distinga "opt-in real via /settings" de "opt-in
-- assumido pelo backfill/cadastro antigo", então a reversão é ampla: zera
-- todo mundo. Quem realmente quer receber pode ligar de novo em /settings
-- (agora com o toggle real) ou marcar o checkbox no cadastro.
UPDATE "User"
SET "whatsappMarketingOptIn" = false
WHERE "whatsappMarketingOptIn" = true;
