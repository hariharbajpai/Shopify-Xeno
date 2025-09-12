// middleware/sessionAuth.js
export function requireSessionUser(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ message: 'Not authenticated' });
}
