import type {
  Request,
  Response,
} from 'express';

import multer from 'multer';

// --------------------------------------------------
// Global Error Handler
// --------------------------------------------------

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
) => {
  // ------------------------------------------------
  // Multer Errors
  // ------------------------------------------------

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message:
          'Resume PDF must be 5 MB or smaller.',
      });
    }

    return res.status(400).json({
      message: error.message,
    });
  }

  // ------------------------------------------------
  // Regular Error
  // ------------------------------------------------

  if (error instanceof Error) {
    console.error(
      'API Error:',
      error.message,
    );

    return res.status(500).json({
      message:
        'Failed to process the request.',
    });
  }

  // ------------------------------------------------
  // Unknown Error
  // ------------------------------------------------

  console.error(
    'Unknown API Error:',
    error,
  );

  return res.status(500).json({
    message:
      'An unexpected server error occurred.',
  });
};