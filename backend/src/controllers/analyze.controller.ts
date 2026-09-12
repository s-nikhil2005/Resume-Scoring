import type { Request, Response } from 'express';

import { PDFParse } from 'pdf-parse';

import {
  parseResumeSectionsWithOllama,
} from '../services/ollama.service';

import {
  preprocessRawText,
} from '../services/resume-parser.service';

import {
  detectResumeSections,
} from '../services/section-detector.service';

import {
  parseSkillsSection,
} from '../services/skills-parser.service';

import {
  parseProjectsSection,
} from '../services/project-parser.service';

import {
  parseEducationSection,
} from '../services/education-parser.service';

import {
  parseExperienceSection,
} from '../services/experience-parser.service';

import {
  analyzeProjectsSkillAlignment,
} from '../services/project-skill-alignment.service';

import {
  extractTextWithOCR,
} from '../services/ocr.service';

import {
  parseCertificationSection,
} from '../services/certification-parser.service';

import {
  analyzeCertifications,
} from '../services/certification-analysis.service';

import {
  analyzeLanguage,
} from '../services/language-analysis.service';

import {
  calculateLanguageScore,
} from '../services/language-scoring.service';

import {
  parseContactSection,
} from '../services/contact-parser.service';

import {
  calculateResumeSectionScores,
} from '../services/resume-section-score.service';

import type {
  CertificationAnalysisResult,
} from '../types/certification.types';

export const analyzeResume = async (
  req: Request,
  res: Response,
) => {
  try {
    // --------------------------------------------------
    // 1. Check whether a PDF was uploaded
    // --------------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        message: 'PDF file is required',
      });
    }

    // --------------------------------------------------
    // 2. Create PDF parser using uploaded file buffer
    // --------------------------------------------------

    const parser = new PDFParse({
      data: req.file.buffer,
    });

    // --------------------------------------------------
    // 3. Extract text from PDF
    // --------------------------------------------------

    const pdfData =
      await parser.getText();

    // --------------------------------------------------
    // 4. Release parser resources
    // --------------------------------------------------

    await parser.destroy();

    // --------------------------------------------------
    // 5. Check whether normal PDF extraction
    //    produced usable text
    // --------------------------------------------------

    /**
     * PDFParse can sometimes return PDF metadata/page
     * markers such as:
     *
     * -- 1 of 1 --
     *
     * even when there is no actual resume text.
     *
     * Therefore, we preprocess the extracted text
     * BEFORE deciding whether OCR is required.
     */

    let extractedText =
      preprocessRawText(
        pdfData.text,
      );

    /**
     * If preprocessing leaves us with no usable text,
     * the PDF is most likely scanned/image-based.
     *
     * In that case, use OCR.
     */

    if (!extractedText) {
      console.log(
        'No usable PDF text found. Starting OCR...',
      );

      extractedText =
        await extractTextWithOCR(
          req.file.buffer,
        );

      console.log(
        'OCR text extraction completed.',
      );
    } else {
      console.log(
        'Usable PDF text found. OCR not required.',
      );
    }

    // --------------------------------------------------
    // 6. Clean extracted text
    // --------------------------------------------------

    /**
     * OCR text also goes through the same preprocessing
     * pipeline.
     */

    const cleanText =
      preprocessRawText(
        extractedText,
      );

    // --------------------------------------------------
    // 7. Parse contact information
    // --------------------------------------------------

    /**
     * Contact information is extracted deterministically.
     *
     * It can include:
     *
     * - name
     * - email
     * - phone
     * - location
     * - LinkedIn
     * - GitHub
     * - other links
     *
     * This does NOT use Ollama.
     */

    const parsedContact =
      parseContactSection(
        cleanText,
      );

    // --------------------------------------------------
    // 8. Detect resume sections
    // --------------------------------------------------

    const sections =
      detectResumeSections(
        cleanText,
      );

    // --------------------------------------------------
    // 9. Extract skills deterministically
    // --------------------------------------------------

    const skillsSection =
      sections.find(
        (section) =>
          section.normalizedType ===
          'skills',
      );

    const parsedSkills =
      skillsSection?.content
        ? parseSkillsSection(
            skillsSection.content,
          )
        : [];

    // --------------------------------------------------
    // 10. Extract projects deterministically
    // --------------------------------------------------

    const projectsSection =
      sections.find(
        (section) =>
          section.normalizedType ===
          'projects',
      );

    const parsedProjects =
      projectsSection?.content
        ? parseProjectsSection(
            projectsSection.content,
          )
        : [];

    // --------------------------------------------------
    // 11. Extract education deterministically
    // --------------------------------------------------

    const educationSection =
      sections.find(
        (section) =>
          section.normalizedType ===
          'education',
      );

    const parsedEducation =
      educationSection?.content
        ? parseEducationSection(
            educationSection.content,
          )
        : [];

    // --------------------------------------------------
    // 12. Extract experience deterministically
    // --------------------------------------------------

    const experienceSection =
      sections.find(
        (section) =>
          section.normalizedType ===
          'experience',
      );

    /**
     * Experience is optional.
     *
     * If the resume contains Experience:
     *     parse it.
     *
     * If the resume does not contain Experience:
     *     return [].
     *
     * A missing Experience section is valid for
     * freshers and should not automatically be
     * treated as a problem.
     */

    const parsedExperience =
      experienceSection?.content
        ? parseExperienceSection(
            experienceSection.content,
          )
        : [];

    // --------------------------------------------------
    // 13. Analyze project ↔ skill alignment
    // --------------------------------------------------

    /**
     * This analysis is deterministic.
     *
     * Resume Technical Skills
     *              ↕
     * Project Technologies
     *
     * This does NOT use Ollama.
     */

    const projectSkillAlignment =
      analyzeProjectsSkillAlignment(
        parsedProjects,
        parsedSkills,
      );

    // --------------------------------------------------
    // 14. Analyze the resume with Ollama
    // --------------------------------------------------

    /**
     * Ollama receives:
     *
     * - detected resume sections
     * - deterministic skills
     * - deterministic projects
     *
     * Ollama performs semantic analysis such as:
     *
     * - project type
     * - project relevance
     * - demonstrated skills
     * - experience interpretation
     * - profile analysis
     *
     * Final scoring will NOT be done by Ollama.
     */

    const aiResults =
      await parseResumeSectionsWithOllama(
        sections,
        parsedSkills,
        parsedProjects,
      );

    // --------------------------------------------------
    // 15. Extract detected role
    // --------------------------------------------------

    /**
     * The existing Ollama result may or may not contain
     * detectedRole depending on the current response
     * structure.
     *
     * Read it safely without changing the existing
     * Ollama service.
     */

    const detectedRole =
      (
        aiResults as {
          detectedRole?: unknown;
        }
      ).detectedRole;

    const normalizedDetectedRole =
      typeof detectedRole ===
        'string' &&
      detectedRole.trim().length > 0
        ? detectedRole.trim()
        : null;

    // --------------------------------------------------
    // 16. Find certification section
    // --------------------------------------------------

    /**
     * Do NOT compare normalizedType with:
     *
     * - certifications
     * - certificates
     * - certifications_achievements
     *
     * because those values are not currently part of
     * your section detector's normalizedType union.
     *
     * Instead, use the actual section heading.
     */

    const certificationSection =
      sections.find(
        (section) => {
          const heading =
            section.heading?.trim() ??
            '';

          return /^(certifications?|certificates?|licenses?\s*&\s*certifications?|certifications?\s*&\s*achievements?|certificates?\s*\/\s*achievements?)\s*$/i.test(
            heading,
          );
        },
      );

    // --------------------------------------------------
    // 17. Extract certifications deterministically
    // --------------------------------------------------

    /**
     * Certifications are parsed only when an actual
     * certification-related section is found.
     */

    const parsedCertifications =
      certificationSection?.content
        ? parseCertificationSection(
            certificationSection.content,
            certificationSection.heading,
          )
        : [];

    // --------------------------------------------------
    // 18. Prepare resume skills for certification analysis
    // --------------------------------------------------

    /**
     * Certification analysis needs only the actual
     * skill names.
     */

    const resumeSkills: string[] =
      parsedSkills.flatMap(
        (category) =>
          category.items,
      );

    // --------------------------------------------------
    // 19. Analyze certifications semantically
    // --------------------------------------------------

    let certificationAnalysis:
      CertificationAnalysisResult;

    if (
      parsedCertifications.length ===
      0
    ) {
      /**
       * Certifications are optional.
       *
       * No certification should NOT negatively affect
       * the resume score.
       */

      certificationAnalysis = {
        analyzed: false,
        certifications: [],
        overallImpact:
          'not_applicable',
        skipReason:
          'No certification section or no parseable certifications',
      };
    } else {
      certificationAnalysis =
        await analyzeCertifications({
          certifications:
            parsedCertifications,

          detectedRole:
            normalizedDetectedRole,

          resumeSkills,
        });
    }

    // --------------------------------------------------
    // 20. Analyze resume language
    // --------------------------------------------------

    /**
     * Language analysis uses LanguageTool.
     *
     * It checks:
     *
     * - grammar
     * - spelling
     * - style
     * - typographical issues
     *
     * Ollama is NOT used here.
     */

    const languageAnalysis =
      await analyzeLanguage(
        cleanText,
      );

    // --------------------------------------------------
    // 21. Calculate deterministic language score
    // --------------------------------------------------

    /**
     * The complete language score contains:
     *
     * - score
     * - grammar penalty
     * - spelling penalty
     * - style penalty
     * - other penalty
     */

    const languageScore =
      calculateLanguageScore(
        languageAnalysis,
      );

    // --------------------------------------------------
    // 22. Calculate resume section scores
    // --------------------------------------------------

    /**
     * Each applicable resume section receives its own
     * score from 0 to 100.
     *
     * Optional sections such as Experience and
     * Certifications are excluded when absent.
     *
     * The average is calculated only from applicable
     * sections.
     */

    const resumeSectionScores =
      calculateResumeSectionScores({
        sections,

        contact:
          parsedContact,

        skills:
          parsedSkills,

        projects:
          parsedProjects,

        education:
          parsedEducation,

        experience:
          parsedExperience,

        certifications:
          parsedCertifications,

        languageAnalysis,

        languageScore:
          languageScore.score,
      });

    // --------------------------------------------------
    // 23. Calculate final ATS Score
    // --------------------------------------------------

    /**
     * The current ATS Score is the average of all
     * applicable resume section scores.
     *
     * Example:
     *
     * Structure      85
     * Contact       100
     * Skills        100
     * Projects       90
     * Education     100
     * Language       97
     *
     * ATS Score =
     *
     * (85 + 100 + 100 + 90 + 100 + 97) / 6
     *
     * = 95.33
     *
     * Rounded:
     *
     * 95
     */

    const atsScore =
      resumeSectionScores.averageScore;

    // --------------------------------------------------
    // 24. Return complete analysis result
    // --------------------------------------------------

    return res.status(200).json({
      /**
       * Text ultimately extracted from the resume.
       *
       * This can come from:
       * 1. Normal PDF text extraction
       * 2. OCR fallback
       */

      rawText: extractedText,

      cleanText,

      // Deterministic contact extraction
      parsedContact,

      // Detected sections
      sections,

      // Deterministic skill extraction
      parsedSkills,

      // Deterministic project extraction
      parsedProjects,

      // Deterministic education extraction
      parsedEducation,

      // Deterministic experience extraction
      parsedExperience,

      // Deterministic certification extraction
      parsedCertifications,

      // Project ↔ Resume Skills comparison
      projectSkillAlignment,

      // Certification semantic analysis
      certificationAnalysis,

      // Language analysis using LanguageTool
      languageAnalysis,

      // Complete Language Score
      languageScore,

      // Individual section scores + average
      resumeSectionScores,

      // Final ATS Score
      atsScore,

      // AI semantic analysis
      aiResults,
    });
  } catch (error) {
    // --------------------------------------------------
    // 25. Handle analysis errors
    // --------------------------------------------------

    console.error(
      'Resume analysis error:',
      error,
    );

    return res.status(500).json({
      message:
        'Failed to analyze resume',
    });
  }
};