const { Employee, Branch, Department } = require('../models');
const SYSTEM_USER_ID = process.env.SYSTEM_USER_ID || '00000000-0000-0000-0000-000000000000';

exports.getEmployees = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status === 'active') {
      where.IsActive = true;
    } else if (status === 'inactive') {
      where.IsActive = false;
    }
    const employees = await Employee.findAll({ where, order: [['EmployeeCode', 'ASC']] });
    res.render('employees/index', {
      employees,
      currentStatusFilter: status || 'all',
      title: 'Employee Master'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

const generateNextEmployeeCode = async () => {
  const employees = await Employee.findAll({ attributes: ['EmployeeCode'] });
  let maxNum = 0;
  for (const emp of employees) {
    const match = emp.EmployeeCode.match(/^EMP-(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) {
        maxNum = num;
      }
    }
  }
  const nextNum = maxNum + 1;
  return `EMP-${String(nextNum).padStart(3, '0')}`;
};

exports.getCreateEmployee = async (req, res) => {
  try {
    const branches = await Branch.findAll({ where: { IsActive: true }, order: [['BranchName', 'ASC']] });
    const departments = await Department.findAll({ where: { IsActive: true }, order: [['DepartmentName', 'ASC']] });
    const nextCode = await generateNextEmployeeCode();
    res.render('employees/form', {
      employee: { EmployeeCode: nextCode },
      branches,
      departments,
      isEdit: false,
      title: 'Add Employee'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.postCreateEmployee = async (req, res) => {
  try {
    let { EmployeeCode, EmployeeName, Email, Phone, Branch: selectedBranch, Department: selectedDept, IsActive } = req.body;
    
    if (!EmployeeCode) {
      EmployeeCode = await generateNextEmployeeCode();
    } else {
      let existing = await Employee.findOne({ where: { EmployeeCode } });
      while (existing) {
        const match = EmployeeCode.match(/^EMP-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10) + 1;
          EmployeeCode = `EMP-${String(num).padStart(3, '0')}`;
        } else {
          EmployeeCode = `${EmployeeCode}-1`;
        }
        existing = await Employee.findOne({ where: { EmployeeCode } });
      }
    }

    await Employee.create({
      EmployeeCode,
      EmployeeName,
      Email,
      Phone,
      Branch: selectedBranch,
      Department: selectedDept,
      IsActive: IsActive === 'true',
      CreatedBy: SYSTEM_USER_ID
    });
    res.redirect('/employees');
  } catch (err) {
    console.error(err);
    const branches = await Branch.findAll({ where: { IsActive: true }, order: [['BranchName', 'ASC']] });
    const departments = await Department.findAll({ where: { IsActive: true }, order: [['DepartmentName', 'ASC']] });
    res.render('employees/form', {
      employee: req.body,
      branches,
      departments,
      isEdit: false,
      error: 'Error creating employee: ' + err.message,
      title: 'Add Employee'
    });
  }
};

exports.getEditEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).send('Employee not found');
    }
    const branches = await Branch.findAll({ where: { IsActive: true }, order: [['BranchName', 'ASC']] });
    const departments = await Department.findAll({ where: { IsActive: true }, order: [['DepartmentName', 'ASC']] });
    res.render('employees/form', {
      employee,
      branches,
      departments,
      isEdit: true,
      title: 'Edit Employee'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.postEditEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const { EmployeeCode, EmployeeName, Email, Phone, Branch: selectedBranch, Department: selectedDept, IsActive } = req.body;
    const existing = await Employee.findOne({ where: { EmployeeCode } });
    if (existing && existing.EmployeeId !== id) {
      const branches = await Branch.findAll({ where: { IsActive: true }, order: [['BranchName', 'ASC']] });
      const departments = await Department.findAll({ where: { IsActive: true }, order: [['DepartmentName', 'ASC']] });
      return res.render('employees/form', {
        employee: { EmployeeId: id, ...req.body },
        branches,
        departments,
        isEdit: true,
        error: 'Employee Code already exists',
        title: 'Edit Employee'
      });
    }
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).send('Employee not found');
    }
    await employee.update({
      EmployeeCode,
      EmployeeName,
      Email,
      Phone,
      Branch: selectedBranch,
      Department: selectedDept,
      IsActive: IsActive === 'true',
      UpdatedBy: SYSTEM_USER_ID,
      UpdatedDate: new Date()
    });
    res.redirect('/employees');
  } catch (err) {
    console.error(err);
    const branches = await Branch.findAll({ where: { IsActive: true }, order: [['BranchName', 'ASC']] });
    const departments = await Department.findAll({ where: { IsActive: true }, order: [['DepartmentName', 'ASC']] });
    res.render('employees/form', {
      employee: { EmployeeId: id, ...req.body },
      branches,
      departments,
      isEdit: true,
      error: 'Error updating employee: ' + err.message,
      title: 'Edit Employee'
    });
  }
};
