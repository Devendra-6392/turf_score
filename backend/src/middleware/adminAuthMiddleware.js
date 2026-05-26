const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { normalizePermissions } = require('../utils/staffPermissions');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

module.exports = async function adminAuthMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await prisma.adminPanelUser.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        turfId: true,
        permissions: true,
        isActive: true
      }
    });

    if (!admin || !admin.isActive) {
      return res.status(403).json({ error: 'This staff account is inactive or no longer exists' });
    }

    req.admin = {
      ...admin,
      permissions: admin.role === 'EMPLOYEE' ? normalizePermissions(admin.permissions) : admin.permissions
    };
    return next();
  } catch (error) {
    return res.status(401).json({ error: error.name === 'TokenExpiredError' ? 'Session expired, please login again' : 'Invalid admin token' });
  }
};
