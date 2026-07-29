import { Dub } from "dub";

/**
 * Wrapper fino sobre o SDK do Dub p/ criar links curtos rastreáveis de
 * campanha (influenciador, canal, criativo). Sem DUB_API_KEY configurada,
 * cai no fallback de retornar a própria URL longa — nunca quebra o caller.
 *
 * Não substitui o sistema de cupom existente ([[pacote-conversao-retencao]]):
 * o Dub só serve pra atribuição (de onde veio o clique), cupom continua
 * controlando desconto/comissão no banco do CarreirasMatch.
 */
const dub = process.env.DUB_API_KEY ? new Dub({ token: process.env.DUB_API_KEY }) : null;

export type CampaignLinkInput = {
  url: string;
  /** slug legível, ex: "amanda", "ufu", "linkedin-julho" */
  key?: string;
  tags?: string[];
};

export async function createCampaignLink({ url, key, tags }: CampaignLinkInput): Promise<string> {
  if (!dub) return url;

  try {
    const link = await dub.links.create({
      url,
      domain: process.env.DUB_DOMAIN,
      key,
      tagNames: tags,
    });
    return link.shortLink;
  } catch {
    // Falha no Dub não pode impedir a geração do link de campanha.
    return url;
  }
}
