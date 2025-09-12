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
    if (!req.user) {
      const target = safeRedirect(`${FRONTEND_FAILURE_URL}?error=authentication_failed`, FRONTEND_FAILURE_URL);
      return res.redirect(target);
    }

    const { googleId, email, name, avatar, role: roleFromIdP } = req.user;

    if (!email || !googleId) {
      const target = safeRedirect(`${FRONTEND_FAILURE_URL}?error=missing_profile`, FRONTEND_FAILURE_URL);
      return res.redirect(target);
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        avatar: avatar || undefined,
        googleId,
        role: roleFromIdP || undefined,
      },
      create: {
        email,
        name,
        avatar: avatar || null,
        googleId,
        role: roleFromIdP || 'user',
      },
      select: { id: true, email: true, name: true, avatar: true, role: true },
    });

    await new Promise((resolve, reject) =>
      req.session.regenerate((err) => (err ? reject(err) : resolve()))
    );

    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
    };

    req.session.v = 1;

    const target = safeRedirect(FRONTEND_SUCCESS_URL, FRONTEND_FAILURE_URL);
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
    if (!req.session?.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const fresh = await prisma.user.findUnique({
      where: { id: req.session.user.id },
      select: { id: true, email: true, name: true, avatar: true, role: true },
    });
    if (!fresh) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    return res.json({
      success: true,
      user: {
        id: fresh.id,
        email: fresh.email,
        name: fresh.name,
        avatar: fresh.avatar,
        role: fresh.role,
      },
    });
  } catch (e) {
    console.error('getCurrentUser error:', e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const logout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({ success: false, message: 'Could not log out' });
      }
      res.clearCookie(SESSION_COOKIE_NAME, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.COOKIE_DOMAIN || undefined,
        path: '/',
      });
      return res.json({ success: true, message: 'Logged out successfully' });
    });
  } catch (e) {
    console.error('Logout error:', e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};