// src/services/ollama.service.ts

import type {
  OllamaSectionResult,
} from '../validations/ollama.validation';

import {
  validateOllamaResult,
} from './ollama-result.service';

import type {
  DetectedResumeSection,
} from './section-detector.service';

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
 * Builds a prompt for parsing detected resume sections.
 *
 * IMPORTANT:
 *
 * The section detector has already identified the
 * boundaries of the resume.
 *
 * Ollama should NOT parse the entire resume again.
 *
 * For known sections, the section type is already known.
 *
 * For unknown/custom sections, Ollama may determine
 * whether the section represents one of our supported
 * resume categories.
 */
const buildSectionPrompt = (
  section: DetectedResumeSection,
): string => {
  const isUnknown =
    section.detectionMethod === 'unknown';

  return `
You are a resume section extraction system.

Your job is to extract structured information from ONE
resume section.

The section boundary has already been determined by the
application.

Do NOT analyze the entire candidate.

Do NOT score the resume.

Do NOT recommend jobs.

Do NOT judge the candidate.

Do NOT invent information.

Do NOT add information that is not present.

Return ONLY valid JSON.

Do NOT return markdown.

Do NOT return explanations.

Do NOT return code fences.

--------------------------------------------------
SECTION INFORMATION
--------------------------------------------------

Original heading:
${section.heading}

Detected section type:
${section.normalizedType}

Detection method:
${section.detectionMethod}

--------------------------------------------------
IMPORTANT CLASSIFICATION RULE
--------------------------------------------------

${
  isUnknown
    ? `
The application could not confidently determine the
semantic type of this section.

Determine whether this section most closely represents:

- summary
- skills
- experience
- education
- projects
- certifications
- custom

If it clearly represents one of the supported categories,
use that category.

If it does not clearly represent one of them, use:

"custom"

Do NOT force the section into a category when the
evidence is insufficient.
`
    : `
The application already determined the section type.

Trust the detected section type:

${section.normalizedType}

Do NOT change the section type simply because the content
contains words associated with another category.
`
}

--------------------------------------------------
GENERAL RULES
--------------------------------------------------

1. Extract only information present in this section.

2. Do not invent missing information.

3. Preserve the original meaning.

4. Preserve original wording where practical.

5. Do not create information from assumptions.

6. Do not create URLs unless an actual URL exists.

7. Do not create empty objects for information that does
   not exist.

8. If a list has no items, return [].

9. Optional fields should be omitted when information is
   unavailable.

10. Do not use null for optional fields.

11. IDs should be simple deterministic identifiers such as:
    "experience-1"
    "education-1"
    "project-1"
    "certification-1"
    "section-1"

--------------------------------------------------
SUMMARY
--------------------------------------------------

If the section represents a summary/profile/objective,
return:

{
  "type": "summary",
  "summary": "summary text"
}

Only include summary text that actually exists.

--------------------------------------------------
SKILLS
--------------------------------------------------

If the section represents skills, preserve the categories
provided by the resume.

Example:

{
  "type": "skills",
  "skills": [
    {
      "category": "Languages",
      "items": [
        "JavaScript",
        "Python",
        "SQL"
      ]
    },
    {
      "category": "Frontend",
      "items": [
        "React.js",
        "Redux"
      ]
    }
  ]
}

Do NOT force skills into developer-specific categories.

If the resume uses categories such as:

Languages
Frontend
Backend
Databases
Tools
Frameworks
Cloud
Data
Testing

preserve those categories.

--------------------------------------------------
EXPERIENCE
--------------------------------------------------

If the section represents actual professional experience,
extract employment entries.

Actual experience may include:

- full-time employment
- internship
- contract
- freelance
- part-time work

Use:

{
  "type": "experience",
  "experience": [
    {
      "id": "experience-1",
      "title": "Job Title",
      "organization": "Company",
      "location": "Location",
      "startDate": "2024",
      "endDate": "2026",
      "isCurrent": false,
      "employmentType": "full-time",
      "bullets": [
        "First responsibility or achievement",
        "Second responsibility or achievement"
      ]
    }
  ]
}

Only include fields supported by the section.

IMPORTANT:

Do NOT put projects into experience.

--------------------------------------------------
EDUCATION
--------------------------------------------------

If the section represents education, extract ALL education
entries.

Use:

{
  "type": "education",
  "education": [
    {
      "id": "education-1",
      "degree": "Bachelor of Science",
      "institution": "University of Mumbai",
      "field": "Information Technology",
      "startDate": "2023",
      "endDate": "2026",
      "grade": "8.70"
    }
  ]
}

Only include fields supported by the resume.

Do not confuse CGPA/grade lines with section headings.

--------------------------------------------------
PROJECTS
--------------------------------------------------

If the section represents projects, extract ALL projects.

Every project must use:

{
  "id": "project-1",
  "name": "Project Name",
  "description": "Short description if clearly available",
  "bullets": [
    "First project bullet",
    "Second project bullet"
  ],
  "technologies": [
    "React.js",
    "Node.js",
    "MongoDB"
  ]
}

IMPORTANT:

- "bullets" MUST contain strings only.
- Extract ALL project bullets.
- Do NOT put project information into experience.
- Extract technologies explicitly mentioned in the
  project title, description, or bullets.
- Do not invent technologies.

--------------------------------------------------
CERTIFICATIONS
--------------------------------------------------

If the section represents certifications, extract ALL
certifications.

Use:

{
  "type": "certifications",
  "certifications": [
    {
      "id": "certification-1",
      "name": "Certification Name",
      "issuer": "Organization",
      "status": "completed",
      "date": "2026",
      "description": "Description if present"
    }
  ]
}

Allowed status values:

- completed
- in-progress
- expired
- unknown

If there are NO certifications in this section:

"certifications": []

IMPORTANT:

Never create an empty certification object.

Do NOT invent a certification simply because the resume
does not contain one.

--------------------------------------------------
CUSTOM SECTIONS
--------------------------------------------------

If the section does not clearly belong to:

- summary
- skills
- experience
- education
- projects
- certifications

preserve it as a custom section.

For example:

AWARDS
PUBLICATIONS
RESEARCH
VOLUNTEER WORK
ACTIVITIES
LEADERSHIP
LANGUAGES

Use:

{
  "type": "custom",
  "section": {
    "id": "section-1",
    "heading": "Original Heading",
    "normalizedType": "custom",
    "content": "Section content",
    "items": [
      "item 1",
      "item 2"
    ]
  }
}

Preserve the original heading.

Do NOT invent a custom section.

--------------------------------------------------
OUTPUT RULES
--------------------------------------------------

Return exactly ONE JSON object.

The "type" field MUST be exactly one of:

"summary"
"skills"
"experience"
"education"
"projects"
"certifications"
"custom"

Do not return any other top-level fields.

--------------------------------------------------
RESUME SECTION
--------------------------------------------------

${section.content}

--------------------------------------------------
FINAL CHECK
--------------------------------------------------

Before responding, verify:

- Only this section was analyzed.
- No information was invented.
- Projects are never placed in experience.
- Project bullets are strings.
- All project bullets are included.
- Project technologies are extracted when present.
- Education entries are preserved.
- Skill categories are preserved.
- Certifications are not invented.
- Unknown sections are preserved as custom when appropriate.
- No URLs are invented.
- Optional fields are omitted when unavailable.
- The response is valid JSON.
- The response contains JSON only.
`;
};

/**
 * Sends one detected resume section to Ollama.
 *
 * Ollama initially returns JSON as a string.
 *
 * The string is then:
 *
 * JSON.parse()
 *      ↓
 * Zod validation
 *      ↓
 * OllamaSectionResult
 */
const parseSectionWithOllama = async (
  section: DetectedResumeSection,
): Promise<OllamaSectionResult> => {
  const prompt = buildSectionPrompt(section);

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

        // Ask Ollama to return JSON.
        format: 'json',

        options: {
          // More deterministic output.
          temperature: 0,
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

  const content = data.message?.content;

  if (!content) {
    throw new Error(
      'Ollama returned an empty response',
    );
  }

  // Validate Ollama's JSON before returning it.
  return validateOllamaResult(content);
};

/**
 * Parses all detected resume sections.
 *
 * Each section is sent independently to Ollama.
 *
 * Example:
 *
 * PROFILE
 *     ↓
 * Ollama
 *     ↓
 * Zod validation
 *
 * EDUCATION
 *     ↓
 * Ollama
 *     ↓
 * Zod validation
 *
 * PROJECTS
 *     ↓
 * Ollama
 *     ↓
 * Zod validation
 *
 * ACTIVITIES
 *     ↓
 * Ollama
 *     ↓
 * Zod validation
 */
export const parseResumeSectionsWithOllama =
  async (
    sections: DetectedResumeSection[],
  ): Promise<OllamaSectionResult[]> => {
    const results: OllamaSectionResult[] = [];

    for (const section of sections) {
      const result =
        await parseSectionWithOllama(section);

      results.push(result);
    }

    return results;
  };