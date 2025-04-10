import { Router, Request, Response } from 'express';
import passport from 'passport';

const router = Router();

// Route for rendering the login page (you’ll use EJS for the login page)
router.get('/login', (req: Request, res: Response): void => {
  res.render('login'); // Assuming you have a login.ejs view
});

// Route for handling login POST request
router.post(
  '/login',
  passport.authenticate('admin-local', {
    successRedirect: '/api-docs', // Redirect to Swagger UI upon success
    failureRedirect: '/login', // Redirect back to login on failure
    failureFlash: true, // Optional, if using flash messages
  }),
);

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
