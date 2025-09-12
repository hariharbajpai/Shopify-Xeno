import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../models/db.js';
import { env } from '../utils/env.js';

passport.use(new GoogleStrategy({
  clientID: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  callbackURL: env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await prisma.user.findUnique({
      where: { googleId: profile.id }
    });

    if (user) {
      return done(null, user);
    }

    const existingEmailUser = await prisma.user.findUnique({
      where: { email: profile.emails[0].value }
    });

    if (existingEmailUser) {
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

passport.serializeUser((user, done) => {
  done(null, user.id);
});

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