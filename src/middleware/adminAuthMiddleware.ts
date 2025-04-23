import { Request, Response, NextFunction } from 'express';

// Middleware to check if user is authenticated (admin session)
// eslint-disable-next-line consistent-return
const ensureAdminSession = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated()) {
    return next();
  }

  // Check if the request expects JSON
  if (
    req.headers.accept?.includes('application/json') ||
    req.headers['content-type'] === 'application/json'
  ) {
    res.status(401).json({ error: 'Unauthorized' });
  } else {
    res.redirect('/login');
  }
};

export default ensureAdminSession;
