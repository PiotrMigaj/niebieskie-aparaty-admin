import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { createAppError } from './errorMiddleware';

// Middleware to authenticate using JWT strategy
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error, user: any) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      const error = createAppError(401, 'Unauthorized');
      return next(error);
    }

    req.user = user;
    return next();
  })(req, res, next);
};
