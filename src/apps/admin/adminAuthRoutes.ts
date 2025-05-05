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
    (err: Error | null, user: any, info: { message: string }) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        if (req.flash) {
          req.flash('error', info.message);
        }
        return res.redirect('/login');
      }

      req.logIn(user, (loginErr: Error | null) => {
        if (loginErr) {
          return next(loginErr);
        }

        const token = generateToken('admin', ADMIN_USERNAME);
        (req.session as any).jwtToken = token;
        return res.redirect('/users');
      });
    },
  )(req, res, next);
});

// Google Auth Routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', failureFlash: true }),
  (req: Request, res: Response) => {
    const token = generateToken('admin', ADMIN_USERNAME);
    (req.session as any).jwtToken = token;
    res.redirect('/users');
  },
);

router.get('/logout', (req: Request, res: Response): void => {
  req.logout((err: any) => {
    if (err) {
      return res.status(500).send('Failed to log out');
    }
    return res.redirect('/login');
  });
});

export default router;
