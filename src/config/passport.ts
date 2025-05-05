import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

// JWT options
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'default_jwt_secret',
};

// Local strategy options for login
passport.use(
  'admin-local',
  new LocalStrategy((username, password, done) => {
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      return done(null, { username });
    } else {
      return done(null, false, { message: 'Invalid credentials' });
    }
  }),
);

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: 'https://admin.niebieskie-aparaty.pl/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value;

      if (email === process.env.ADMIN_USERNAME) {
        return done(null, { username: email });
      }
      return done(null, false, { message: 'Unauthorized email' });
    },
  ),
);

// JWT strategy for authentication
passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      return done(null, { id: payload.id, username: payload.username });
    } catch (error) {
      return done(error, false);
    }
  }),
);

// Serialize and deserialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.username);
});

passport.deserializeUser((username: string, done) => {
  if (username === process.env.ADMIN_USERNAME) {
    done(null, { username });
  } else {
    done('No user', null);
  }
});

export default passport;
