export function requireSessionUser(req, res, next) {
  // Debug logging to see what's in the session
  console.log('Session check:', {
    sessionExists: !!req.session,
    userInSession: req.session ? !!req.session.user : false,
    sessionId: req.sessionID,
    cookies: req.cookies,
    signedCookies: req.signedCookies
  });
  
  if (req.session && req.session.user) {
    console.log('User authenticated:', req.session.user.email);
    return next();
  }
  
  console.log('User not authenticated, redirecting to login');
  return res.status(401).json({ message: 'Not authenticated' });
}