const express = require('express');
const router = express.Router();
const { Employee, Asset } = require('../models');
const { Op } = require('sequelize');

router.get('/', async (req, res) => {
  try {
    const totalEmployees = await Employee.count();
    const activeEmployees = await Employee.count({ where: { IsActive: true } });

    const totalAssets = await Asset.count();
    const assetsScrapped = await Asset.count({ where: { Status: 'Scrapped' } });

    const inStockAssets = await Asset.findAll({ where: { Status: 'InStock' } });
    const issuedAssets = await Asset.findAll({ where: { Status: 'Issued' } });
    const assetsInStock = inStockAssets.reduce((sum, a) => sum + (parseInt(a.Quantity) || 0), 0);
    const assetsIssued = issuedAssets.reduce((sum, a) => sum + (parseInt(a.Quantity) || 0), 0);

    const activeAssets = await Asset.findAll({
      where: { Status: { [Op.ne]: 'Scrapped' } }
    });
    const totalValue = activeAssets.reduce((sum, asset) => sum + (parseFloat(asset.Value) || 0), 0);

    res.render('dashboard', {
      totalEmployees,
      activeEmployees,
      totalAssets,
      assetsInStock,
      assetsIssued,
      assetsScrapped,
      totalValue,
      title: 'Dashboard'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router.use('/employees', require('./employees'));
router.use('/categories', require('./categories'));
router.use('/assets', require('./assets'));
router.use('/branches', require('./branches'));
router.use('/departments', require('./departments'));
router.use('/return-reasons', require('./returnReasons'));

module.exports = router;
