const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { validateSchema } = require('../middleware/validation');
const { departmentSchema } = require('../schemas');
const { Department } = require('../models');

const getDepartmentsExtraData = async () => {
  const departments = await Department.findAll({ order: [['DepartmentName', 'ASC']] });
  return { departments, title: 'Department Master', editDepartment: null };
};

const getEditDepartmentExtraData = async (req) => {
  const departments = await Department.findAll({ order: [['DepartmentName', 'ASC']] });
  const editDepartment = await Department.findByPk(req.params.id);
  return { departments, title: 'Department Master', editDepartment };
};

router.get('/', departmentController.getDepartments);
router.post('/create', validateSchema(departmentSchema, 'departments/index', getDepartmentsExtraData), departmentController.postCreateDepartment);
router.post('/edit/:id', validateSchema(departmentSchema, 'departments/index', getEditDepartmentExtraData), departmentController.postEditDepartment);

module.exports = router;
