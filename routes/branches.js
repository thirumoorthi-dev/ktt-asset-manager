const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const { validateSchema } = require('../middleware/validation');
const { branchSchema } = require('../schemas');
const { Branch } = require('../models');

const getBranchesExtraData = async () => {
  const branches = await Branch.findAll({ order: [['BranchName', 'ASC']] });
  return { branches, title: 'Branch Master', editBranch: null };
};

const getEditBranchExtraData = async (req) => {
  const branches = await Branch.findAll({ order: [['BranchName', 'ASC']] });
  const editBranch = await Branch.findByPk(req.params.id);
  return { branches, title: 'Branch Master', editBranch };
};

router.get('/', branchController.getBranches);
router.post('/create', validateSchema(branchSchema, 'branches/index', getBranchesExtraData), branchController.postCreateBranch);
router.post('/edit/:id', validateSchema(branchSchema, 'branches/index', getEditBranchExtraData), branchController.postEditBranch);

module.exports = router;
