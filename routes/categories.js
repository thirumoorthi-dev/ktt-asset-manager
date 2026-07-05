const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { validateSchema } = require('../middleware/validation');
const { categorySchema } = require('../schemas');
const { AssetCategory } = require('../models');

const getCategoriesExtraData = async () => {
  const categories = await AssetCategory.findAll({ order: [['CategoryName', 'ASC']] });
  return { categories, title: 'Asset Category Master', editCategory: null };
};

const getEditCategoryExtraData = async (req) => {
  const categories = await AssetCategory.findAll({ order: [['CategoryName', 'ASC']] });
  const editCategory = await AssetCategory.findByPk(req.params.id);
  return { categories, title: 'Asset Category Master', editCategory };
};

router.get('/', categoryController.getCategories);
router.post('/create', validateSchema(categorySchema, 'categories/index', getCategoriesExtraData), categoryController.postCreateCategory);
router.post('/edit/:id', validateSchema(categorySchema, 'categories/index', getEditCategoryExtraData), categoryController.postEditCategory);

module.exports = router;
