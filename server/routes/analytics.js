const router = require('express').Router();
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const Order = require('../models/Order');
const asyncHandler = require('../middleware/async');
const { protect } = require('../middleware/auth');

router.use(protect);

// Dashboard + report data for the logged-in farmer
router.get('/summary', asyncHandler(async (req, res) => {
  const owner = req.user._id;
  const [farms, crops, orders] = await Promise.all([
    Farm.find({ owner }),
    Crop.find({ owner }),
    Order.find({ user: owner, status: { $ne: 'cancelled' } }),
  ]);

  const stageCounts = {};
  const yieldByCrop = {};
  const usageByType = {};
  const costByMonth = {};
  let totalCost = 0;

  crops.forEach((c) => {
    stageCounts[c.stage] = (stageCounts[c.stage] || 0) + 1;
    const y = yieldByCrop[c.name] || { expected: 0, actual: 0 };
    y.expected += c.expectedYield || 0;
    y.actual += c.actualYield || 0;
    yieldByCrop[c.name] = y;
    c.resourceUsage.forEach((u) => {
      usageByType[u.type] = (usageByType[u.type] || 0) + u.quantity;
      totalCost += u.cost || 0;
      const m = new Date(u.date).toISOString().slice(0, 7);
      costByMonth[m] = (costByMonth[m] || 0) + (u.cost || 0);
    });
  });

  const orderSpend = orders.reduce((s, o) => s + o.total, 0);
  const upcomingHarvests = crops
    .filter((c) => c.stage !== 'harvested' && c.expectedHarvestDate >= new Date())
    .sort((a, b) => a.expectedHarvestDate - b.expectedHarvestDate)
    .slice(0, 5)
    .map((c) => ({ _id: c._id, name: c.name, expectedHarvestDate: c.expectedHarvestDate, stage: c.stage }));

  res.json({
    totals: {
      farms: farms.length,
      crops: crops.length,
      activeCrops: crops.filter((c) => c.stage !== 'harvested').length,
      totalArea: farms.reduce((s, f) => s + f.size, 0),
      orders: orders.length,
      orderSpend,
      resourceCost: totalCost,
    },
    stageCounts,
    yieldByCrop: Object.entries(yieldByCrop).map(([name, v]) => ({ name, ...v })),
    usageByType: Object.entries(usageByType).map(([type, quantity]) => ({ type, quantity })),
    costByMonth: Object.entries(costByMonth).sort().map(([month, cost]) => ({ month, cost })),
    upcomingHarvests,
  });
}));

module.exports = router;
