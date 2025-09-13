import express from 'express';
import passport from 'passport';
import { 
  googleAuthSuccess, 
  googleAuthFailure, 
  getCurrentUser, 
  logout 
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// COMMENTING OUT AUTHENTICATION ROUTES - ORIGINAL CODE:
// router.get('/google',
//   passport.authenticate('google', { scope: ['profile', 'email'] })
// );
//
// router.get('/google/callback',
//   passport.authenticate('google', { failureRedirect: '/auth/failure' }),
//   googleAuthSuccess
// );

// MODIFIED CODE - KEEPING ROUTES BUT REMOVING AUTHENTICATION:
router.get('/google', (req, res) => {
  // Authentication removed - redirecting to success page
  console.log('Google auth bypassed');
  res.redirect('/auth/user');
});

router.get('/google/callback', (req, res) => {
  // Authentication removed - redirecting to success page
  console.log('Google auth callback bypassed');
  res.redirect('/auth/user');
});

// COMMENTING OUT AUTHENTICATED ROUTES - ORIGINAL CODE:
// router.get('/user', getCurrentUser);
// router.get('/current', authenticateToken, getCurrentUser);
// router.post('/logout', logout);
// router.get('/failure', googleAuthFailure);

// MODIFIED CODE - MAKING ALL ROUTES PUBLIC:
router.get('/user', getCurrentUser);
router.get('/current', getCurrentUser); // Removed authenticateToken middleware
router.post('/logout', (req, res) => {
  // Authentication removed - simple success response
  console.log('Logout bypassed');
  res.json({ success: true, message: 'Logged out successfully' });
});
router.get('/failure', googleAuthFailure);

export default router;