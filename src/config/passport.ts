import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';

dotenv.config();

// JWT options
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'default_jwt_secret',
};

// JWT strategy for authentication
passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      return done(null, { id: payload.id, username: payload.username });
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
