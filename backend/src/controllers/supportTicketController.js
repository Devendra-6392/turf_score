const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==========================================
// USER CONTROLLERS
// ==========================================

exports.createTicket = async (req, res) => {
  try {
    const { subject, description, priority, category } = req.body;
    const userId = req.userId;

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject,
        description,
        priority: priority || 'MEDIUM',
        category: category || 'GENERAL',
        status: 'OPEN'
      }
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
};

exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ error: 'Failed to fetch support tickets' });
  }
};

// ==========================================
// ADMIN CONTROLLERS
// ==========================================

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      orderBy: [
        { status: 'asc' }, // OPEN first
        { createdAt: 'desc' }
      ],
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        }
      }
    });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching all tickets:', error);
    res.status(500).json({ error: 'Failed to fetch all tickets' });
  }
};

exports.resolveTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        updatedAt: new Date()
      }
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: ticket.userId,
        title: 'Support Ticket Resolved ✅',
        body: `Your ticket regarding "${ticket.subject}" has been marked as resolved by our team.`,
        type: 'REMINDER',
        sentAt: new Date()
      }
    });

    res.json(ticket);
  } catch (error) {
    console.error('Error resolving ticket:', error);
    res.status(500).json({ error: 'Failed to resolve ticket' });
  }
};
