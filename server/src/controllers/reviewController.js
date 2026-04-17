const prisma = require('../utils/prisma');

const createReview = async (req, res) => {
  try {
    const { orderId, menuItemId, rating, comment } = req.body;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user.id, status: { in: ['COMPLETED', 'DELIVERED'] } },
    });

    if (!order) {
      return res.status(400).json({ success: false, message: 'Can only review completed orders' });
    }

    const existing = await prisma.review.findUnique({ where: { orderId } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Order already reviewed' });
    }

    const review = await prisma.review.create({
      data: { userId: req.user.id, orderId, menuItemId, rating, comment },
      include: { user: { select: { name: true } } },
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { menuItemId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createReview, getReviews };
