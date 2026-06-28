const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all equipment / add-ons
exports.getEquipments = async (req, res) => {
  try {
    const equipments = await prisma.addOnProduct.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(equipments);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new equipment
exports.createEquipment = async (req, res) => {
  try {
    const { name, description, price, isRentable, stockCount } = req.body;
    
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const newEquipment = await prisma.addOnProduct.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        isRentable: isRentable !== undefined ? isRentable : true,
        stockCount: parseInt(stockCount) || 10
      }
    });

    res.status(201).json(newEquipment);
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update equipment
exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, isRentable, stockCount, isActive } = req.body;

    const updatedEquipment = await prisma.addOnProduct.update({
      where: { id },
      data: {
        name,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        isRentable,
        stockCount: stockCount !== undefined ? parseInt(stockCount) : undefined,
        isActive
      }
    });

    res.json(updatedEquipment);
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete (Deactivate) equipment
exports.deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.addOnProduct.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
