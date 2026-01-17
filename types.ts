
export enum AppMode {
  GENERATOR = 'GENERATOR',
  CHECKER = 'CHECKER'
}

export interface SkillItem {
  name: string;
  category: string;
}

export interface CVSections {
  professionalSummary: string;
  coreCompetencies: string[];
  keyProjects: { title: string; description: string }[];
  experience: { role: string; bulletPoints: string[] }[];
}

export interface GeneratorResponse {
  suggestedSkills: SkillItem[];
  cvSections: CVSections;
  cta: string;
  canvaLogic: string;
}

export interface SkillGap {
  skill: string;
  suggestedCourse: string;
  platform: 'Coursera Professional Certificate' | 'Udemy Best-Seller Course' | 'DataCamp Career Track' | 'LinkedIn Learning';
  reason: string;
}

export interface CheckerResponse {
  skillGaps: SkillGap[];
}
