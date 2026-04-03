import {Router} from 'express';
import authRoutes from './auth.ts';
import userRoutes from './users.ts';
import programRoutes from './programs.ts';
import courseRoutes from './courses.ts';
import categoryRoutes from './categories.ts';
import enrollRoutes from './enrollments.ts';
import flashcardRoutes from './flashcards.ts';
import chatbotRoutes from './chatbot.ts';
import canvasRoutes from './canvas.ts';

const rootRouter = Router();

rootRouter.use('/auth', authRoutes);
rootRouter.use('/users', userRoutes);
rootRouter.use('/programs', programRoutes);
rootRouter.use('/courses', courseRoutes);
rootRouter.use('/categories', categoryRoutes);
rootRouter.use('/flashcards', flashcardRoutes);
rootRouter.use('/chatbot', chatbotRoutes);
rootRouter.use('/enrollments', enrollRoutes);
rootRouter.use('/canvas', canvasRoutes);

export default rootRouter;