export type FetchedJob = {
  url: string;
  jobTitle: string;
  jobText: string;
  source: string;
  location?: string;
};

export type JobSearchTerms = {
  titleEn: string;
  titlePt: string;
  keywords: string[];
};
