const roleGuard = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

module.exports = roleGuard;
