const prisma = require('../utils/prisma');

const getMenuItems = async (req, res) => {
  try {
    const { branchId, categoryId, search, includeOutOfStock } = req.query;

    const where = { isActive: true };
    if (branchId) where.branchId = branchId;
    if (categoryId) where.categoryId = categoryId;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const items = await prisma.menuItem.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        inventory: { select: { status: true, quantity: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
    });

    const itemsWithRating = items.map(item => {
      const avgRating = item.reviews.length > 0
        ? item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length
        : null;

      const inStock = !item.inventory || item.inventory.status === 'IN_STOCK';

      if (!includeOutOfStock && !inStock) return null;

      return {
        ...item,
        averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        reviewCount: item.reviews.length,
        inStock,
        reviews: undefined,
      };
    }).filter(Boolean);

    res.json({ success: true, data: itemsWithRating });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMenuItem = async (req, res) => {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        inventory: true,
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, categoryId, branchId, imageUrl } = req.body;

    const item = await prisma.menuItem.create({
      data: { name, description, price, categoryId, branchId, imageUrl },
      include: { category: true },
    });

    // Create inventory entry
    await prisma.inventory.create({
      data: {
        menuItemId: item.id,
        branchId: branchId || item.branchId,
        status: 'IN_STOCK',
        quantity: 100,
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, categoryId, imageUrl, isActive } = req.body;

    const item = await prisma.menuItem.update({
      where: { id: req.params.id },
      data: { name, description, price, categoryId, imageUrl, isActive },
      include: { category: true, inventory: true },
    });

    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    await prisma.menuItem.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ success: true, message: 'Menu item deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const category = await prisma.category.create({ data: req.body });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem,
  getCategories, createCategory, updateCategory,
};
