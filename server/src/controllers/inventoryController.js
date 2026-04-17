const prisma = require('../utils/prisma');

const getInventory = async (req, res) => {
  try {
    const { branchId } = req.query;
    const where = {};
    if (branchId) where.branchId = branchId;
    else if (req.user.branchId) where.branchId = req.user.branchId;

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        menuItem: { include: { category: { select: { name: true } } } },
        branch: { select: { name: true } },
      },
      orderBy: { menuItem: { name: 'asc' } },
    });

    res.json({ success: true, data: inventory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateInventory = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const { status, quantity } = req.body;

    const inventory = await prisma.inventory.update({
      where: { menuItemId },
      data: { status, quantity },
      include: { menuItem: { select: { name: true } } },
    });

    // If out of stock, also disable the menu item display
    if (status === 'OUT_OF_STOCK') {
      const io = req.app.get('io');
      if (io) {
        io.emit('inventory:updated', { menuItemId, status });
      }
    }

    res.json({ success: true, data: inventory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const toggleStock = async (req, res) => {
  try {
    const { menuItemId } = req.params;

    const current = await prisma.inventory.findUnique({ where: { menuItemId } });
    if (!current) return res.status(404).json({ success: false, message: 'Inventory not found' });

    const newStatus = current.status === 'IN_STOCK' ? 'OUT_OF_STOCK' : 'IN_STOCK';

    const inventory = await prisma.inventory.update({
      where: { menuItemId },
      data: { status: newStatus },
      include: { menuItem: { select: { name: true } } },
    });

    const io = req.app.get('io');
    if (io) io.emit('inventory:updated', { menuItemId, status: newStatus });

    res.json({ success: true, data: inventory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getInventory, updateInventory, toggleStock };
