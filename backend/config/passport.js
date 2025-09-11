import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../models/db.js';
import { env } from '../utils/env.js';

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  callbackURL: env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { googleId: profile.id }
    });

    if (user) {
      // User exists, return the user
      return done(null, user);
    }

    // Check if user exists with the same email
    const existingEmailUser = await prisma.user.findUnique({
      where: { email: profile.emails[0].value }
    });

    if (existingEmailUser) {
      // Update existing user with Google ID
      user = await prisma.user.update({
        where: { email: profile.emails[0].value },
        data: {
          googleId: profile.id,
          name: profile.displayName,
          avatar: profile.photos[0]?.value
        }
      });
      return done(null, user);
    }

    // Create new user
    user = await prisma.user.create({
      data: {
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0]?.value,
        role: 'user'
      }
    });

    return done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;