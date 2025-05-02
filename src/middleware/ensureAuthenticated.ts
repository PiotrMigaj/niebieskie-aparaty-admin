import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

// eslint-disable-next-line consistent-return
export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  // eslint-disable-next-line consistent-return
  passport.authenticate('jwt', { session: false }, (err: Error | null, user: any) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;
    next();
  })(req, res, next);
};
