// --------------------------------------------------
// Resume Suggestion Types
// --------------------------------------------------

export type ResumeSuggestionCategory =
  | 'structure'
  | 'contact'
  | 'skills'
  | 'projects'
  | 'language'
  | 'education'
  | 'experience'
  | 'certifications';

export type ResumeSuggestionPriority =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

export interface ResumeSuggestion {
  category: ResumeSuggestionCategory;
  priority: ResumeSuggestionPriority;
  title: string;
  message: string;
}

export interface ResumeSuggestions {
  suggestions: ResumeSuggestion[];
}