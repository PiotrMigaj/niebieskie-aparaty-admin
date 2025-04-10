import { Request, Response, NextFunction } from 'express';

// Middleware to check if user is authenticated (admin session)
// eslint-disable-next-line consistent-return
const ensureAdminSession = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated()) {
    return next(); // Continue to the next middleware
  }
  res.redirect('/login'); // Redirect to login if not authenticated
};

export default ensureAdminSession;
