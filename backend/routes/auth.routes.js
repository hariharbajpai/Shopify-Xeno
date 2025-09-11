import express from 'express';
import passport from 'passport';
import { 
  googleAuthSuccess, 
  googleAuthFailure, 
  getCurrentUser, 
  logout 
} from '../controllers/auth.controller.js';

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
router.post('/logout', logout);
router.get('/failure', googleAuthFailure);

export default router;