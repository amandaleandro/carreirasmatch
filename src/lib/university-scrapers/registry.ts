import { UniversityScraper } from "./types";
import { createSigaaCourseScraper } from "./sigaa";
import { createSigaaBrowserCourseScraper } from "./sigaa-browser";
import { createSigaaInstitutionScraper } from "./sigaa-institution";
import { createUfuCatalogScraper } from "./ufu";

/**
 * Cada instituição do SIGAA publica sua matriz curricular num link próprio; não dá
 * para "descobrir" todas de uma vez, então este registry cresce igual o de
 * city-scrapers/multi-city-sync.ts: uma entrada nova por curso/universidade real.
 */
export const REGISTERED_UNIVERSITY_SCRAPERS: UniversityScraper[] = [
  createUfuCatalogScraper(),
  createSigaaCourseScraper({
    universityName: "Universidade Federal de Goiás",
    city: "Goiânia",
    state: "GO",
    website: "https://www.ufg.br",
    courseTitle: "Administração",
    area: "administracao",
    curriculumUrl: "https://sigaa.sistemas.ufg.br/sigaa/link/public/curso/curriculo/94142302",
  }),
  createSigaaCourseScraper({
    universityName: "Universidade Federal do Maranhão",
    city: "São Luís",
    state: "MA",
    website: "https://portais.ufma.br",
    courseTitle: "Ciência da Computação",
    area: "ti",
    subarea: "tecnologia da informacao",
    curriculumUrl: "https://sigaa.ufma.br/sigaa/link/public/curso/curriculo/86106",
  }),
  createSigaaCourseScraper({
    universityName: "Universidade Federal do Maranhão",
    city: "São Luís",
    state: "MA",
    website: "https://portais.ufma.br",
    courseTitle: "Direito",
    area: "direito",
    curriculumUrl: "https://sigaa.ufma.br/sigaa/link/public/curso/curriculo/20565232",
  }),
  createSigaaCourseScraper({
    universityName: "Universidade Federal do Maranhão",
    city: "São Luís",
    state: "MA",
    website: "https://portais.ufma.br",
    courseTitle: "Matemática (Licenciatura)",
    area: "exatas",
    curriculumUrl: "https://sigaa.ufma.br/sigaa/link/public/curso/curriculo/86197",
  }),

  // Cursos cuja grade só abre com clique (postback JSF), raspados via
  // navegador (sigaa-browser.ts) em vez de fetch+cheerio puro.
  createSigaaBrowserCourseScraper({
    universityName: "Universidade Federal de Goiás",
    city: "Goiânia",
    state: "GO",
    website: "https://www.ufg.br",
    courseTitle: "Ciência da Computação",
    area: "ti",
    domain: "sigaa.sistemas.ufg.br",
    courseId: "69673254",
  }),
  createSigaaBrowserCourseScraper({
    universityName: "Universidade Federal do Maranhão",
    city: "São Luís",
    state: "MA",
    website: "https://portais.ufma.br",
    courseTitle: "Farmácia",
    area: "farmacia",
    domain: "sigaa.ufma.br",
    courseId: "85827",
  }),
  createSigaaBrowserCourseScraper({
    universityName: "Universidade Federal do Maranhão",
    city: "São Luís",
    state: "MA",
    website: "https://portais.ufma.br",
    courseTitle: "Enfermagem",
    area: "enfermagem",
    domain: "sigaa.ufma.br",
    courseId: "85789",
  }),
  createSigaaBrowserCourseScraper({
    universityName: "Universidade Federal do Maranhão",
    city: "São Luís",
    state: "MA",
    website: "https://portais.ufma.br",
    courseTitle: "Psicologia",
    area: "psicologia",
    domain: "sigaa.ufma.br",
    courseId: "85820",
  }),
  createSigaaBrowserCourseScraper({
    universityName: "Universidade Federal do Maranhão",
    city: "São Luís",
    state: "MA",
    website: "https://portais.ufma.br",
    courseTitle: "Ciências Contábeis",
    area: "financas",
    domain: "sigaa.ufma.br",
    courseId: "85772",
  }),
  createSigaaBrowserCourseScraper({
    universityName: "Universidade Federal do Maranhão",
    city: "São Luís",
    state: "MA",
    website: "https://portais.ufma.br",
    courseTitle: "Design",
    area: "design",
    domain: "sigaa.ufma.br",
    courseId: "85787",
  }),
  createSigaaBrowserCourseScraper({
    universityName: "Universidade Federal do Maranhão",
    city: "São Luís",
    state: "MA",
    website: "https://portais.ufma.br",
    courseTitle: "Comunicação Social - Jornalismo",
    area: "comunicacao",
    domain: "sigaa.ufma.br",
    courseId: "85804",
  }),

  // Descoberta automática por instituição (ver sigaa-institution.ts): em vez de
  // cadastrar curso por curso à mão, cada entrada abaixo varre sozinha TODOS os
  // cursos de graduação presenciais da instituição, avançando alguns por execução
  // do cron. Domínios confirmados manualmente antes de entrar aqui — só
  // instituições onde o fluxo completo (listar cursos → abrir grade) foi validado.
  createSigaaInstitutionScraper({
    universityName: "Universidade Federal do Maranhão",
    city: "São Luís",
    state: "MA",
    website: "https://portais.ufma.br",
    domain: "sigaa.ufma.br",
  }),
  createSigaaInstitutionScraper({
    universityName: "Universidade Federal do Rio Grande do Norte",
    city: "Natal",
    state: "RN",
    website: "https://www.ufrn.br",
    domain: "sigaa.ufrn.br",
  }),
  createSigaaInstitutionScraper({
    universityName: "Universidade Federal da Bahia",
    city: "Salvador",
    state: "BA",
    website: "https://www.ufba.br",
    domain: "sigaa.ufba.br",
  }),
  createSigaaInstitutionScraper({
    universityName: "Universidade Federal da Paraíba",
    city: "João Pessoa",
    state: "PB",
    website: "https://www.ufpb.br",
    domain: "sigaa.ufpb.br",
  }),
  createSigaaInstitutionScraper({
    universityName: "Universidade Federal de Pernambuco",
    city: "Recife",
    state: "PE",
    website: "https://www.ufpe.br",
    domain: "sigaa.ufpe.br",
  }),
];
