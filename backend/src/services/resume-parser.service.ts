// src/services/resume-parser.service.ts

export const preprocessRawText = (rawText: string): string => {
  return rawText
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')

    // Remove common PDF page markers
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, '')

    // Normalize bullet characters
    .replace(/[•●▪◦]/g, '-')

    // Remove spaces at the beginning/end of every line
    .split('\n')
    .map((line) => line.trim())

    // Remove excessive empty lines
    .filter((line, index, lines) => {
      if (line !== '') {
        return true;
      }

      return index > 0 && lines[index - 1] !== '';
    })

    .join('\n')

    .trim();
};