import { Router } from 'express';

import { analyzeResume } from '../controllers/analyze.controller';
import upload from '../middlewares/upload.middleware';

const analyzeRouter = Router();

analyzeRouter.post('/analyze', upload.single('resume'), analyzeResume);

export default analyzeRouter;