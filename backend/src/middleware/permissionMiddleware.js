module.exports = function authorize(resource, action = 'view') {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    if (req.admin.role === 'SUPER_ADMIN' || req.admin.role === 'TURF_ADMIN') {
      return next();
    }

    if (req.admin.permissions?.[resource]?.[action] === true) {
      return next();
    }

    return res.status(403).json({ error: `Access denied: ${resource}.${action} permission required` });
  };
};
