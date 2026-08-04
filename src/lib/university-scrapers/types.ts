export interface ScrapedSubject {
  name: string;
  semester?: number;
}

export interface ScrapedUniversityCourse {
  title: string;
  url: string;
  area: string;
  subarea?: string;
  modality?: string;
  subjects: ScrapedSubject[];
}

export interface UniversityScraper {
  universityName: string;
  city: string;
  state: string;
  website: string;
  /** Identificador estável da fonte; permite misturar SIGAA, catálogos UFU,
   * portais particulares e, futuramente, o catálogo nacional do MEC. */
  source?: string;
  scrape(): Promise<ScrapedUniversityCourse[]>;
}
