import type {
  ResumeContact,
  ResumeEducation,
  ResumeExperience,
  ResumeProject,
  ResumeCertification,
  ResumeSkillCategory,
} from '../types/resume.types';

import type {
  ResumeSectionScore,
  ResumeSectionScores,
  ResumeScoreSummary,
} from '../types/resume-section-score.types';

import type {
  LanguageAnalysisResult,
} from '../types/language-analysis.types';

// --------------------------------------------------
// Section type used only for scoring
// --------------------------------------------------

interface ScoredResumeSection {
  normalizedType?: string;
}

// --------------------------------------------------
// Section Score Input
// --------------------------------------------------

interface ResumeSectionScoreInput {
  sections: ScoredResumeSection[];
  contact: ResumeContact;
  skills: ResumeSkillCategory[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  experience: ResumeExperience[];
  certifications: ResumeCertification[];
  languageAnalysis: LanguageAnalysisResult;
  languageScore: number;
}

// --------------------------------------------------
// Score Helper
// --------------------------------------------------

const createScore = (
  score: number,
  applicable = true,
  reason?: string,
): ResumeSectionScore => {
  const result: ResumeSectionScore = {
    score: Math.max(
      0,
      Math.min(
        100,
        Math.round(score),
      ),
    ),
    applicable,
  };

  if (reason !== undefined) {
    result.reason = reason;
  }

  return result;
};

// --------------------------------------------------
// Structure Score
// --------------------------------------------------

const calculateStructureScore = (
  sections: ScoredResumeSection[],
): ResumeSectionScore => {
  if (sections.length === 0) {
    return createScore(
      0,
      false,
      'No resume sections were detected',
    );
  }

  let score = 40;

  const sectionCount =
    sections.length;

  if (sectionCount >= 3) {
    score += 15;
  }

  if (sectionCount >= 5) {
    score += 15;
  }

  const standardSections =
    sections.filter(
      (section) =>
        section.normalizedType !==
        'custom',
    );

  if (standardSections.length >= 3) {
    score += 15;
  }

  if (
    standardSections.length ===
    sectionCount
  ) {
    score += 15;
  }

  return createScore(score);
};

// --------------------------------------------------
// Contact Score
// --------------------------------------------------

const calculateContactScore = (
  contact: ResumeContact,
): ResumeSectionScore => {
  let score = 0;

  if (contact.name?.trim()) {
    score += 30;
  }

  if (contact.email?.trim()) {
    score += 25;
  }

  if (contact.phone?.trim()) {
    score += 20;
  }

  if (contact.location?.trim()) {
    score += 10;
  }

  if (contact.links.length > 0) {
    score += 15;
  }

  return createScore(score);
};

// --------------------------------------------------
// Skills Score
// --------------------------------------------------

const calculateSkillsScore = (
  skills: ResumeSkillCategory[],
): ResumeSectionScore => {
  if (skills.length === 0) {
    return createScore(
      0,
      false,
      'No skills section was detected',
    );
  }

  const allSkills =
    skills.flatMap(
      (category) => category.items,
    );

  if (allSkills.length === 0) {
    return createScore(
      0,
      false,
      'Skills section contains no parseable skills',
    );
  }

  let score = 40;

  if (skills.length >= 2) {
    score += 15;
  }

  if (skills.length >= 3) {
    score += 15;
  }

  if (allSkills.length >= 5) {
    score += 10;
  }

  if (allSkills.length >= 10) {
    score += 10;
  }

  if (allSkills.length >= 15) {
    score += 10;
  }

  return createScore(score);
};

// --------------------------------------------------
// Projects Score
// --------------------------------------------------

const calculateProjectsScore = (
  projects: ResumeProject[],
): ResumeSectionScore => {
  if (projects.length === 0) {
    return createScore(
      0,
      false,
      'No projects section was detected',
    );
  }

  let score = 30;

  if (projects.length >= 2) {
    score += 20;
  }

  if (projects.length >= 3) {
    score += 10;
  }

  const projectsWithDescription =
    projects.filter(
      (project) =>
        Boolean(
          project.description?.trim(),
        ) ||
        project.bullets.length > 0,
    ).length;

  const projectsWithTechnologies =
    projects.filter(
      (project) =>
        project.technologies.length >
        0,
    ).length;

  if (
    projectsWithDescription ===
    projects.length
  ) {
    score += 20;
  }

  if (
    projectsWithTechnologies ===
    projects.length
  ) {
    score += 20;
  }

  return createScore(score);
};

// --------------------------------------------------
// Education Score
// --------------------------------------------------

const calculateEducationScore = (
  education: ResumeEducation[],
): ResumeSectionScore => {
  if (education.length === 0) {
    return createScore(
      0,
      false,
      'No education section was detected',
    );
  }

  let score = 40;

  const entriesWithInstitution =
    education.filter(
      (item) =>
        Boolean(
          item.institution?.trim(),
        ),
    ).length;

  const entriesWithDegree =
    education.filter(
      (item) =>
        Boolean(
          item.degree?.trim(),
        ),
    ).length;

  const entriesWithDates =
    education.filter(
      (item) =>
        Boolean(
          item.startDate?.trim(),
        ) ||
        Boolean(
          item.endDate?.trim(),
        ),
    ).length;

  if (
    entriesWithInstitution ===
    education.length
  ) {
    score += 20;
  }

  if (
    entriesWithDegree ===
    education.length
  ) {
    score += 20;
  }

  if (
    entriesWithDates ===
    education.length
  ) {
    score += 20;
  }

  return createScore(score);
};

// --------------------------------------------------
// Experience Score
// --------------------------------------------------

const calculateExperienceScore = (
  experience: ResumeExperience[],
): ResumeSectionScore => {
  if (experience.length === 0) {
    return createScore(
      0,
      false,
      'No experience section or experience entries were found',
    );
  }

  let score = 30;

  const entriesWithOrganization =
    experience.filter(
      (item) =>
        Boolean(
          item.organization?.trim(),
        ),
    ).length;

  const entriesWithTitle =
    experience.filter(
      (item) =>
        Boolean(
          item.title?.trim(),
        ),
    ).length;

  const entriesWithDates =
    experience.filter(
      (item) =>
        Boolean(
          item.startDate?.trim(),
        ) ||
        Boolean(
          item.endDate?.trim(),
        ),
    ).length;

  const entriesWithBullets =
    experience.filter(
      (item) =>
        item.bullets.length > 0,
    ).length;

  if (
    entriesWithOrganization ===
    experience.length
  ) {
    score += 20;
  }

  if (
    entriesWithTitle ===
    experience.length
  ) {
    score += 20;
  }

  if (
    entriesWithDates ===
    experience.length
  ) {
    score += 10;
  }

  if (
    entriesWithBullets ===
    experience.length
  ) {
    score += 20;
  }

  return createScore(score);
};

// --------------------------------------------------
// Certification Score
// --------------------------------------------------

const calculateCertificationScore = (
  certifications: ResumeCertification[],
): ResumeSectionScore => {
  if (certifications.length === 0) {
    return createScore(
      0,
      false,
      'No certifications were found',
    );
  }

  let score = 50;

  const certificationsWithName =
    certifications.filter(
      (certification) =>
        Boolean(
          certification.name?.trim(),
        ),
    ).length;

  const certificationsWithIssuer =
    certifications.filter(
      (certification) =>
        Boolean(
          certification.issuer?.trim(),
        ),
    ).length;

  const certificationsWithDate =
    certifications.filter(
      (certification) =>
        Boolean(
          certification.date?.trim(),
        ),
    ).length;

  if (
    certificationsWithName ===
    certifications.length
  ) {
    score += 20;
  }

  if (
    certificationsWithIssuer ===
    certifications.length
  ) {
    score += 15;
  }

  if (
    certificationsWithDate ===
    certifications.length
  ) {
    score += 15;
  }

  return createScore(score);
};

// --------------------------------------------------
// Language Score
// --------------------------------------------------

const calculateLanguageSectionScore = (
  languageAnalysis: LanguageAnalysisResult,
  languageScore: number,
): ResumeSectionScore => {
  if (!languageAnalysis.analyzed) {
    return createScore(
      0,
      false,
      'Language analysis was not available',
    );
  }

  return createScore(
    languageScore,
  );
};

// --------------------------------------------------
// ATS Score
// --------------------------------------------------
//
// Education is intentionally excluded.
//
// ATS Score considers only:
//
// 1. Structure
// 2. Contact
// 3. Skills
// 4. Projects
// 5. Language
//
// Education is still analyzed separately.
// Experience and Certifications are also analyzed
// separately when they are present.
// --------------------------------------------------

const calculateAverageScore = (
  sectionScores: ResumeSectionScores,
): ResumeScoreSummary => {
  // Only these five sections contribute
  // to the final ATS Score.
  const atsSections = [
    sectionScores.structure,
    sectionScores.contact,
    sectionScores.skills,
    sectionScores.projects,
    sectionScores.language,
  ];

  const applicableScores =
    atsSections
      .filter(
        (section) =>
          section.applicable,
      )
      .map(
        (section) =>
          section.score,
      );

  if (
    applicableScores.length === 0
  ) {
    return {
      sectionScores,
      averageScore: 0,
      scoredSectionCount: 0,
    };
  }

  const total =
    applicableScores.reduce(
      (sum, score) =>
        sum + score,
      0,
    );

  const averageScore =
    Math.round(
      total /
        applicableScores.length,
    );

  return {
    sectionScores,
    averageScore,
    scoredSectionCount:
      applicableScores.length,
  };
};

// --------------------------------------------------
// Main Section Score Analysis
// --------------------------------------------------

export const calculateResumeSectionScores = (
  input: ResumeSectionScoreInput,
): ResumeScoreSummary => {
  const sectionScores: ResumeSectionScores = {
    structure:
      calculateStructureScore(
        input.sections,
      ),

    contact:
      calculateContactScore(
        input.contact,
      ),

    skills:
      calculateSkillsScore(
        input.skills,
      ),

    projects:
      calculateProjectsScore(
        input.projects,
      ),

    education:
      calculateEducationScore(
        input.education,
      ),

    experience:
      calculateExperienceScore(
        input.experience,
      ),

    certifications:
      calculateCertificationScore(
        input.certifications,
      ),

    language:
      calculateLanguageSectionScore(
        input.languageAnalysis,
        input.languageScore,
      ),
  };

  return calculateAverageScore(
    sectionScores,
  );
};