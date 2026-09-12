import type {
  ResumeContact,
  ResumeEducation,
  ResumeExperience,
} from '../types/resume.types';

import type {
  ResumeSectionScores,
} from '../types/resume-section-score.types';

import type {
  ResumeSuggestion,
  ResumeSuggestions,
  ResumeSuggestionCategory,
  ResumeSuggestionPriority,
} from '../types/resume-suggestion.types';

// --------------------------------------------------
// Project Skill Alignment Types
// --------------------------------------------------

interface ProjectSkillAlignmentItem {
  projectId: string;
  projectName: string;
  matchedSkills: string[];
  projectOnlySkills: string[];
  alignmentPercentage: number;
  alignmentStatus: string;
}

interface ProjectSkillAlignment {
  projects: ProjectSkillAlignmentItem[];
  overallAlignmentPercentage: number;
  projectOnlySkills: string[];
}

// --------------------------------------------------
// Suggestion Rule
// --------------------------------------------------

interface SuggestionRule {
  category: ResumeSuggestionCategory;
  priority: ResumeSuggestionPriority;
  minScore: number;
  title: string;
  message: string;
}

// --------------------------------------------------
// Generic Score-Based Suggestion Rules
// --------------------------------------------------

const suggestionRules: SuggestionRule[] = [
  {
    category: 'structure',
    priority: 'high',
    minScore: 60,
    title: 'Improve resume structure',
    message:
      'Improve the organization and consistency of your resume sections. Use clear standard section headings and maintain a consistent structure throughout the resume.',
  },
  {
    category: 'structure',
    priority: 'medium',
    minScore: 80,
    title: 'Polish resume structure',
    message:
      'Your resume structure is good, but you can improve consistency in section organization and formatting.',
  },
  {
    category: 'skills',
    priority: 'high',
    minScore: 60,
    title: 'Improve your skills section',
    message:
      'Organize your technical skills into clear categories and make sure the important skills demonstrated in your projects are represented in the Skills section.',
  },
  {
    category: 'skills',
    priority: 'medium',
    minScore: 80,
    title: 'Strengthen your skills section',
    message:
      'Your skills section is good, but review whether the technologies demonstrated in your projects are also represented in your Technical Skills section.',
  },
  {
    category: 'projects',
    priority: 'high',
    minScore: 60,
    title: 'Improve your projects section',
    message:
      'Add clear project descriptions, technologies used, and specific contributions to make your projects stronger and easier to evaluate.',
  },
  {
    category: 'projects',
    priority: 'medium',
    minScore: 80,
    title: 'Strengthen your project descriptions',
    message:
      'Your projects are well represented, but you can make them stronger by emphasizing your contribution, implementation details, and technologies used.',
  },
  {
    category: 'language',
    priority: 'high',
    minScore: 60,
    title: 'Improve resume language',
    message:
      'Review grammar, spelling, and writing clarity issues in your resume. Use concise and professional language.',
  },
  {
    category: 'language',
    priority: 'medium',
    minScore: 80,
    title: 'Polish resume language',
    message:
      'Your resume language is generally good, but review the detected language issues and improve clarity where necessary.',
  },
];

// --------------------------------------------------
// Get Applicable ATS Sections
// --------------------------------------------------

const getAtsSections = (
  sectionScores: ResumeSectionScores,
): Array<{
  category: ResumeSuggestionCategory;
  score: number;
  applicable: boolean;
}> => {
  return [
    {
      category: 'structure',
      score: sectionScores.structure.score,
      applicable:
        sectionScores.structure.applicable,
    },
    {
      category: 'contact',
      score: sectionScores.contact.score,
      applicable:
        sectionScores.contact.applicable,
    },
    {
      category: 'skills',
      score: sectionScores.skills.score,
      applicable:
        sectionScores.skills.applicable,
    },
    {
      category: 'projects',
      score: sectionScores.projects.score,
      applicable:
        sectionScores.projects.applicable,
    },
    {
      category: 'language',
      score: sectionScores.language.score,
      applicable:
        sectionScores.language.applicable,
    },
  ];
};

// --------------------------------------------------
// Generic Section Suggestion
// --------------------------------------------------

const createGenericSuggestion = (
  category: ResumeSuggestionCategory,
  score: number,
): ResumeSuggestion | null => {
  if (score >= 100) {
    return null;
  }

  const matchingRule =
    suggestionRules
      .filter(
        (rule) =>
          rule.category === category &&
          score >= rule.minScore,
      )
      .sort(
        (a, b) =>
          b.minScore - a.minScore,
      )[0];

  if (matchingRule === undefined) {
    return null;
  }

  return {
    category:
      matchingRule.category,
    priority:
      matchingRule.priority,
    title:
      matchingRule.title,
    message:
      matchingRule.message,
  };
};

// --------------------------------------------------
// Contact Mention Detection
// --------------------------------------------------

const hasMentionedProfessionalLink = (
  text: string,
  linkName: string,
): boolean => {
  return new RegExp(
    `\\b${linkName}\\b`,
    'i',
  ).test(text);
};

// --------------------------------------------------
// Specific Contact Suggestions
// --------------------------------------------------

const createContactSuggestions = (
  contact: ResumeContact,
  cleanText?: string,
): ResumeSuggestion[] => {
  const suggestions: ResumeSuggestion[] =
    [];

  // ------------------------------------------------
  // Missing name
  // ------------------------------------------------

  if (!contact.name?.trim()) {
    suggestions.push({
      category: 'contact',
      priority: 'high',
      title: 'Add your full name',
      message:
        'Add your full name clearly at the top of your resume so recruiters and ATS systems can identify you correctly.',
    });
  }

  // ------------------------------------------------
  // Missing email
  // ------------------------------------------------

  if (!contact.email?.trim()) {
    suggestions.push({
      category: 'contact',
      priority: 'high',
      title: 'Add a professional email',
      message:
        'Add a professional email address to your contact section so recruiters can contact you.',
    });
  }

  // ------------------------------------------------
  // Missing phone
  // ------------------------------------------------

  if (!contact.phone?.trim()) {
    suggestions.push({
      category: 'contact',
      priority: 'high',
      title: 'Add your phone number',
      message:
        'Add a valid phone number to your contact section so recruiters can contact you directly.',
    });
  }

  // ------------------------------------------------
  // Missing location
  // ------------------------------------------------

  if (!contact.location?.trim()) {
    suggestions.push({
      category: 'contact',
      priority: 'low',
      title: 'Add your location',
      message:
        'Consider adding your city and country to your contact section so recruiters can understand your location.',
    });
  }

  // ------------------------------------------------
  // Professional links
  // ------------------------------------------------

  if (contact.links.length === 0) {
    const sourceText =
      cleanText ?? '';

    const mentionedLinkedIn =
      hasMentionedProfessionalLink(
        sourceText,
        'LinkedIn',
      );

    const mentionedGitHub =
      hasMentionedProfessionalLink(
        sourceText,
        'GitHub',
      );

    const mentionedPortfolio =
      hasMentionedProfessionalLink(
        sourceText,
        'Portfolio',
      );

    if (
      mentionedLinkedIn ||
      mentionedGitHub ||
      mentionedPortfolio
    ) {
      const mentionedLinks: string[] =
        [];

      if (mentionedLinkedIn) {
        mentionedLinks.push(
          'LinkedIn',
        );
      }

      if (mentionedGitHub) {
        mentionedLinks.push(
          'GitHub',
        );
      }

      if (mentionedPortfolio) {
        mentionedLinks.push(
          'Portfolio',
        );
      }

      suggestions.push({
        category: 'contact',
        priority: 'medium',
        title:
          'Add complete professional links',
        message:
          `Your resume mentions ${mentionedLinks.join(
            ', ',
          )}, but complete URLs were not detected. Add the full ${mentionedLinks.join(
            ', ',
          )} URL${mentionedLinks.length > 1 ? 's' : ''} to your contact section.`,
      });
    } else {
      suggestions.push({
        category: 'contact',
        priority: 'medium',
        title:
          'Add professional profile links',
        message:
          'Consider adding relevant professional links such as LinkedIn, GitHub, or a portfolio to help recruiters review your professional work.',
      });
    }
  }

  return suggestions;
};

// --------------------------------------------------
// Education Suggestions
// --------------------------------------------------

const createEducationSuggestions = (
  education: ResumeEducation[],
  experience: ResumeExperience[],
): ResumeSuggestion[] => {
  // ------------------------------------------------
  // Education exists
  // ------------------------------------------------

  if (education.length > 0) {
    return [];
  }

  // ------------------------------------------------
  // Education missing + no experience
  // ------------------------------------------------
  // This can indicate a fresher / early-career
  // resume, so give a fresher-specific suggestion.
  // ------------------------------------------------

  if (experience.length === 0) {
    return [
      {
        category: 'education',
        priority: 'high',
        title: 'Add your Education section',
        message:
          'As a fresher or early-career candidate, add your Education section with your degree, institution, and relevant academic details so recruiters can understand your academic background.',
      },
    ];
  }

  // ------------------------------------------------
  // Education missing + experience exists
  // ------------------------------------------------

  return [
    {
      category: 'education',
      priority: 'medium',
      title: 'Add your Education section',
      message:
        'Add your Education section with your degree, institution, and relevant academic details to provide a complete overview of your background.',
    },
  ];
};

// --------------------------------------------------
// Project → Skills Suggestions
// --------------------------------------------------

const createProjectSkillSuggestions = (
  projectSkillAlignment?: ProjectSkillAlignment,
): ResumeSuggestion[] => {
  if (
    projectSkillAlignment === undefined
  ) {
    return [];
  }

  const suggestions: ResumeSuggestion[] =
    [];

  for (const project of
    projectSkillAlignment.projects) {
    if (
      project.projectOnlySkills.length ===
      0
    ) {
      continue;
    }

    for (const skill of
      project.projectOnlySkills) {
      suggestions.push({
        category: 'skills',
        priority: 'medium',
        title:
          'Add project technology to Skills',
        message:
          `${skill} is used in your ${project.projectName} project but is not currently listed in your Technical Skills section. Add it if you are comfortable using this technology.`,
      });
    }
  }

  return suggestions;
};

// --------------------------------------------------
// Sort Suggestions
// --------------------------------------------------

const priorityOrder: Record<
  ResumeSuggestionPriority,
  number
> = {
  critical: 1,
  high: 2,
  medium: 3,
  low: 4,
};

const sortSuggestions = (
  suggestions: ResumeSuggestion[],
): ResumeSuggestion[] => {
  return [...suggestions].sort(
    (a, b) =>
      priorityOrder[a.priority] -
      priorityOrder[b.priority],
  );
};

// --------------------------------------------------
// Main Suggestion Analysis
// --------------------------------------------------

export const generateResumeSuggestions = (
  sectionScores: ResumeSectionScores,
  contact: ResumeContact,
  cleanText?: string,
  projectSkillAlignment?: ProjectSkillAlignment,
  education: ResumeEducation[] = [],
  experience: ResumeExperience[] = [],
): ResumeSuggestions => {
  const atsSections =
    getAtsSections(sectionScores);

  const suggestions: ResumeSuggestion[] =
    [];

  for (const section of atsSections) {
    if (!section.applicable) {
      continue;
    }

    // ----------------------------------------------
    // Contact uses specific suggestions
    // ----------------------------------------------

    if (
      section.category ===
      'contact'
    ) {
      if (section.score < 100) {
        suggestions.push(
          ...createContactSuggestions(
            contact,
            cleanText,
          ),
        );
      }

      continue;
    }

    // ----------------------------------------------
    // Other sections currently use generic
    // score-based suggestions
    // ----------------------------------------------

    const suggestion =
      createGenericSuggestion(
        section.category,
        section.score,
      );

    if (suggestion !== null) {
      suggestions.push(suggestion);
    }
  }

  // ----------------------------------------------
  // Education suggestions
  // ----------------------------------------------

  suggestions.push(
    ...createEducationSuggestions(
      education,
      experience,
    ),
  );

  // ----------------------------------------------
  // Project → Skills relationship suggestions
  // ----------------------------------------------

  suggestions.push(
    ...createProjectSkillSuggestions(
      projectSkillAlignment,
    ),
  );

  return {
    suggestions:
      sortSuggestions(suggestions),
  };
};