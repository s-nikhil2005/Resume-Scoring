import type {
  ResumeContact,
  ResumeLink,
} from '../types/resume.types';

const EMAIL_REGEX =
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

const PHONE_REGEX =
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}/g;

const URL_REGEX =
  /https?:\/\/[^\s<>"')]+/gi;

const normalizeUrl = (url: string): string => {
  return url.replace(/[.,;:]+$/, '');
};

const getLinkLabel = (
  url: string,
): string => {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('linkedin.com')) {
    return 'LinkedIn';
  }

  if (lowerUrl.includes('github.com')) {
    return 'GitHub';
  }

  if (lowerUrl.includes('leetcode.com')) {
    return 'LeetCode';
  }

  if (lowerUrl.includes('portfolio')) {
    return 'Portfolio';
  }

  return 'Website';
};

const extractLinks = (
  text: string,
): ResumeLink[] => {
  const urls = text.match(URL_REGEX) ?? [];

  const uniqueUrls = [
    ...new Set(
      urls.map(normalizeUrl),
    ),
  ];

  return uniqueUrls.map((url) => ({
    label: getLinkLabel(url),
    url,
  }));
};

const extractEmail = (
  text: string,
): string | undefined => {
  const match = text.match(
    EMAIL_REGEX,
  );

  return match?.[0];
};

const extractPhone = (
  text: string,
): string | undefined => {
  const matches = text.match(
    PHONE_REGEX,
  );

  if (!matches) {
    return undefined;
  }

  const phone = matches.find(
    (value) => {
      const digits = value.replace(
        /\D/g,
        '',
      );

      return (
        digits.length >= 10 &&
        digits.length <= 15
      );
    },
  );

  return phone?.trim();
};

const extractName = (
  text: string,
): string | undefined => {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const firstLine = lines.at(0);

  if (firstLine === undefined) {
    return undefined;
  }

  const emailPattern =
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

  const urlPattern =
    /https?:\/\/[^\s<>"')]+/i;

  if (
    emailPattern.test(firstLine) ||
    urlPattern.test(firstLine)
  ) {
    return undefined;
  }

  const cleanedLine =
    firstLine
      .replace(
        PHONE_REGEX,
        '',
      )
      .trim();

  if (!cleanedLine) {
    return undefined;
  }

  const words =
    cleanedLine.split(/\s+/);

  if (
    words.length < 2 ||
    words.length > 5
  ) {
    return undefined;
  }

  const looksLikeName =
    words.every(
      (word) =>
        /^[A-Za-z][A-Za-z.'-]*$/.test(
          word,
        ),
    );

  return looksLikeName
    ? cleanedLine
    : undefined;
};

const extractLocation = (
  text: string,
): string | undefined => {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const locationPattern =
    /\b(?:Mumbai|Thane|Pune|Delhi|Bengaluru|Bangalore|Hyderabad|Chennai|Kolkata|Ahmedabad|Navi Mumbai)\b/i;

  return lines.find((line) =>
    locationPattern.test(line),
  );
};

export const parseContactSection = (
  text: string,
): ResumeContact => {
  const links = extractLinks(text);

  const contact: ResumeContact = {
    links,
  };

  const name = extractName(text);
  const email = extractEmail(text);
  const phone = extractPhone(text);
  const location =
    extractLocation(text);

  if (name !== undefined) {
    contact.name = name;
  }

  if (email !== undefined) {
    contact.email = email;
  }

  if (phone !== undefined) {
    contact.phone = phone;
  }

  if (location !== undefined) {
    contact.location = location;
  }

  return contact;
};