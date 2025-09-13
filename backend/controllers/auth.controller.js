import { prisma } from '../models/db.js';
import { env } from '../utils/env.js';

const FRONTEND_SUCCESS_URL = env.FRONTEND_SUCCESS_URL;
const FRONTEND_FAILURE_URL = env.FRONTEND_FAILURE_URL;
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'connect.sid';

function safeRedirect(url, fallback) {
  try {
    const u = new URL(url);
    const allowed = [new URL(FRONTEND_SUCCESS_URL).origin, new URL(FRONTEND_FAILURE_URL).origin];
    if (allowed.includes(u.origin)) return u.toString();
  } catch {}
  return fallback;
}

export const googleAuthSuccess = async (req, res) => {
  try {
    console.log('Google auth success, user:', req.user);
    
    // COMMENTING OUT AUTHENTICATION CODE - ORIGINAL CODE:
    // if (!req.user) {
    //   const target = safeRedirect(`${FRONTEND_FAILURE_URL}?error=authentication_failed`, FRONTEND_FAILURE_URL);
    //   return res.redirect(target);
    // }
    //
    // const { googleId, email, name, avatar, role: roleFromIdP } = req.user;
    //
    // if (!email || !googleId) {
    //   const target = safeRedirect(`${FRONTEND_FAILURE_URL}?error=missing_profile`, FRONTEND_FAILURE_URL);
    //   return res.redirect(target);
    // }
    //
    // const user = await prisma.user.upsert({
    //   where: { email },
    //   update: {
    //     name,
    //     avatar: avatar || undefined,
    //     googleId,
    //     role: roleFromIdP || undefined,
    //   },
    //   create: {
    //     email,
    //     name,
    //     avatar: avatar || null,
    //     googleId,
    //     role: roleFromIdP || 'user',
    //   },
    //   select: { id: true, email: true, name: true, avatar: true, role: true },
    // });
    //
    // await new Promise((resolve, reject) =>
    //   req.session.regenerate((err) => (err ? reject(err) : resolve()))
    // );
    //
    // req.session.user = {
    //   id: user.id,
    //   email: user.email,
    //   name: user.name,
    //   avatar: user.avatar,
    //   role: user.role,
    // };
    //
    // req.session.v = 1;
    
    // Authentication removed - creating a dummy user
    console.log('Authentication bypassed - creating dummy user');
    const user = {
      id: 'dummy-id',
      email: 'dummy@example.com',
      name: 'Dummy User',
      avatar: null,
      role: 'admin'
    };
    
    console.log('Session set, redirecting to:', FRONTEND_SUCCESS_URL);

    const target = safeRedirect(FRONTEND_SUCCESS_URL, FRONTEND_FAILURE_URL);
    console.log('Redirecting to:', target);
    return res.redirect(target);
  } catch (error) {
    console.error('Google auth success error:', error);
    const target = safeRedirect(`${FRONTEND_FAILURE_URL}?error=server_error`, FRONTEND_FAILURE_URL);
    return res.redirect(target);
  }
};

export const googleAuthFailure = (_req, res) => {
  const target = safeRedirect(`${FRONTEND_FAILURE_URL}?error=oauth_cancelled`, FRONTEND_FAILURE_URL);
  res.redirect(target);
};

export const getCurrentUser = async (req, res) => {
  try {
    console.log('Getting current user, session:', {
      sessionExists: !!req.session,
      userInSession: req.session ? req.session.user : null,
      sessionId: req.sessionID
    });
    
    // COMMENTING OUT AUTHENTICATION CODE - ORIGINAL CODE:
    // if (!req.session?.user) {
    //   return res.status(401).json({ success: false, message: 'Not authenticated' });
    // }
    // const fresh = await prisma.user.findUnique({
    //   where: { id: req.session.user.id },
    //   select: { id: true, email: true, name: true, avatar: true, role: true },
    // });
    // if (!fresh) {
    //   return res.status(401).json({ success: false, message: 'User no longer exists' });
    // }
    
    // Authentication removed - returning dummy user data
    console.log('Authentication bypassed - returning dummy user data');
    return res.json({
      success: true,
      user: {
        id: 'dummy-id',
        email: 'dummy@example.com',
        name: 'Dummy User',
        avatar: null,
        role: 'admin',
      },
    });
  } catch (e) {
    console.error('getCurrentUser error:', e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const logout = (req, res) => {
  try {
    // COMMENTING OUT AUTHENTICATION CODE - ORIGINAL CODE:
    // req.session.destroy((err) => {
    //   if (err) {
    //     console.error('Session destroy error:', err);
    //     return res.status(500).json({ success: false, message: 'Could not log out' });
    //   }
    //   res.clearCookie(SESSION_COOKIE_NAME, {
    //     httpOnly: true,
    //     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    //     secure: process.env.NODE_ENV === 'production',
    //     domain: process.env.COOKIE_DOMAIN || undefined,
    //     path: '/',
    //   });
    //   return res.json({ success: true, message: 'Logged out successfully' });
    // });
    
    // Authentication removed - simple success response
    console.log('Logout bypassed');
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (e) {
    console.error('Logout error:', e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};