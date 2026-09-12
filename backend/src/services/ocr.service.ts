import { createWorker, type Worker } from 'tesseract.js';

const TARGET_DPI = 180;
const SCALE = TARGET_DPI / 72;

/**
 * Renders every page of a PDF from an in-memory Buffer to PNG
 * using MuPDF.js and runs Tesseract.js OCR on each page.
 *
 * - Supports scanned/image-based PDFs.
 * - Uses one Tesseract worker for the complete document.
 * - Does not write files to disk.
 * - Processes pages in order.
 * - Releases MuPDF resources after each page.
 */
export async function extractTextWithOCR(
  pdfBuffer: Buffer,
): Promise<string> {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error('Empty PDF buffer received for OCR');
  }

  let worker: Worker | null = null;

  try {
    /*
     * MuPDF is ESM-only.
     *
     * Dynamic import allows our existing backend to remain
     * compatible with its current module configuration.
     */
    const mupdf = await import('mupdf');

    // Open the PDF directly from the in-memory Buffer.
    const doc = mupdf.Document.openDocument(
      pdfBuffer,
      'application/pdf',
    );

    try {
      const pageCount = doc.countPages();

      if (pageCount === 0) {
        console.warn('OCR: PDF contains 0 pages');
        return '';
      }

      console.log(`OCR: PDF contains ${pageCount} page(s)`);

      // Create one Tesseract worker for the entire document.
      worker = await createWorker('eng');

      const pageTexts: string[] = [];

      for (let i = 0; i < pageCount; i++) {
        console.log(
          `OCR processing page ${i + 1}/${pageCount}...`,
        );

        const page = doc.loadPage(i);

        try {
          /*
           * Render the page at approximately 180 DPI.
           *
           * PDF uses 72 points per inch:
           *
           * 180 / 72 = 2.5
           */
          const pixmap = page.toPixmap(
            mupdf.Matrix.scale(SCALE, SCALE),
            mupdf.ColorSpace.DeviceRGB,
            false,
            true,
          );

          try {
            // Convert MuPDF PNG data into a Node.js Buffer.
            const pngBuffer = Buffer.from(pixmap.asPNG());

            // Run OCR on the rendered page.
            const {
              data: { text },
            } = await worker.recognize(pngBuffer);

            const cleanedText = text.trim();

            if (cleanedText) {
              pageTexts.push(cleanedText);
            }

            console.log(
              `OCR completed page ${i + 1}/${pageCount}`,
            );
          } finally {
            // Release MuPDF rendering memory.
            pixmap.destroy();
          }
        } finally {
          // Release the page resource.
          page.destroy();
        }
      }

      const combinedText = pageTexts.join('\n\n').trim();

      console.log(
        `OCR extraction completed. Extracted ${combinedText.length} characters.`,
      );

      return combinedText;
    } finally {
      // Release the MuPDF document.
      doc.destroy();
    }
  } catch (err) {
    console.error('OCR extraction failed:', err);

    throw new Error(
      'Failed to extract text from scanned PDF. The document may be corrupted or unreadable.',
      { cause: err },
    );
  } finally {
    // Always terminate the Tesseract worker.
    if (worker) {
      try {
        await worker.terminate();
      } catch (err) {
        console.error('Failed to terminate OCR worker:', err);
      }
    }
  }
}