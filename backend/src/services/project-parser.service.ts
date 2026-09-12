// src/services/project-parser.service.ts

export interface ParsedProject {
  id: string;
  name: string;
  description?: string;
  bullets: string[];
  technologies: string[];
  rawText: string;
}

/**
 * Technologies that our deterministic parser knows.
 *
 * This is intentionally controlled instead of asking
 * Ollama to extract technologies.
 *
 * We can expand this list later as we support more roles.
 */
const TECHNOLOGY_PATTERNS: Array<{
  name: string;
  pattern: RegExp;
}> = [
  {
    name: 'React.js',
    pattern: /\bReact(?:\.js)?\b/i,
  },
  {
    name: 'Redux',
    pattern: /\bRedux\b/i,
  },
  {
    name: 'JavaScript',
    pattern: /\bJavaScript\b/i,
  },
  {
    name: 'TypeScript',
    pattern: /\bTypeScript\b/i,
  },
  {
    name: 'HTML',
    pattern: /\bHTML\b/i,
  },
  {
    name: 'CSS',
    pattern: /\bCSS\b/i,
  },
  {
    name: 'Tailwind CSS',
    pattern: /\bTailwind\s+CSS\b/i,
  },
  {
    name: 'Node.js',
    pattern: /\bNode(?:\.js)?\b/i,
  },
  {
    name: 'Express.js',
    pattern: /\bExpress(?:\.js)?\b/i,
  },
  {
    name: 'MongoDB',
    pattern: /\bMongoDB\b/i,
  },
  {
    name: 'PostgreSQL',
    pattern: /\bPostgreSQL\b/i,
  },
  {
    name: 'MySQL',
    pattern: /\bMySQL\b/i,
  },
  {
    name: 'Redis',
    pattern: /\bRedis\b/i,
  },
  {
    name: 'JWT',
    pattern: /\bJWT\b/i,
  },
  {
    name: 'Axios',
    pattern: /\bAxios\b/i,
  },
  {
    name: 'REST API',
    pattern: /\bREST\s+API(?:s)?\b/i,
  },
  {
    name: 'Git',
    pattern: /\bGit\b/i,
  },
  {
    name: 'GitHub',
    pattern: /\bGitHub\b/i,
  },
  {
    name: 'Postman',
    pattern: /\bPostman\b/i,
  },
  {
    name: 'Docker',
    pattern: /\bDocker\b/i,
  },
];

/**
 * Extract technologies from project text.
 *
 * The parser checks both:
 *
 * - project heading
 * - project bullets
 *
 * Only technologies explicitly present in the
 * project text are returned.
 */
const extractTechnologies = (
  text: string,
): string[] => {
  const technologies: string[] = [];

  for (const technology of TECHNOLOGY_PATTERNS) {
    if (technology.pattern.test(text)) {
      technologies.push(technology.name);
    }
  }

  return technologies;
};

export const parseProjectsSection = (
  content: string,
): ParsedProject[] => {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const projects: ParsedProject[] = [];

  let currentProject: ParsedProject | null =
    null;

  let currentBullet = '';

  const isBullet = (line: string): boolean => {
    return /^[-•●▪◦*]\s*/.test(line);
  };

  const isProjectHeading = (
    line: string,
  ): boolean => {
    /*
     * Project headings in the resume usually contain
     * the project name followed by stack/year.
     *
     * Examples:
     *
     * Voya – Travel Booking Platform | MERN Stack 2026
     * StudyLoop – Peer-to-Peer Learning Platform | MERN Stack 2026
     */

    return (
      !isBullet(line) &&
      (line.includes('|') ||
        /\b(MERN|MEAN|Java|Python|React|Node)\b/i.test(
          line,
        ))
    );
  };

  const saveCurrentBullet = () => {
    if (!currentProject || !currentBullet) {
      return;
    }

    const cleanedBullet =
      currentBullet.trim();

    currentProject.bullets.push(
      cleanedBullet,
    );

    currentProject.rawText +=
      `\n${cleanedBullet}`;

    currentBullet = '';
  };

  for (const line of lines) {
    // --------------------------------------------------
    // Project heading
    // --------------------------------------------------

    if (isProjectHeading(line)) {
      // Save previous bullet
      saveCurrentBullet();

      // Save previous project
      if (currentProject) {
        currentProject.technologies =
          extractTechnologies(
            currentProject.rawText,
          );

        projects.push(currentProject);
      }

      // Create new project
      currentProject = {
        id: `project-${projects.length + 1}`,
        name: line,
        bullets: [],
        technologies: [],
        rawText: line,
      };

      continue;
    }

    // --------------------------------------------------
    // Ignore text before the first project
    // --------------------------------------------------

    if (!currentProject) {
      continue;
    }

    // --------------------------------------------------
    // New bullet
    // --------------------------------------------------

    if (isBullet(line)) {
      // Save previous bullet
      saveCurrentBullet();

      // Remove bullet character
      currentBullet = line
        .replace(/^[-•●▪◦*]\s*/, '')
        .trim();

      continue;
    }

    // --------------------------------------------------
    // Wrapped PDF line
    // --------------------------------------------------
    //
    // PDF extraction can split one bullet into
    // multiple lines.
    //
    // Example:
    //
    // - Built a full-stack application with React.js,
    // Node.js, Express.js, and MongoDB
    //
    // The second line belongs to the same bullet.
    // --------------------------------------------------

    if (currentBullet) {
      currentBullet += ` ${line}`;
    }
  }

  // --------------------------------------------------
  // Save final bullet
  // --------------------------------------------------

  saveCurrentBullet();

  // --------------------------------------------------
  // Save final project
  // --------------------------------------------------

  if (currentProject) {
    currentProject.technologies =
      extractTechnologies(
        currentProject.rawText,
      );

    projects.push(currentProject);
  }

  return projects;
};