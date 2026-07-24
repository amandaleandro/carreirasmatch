export interface ScrapedOpportunity {
  externalKey: string;
  title: string;
  company?: string;
  description: string;
  url: string;
  city: string;
  state: string;
  salary?: string;
  experience?: string;
  education?: string;
  type: "vaga" | "curso" | "evento";
}

export interface CityScraper {
  cityId: string;
  cityName: string;
  state: string;
  scrape(): Promise<ScrapedOpportunity[]>;
}
