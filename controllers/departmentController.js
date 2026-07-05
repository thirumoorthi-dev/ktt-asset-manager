const { Department } = require('../models');
const SYSTEM_USER_ID = process.env.SYSTEM_USER_ID || '00000000-0000-0000-0000-000000000000';

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({ order: [['DepartmentName', 'ASC']] });
    let editDepartment = null;
    if (req.query.edit) {
      editDepartment = await Department.findByPk(req.query.edit);
    }
    res.render('departments/index', {
      departments,
      editDepartment,
      title: 'Department Master'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.postCreateDepartment = async (req, res) => {
  try {
    const { DepartmentName, _redirect } = req.body;
    const existing = await Department.findOne({ where: { DepartmentName } });
    if (existing) {
      const departments = await Department.findAll({ order: [['DepartmentName', 'ASC']] });
      return res.render('departments/index', {
        departments,
        editDepartment: null,
        error: 'Department Name already exists',
        title: 'Department Master'
      });
    }
    await Department.create({
      DepartmentName,
      CreatedBy: SYSTEM_USER_ID
    });
    res.redirect(_redirect || '/departments');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.postEditDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    const { DepartmentName, IsActive } = req.body;
    const existing = await Department.findOne({ where: { DepartmentName } });
    if (existing && existing.DepartmentId !== id) {
      const departments = await Department.findAll({ order: [['DepartmentName', 'ASC']] });
      return res.render('departments/index', {
        departments,
        editDepartment: { DepartmentId: id, DepartmentName, IsActive: IsActive === 'true' },
        error: 'Department Name already exists',
        title: 'Department Master'
      });
    }
    const dept = await Department.findByPk(id);
    if (!dept) {
      return res.status(404).send('Department not found');
    }
    await dept.update({
      DepartmentName,
      IsActive: IsActive === 'true',
      UpdatedBy: SYSTEM_USER_ID,
      UpdatedDate: new Date()
    });
    res.redirect('/departments');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};
