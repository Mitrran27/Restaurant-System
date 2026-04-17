const prisma = require('../utils/prisma');

const getBranches = async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: branches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createBranch = async (req, res) => {
  try {
    const branch = await prisma.branch.create({ data: req.body });
    res.status(201).json({ success: true, data: branch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateBranch = async (req, res) => {
  try {
    const branch = await prisma.branch.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: branch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getBranches, createBranch, updateBranch };
