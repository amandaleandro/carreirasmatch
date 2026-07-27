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
  scrape(): Promise<ScrapedUniversityCourse[]>;
}
