export interface ParsedSkillCategory {
  category: string;
  items: string[];
}

export const parseSkillsSection = (
  content: string,
): ParsedSkillCategory[] => {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const categories: ParsedSkillCategory[] = [];

  for (const line of lines) {
    const match = line.match(/^([^:]+):\s*(.+)$/);

    if (!match) {
      continue;
    }

    const category = match[1];
    const skillsText = match[2];

    if (!category || !skillsText) {
      continue;
    }

    const items = skillsText
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    categories.push({
      category: category.trim(),
      items,
    });
  }

  return categories;
};