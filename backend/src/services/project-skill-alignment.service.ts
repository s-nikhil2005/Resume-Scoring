// src/services/project-skill-alignment.service.ts

import type {
  ParsedProject,
} from './project-parser.service';

import type {
  ParsedSkillCategory,
} from './skills-parser.service';

/**
 * Result of comparing one project against
 * the skills listed in the resume.
 */
export interface ProjectSkillAlignment {
  projectId: string;
  projectName: string;

  /**
   * Technologies found in the project that are
   * also represented in the resume skills.
   */
  matchedSkills: string[];

  /**
   * Technologies demonstrated in the project
   * but not listed in the resume's Technical Skills.
   */
  projectOnlySkills: string[];

  /**
   * Percentage of project technologies that are
   * supported by the resume skill list.
   */
  alignmentPercentage: number;

  /**
   * Simple interpretation of the alignment.
   */
  alignmentStatus:
    | 'strong'
    | 'moderate'
    | 'weak'
    | 'none';
}

/**
 * Complete result for all projects.
 */
export interface ProjectSkillAlignmentResult {
  projects: ProjectSkillAlignment[];

  /**
   * Overall alignment across all projects.
   */
  overallAlignmentPercentage: number;

  /**
   * Skills demonstrated in projects but missing
   * from the Technical Skills section.
   */
  projectOnlySkills: string[];
}


/**
 * Normalize a skill name only for comparison.
 *
 * IMPORTANT:
 * This does NOT decide the canonical name of a skill.
 *
 * It only makes strings easier to compare.
 *
 * Examples:
 *
 * "React.js"            -> "react"
 * "ReactJS"             -> "react"
 * "Node.js"             -> "node"
 * "MongoDB"             -> "mongodb"
 * "REST APIs"           -> "rest api"
 */
const normalizeForComparison = (
  skill: string,
): string => {
  return skill
    .trim()
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\.js\b/g, '')
    .replace(/\bjs\b/g, '')
    .replace(/\bapis\b/g, 'api')
    .replace(/\bapi endpoints\b/g, 'api')
    .replace(/\brestful\b/g, 'rest')
    .replace(/\s+/g, ' ')
    .trim();
};


/**
 * Creates useful comparison variants for a skill.
 *
 * This allows us to compare things such as:
 *
 * "JWT"
 * with
 * "JWT authentication"
 *
 * without changing the actual displayed skill names.
 */
const getComparisonVariants = (
  skill: string,
): string[] => {
  const normalized =
    normalizeForComparison(skill);

  const variants = new Set<string>();

  variants.add(normalized);

  /**
   * Remove common descriptive words.
   */
  const simplified = normalized
    .replace(/\bauthentication\b/g, '')
    .replace(/\bauthorization\b/g, '')
    .replace(/\bdesign\b/g, '')
    .replace(/\bintegration\b/g, '')
    .replace(/\bdevelopment\b/g, '')
    .replace(/\bschema\b/g, '')
    .replace(/\bdebugging\b/g, '')
    .replace(/\btesting\b/g, '')
    .replace(/\bweb\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (simplified) {
    variants.add(simplified);
  }

  /**
   * Handle slash-separated skills.
   *
   * Example:
   * MySQL/SQL
   *
   * becomes:
   * MySQL
   * SQL
   */
  if (skill.includes('/')) {
    for (const part of skill.split('/')) {
      const normalizedPart =
        normalizeForComparison(part);

      if (normalizedPart) {
        variants.add(normalizedPart);
      }
    }
  }

  return [...variants];
};


/**
 * Determines whether two skills represent the
 * same technology/concept for project alignment.
 */
const skillsMatch = (
  firstSkill: string,
  secondSkill: string,
): boolean => {
  const firstVariants =
    getComparisonVariants(firstSkill);

  const secondVariants =
    getComparisonVariants(secondSkill);

  return firstVariants.some(
    (firstVariant) =>
      secondVariants.some(
        (secondVariant) => {
          if (
            firstVariant === secondVariant
          ) {
            return true;
          }

          /**
           * Handle cases where one side contains
           * the more descriptive version.
           *
           * Example:
           *
           * JWT
           * JWT authentication
           */
          if (
            firstVariant.length >= 3 &&
            secondVariant.length >= 3
          ) {
            return (
              firstVariant.includes(
                secondVariant,
              ) ||
              secondVariant.includes(
                firstVariant,
              )
            );
          }

          return false;
        },
      ),
  );
};


/**
 * Extracts all skills from the categorized
 * resume skill structure.
 *
 * Example:
 *
 * [
 *   {
 *     category: "Frontend",
 *     items: ["React.js", "Redux"]
 *   },
 *   {
 *     category: "Backend",
 *     items: ["Node.js"]
 *   }
 * ]
 *
 * becomes:
 *
 * ["React.js", "Redux", "Node.js"]
 */
const flattenResumeSkills = (
  parsedSkills: ParsedSkillCategory[],
): string[] => {
  return [
    ...new Set(
      parsedSkills.flatMap(
        (category) => category.items,
      ),
    ),
  ];
};


/**
 * Finds the resume skill that matches a project
 * technology.
 *
 * We return the resume's original skill name
 * rather than the project's technology name.
 *
 * This keeps the result aligned with the
 * Technical Skills section.
 */
const findMatchingResumeSkill = (
  projectTechnology: string,
  resumeSkills: string[],
): string | undefined => {
  return resumeSkills.find((resumeSkill) =>
    skillsMatch(
      projectTechnology,
      resumeSkill,
    ),
  );
};


/**
 * Converts an alignment percentage into
 * a human-readable status.
 */
const getAlignmentStatus = (
  percentage: number,
): ProjectSkillAlignment['alignmentStatus'] => {
  if (percentage === 0) {
    return 'none';
  }

  if (percentage >= 75) {
    return 'strong';
  }

  if (percentage >= 40) {
    return 'moderate';
  }

  return 'weak';
};


/**
 * Calculates project-to-resume skill alignment
 * for one project.
 *
 * Example:
 *
 * Project technologies:
 * React.js
 * Node.js
 * MongoDB
 * Axios
 *
 * Resume skills:
 * React.js
 * Node.js
 * MongoDB
 *
 * Result:
 *
 * matchedSkills:
 * React.js
 * Node.js
 * MongoDB
 *
 * projectOnlySkills:
 * Axios
 *
 * alignment:
 * 75%
 */
export const analyzeProjectSkillAlignment = (
  project: ParsedProject,
  resumeSkills: string[],
): ProjectSkillAlignment => {
  const projectTechnologies = [
    ...new Set(project.technologies),
  ];

  /**
   * If the project has no extracted technologies,
   * we cannot calculate meaningful alignment.
   */
  if (projectTechnologies.length === 0) {
    return {
      projectId: project.id,
      projectName: project.name,
      matchedSkills: [],
      projectOnlySkills: [],
      alignmentPercentage: 0,
      alignmentStatus: 'none',
    };
  }

  const matchedSkills: string[] = [];
  const projectOnlySkills: string[] = [];

  for (const technology of projectTechnologies) {
    const matchingResumeSkill =
      findMatchingResumeSkill(
        technology,
        resumeSkills,
      );

    if (matchingResumeSkill) {
      if (
        !matchedSkills.some(
          (skill) =>
            skillsMatch(
              skill,
              matchingResumeSkill,
            ),
        )
      ) {
        matchedSkills.push(
          matchingResumeSkill,
        );
      }

      continue;
    }

    projectOnlySkills.push(
      technology,
    );
  }

  const alignmentPercentage =
    Math.round(
      (matchedSkills.length /
        projectTechnologies.length) *
        100,
    );

  return {
    projectId: project.id,
    projectName: project.name,
    matchedSkills,
    projectOnlySkills,
    alignmentPercentage,
    alignmentStatus:
      getAlignmentStatus(
        alignmentPercentage,
      ),
  };
};


/**
 * Analyzes all projects against the resume's
 * Technical Skills section.
 */
export const analyzeProjectsSkillAlignment = (
  projects: ParsedProject[],
  parsedSkills: ParsedSkillCategory[],
): ProjectSkillAlignmentResult => {
  const resumeSkills =
    flattenResumeSkills(parsedSkills);

  /**
   * No projects means there is nothing to compare.
   */
  if (projects.length === 0) {
    return {
      projects: [],
      overallAlignmentPercentage: 0,
      projectOnlySkills: [],
    };
  }

  const projectResults =
    projects.map((project) =>
      analyzeProjectSkillAlignment(
        project,
        resumeSkills,
      ),
    );

  /**
   * Collect unique technologies that appear in
   * projects but aren't listed in the resume skills.
   */
  const projectOnlySkills = [
    ...new Set(
      projectResults.flatMap(
        (project) =>
          project.projectOnlySkills,
      ),
    ),
  ];

  /**
   * Calculate the overall alignment using the
   * total number of project technologies rather
   * than averaging percentages.
   *
   * Example:
   *
   * Project 1: 7/8
   * Project 2: 5/5
   *
   * Overall:
   * 12/13 = 92%
   */
  const totalProjectTechnologies =
    projects.reduce(
      (total, project) =>
        total + project.technologies.length,
      0,
    );

  const totalMatchedSkills =
    projectResults.reduce(
      (total, project) =>
        total + project.matchedSkills.length,
      0,
    );

  const overallAlignmentPercentage =
    totalProjectTechnologies === 0
      ? 0
      : Math.round(
          (totalMatchedSkills /
            totalProjectTechnologies) *
            100,
        );

  return {
    projects: projectResults,
    overallAlignmentPercentage,
    projectOnlySkills,
  };
};