import {Router} from 'express';
const authRouter = Router();

import {register,login,getMe,logout} from '../controllers/auth.controller';
import {authMiddleware} from '../middlewares/auth.middleware';

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me',authMiddleware,getMe);
authRouter.post('/logout', authMiddleware, logout);

export default authRouter;