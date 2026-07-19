# Visão do produto

## Proposta

O CarreirasMatch é uma plataforma brasileira de carreira que combina análise
por IA, organização da busca por emprego, conteúdo educacional e descoberta de
oportunidades. O núcleo do produto compara currículo e vaga, transforma o
diagnóstico em ações práticas e acompanha a evolução do usuário.

## Públicos

| Público | Necessidade atendida |
| --- | --- |
| Visitante | Conteúdo, vagas públicas e ferramentas gratuitas |
| Candidato | Currículo, análises, entrevistas, plano de ação e candidaturas |
| Assinante | Recursos recorrentes e diagnósticos completos |
| Empresa | Triagem de currículos e busca consentida no banco de talentos |
| Influenciador | Indicação por cupom e acompanhamento de conversões |
| Administrador | Suporte, concessões, cupons, fontes, denúncias e operação |

Os segmentos de carreira usados para personalização e preço incluem jovem
aprendiz, estágio, primeiro emprego, recolocação, transição, concursos, OAB e
outros definidos em `src/lib/career-segments.ts`.

## Domínios do sistema

- **Identidade e perfil:** cadastro, login, recuperação de senha, perfil,
  preferências e disponibilidade pública.
- **Currículo e IA:** upload/leitura, análise contra vaga, diagnóstico,
  otimização, PDF e recomendações.
- **Carreira:** entrevistas, plano de ação, cursos e sugestões de evolução.
- **Oportunidades:** feed, fontes externas, vagas públicas, alertas, salvamento,
  denúncias e candidaturas.
- **Ferramentas gratuitas:** testes, guias, simuladores, currículo, carta,
  LinkedIn, GitHub, concursos, OAB e estudos.
- **Receita:** pagamento avulso, assinatura, cupons e pacotes B2B.
- **Empresas:** conta separada, triagem, candidatos e banco de talentos.
- **Conteúdo:** blog, vídeos, cursos, radar e páginas SEO.
- **Operação:** administração, suporte, e-mails, métricas, logs e backups.

## Modelo de negócio

O candidato pode usar entradas gratuitas, comprar um diagnóstico avulso ou
assinar um plano. A empresa possui uma franquia de triagens e pode comprar
pacotes de créditos. Cupons atribuem cadastros e pagamentos a influenciadores,
com desconto e comissão configuráveis.

## Princípios funcionais

- O resultado completo é liberado por entitlement, não apenas pela existência
  de uma sessão.
- Dados de contato de talentos dependem de opt-in do candidato e aceite do
  pedido de contato.
- Webhooks de pagamento devem ser idempotentes.
- Ferramentas públicas aplicam limites e/ou captura de lead conforme o fluxo.
- Conteúdo gerado por IA é assistência e não garantia de contratação,
  aprovação ou resultado profissional.
