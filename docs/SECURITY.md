# Segurança

Este documento registra controles observados e cuidados obrigatórios. Não
substitui auditoria profissional.

## Controles existentes

- senhas com bcrypt;
- sessão JWT via Auth.js;
- helpers separados para usuário, empresa e administrador;
- validação de assinatura do webhook do Mercado Pago;
- rate limit em fluxos de abuso mais provável;
- validação de URLs externas;
- consentimento em pedidos de contato com talentos;
- Sentry e métricas opcionais;
- tokens de recuperação com expiração.

## Segredos

- Nunca versionar `.env`.
- Nunca enviar valores de chaves em documentação, logs ou respostas de API.
- Apenas variáveis intencionalmente públicas usam `NEXT_PUBLIC_*`.
- Credencial exposta deve ser revogada, não apenas removida do arquivo.
- Produção, homologação e desenvolvimento devem usar credenciais diferentes.

## Autorização

- APIs não são protegidas pelo proxy global.
- Toda ação por ID valida proprietário no banco.
- `accountType` separa sessões de empresa.
- Operações administrativas usam helper server-side.
- Entitlement é validado no servidor, nunca apenas escondendo UI.

## Entrada e conteúdo

- Validar payload com Zod e impor tamanho máximo.
- Tratar PDFs e textos como conteúdo não confiável.
- Escapar conteúdo ao gerar HTML/e-mail.
- Restringir protocolos, hosts e redirecionamentos em fetch/scraping.
- Respostas de IA não são comandos confiáveis e precisam de schema.

## Pagamentos

- Validar `x-signature`.
- Consultar o objeto no Mercado Pago antes de liberar acesso.
- Comparar valor, moeda, destinatário e referência interna.
- Usar unicidade de `mpPaymentId` e atualização idempotente.
- Não conceder crédito duas vezes em retries concorrentes.

## Dados pessoais e LGPD

O sistema trata currículo, contato, histórico profissional e dados de
candidatura. A operação deve:

- coletar apenas o necessário;
- explicar finalidade e retenção;
- atender acesso, correção e exclusão;
- restringir acesso interno;
- manter base legal e consentimento quando aplicável;
- não expor contato de talento antes do aceite.

## Riscos conhecidos a acompanhar

- rate limit em memória não é compartilhado entre réplicas;
- schedulers no processo web exigem coordenação ao escalar;
- campos JSON em `String` têm validação mais fraca que tipos estruturados;
- alteração administrativa do modelo de IA afeta comportamento global;
- endpoints de ferramentas devem ser revistos individualmente quanto a limite.

## Relato de vulnerabilidade

Não abra issue pública com segredo ou dados pessoais. Registre internamente o
impacto, evidência mínima, rota afetada e forma de reprodução segura; faça
contenção e rotação de credenciais antes da divulgação.
