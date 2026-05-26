const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { normalizePermissions, canAccessTurf } = require('../utils/staffPermissions');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.adminPanelUser.findUnique({
      where: { email },
      include: { turf: true }
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, role: admin.role, turfId: admin.turfId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        turfId: admin.turfId,
        turfName: admin.turf?.name,
        permissions: admin.role === 'EMPLOYEE' ? normalizePermissions(admin.permissions) : (admin.permissions || {})
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCurrentAdmin = async (req, res) => {
  const admin = await prisma.adminPanelUser.findUnique({
    where: { id: req.admin.id },
    include: { turf: { select: { name: true } } }
  });

  res.json({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    turfId: admin.turfId,
    turfName: admin.turf?.name,
    permissions: admin.role === 'EMPLOYEE' ? normalizePermissions(admin.permissions) : (admin.permissions || {})
  });
};

// Admin Register (General)
exports.adminRegister = async (req, res) => {
  try {
    const { name, email, password, role, secretKey } = req.body;

    // Optional: Protect Super Admin registration with a secret key
    if (role === 'SUPER_ADMIN' && secretKey !== 'SUPER_ADMIN_SECRET') {
        return res.status(403).json({ error: 'Unauthorized role assignment' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.adminPanelUser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'TURF_ADMIN'
      }
    });

    res.status(201).json({ message: 'Admin created successfully', id: admin.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create Turf Admin (Super Admin only)
exports.createTurfAdmin = async (req, res) => {
  try {
    if (req.admin?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only super admins can create turf administrators' });
    }

    const { name, email, turfId } = req.body;
    if (!name || !email || !turfId) {
      return res.status(400).json({ error: 'Name, email and turf are required' });
    }

    // Default password as requested: name@12345
    const defaultPassword = `${name}@12345`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const admin = await prisma.adminPanelUser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'TURF_ADMIN',
        turfId
      }
    });

    res.status(201).json({
      message: 'Turf Admin created successfully',
      credentials: {
        email,
        password: defaultPassword
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Create Employee (Turf Admin only)
exports.createEmployee = async (req, res) => {
  try {
    if (req.admin?.role !== 'TURF_ADMIN' && req.admin?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only administrators can add employees' });
    }

    const { name, email, password } = req.body;
    const turfId = req.admin.role === 'TURF_ADMIN' ? req.admin.turfId : req.body.turfId;
    if (!name || !email || !turfId) {
      return res.status(400).json({ error: 'Missing required fields: name, email and turf' });
    }
    // Verify turf exists
    const turf = await prisma.turf.findUnique({ where: { id: turfId } });
    if (!turf) {
      return res.status(404).json({ error: `Turf with ID ${turfId} not found` });
    }
    // Default password if not provided
    const userPassword = password || `${name}@emp123`;
    const hashedPassword = await bcrypt.hash(userPassword, 10);
    const employee = await prisma.adminPanelUser.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'EMPLOYEE',
          turfId,
          permissions: normalizePermissions(req.body.permissions)
        }
    });
    res.status(201).json({
      message: 'Employee created successfully',
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        turfId: employee.turfId,
        permissions: employee.permissions,
        defaultPassword: userPassword
      }
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get Employees for a Turf
exports.getEmployees = async (req, res) => {
  try {
    if (req.admin?.role !== 'TURF_ADMIN' && req.admin?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only administrators can manage employees' });
    }

    const where = { role: 'EMPLOYEE' };
    if (req.admin.role === 'TURF_ADMIN') {
      where.turfId = req.admin.turfId;
    } else if (req.query.turfId) {
      where.turfId = req.query.turfId;
    }

    const employees = await prisma.adminPanelUser.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        turfId: true,
        isActive: true,
        permissions: true,
        turf: { select: { name: true } }
      }
    });

    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Employee
exports.updateEmployee = async (req, res) => {
  try {
    if (req.admin?.role !== 'TURF_ADMIN' && req.admin?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only administrators can edit employees' });
    }

    const { id } = req.params;
    const { name, email, isActive, permissions } = req.body;
    const existingEmployee = await prisma.adminPanelUser.findFirst({ where: { id, role: 'EMPLOYEE' } });
    if (!existingEmployee || !canAccessTurf(req.admin, existingEmployee.turfId)) {
      return res.status(404).json({ error: 'Employee not found for your turf' });
    }

    const employee = await prisma.adminPanelUser.update({
      where: { id },
      data: {
        name,
        email,
        isActive: typeof isActive === 'boolean' ? isActive : undefined,
        permissions: permissions ? normalizePermissions(permissions) : undefined
      }
    });

    res.json({ message: 'Employee updated successfully', employee });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Employee
exports.deleteEmployee = async (req, res) => {
  try {
    if (req.admin?.role !== 'TURF_ADMIN' && req.admin?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only administrators can delete employees' });
    }

    const { id } = req.params;
    const employee = await prisma.adminPanelUser.findFirst({ where: { id, role: 'EMPLOYEE' } });
    if (!employee || !canAccessTurf(req.admin, employee.turfId)) {
      return res.status(404).json({ error: 'Employee not found for your turf' });
    }

    await prisma.adminPanelUser.delete({
      where: { id }
    });

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all users (Super Admin only)
exports.getUsers = async (req, res) => {
  try {
    if (req.admin?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only super admins can view users list' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        xp: true,
        matchesPlayed: true,
        wallet: {
          select: {
            balance: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedUsers = users.map(user => ({
      ...user,
      walletBalance: user.wallet ? user.wallet.balance : 0
    }));

    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Credit User Wallet (Super Admin only)
exports.creditUserWallet = async (req, res) => {
  try {
    if (req.admin?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only super admins can credit user wallets' });
    }

    const { userId } = req.params;
    const { amount, description } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid positive number for amount' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let wallet = user.wallet;
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 0
        }
      });
    }

    const previousBalance = wallet.balance;
    const newBalance = previousBalance + parsedAmount;

    const [updatedWallet] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance }
      }),
      prisma.transaction.create({
        data: {
          walletId: wallet.id,
          amount: parsedAmount,
          type: 'CREDIT',
          description: description || 'Refund/Credit by Admin',
          previousBalance,
          newBalance,
          status: 'COMPLETED'
        }
      })
    ]);

    res.json({
      message: 'Wallet credited successfully',
      wallet: updatedWallet
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
