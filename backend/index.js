const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const turfRoutes = require('./src/routes/turfRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const teamRoutes = require('./src/routes/teamRoutes');
const checkInRoutes = require('./src/routes/checkInRoutes');
const bannerRoutes = require('./src/routes/bannerRoutes');
const challengeRoutes = require('./src/routes/challengeRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const couponRoutes = require('./src/routes/couponRoutes');
const supportTicketRoutes = require('./src/routes/supportTicketRoutes');
const lfpRoutes = require('./src/routes/lfpRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');

const app = express();
const PORT = process.env.PORT || 5500;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Skipers API is operational', timestamp: new Date() });
});

// API Routes (nginx strips /api prefix, so don't add it here)
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/turfs', turfRoutes);
app.use('/bookings', bookingRoutes);
app.use('/teams', teamRoutes);
app.use('/check-ins', checkInRoutes);
app.use('/banners', bannerRoutes);
app.use('/challenges', challengeRoutes);
app.use('/notifications', notificationRoutes);
app.use('/coupons', couponRoutes);
app.use('/support-tickets', supportTicketRoutes);
app.use('/lfp', lfpRoutes);
app.use('/ai', aiRoutes);
app.use('/subscriptions', subscriptionRoutes);

// Database check and Start
const prisma = require('./src/config/db');

app.listen(PORT, '0.0.0.0', async () => {
  try {
    await prisma.$connect();
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
    console.log('✅ Database connected');
  } catch (e) {
    console.error('❌ DB Connection Error:', e);
  }
});
