import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
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
    // Compare username and password from form submission
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      return done(null, { username });
    } else {
      return done(null, false, { message: 'Invalid credentials' });
    }
  }),
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

// Serialize and deserialize user for session (local login)
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
