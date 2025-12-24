export type Phase = 'idea' | 'content' | 'demand' | 'mvp';

export interface ProjectState {
  idea: string;
  niche: string;
  d3Analysis: string | null;
  videoScript: string | null;
  demandData: {
    comments: number;
    wants: number; // How many "I want this"
    feedback: string;
  };
  demandAnalysis: string | null;
  isGo: boolean;
  mvpSpecs: string | null;
}

export const INITIAL_STATE: ProjectState = {
  idea: '',
  niche: '',
  d3Analysis: null,
  videoScript: null,
  demandData: {
    comments: 0,
    wants: 0,
    feedback: '',
  },
  demandAnalysis: null,
  isGo: false,
  mvpSpecs: null,
};