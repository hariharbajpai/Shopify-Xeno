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

// Google OAuth Routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/failure' }),
  googleAuthSuccess
);

// Auth Status Routes
router.get('/user', getCurrentUser);
router.get('/current', authenticateToken, getCurrentUser); // JWT-protected endpoint
router.post('/logout', logout);
router.get('/failure', googleAuthFailure);

export default router;