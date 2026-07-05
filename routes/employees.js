const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { validateSchema } = require('../middleware/validation');
const { employeeSchema } = require('../schemas');
const { Branch, Department, Employee } = require('../models');

const getCreateEmployeeExtra = async (req) => {
  const branches = await Branch.findAll({ where: { IsActive: true }, order: [['BranchName', 'ASC']] });
  const departments = await Department.findAll({ where: { IsActive: true }, order: [['DepartmentName', 'ASC']] });
  return { branches, departments, employee: req ? req.body : {}, isEdit: false, title: 'Add Employee' };
};

const getEditEmployeeExtra = async (req) => {
  const branches = await Branch.findAll({ where: { IsActive: true }, order: [['BranchName', 'ASC']] });
  const departments = await Department.findAll({ where: { IsActive: true }, order: [['DepartmentName', 'ASC']] });
  const employee = { EmployeeId: req.params.id, ...req.body };
  return { branches, departments, employee, isEdit: true, title: 'Edit Employee' };
};

router.get('/', employeeController.getEmployees);
router.get('/create', employeeController.getCreateEmployee);
router.post('/create', validateSchema(employeeSchema, 'employees/form', getCreateEmployeeExtra), employeeController.postCreateEmployee);
router.get('/edit/:id', employeeController.getEditEmployee);
router.post('/edit/:id', validateSchema(employeeSchema, 'employees/form', getEditEmployeeExtra), employeeController.postEditEmployee);

module.exports = router;
