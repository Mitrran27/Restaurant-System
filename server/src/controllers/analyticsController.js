const prisma = require('../utils/prisma');

const getDashboardStats = async (req, res) => {
  try {
    const { branchId, period = '7d' } = req.query;

    const periodMap = { '1d': 1, '7d': 7, '30d': 30, '90d': 90 };
    const days = periodMap[period] || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where = { createdAt: { gte: startDate } };
    if (branchId) where.branchId = branchId;
    else if (req.user.branchId && req.user.role !== 'ADMIN') {
      where.branchId = req.user.branchId;
    }

    const [
      totalOrders,
      completedOrders,
      cancelledOrders,
      revenue,
      pendingOrders,
    ] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.count({ where: { ...where, status: { in: ['COMPLETED', 'DELIVERED'] } } }),
      prisma.order.count({ where: { ...where, status: 'CANCELLED' } }),
      prisma.order.aggregate({
        where: { ...where, status: { in: ['COMPLETED', 'DELIVERED'] } },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] }, ...(branchId ? { branchId } : {}) } }),
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        completedOrders,
        cancelledOrders,
        pendingOrders,
        revenue: parseFloat(revenue._sum.totalAmount || 0),
        completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getRevenueChart = async (req, res) => {
  try {
    const { branchId, days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const where = {
      createdAt: { gte: startDate },
      status: { in: ['COMPLETED', 'DELIVERED'] },
    };
    if (branchId) where.branchId = branchId;

    const orders = await prisma.order.findMany({
      where,
      select: { totalAmount: true, createdAt: true },
    });

    // Group by day
    const dailyRevenue = {};
    for (let i = 0; i < parseInt(days); i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      dailyRevenue[key] = 0;
    }

    orders.forEach(order => {
      const key = order.createdAt.toISOString().split('T')[0];
      if (dailyRevenue[key] !== undefined) {
        dailyRevenue[key] += parseFloat(order.totalAmount);
      }
    });

    const chartData = Object.entries(dailyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 }));

    res.json({ success: true, data: chartData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getBestSellers = async (req, res) => {
  try {
    const { branchId, limit = 10 } = req.query;

    const whereOrder = { status: { in: ['COMPLETED', 'DELIVERED'] } };
    if (branchId) whereOrder.branchId = branchId;

    const items = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      _sum: { quantity: true },
      _count: { menuItemId: true },
      where: { order: whereOrder },
      orderBy: { _sum: { quantity: 'desc' } },
      take: parseInt(limit),
    });

    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map(i => i.menuItemId) } },
      select: { id: true, name: true, price: true, imageUrl: true, category: { select: { name: true } } },
    });

    const result = items.map(item => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      return {
        ...menuItem,
        totalSold: item._sum.quantity,
        orderCount: item._count.menuItemId,
      };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getPeakHours = async (req, res) => {
  try {
    const { branchId } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const where = { createdAt: { gte: startDate } };
    if (branchId) where.branchId = branchId;

    const orders = await prisma.order.findMany({
      where,
      select: { createdAt: true },
    });

    const hourCount = Array(24).fill(0);
    orders.forEach(order => {
      const hour = order.createdAt.getHours();
      hourCount[hour]++;
    });

    const data = hourCount.map((count, hour) => ({
      hour,
      label: `${hour.toString().padStart(2, '0')}:00`,
      orders: count,
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getOrderTypeStats = async (req, res) => {
  try {
    const { branchId } = req.query;
    const where = {};
    if (branchId) where.branchId = branchId;

    const stats = await prisma.order.groupBy({
      by: ['type'],
      _count: { type: true },
      where,
    });

    res.json({ success: true, data: stats.map(s => ({ type: s.type, count: s._count.type })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboardStats, getRevenueChart, getBestSellers, getPeakHours, getOrderTypeStats };
