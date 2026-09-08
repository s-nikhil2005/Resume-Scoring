// src/controllers/analyze.controller.ts

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
    // 2. Create PDF parser using the uploaded
    //    file buffer
    // --------------------------------------------------

    const parser = new PDFParse({
      data: req.file.buffer,
    });

    // --------------------------------------------------
    // 3. Extract text from PDF
    // --------------------------------------------------

    const pdfData = await parser.getText();

    // --------------------------------------------------
    // 4. Release parser resources
    // --------------------------------------------------

    await parser.destroy();

    // --------------------------------------------------
    // 5. Clean extracted text
    // --------------------------------------------------

    const cleanText = preprocessRawText(
      pdfData.text,
    );

    // --------------------------------------------------
    // 6. Detect resume sections
    // --------------------------------------------------

    const sections =
      detectResumeSections(cleanText);

    // --------------------------------------------------
    // 7. Send each detected section to Ollama
    //
    // Ollama returns JSON.
    //
    // ollama.service.ts now validates each response
    // using Zod before returning it.
    // --------------------------------------------------

    const aiResults =
      await parseResumeSectionsWithOllama(
        sections,
      );

    // --------------------------------------------------
    // 8. Return the complete analysis pipeline result
    // --------------------------------------------------

    return res.status(200).json({
      rawText: pdfData.text,
      cleanText,
      sections,
      aiResults,
    });
  } catch (error) {
    // --------------------------------------------------
    // 9. Handle analysis errors
    // --------------------------------------------------

    console.error(
      'Resume analysis error:',
      error,
    );

    return res.status(500).json({
      message: 'Failed to analyze resume',
    });
  }
};