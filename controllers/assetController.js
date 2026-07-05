const { Asset, AssetCategory, Employee, AssetHistory, Branch, ReturnReason } = require('../models');
const { Op } = require('sequelize');
const SYSTEM_USER_ID = process.env.SYSTEM_USER_ID || '00000000-0000-0000-0000-000000000000';

exports.getAssets = async (req, res) => {
  try {
    const { category, status } = req.query;
    const where = {};
    if (category) {
      where.CategoryId = category;
    }
    if (status === 'all') {
      // no filter
    } else if (status) {
      where.Status = status;
    } else {
      where.Status = { [Op.ne]: 'Scrapped' };
    }
    const assets = await Asset.findAll({
      where,
      include: [
        { model: AssetCategory, as: 'Category' },
        { model: Employee, as: 'CurrentEmployee' }
      ],
      order: [['UniqueId', 'ASC']]
    });

    const assetIds = assets.map(a => a.AssetId);
    const issuedQtyMap = {};
    if (assetIds.length > 0) {
      const issueRecords = await AssetHistory.findAll({
        where: { AssetId: { [Op.in]: assetIds }, ActionType: 'Issue' },
        attributes: ['AssetId']
      });
      const returnRecords = await AssetHistory.findAll({
        where: { AssetId: { [Op.in]: assetIds }, ActionType: 'Return' },
        attributes: ['AssetId']
      });
      assetIds.forEach(id => {
        const issued = issueRecords.filter(r => r.AssetId === id).length;
        const returned = returnRecords.filter(r => r.AssetId === id).length;
        issuedQtyMap[id] = Math.max(0, issued - returned);
      });
    }
    assets.forEach(asset => {
      asset.issuedQty = issuedQtyMap[asset.AssetId] || 0;
    });

    const categories = await AssetCategory.findAll({ where: { IsActive: true }, order: [['CategoryName', 'ASC']] });
    res.render('assets/index', {
      assets,
      categories,
      currentCategoryFilter: category || '',
      currentStatusFilter: status || '',
      title: 'Asset Master'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

const getCategoryPrefix = (categoryName) => {
  const name = categoryName.toLowerCase();
  if (name.includes('laptop')) return 'L';
  if (name.includes('mobile') || name.includes('phone')) return 'M';
  if (name.includes('tablet')) return 'TB';
  if (name.includes('screw') || name.includes('tool') || name.includes('driver')) return 'T';
  if (name.includes('drill') || name.includes('machine')) return 'D';
  return categoryName.charAt(0).toUpperCase();
};

const generateNextAssetUniqueIdForCategory = async (categoryId) => {
  if (!categoryId) {
    return '';
  }
  const category = await AssetCategory.findByPk(categoryId);
  if (!category) {
    return '';
  }
  const prefix = getCategoryPrefix(category.CategoryName);
  const searchPrefix = `AST-${prefix}`;

  const assets = await Asset.findAll({
    where: {
      UniqueId: {
        [Op.like]: `${searchPrefix}%`
      }
    },
    attributes: ['UniqueId']
  });

  let maxNum = 0;
  const regex = new RegExp(`^AST-${prefix}(\\d+)$`, 'i');
  for (const asset of assets) {
    const match = asset.UniqueId.match(regex);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) {
        maxNum = num;
      }
    }
  }
  return `AST-${prefix}${String(maxNum + 1).padStart(3, '0')}`;
};

exports.getNextUniqueIdApi = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const nextUniqueId = await generateNextAssetUniqueIdForCategory(categoryId);
    res.json({ uniqueId: nextUniqueId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getCreateAsset = async (req, res) => {
  try {
    const categories = await AssetCategory.findAll({ where: { IsActive: true }, order: [['CategoryName', 'ASC']] });
    const branches = await Branch.findAll({ where: { IsActive: true }, order: [['BranchName', 'ASC']] });
    res.render('assets/form', {
      asset: { UniqueId: '' },
      categories,
      branches,
      isEdit: false,
      title: 'Add Asset'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.postCreateAsset = async (req, res) => {
  try {
    let { UniqueId, SerialNumber, Make, Model, Value, Quantity, Branch: selectedBranch, PurchaseDate, CategoryId } = req.body;
    const categories = await AssetCategory.findAll({ where: { IsActive: true }, order: [['CategoryName', 'ASC']] });
    const branches = await Branch.findAll({ where: { IsActive: true }, order: [['BranchName', 'ASC']] });
    
    if (!UniqueId || UniqueId === '') {
      UniqueId = await generateNextAssetUniqueIdForCategory(CategoryId);
    }

    let existing = await Asset.findOne({ where: { UniqueId } });
    while (existing) {
      const category = await AssetCategory.findByPk(CategoryId);
      const prefix = getCategoryPrefix(category.CategoryName);
      const regex = new RegExp(`^AST-${prefix}(\\d+)$`, 'i');
      const match = UniqueId.match(regex);
      if (match) {
        const num = parseInt(match[1], 10) + 1;
        UniqueId = `AST-${prefix}${String(num).padStart(3, '0')}`;
      } else {
        UniqueId = `${UniqueId}-1`;
      }
      existing = await Asset.findOne({ where: { UniqueId } });
    }

    const existSerial = await Asset.findOne({ where: { SerialNumber } });
    if (existSerial) {
      return res.render('assets/form', {
        asset: req.body,
        categories,
        branches,
        isEdit: false,
        error: 'Serial Number already exists',
        title: 'Add Asset'
      });
    }
    const asset = await Asset.create({
      UniqueId,
      SerialNumber,
      Make,
      Model,
      Value: parseFloat(Value) || 0,
      Quantity: parseInt(Quantity) || 1,
      Status: 'InStock',
      Branch: selectedBranch,
      PurchaseDate: PurchaseDate || null,
      CategoryId,
      CreatedBy: SYSTEM_USER_ID
    });
    await AssetHistory.create({
      AssetId: asset.AssetId,
      ActionType: 'Purchase',
      ActionDate: PurchaseDate ? new Date(PurchaseDate) : new Date(),
      Notes: 'Asset purchased and registered in system.',
      CreatedBy: SYSTEM_USER_ID
    });
    res.redirect('/assets');
  } catch (err) {
    console.error(err);
    const categories = await AssetCategory.findAll({ where: { IsActive: true } });
    const branches = await Branch.findAll({ where: { IsActive: true }, order: [['BranchName', 'ASC']] });
    res.render('assets/form', {
      asset: req.body,
      categories,
      branches,
      isEdit: false,
      error: 'Error creating asset: ' + err.message,
      title: 'Add Asset'
    });
  }
};

exports.getEditAsset = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) {
      return res.status(404).send('Asset not found');
    }
    const categories = await AssetCategory.findAll({ where: { IsActive: true }, order: [['CategoryName', 'ASC']] });
    const branches = await Branch.findAll({ where: { IsActive: true }, order: [['BranchName', 'ASC']] });
    res.render('assets/form', {
      asset,
      categories,
      branches,
      isEdit: true,
      title: 'Edit Asset'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.postEditAsset = async (req, res) => {
  const { id } = req.params;
  try {
    const { UniqueId, SerialNumber, Make, Model, Value, Quantity, Branch: selectedBranch, PurchaseDate, CategoryId, Status } = req.body;
    const categories = await AssetCategory.findAll({ where: { IsActive: true } });
    const branches = await Branch.findAll({ where: { IsActive: true }, order: [['BranchName', 'ASC']] });
    const existUnique = await Asset.findOne({ where: { UniqueId } });
    if (existUnique && existUnique.AssetId !== id) {
      return res.render('assets/form', {
        asset: { AssetId: id, ...req.body },
        categories,
        branches,
        isEdit: true,
        error: 'Unique ID already exists',
        title: 'Edit Asset'
      });
    }
    const existSerial = await Asset.findOne({ where: { SerialNumber } });
    if (existSerial && existSerial.AssetId !== id) {
      return res.render('assets/form', {
        asset: { AssetId: id, ...req.body },
        categories,
        branches,
        isEdit: true,
        error: 'Serial Number already exists',
        title: 'Edit Asset'
      });
    }
    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).send('Asset not found');
    }
    await asset.update({
      UniqueId,
      SerialNumber,
      Make,
      Model,
      Value: parseFloat(Value) || 0,
      Quantity: parseInt(Quantity) || 1,
      Branch: selectedBranch,
      PurchaseDate: PurchaseDate || null,
      CategoryId,
      Status,
      UpdatedBy: SYSTEM_USER_ID,
      UpdatedDate: new Date()
    });
    res.redirect('/assets');
  } catch (err) {
    console.error(err);
    const categories = await AssetCategory.findAll({ where: { IsActive: true } });
    const branches = await Branch.findAll({ where: { IsActive: true }, order: [['BranchName', 'ASC']] });
    res.render('assets/form', {
      asset: { AssetId: id, ...req.body },
      categories,
      branches,
      isEdit: true,
      error: 'Error updating asset: ' + err.message,
      title: 'Edit Asset'
    });
  }
};

exports.getStockView = async (req, res) => {
  try {
    const assets = await Asset.findAll({
      where: { Status: 'InStock' },
      include: [{ model: AssetCategory, as: 'Category' }],
      order: [['UniqueId', 'ASC']]
    });
    const issuedAssets = await Asset.findAll({ where: { Status: 'Issued' } });

    const branchSummaryMap = {};
    let totalValue = 0;

    assets.forEach(asset => {
      const branchName = asset.Branch || 'Unassigned';
      const qty = parseInt(asset.Quantity) || 0;
      const val = parseFloat(asset.Value) || 0;
      const totalAssetValue = qty * val;
      if (!branchSummaryMap[branchName]) {
        branchSummaryMap[branchName] = { Branch: branchName, TotalCount: 0, IssuedCount: 0, TotalValue: 0 };
      }
      branchSummaryMap[branchName].TotalCount += qty;
      branchSummaryMap[branchName].TotalValue += totalAssetValue;
      totalValue += totalAssetValue;
    });

    issuedAssets.forEach(asset => {
      const branchName = asset.Branch || 'Unassigned';
      const qty = parseInt(asset.Quantity) || 1;
      if (!branchSummaryMap[branchName]) {
        branchSummaryMap[branchName] = { Branch: branchName, TotalCount: 0, IssuedCount: 0, TotalValue: 0 };
      }
      branchSummaryMap[branchName].IssuedCount += qty;
    });

    const branchSummary = Object.values(branchSummaryMap);
    res.render('assets/stock', {
      assets,
      branchSummary,
      totalValue,
      title: 'Stock View'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.getIssueAsset = async (req, res) => {
  try {
    const { AssetId } = req.query;
    const assets = await Asset.findAll({
      where: { Status: 'InStock' },
      order: [['UniqueId', 'ASC']]
    });
    const employees = await Employee.findAll({
      where: { IsActive: true },
      order: [['EmployeeName', 'ASC']]
    });
    res.render('assets/issue', {
      assets,
      employees,
      selectedAssetId: AssetId || '',
      title: 'Issue Asset'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.postIssueAsset = async (req, res) => {
  try {
    const { AssetId, EmployeeId, IssueDate, Notes } = req.body;
    const asset = await Asset.findByPk(AssetId);
    if (!asset || asset.Status !== 'InStock') {
      return res.status(400).send('Asset is not available for issue.');
    }
    const employee = await Employee.findByPk(EmployeeId);
    if (!employee || !employee.IsActive) {
      return res.status(400).send('Employee is not active or does not exist.');
    }
    const newQty = asset.Quantity - 1;
    await asset.update({
      Quantity: newQty,
      Status: newQty === 0 ? 'Issued' : 'InStock',
      CurrentEmployeeId: EmployeeId,
      UpdatedBy: SYSTEM_USER_ID,
      UpdatedDate: new Date()
    });
    await AssetHistory.create({
      AssetId: asset.AssetId,
      EmployeeId: employee.EmployeeId,
      ActionType: 'Issue',
      ActionDate: IssueDate ? new Date(IssueDate) : new Date(),
      Notes: Notes || 'Issued to employee.',
      CreatedBy: SYSTEM_USER_ID
    });
    res.redirect('/assets');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error issuing asset: ' + err.message);
  }
};

exports.getReturnAsset = async (req, res) => {
  try {
    const { AssetId } = req.query;
    const assets = await Asset.findAll({
      where: { Status: 'Issued' },
      include: [{ model: Employee, as: 'CurrentEmployee' }],
      order: [['UniqueId', 'ASC']]
    });
    const branches = await Branch.findAll({ where: { IsActive: true }, order: [['BranchName', 'ASC']] });
    const returnReasons = await ReturnReason.findAll({ where: { IsActive: true }, order: [['ReasonName', 'ASC']] });
    res.render('assets/return', {
      assets,
      branches,
      returnReasons,
      selectedAssetId: AssetId || '',
      title: 'Return Asset'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.postReturnAsset = async (req, res) => {
  try {
    const { AssetId, ReturnBranch, ReturnDate, Reason, Notes } = req.body;
    const asset = await Asset.findByPk(AssetId, {
      include: [{ model: Employee, as: 'CurrentEmployee' }]
    });
    if (!asset || asset.Status !== 'Issued') {
      return res.status(400).send('Asset is not currently issued.');
    }
    const previousEmployeeId = asset.CurrentEmployeeId;
    const newQty = asset.Quantity + 1;
    await asset.update({
      Quantity: newQty,
      Status: 'InStock',
      CurrentEmployeeId: null,
      Branch: ReturnBranch,
      UpdatedBy: SYSTEM_USER_ID,
      UpdatedDate: new Date()
    });
    const historyNotes = `Returned to branch: ${ReturnBranch}. Reason: ${Reason}. Notes: ${Notes || 'No notes.'}`;
    await AssetHistory.create({
      AssetId: asset.AssetId,
      EmployeeId: previousEmployeeId,
      ActionType: 'Return',
      ActionDate: ReturnDate ? new Date(ReturnDate) : new Date(),
      Notes: historyNotes,
      CreatedBy: SYSTEM_USER_ID
    });
    res.redirect('/assets/stock');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error returning asset: ' + err.message);
  }
};

exports.postScrapAsset = async (req, res) => {
  try {
    const { AssetId, ScrapReason } = req.body;
    const asset = await Asset.findByPk(AssetId);
    if (!asset) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }
    const prevEmployeeId = asset.CurrentEmployeeId;
    await asset.update({
      Status: 'Scrapped',
      CurrentEmployeeId: null,
      UpdatedBy: SYSTEM_USER_ID,
      UpdatedDate: new Date()
    });
    await AssetHistory.create({
      AssetId: asset.AssetId,
      EmployeeId: prevEmployeeId,
      ActionType: 'Scrap',
      ActionDate: new Date(),
      Notes: ScrapReason || 'Marked as scrap/obsolete.',
      CreatedBy: SYSTEM_USER_ID
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAssetHistory = async (req, res) => {
  try {
    const { AssetId } = req.query;
    const assets = await Asset.findAll({
      order: [['UniqueId', 'ASC']]
    });
    let selectedAsset = null;
    let history = [];
    if (AssetId) {
      selectedAsset = await Asset.findByPk(AssetId, {
        include: [
          { model: AssetCategory, as: 'Category' },
          { model: Employee, as: 'CurrentEmployee' }
        ]
      });
      if (selectedAsset) {
        history = await AssetHistory.findAll({
          where: { AssetId },
          include: [{ model: Employee, as: 'Employee' }],
          order: [['ActionDate', 'ASC'], ['CreatedDate', 'ASC']]
        });
      }
    }
    res.render('assets/history', {
      assets,
      selectedAsset,
      history,
      selectedAssetId: AssetId || '',
      title: 'Asset History'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};
