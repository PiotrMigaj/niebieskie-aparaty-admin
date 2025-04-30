import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { generateToken } from '../../utils/jwt';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

const router = Router();

router.get('/login', (req: Request, res: Response): void => {
  const messages = req.flash('error');
  res.render('login', { messages }); // Assuming you have a login.ejs view
});

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'admin-local',
    // eslint-disable-next-line consistent-return
    (err: Error | null, user: any, info: { message: string }) => {
      // Handle authentication errors
      if (err) {
        return next(err);
      }

      // If authentication failed
      if (!user) {
        // Handle failure (optional flash message)
        if (req.flash) {
          req.flash('error', info.message);
        }
        return res.redirect('/login');
      }

      // Log the user in
      req.logIn(user, (loginErr: Error | null) => {
        if (loginErr) {
          return next(loginErr);
        }

        // Generate JWT token after successful login
        const token = generateToken('admin', ADMIN_USERNAME);

        // Store the token in session
        if (req.session) {
          // Now TypeScript recognizes jwtToken as a valid property
          (req.session as any).jwtToken = token;
        }

        // Redirect to Swagger UI
        return res.redirect('/api-docs');
      });
    },
  )(req, res, next);
});

// Logout route to destroy the session and redirect to login page
router.get('/logout', (req: Request, res: Response): void => {
  req.logout((err: any) => {
    // Type the error if necessary
    if (err) {
      // Handle error and return the error response
      return res.status(500).send('Failed to log out');
    }
    return res.redirect('/login'); // Return the redirect after logout
  });
});

export default router;
