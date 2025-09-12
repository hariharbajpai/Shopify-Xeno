export function requireAdmin(req, res, next) {
  try {
    const role = req.session?.user?.role || req.user?.role;
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (err) {
    next(err);
  }
}

export default requireAdmin;