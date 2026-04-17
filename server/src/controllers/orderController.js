const prisma = require('../utils/prisma');

const generateOrderNumber = () => {
  const prefix = 'A';
  const num = Math.floor(Math.random() * 900) + 100;
  return `${prefix}${num}`;
};

const emitOrderUpdate = (app, order, event = 'order:updated') => {
  const io = app.get('io');
  if (!io) return;

  io.to(`branch:${order.branchId}`).emit(event, order);
  io.to(`order:${order.id}`).emit(event, order);
  io.to('role:KITCHEN').emit(event, order);
  io.to('role:CASHIER').emit(event, order);
};

const getOrders = async (req, res) => {
  try {
    const { branchId, status, type, page = 1, limit = 20, startDate, endDate } = req.query;

    const where = {};
    if (branchId) where.branchId = branchId;
    else if (req.user.branchId && req.user.role !== 'ADMIN') {
      where.branchId = req.user.branchId;
    }
    if (status) where.status = status;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { menuItem: { select: { name: true, imageUrl: true } } } },
          payment: true,
          user: { select: { id: true, name: true, email: true } },
          branch: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: { include: { menuItem: { select: { name: true, imageUrl: true } } } },
        payment: true,
        branch: { select: { name: true } },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { menuItem: true } },
        payment: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
        branch: true,
        statusLogs: { orderBy: { createdAt: 'asc' } },
        review: true,
      },
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { branchId, type, items, notes, tableNumber, deliveryAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item' });
    }

    // Validate and price items
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map(i => i.menuItemId) }, isActive: true },
      include: { inventory: true },
    });

    if (menuItems.length !== items.length) {
      return res.status(400).json({ success: false, message: 'One or more menu items not found' });
    }

    const outOfStock = menuItems.filter(m => m.inventory?.status === 'OUT_OF_STOCK');
    if (outOfStock.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Out of stock: ${outOfStock.map(m => m.name).join(', ')}`,
      });
    }

    let totalAmount = 0;
    const orderItems = items.map(item => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      const unitPrice = parseFloat(menuItem.price);
      totalAmount += unitPrice * item.quantity;
      return { menuItemId: item.menuItemId, quantity: item.quantity, unitPrice, notes: item.notes };
    });

    let orderNumber;
    let attempts = 0;
    do {
      orderNumber = generateOrderNumber();
      const existing = await prisma.order.findUnique({ where: { orderNumber } });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user?.id || null,
        branchId,
        type,
        notes,
        tableNumber,
        deliveryAddress,
        totalAmount,
        status: 'PENDING',
        items: { create: orderItems },
        payment: {
          create: {
            method: paymentMethod || 'CASH',
            amount: totalAmount,
            status: type === 'DINE_IN' ? 'PENDING' : 'PENDING',
          },
        },
      },
      include: {
        items: { include: { menuItem: { select: { name: true, imageUrl: true } } } },
        payment: true,
        branch: { select: { name: true } },
      },
    });

    // Log status
    await prisma.orderStatusLog.create({
      data: { orderId: order.id, status: 'PENDING', note: 'Order placed' },
    });

    // Emit to kitchen and branch
    emitOrderUpdate(req.app, order, 'order:new');

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const { id } = req.params;

    const validTransitions = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY'],
      READY: ['OUT_FOR_DELIVERY', 'COMPLETED'],
      OUT_FOR_DELIVERY: ['DELIVERED'],
      DELIVERED: ['COMPLETED'],
    };

    const currentOrder = await prisma.order.findUnique({ where: { id } });
    if (!currentOrder) return res.status(404).json({ success: false, message: 'Order not found' });

    const allowed = validTransitions[currentOrder.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${currentOrder.status} to ${status}`,
      });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: { include: { menuItem: { select: { name: true } } } },
        payment: true,
        user: { select: { id: true, name: true } },
        branch: { select: { name: true } },
      },
    });

    await prisma.orderStatusLog.create({
      data: { orderId: id, status, note: note || `Status updated to ${status}` },
    });

    // Create notification if user exists
    if (order.userId) {
      const notifMap = {
        CONFIRMED: { type: 'ORDER_CONFIRMED', title: 'Order Confirmed', message: `Your order #${order.orderNumber} has been confirmed!` },
        PREPARING: { type: 'ORDER_PREPARING', title: 'Being Prepared', message: `Your order #${order.orderNumber} is being prepared!` },
        READY: { type: 'ORDER_READY', title: 'Order Ready', message: `Your order #${order.orderNumber} is ready!` },
        DELIVERED: { type: 'ORDER_DELIVERED', title: 'Delivered!', message: `Your order #${order.orderNumber} has been delivered!` },
        CANCELLED: { type: 'ORDER_CANCELLED', title: 'Order Cancelled', message: `Your order #${order.orderNumber} has been cancelled.` },
      };

      if (notifMap[status]) {
        await prisma.notification.create({
          data: {
            userId: order.userId,
            orderId: id,
            ...notifMap[status],
          },
        });
      }
    }

    emitOrderUpdate(req.app, order, 'order:statusChanged');

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel order in current status' });
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
      include: { items: { include: { menuItem: true } }, payment: true },
    });

    await prisma.orderStatusLog.create({
      data: { orderId: req.params.id, status: 'CANCELLED', note: req.body.reason || 'Cancelled by user' },
    });

    emitOrderUpdate(req.app, updated, 'order:statusChanged');

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getKitchenOrders = async (req, res) => {
  try {
    const { branchId } = req.query;
    const where = {
      status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] },
    };
    if (branchId) where.branchId = branchId;
    else if (req.user.branchId) where.branchId = req.user.branchId;

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { menuItem: { select: { id: true, name: true } } } },
        branch: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const { status, method } = req.body;
    const payment = await prisma.payment.update({
      where: { orderId: req.params.id },
      data: { status, method },
    });
    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getOrders, getMyOrders, getOrder, createOrder,
  updateOrderStatus, cancelOrder, getKitchenOrders, updatePayment,
};
