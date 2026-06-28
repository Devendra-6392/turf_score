const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to check access
const canAccessTurf = (admin, turfId) => {
  return admin.role === 'SUPER_ADMIN' || admin.turfId === turfId;
};

// Create a new expense
exports.createExpense = async (req, res) => {
  try {
    const { turfId, category, amount, date, description } = req.body;
    
    if (!canAccessTurf(req.admin, turfId)) {
      return res.status(403).json({ error: 'Not authorized for this turf' });
    }

    const expense = await prisma.expense.create({
      data: {
        turfId,
        category,
        amount: parseFloat(amount),
        date: new Date(date),
        description
      }
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get expenses for a turf (with optional filters)
exports.getExpenses = async (req, res) => {
  try {
    const { turfId } = req.params;
    const { startDate, endDate, category } = req.query;

    if (!canAccessTurf(req.admin, turfId)) {
      return res.status(403).json({ error: 'Not authorized for this turf' });
    }

    const where = { turfId };
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    if (category) {
      where.category = category;
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, amount, date, description } = req.body;

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense || !canAccessTurf(req.admin, expense.turfId)) {
      return res.status(403).json({ error: 'Not authorized or not found' });
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        category,
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        date: date ? new Date(date) : undefined,
        description
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense || !canAccessTurf(req.admin, expense.turfId)) {
      return res.status(403).json({ error: 'Not authorized or not found' });
    }

    await prisma.expense.delete({ where: { id } });
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get P&L Report
exports.getProfitAndLoss = async (req, res) => {
  try {
    const { turfId } = req.params;
    let { startDate, endDate } = req.query;

    if (!canAccessTurf(req.admin, turfId)) {
      return res.status(403).json({ error: 'Not authorized for this turf' });
    }

    // Default to current month if not provided
    if (!startDate || !endDate) {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    }

    // 1. Get Revenue (Confirmed Bookings)
    const bookings = await prisma.booking.findMany({
      where: {
        turfId,
        status: { in: ['CONFIRMED', 'PAID', 'COMPLETED'] },
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);

    // 2. Get Expenses
    const expenses = await prisma.expense.findMany({
      where: {
        turfId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

    res.json({
      startDate,
      endDate,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      expensesByCategory
    });
  } catch (error) {
    console.error('Error getting P&L:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
