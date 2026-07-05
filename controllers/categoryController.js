const { AssetCategory } = require('../models');
const SYSTEM_USER_ID = process.env.SYSTEM_USER_ID || '00000000-0000-0000-0000-000000000000';

exports.getCategories = async (req, res) => {
  try {
    const categories = await AssetCategory.findAll({ order: [['CategoryName', 'ASC']] });
    let editCategory = null;
    if (req.query.edit) {
      editCategory = await AssetCategory.findByPk(req.query.edit);
    }

    res.render('categories/index', {
      categories,
      editCategory,
      title: 'Asset Category Master'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.postCreateCategory = async (req, res) => {
  try {
    const { CategoryName, Description, _redirect } = req.body;
    
    const existing = await AssetCategory.findOne({ where: { CategoryName } });
    if (existing) {
      const categories = await AssetCategory.findAll({ order: [['CategoryName', 'ASC']] });
      return res.render('categories/index', {
        categories,
        editCategory: null,
        error: 'Category Name already exists',
        title: 'Asset Category Master'
      });
    }

    await AssetCategory.create({
      CategoryName,
      Description,
      CreatedBy: SYSTEM_USER_ID
    });

    res.redirect(_redirect || '/categories');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.postEditCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const { CategoryName, Description, IsActive } = req.body;

    const existing = await AssetCategory.findOne({ where: { CategoryName } });
    if (existing && existing.CategoryId !== id) {
      const categories = await AssetCategory.findAll({ order: [['CategoryName', 'ASC']] });
      return res.render('categories/index', {
        categories,
        editCategory: { CategoryId: id, CategoryName, Description, IsActive: IsActive === 'true' },
        error: 'Category Name already exists',
        title: 'Asset Category Master'
      });
    }

    const category = await AssetCategory.findByPk(id);
    if (!category) {
      return res.status(404).send('Category not found');
    }

    await category.update({
      CategoryName,
      Description,
      IsActive: IsActive === 'true',
      UpdatedBy: SYSTEM_USER_ID,
      UpdatedDate: new Date()
    });

    res.redirect('/categories');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};
