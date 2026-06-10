const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Traditional Native Sign Up (Email/Password)
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Please provide all fields' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        xp: 0,
        matchesPlayed: 0,
        wallet: {
          create: { balance: 0 }
        }
      },
      include: { wallet: true }
    });

    // Create JWT Payload
    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Traditional Native Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || (!user.password && !user.id)) {
      return res.status(400).json({ error: 'Invalid credentials. If you used Google SSO, please try that.' });
    }

    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
    }

    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// SSO/Google Social Login Sync
exports.syncUser = async (req, res) => {
  const { id, email, name, avatar } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing required user fields' });
  }

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        avatar,
      },
      create: {
        id: id || undefined,
        email,
        name,
        avatar,
        xp: 0,
        matchesPlayed: 0,
        wallet: {
          create: { balance: 0 }
        }
      },
      include: { wallet: true }
    });

    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      message: 'User synced successfully via SSO',
      token,
      user
    });
  } catch (error) {
    console.error('Prisma Sync Error:', error);
    res.status(500).json({ error: 'Failed to sync SSO user' });
  }
};

// Get user profile (protected route)
exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { wallet: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update user profile (protected route)
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, expoPushToken, fcmToken } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (fcmToken !== undefined) updateData.fcmToken = fcmToken;
    if (expoPushToken !== undefined) updateData.expoPushToken = expoPushToken;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      include: { wallet: true }
    });

    res.json(user);
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

