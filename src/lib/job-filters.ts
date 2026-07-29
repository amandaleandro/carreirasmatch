import type { Prisma } from "@/generated/prisma/client";

/**
 * Normaliza o filtro de modelo de trabalho cobrindo sinônimos/grafias que
 * aparecem tanto na coluna estruturada `workModel` quanto no texto livre de
 * `location`/`jobTitle` (vagas antigas nem sempre têm `workModel` preenchido).
 */
export function workModelFilter(workModel: string): Prisma.JobWhereInput {
  const wmLower = workModel.toLowerCase();
  if (wmLower === "remoto") {
    return {
      OR: [
        { workModel: { contains: "remoto", mode: "insensitive" } },
        { location: { contains: "remote", mode: "insensitive" } },
        { location: { contains: "remoto", mode: "insensitive" } },
        { jobTitle: { contains: "remoto", mode: "insensitive" } },
        { jobTitle: { contains: "remote", mode: "insensitive" } },
      ],
    };
  }
  if (wmLower === "hibrido") {
    return {
      OR: [
        { workModel: { contains: "hibrido", mode: "insensitive" } },
        { location: { contains: "hybrid", mode: "insensitive" } },
        { location: { contains: "hibrido", mode: "insensitive" } },
        { jobTitle: { contains: "hibrid", mode: "insensitive" } },
        { jobTitle: { contains: "hybrid", mode: "insensitive" } },
      ],
    };
  }
  if (wmLower === "presencial") {
    return {
      OR: [
        { workModel: { contains: "presencial", mode: "insensitive" } },
        { location: { contains: "onsite", mode: "insensitive" } },
        { location: { contains: "on-site", mode: "insensitive" } },
        { location: { contains: "presencial", mode: "insensitive" } },
      ],
    };
  }
  return { workModel: { contains: workModel, mode: "insensitive" } };
}
