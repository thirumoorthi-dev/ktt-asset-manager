const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { validateSchema } = require('../middleware/validation');
const { assetSchema, issueAssetSchema, returnAssetSchema } = require('../schemas');
const { Asset, AssetCategory, Employee, Branch, ReturnReason } = require('../models');

const getCreateAssetExtra = async (req) => {
  const categories = await AssetCategory.findAll({ where: { IsActive: true }, order: [['CategoryName', 'ASC']] });
  const branches = await Branch.findAll({ where: { IsActive: true }, order: [['BranchName', 'ASC']] });
  return { categories, branches, asset: req ? req.body : {}, isEdit: false, title: 'Add Asset' };
};

const getEditAssetExtra = async (req) => {
  const categories = await AssetCategory.findAll({ where: { IsActive: true }, order: [['CategoryName', 'ASC']] });
  const branches = await Branch.findAll({ where: { IsActive: true }, order: [['BranchName', 'ASC']] });
  const asset = { AssetId: req.params.id, ...req.body };
  return { categories, branches, asset, isEdit: true, title: 'Edit Asset' };
};

const getIssueAssetExtra = async (req) => {
  const assets = await Asset.findAll({ where: { Status: 'InStock' }, order: [['UniqueId', 'ASC']] });
  const employees = await Employee.findAll({ where: { IsActive: true }, order: [['EmployeeName', 'ASC']] });
  return { assets, employees, selectedAssetId: req.body.AssetId || '', title: 'Issue Asset' };
};

const getReturnAssetExtra = async (req) => {
  const assets = await Asset.findAll({ where: { Status: 'Issued' }, include: [{ model: Employee, as: 'CurrentEmployee' }], order: [['UniqueId', 'ASC']] });
  const branches = await Branch.findAll({ where: { IsActive: true }, order: [['BranchName', 'ASC']] });
  const returnReasons = await ReturnReason.findAll({ where: { IsActive: true }, order: [['ReasonName', 'ASC']] });
  return { assets, branches, returnReasons, selectedAssetId: req.body.AssetId || '', title: 'Return Asset' };
};

router.get('/', assetController.getAssets);
router.get('/next-unique-id', assetController.getNextUniqueIdApi);
router.get('/create', assetController.getCreateAsset);
router.post('/create', validateSchema(assetSchema, 'assets/form', getCreateAssetExtra), assetController.postCreateAsset);
router.get('/edit/:id', assetController.getEditAsset);
router.post('/edit/:id', validateSchema(assetSchema, 'assets/form', getEditAssetExtra), assetController.postEditAsset);
router.get('/stock', assetController.getStockView);
router.get('/issue', assetController.getIssueAsset);
router.post('/issue', validateSchema(issueAssetSchema, 'assets/issue', getIssueAssetExtra), assetController.postIssueAsset);
router.get('/return', assetController.getReturnAsset);
router.post('/return', validateSchema(returnAssetSchema, 'assets/return', getReturnAssetExtra), assetController.postReturnAsset);
router.post('/scrap', assetController.postScrapAsset);
router.get('/history', assetController.getAssetHistory);

module.exports = router;
