import type {
  OllamaAnalysis,
} from '../validations/ollama.validation';

import {
  validateOllamaResult,
} from './ollama-result.service';

import type {
  DetectedResumeSection,
} from './section-detector.service';

import type {
  ParsedSkillCategory,
} from './skills-parser.service';

import type {
  ParsedProject,
} from './project-parser.service';

import type {
  ResumeExperience,
} from '../types/resume.types';

const OLLAMA_URL =
  process.env.OLLAMA_URL ??
  'http://localhost:11434';

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL ??
  'llama3.2:3b';

interface OllamaChatResponse {
  message?: {
    role?: string;
    content?: string;
  };
}

/**
 * Find a specific detected resume section.
 */
const findSection = (
  sections: DetectedResumeSection[],
  normalizedType: string,
): DetectedResumeSection | undefined => {
  return sections.find(
    (section) =>
      section.normalizedType === normalizedType,
  );
};

/**
 * Build a FLAT list of skills.
 *
 * Important:
 *
 * Ollama receives individual skill values instead
 * of category strings.
 *
 * This prevents output such as:
 *
 * "Frontend: React.js, Redux, JavaScript..."
 *
 * being treated as one skill.
 */
const buildSkillsReference = (
  parsedSkills: ParsedSkillCategory[],
): string => {
  const skills = parsedSkills.flatMap(
    (category) => category.items,
  );

  if (skills.length === 0) {
    return 'No skills detected.';
  }

  return skills
    .map(
      (skill, index) =>
        `${index + 1}. ${skill}`,
    )
    .join('\n');
};

/**
 * Build already-parsed project information.
 *
 * Project detection is handled by TypeScript.
 *
 * Ollama only performs semantic analysis.
 */
const buildProjectsReference = (
  parsedProjects: ParsedProject[],
): string => {
  if (parsedProjects.length === 0) {
    return 'No projects detected.';
  }

  return parsedProjects
    .map(
      (project) => `
PROJECT ID: ${project.id}

PROJECT NAME: ${project.name}

EXTRACTED TECHNOLOGIES:
${
  project.technologies.length > 0
    ? project.technologies.join(', ')
    : 'None detected'
}

PROJECT BULLETS:
${
  project.bullets.length > 0
    ? project.bullets.join('\n')
    : 'None detected'
}
`,
    )
    .join(
      '\n------------------------------\n',
    );
};

/**
 * Build already-parsed employment experience.
 *
 * Experience detection and structure are handled
 * by TypeScript.
 *
 * Ollama only performs semantic interpretation.
 */
const buildExperienceReference = (
  parsedExperiences: ResumeExperience[],
): string => {
  if (
    parsedExperiences.length === 0
  ) {
    return 'No employment experience detected.';
  }

  return parsedExperiences
    .map(
      (experience) => `
EXPERIENCE ID: ${experience.id}

TITLE:
${experience.title ?? ''}

ORGANIZATION:
${experience.organization ?? ''}

LOCATION:
${experience.location ?? ''}

START DATE:
${experience.startDate ?? ''}

END DATE:
${experience.endDate ?? ''}

CURRENT:
${experience.isCurrent === true ? 'Yes' : 'No'}

EMPLOYMENT TYPE:
${experience.employmentType ?? ''}

EXPERIENCE BULLETS:
${
  experience.bullets.length > 0
    ? experience.bullets.join('\n')
    : 'None detected'
}

RAW EXPERIENCE TEXT:
${experience.rawText ?? ''}
`,
    )
    .join(
      '\n------------------------------\n',
    );
};

/**
 * Builds the AI semantic-analysis prompt.
 *
 * Architecture:
 *
 * PDF
 *   ↓
 * deterministic parsing
 *   ↓
 * structured resume data
 *   ↓
 * Ollama semantic analysis
 *   ↓
 * deterministic scoring
 *
 * Ollama does NOT calculate the final score.
 */
const buildResumeAnalysisPrompt = (
  sections: DetectedResumeSection[],
  parsedSkills: ParsedSkillCategory[],
  parsedProjects: ParsedProject[],
  parsedExperiences: ResumeExperience[],
): string => {
  const summarySection =
    findSection(
      sections,
      'summary',
    );

  const certificationsSection =
    findSection(
      sections,
      'certifications',
    );

  const experienceSection =
    findSection(
      sections,
      'experience',
    );

  const summary =
    summarySection?.content?.trim() ?? '';

  const certifications =
    certificationsSection?.content?.trim() ?? '';

  const experience =
    experienceSection?.content?.trim() ?? '';

  const skillsReference =
    buildSkillsReference(parsedSkills);

  const projectsReference =
    buildProjectsReference(parsedProjects);

  const experienceReference =
    buildExperienceReference(
      parsedExperiences,
    );

  return `
You are a strict resume semantic analysis system.

Return ONLY one valid JSON object.

Do not use markdown.
Do not explain anything outside JSON.
Do not calculate a score.
Do not recommend jobs.
Do not rewrite the resume.
Do not invent information.

==================================================
AVAILABLE RESUME SKILLS
==================================================

These are the ONLY skills you may return in:

- demonstratedSkills
- supportedSkills
- mentionedSkills

${skillsReference}

IMPORTANT:

Each skill is an individual value.

When returning a skill, copy the skill EXACTLY
from the list above.

NEVER combine multiple skills into one array item.

BAD:
"Frontend: React.js, Redux, JavaScript"

GOOD:
"React.js"
"Redux"
"JavaScript (ES6+)"

==================================================
PROJECTS
==================================================

Projects have already been detected by TypeScript.

Analyze ONLY these projects:

${projectsReference}

For every supplied project return:

- id
- name
- type
- description
- technologies
- demonstratedSkills
- relevanceToDevelopment

Rules:

1. Preserve the exact project ID.

2. Preserve the exact project name.

3. Do not create projects.

4. Do not remove projects.

5. Do not merge projects.

6. Do not split projects.

7. Technologies must come from the extracted
   technologies provided above.

8. Do not invent technologies.

9. demonstratedSkills must contain only individual
   skills from AVAILABLE RESUME SKILLS.

10. demonstratedSkills must be supported by the
    project bullets.

11. relevanceToDevelopment must be a short
    evidence-based explanation.

12. type and relevanceToDevelopment are different.

type example:
"Full-Stack Web Development"

relevanceToDevelopment example:
"Demonstrates full-stack development through
React.js UI development, Node.js and Express.js
APIs, MongoDB data handling, authentication,
and frontend-backend integration."

Possible project types:

Frontend Development
Backend Development
Full-Stack Web Development
Mobile Development
Data Science
Machine Learning
AI
DevOps
Cybersecurity
Testing / QA
Data Analytics
Other

If no projects exist:

"projects": []

==================================================
CERTIFICATIONS
==================================================

Certification section:

${
  certifications ||
  'NO CERTIFICATION SECTION'
}

If there is NO certification section:

"certifications": []

Do not invent certifications.

If certifications exist, analyze only certifications
actually present.

For each certification return:

- id
- name
- issuer when present
- status when present
- date when present
- domain
- supportedSkills

supportedSkills must contain only individual
skills from AVAILABLE RESUME SKILLS.

Possible domains:

Web Development
Backend Development
Database
Cloud
DevOps
Cybersecurity
Data Analytics
Data Science
Machine Learning
Programming
Testing / QA
Other

==================================================
EMPLOYMENT EXPERIENCE
==================================================

Experience has already been detected and parsed
by TypeScript.

Use the following structured experience data:

${experienceReference}

The original detected Experience section is also
provided below for semantic context:

${
  experience ||
  'NO EMPLOYMENT EXPERIENCE SECTION'
}

IMPORTANT:

Only analyze actual employment experience.

DO NOT treat these as employment:

- projects
- personal projects
- college projects
- coding clubs
- college clubs
- activities
- academic activities
- volunteer activities

Do not invent employment.

For every supplied experience return:

- id
- title
- organization when present
- employmentType when present
- startDate when present
- endDate when present
- isCurrent when present
- domain
- demonstratedSkills

Rules:

1. Preserve the exact EXPERIENCE ID supplied by
   TypeScript.

2. Preserve the exact experience title.

3. Do not create experience entries.

4. Do not remove experience entries.

5. Do not merge experience entries.

6. Do not split experience entries.

7. demonstratedSkills must contain only individual
   skills from AVAILABLE RESUME SKILLS.

8. demonstratedSkills must be supported by the
   experience bullets or raw experience text.

9. Do not return a skill only because it is common
   for the job title.

10. Return a skill only when the experience provides
    evidence that the skill was actually used or
    demonstrated.

11. If no supported resume skill can be identified,
    return:

    "demonstratedSkills": []

12. Do not invent technologies or skills.

13. Do not convert general responsibilities into
    technical skills without evidence.

14. The experience ID must come from the supplied
    TypeScript experience data.

If no employment experience exists:

"experience": []

==================================================
PROFILE
==================================================

Analyze ONLY the Summary.

SUMMARY:

${
  summary ||
  'NO SUMMARY SECTION'
}

Return:

- summary
- mentionedRoles
- mentionedSkills
- strengths
- issues

Rules:

mentionedRoles:

Only roles explicitly mentioned in the Summary.

mentionedSkills:

Only individual skills explicitly mentioned in
the Summary AND present in AVAILABLE RESUME SKILLS.

Do not return skill categories.

For example:

BAD:
"Frontend: React.js, Redux"

GOOD:
"React.js"

strengths:

Only identify strengths supported by the Summary.

issues:

Only identify genuine issues supported by the Summary.

Do not invent issues.

If no Summary exists:

summary: ""

mentionedRoles: []

mentionedSkills: []

strengths: []

issues: []

==================================================
NO-INVENTION RULE
==================================================

Never invent:

- projects
- certifications
- employment
- internships
- companies
- technologies
- skills
- dates
- achievements
- qualifications
- roles

Never use placeholder values.

If information does not exist:

Use an empty array.

If a required string cannot be safely determined:

Use an empty string.

==================================================
OUTPUT CONTRACT
==================================================

The top-level object MUST contain:

projects
certifications
experience
profile

The profile object MUST contain:

summary
mentionedRoles
mentionedSkills
strengths
issues

Every project object MUST contain:

id
name
type
description
technologies
demonstratedSkills
relevanceToDevelopment

Every certification object MUST contain:

id
name
domain
supportedSkills

Every experience object MUST contain:

id
title
domain
demonstratedSkills

Optional experience fields:

organization
employmentType
startDate
endDate
isCurrent

==================================================
FINAL CHECK
==================================================

Before returning:

- Return JSON only.
- Include every detected project.
- Preserve project IDs.
- Preserve project names.
- Include every detected employment experience.
- Preserve experience IDs.
- Preserve experience titles.
- Use individual skills only.
- Never combine skill categories into one skill.
- Do not invent projects.
- Do not invent certifications.
- Do not invent employment.
- Activities are NOT employment.
- Certifications are [] when absent.
- Experience is [] when absent.
- demonstratedSkills must use available skills.
- supportedSkills must use available skills.
- mentionedSkills must use available skills.
- Summary must be preserved.
- Do not calculate a score.
- Do not recommend jobs.

Return the JSON now.
`;
};

/**
 * Sends structured resume information to Ollama.
 *
 * Ollama performs semantic analysis only.
 * Final scoring is handled separately.
 */
export const parseResumeSectionsWithOllama =
  async (
    sections: DetectedResumeSection[],
    parsedSkills: ParsedSkillCategory[] = [],
    parsedProjects: ParsedProject[] = [],
    parsedExperiences: ResumeExperience[] = [],
  ): Promise<OllamaAnalysis> => {
    const prompt =
      buildResumeAnalysisPrompt(
        sections,
        parsedSkills,
        parsedProjects,
        parsedExperiences,
      );

    const response = await fetch(
      `${OLLAMA_URL}/api/chat`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          model: OLLAMA_MODEL,

          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],

          stream: false,

          format: 'json',

          keep_alive: '10m',

          options: {
            temperature: 0,

            /*
             * Keep enough room for the structured
             * analysis without going back to 1800.
             */
            num_predict: 1000,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Ollama request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data =
      (await response.json()) as OllamaChatResponse;

    const content =
      data.message?.content;

    if (!content) {
      throw new Error(
        'Ollama returned an empty response',
      );
    }

    /*
     * Parse JSON + validate using Zod.
     */
    return validateOllamaResult(content);
  };