const { Branch } = require('../models');
const SYSTEM_USER_ID = process.env.SYSTEM_USER_ID || '00000000-0000-0000-0000-000000000000';

exports.getBranches = async (req, res) => {
  try {
    const branches = await Branch.findAll({ order: [['BranchName', 'ASC']] });
    let editBranch = null;
    if (req.query.edit) {
      editBranch = await Branch.findByPk(req.query.edit);
    }
    res.render('branches/index', {
      branches,
      editBranch,
      title: 'Branch Master'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.postCreateBranch = async (req, res) => {
  try {
    const { BranchName, _redirect } = req.body;
    const existing = await Branch.findOne({ where: { BranchName } });
    if (existing) {
      const branches = await Branch.findAll({ order: [['BranchName', 'ASC']] });
      return res.render('branches/index', {
        branches,
        editBranch: null,
        error: 'Branch Name already exists',
        title: 'Branch Master'
      });
    }
    await Branch.create({
      BranchName,
      CreatedBy: SYSTEM_USER_ID
    });
    res.redirect(_redirect || '/branches');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.postEditBranch = async (req, res) => {
  const { id } = req.params;
  try {
    const { BranchName, IsActive } = req.body;
    const existing = await Branch.findOne({ where: { BranchName } });
    if (existing && existing.BranchId !== id) {
      const branches = await Branch.findAll({ order: [['BranchName', 'ASC']] });
      return res.render('branches/index', {
        branches,
        editBranch: { BranchId: id, BranchName, IsActive: IsActive === 'true' },
        error: 'Branch Name already exists',
        title: 'Branch Master'
      });
    }
    const branch = await Branch.findByPk(id);
    if (!branch) {
      return res.status(404).send('Branch not found');
    }
    await branch.update({
      BranchName,
      IsActive: IsActive === 'true',
      UpdatedBy: SYSTEM_USER_ID,
      UpdatedDate: new Date()
    });
    res.redirect('/branches');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};
