const { sequelize, AssetCategory, Employee, Asset, AssetHistory, Branch, Department, ReturnReason, User } = require('./models');
const initDatabase = require('./db-init');
const bcrypt = require('bcrypt');
require('dotenv').config();

const SYSTEM_USER_ID = process.env.SYSTEM_USER_ID || '00000000-0000-0000-0000-000000000000';

async function seed() {
  try {
    await initDatabase();
    await sequelize.sync({ force: true });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Admin@1234', salt);

    await User.create({
      username: 'admin',
      passwordHash: passwordHash,
      role: 'admin',
      CreatedBy: SYSTEM_USER_ID
    });

    await Branch.bulkCreate([
      { BranchName: 'Chennai', CreatedBy: SYSTEM_USER_ID },
      { BranchName: 'Bangalore', CreatedBy: SYSTEM_USER_ID },
      { BranchName: 'Mumbai', CreatedBy: SYSTEM_USER_ID },
      { BranchName: 'Delhi', CreatedBy: SYSTEM_USER_ID }
    ]);

    await Department.bulkCreate([
      { DepartmentName: 'Engineering', CreatedBy: SYSTEM_USER_ID },
      { DepartmentName: 'Human Resources', CreatedBy: SYSTEM_USER_ID },
      { DepartmentName: 'Operations', CreatedBy: SYSTEM_USER_ID },
      { DepartmentName: 'Product Design', CreatedBy: SYSTEM_USER_ID },
      { DepartmentName: 'Sales', CreatedBy: SYSTEM_USER_ID }
    ]);

    await ReturnReason.bulkCreate([
      { ReasonName: 'Hardware Upgrade', CreatedBy: SYSTEM_USER_ID },
      { ReasonName: 'Technical Defect / Repair', CreatedBy: SYSTEM_USER_ID },
      { ReasonName: 'Employee Resignation', CreatedBy: SYSTEM_USER_ID },
      { ReasonName: 'Project Completed', CreatedBy: SYSTEM_USER_ID },
      { ReasonName: 'Other', CreatedBy: SYSTEM_USER_ID }
    ]);

    const categories = await AssetCategory.bulkCreate([
      { CategoryName: 'Laptop', Description: 'Workstation laptops', CreatedBy: SYSTEM_USER_ID },
      { CategoryName: 'Mobile Phone', Description: 'Smartphones', CreatedBy: SYSTEM_USER_ID },
      { CategoryName: 'Screw Driver', Description: 'Hardware tools', CreatedBy: SYSTEM_USER_ID },
      { CategoryName: 'Drill Machine', Description: 'Power tools', CreatedBy: SYSTEM_USER_ID },
      { CategoryName: 'Tablet', Description: 'Graphic tablets', CreatedBy: SYSTEM_USER_ID }
    ]);

    const employees = await Employee.bulkCreate([
      { EmployeeCode: 'EMP-001', EmployeeName: 'Amit Sharma', Email: 'amit.sharma@kttelematic.com', Phone: '+91 9876543210', Branch: 'Chennai', Department: 'Engineering', CreatedBy: SYSTEM_USER_ID },
      { EmployeeCode: 'EMP-002', EmployeeName: 'Priya Nair', Email: 'priya.nair@kttelematic.com', Phone: '+91 9876543211', Branch: 'Chennai', Department: 'Human Resources', CreatedBy: SYSTEM_USER_ID },
      { EmployeeCode: 'EMP-003', EmployeeName: 'Rohan Verma', Email: 'rohan.verma@kttelematic.com', Phone: '+91 9876543212', Branch: 'Bangalore', Department: 'Product Design', CreatedBy: SYSTEM_USER_ID },
      { EmployeeCode: 'EMP-004', EmployeeName: 'Sneha Rao', Email: 'sneha.rao@kttelematic.com', Phone: '+91 9876543213', Branch: 'Bangalore', Department: 'Operations', CreatedBy: SYSTEM_USER_ID, IsActive: false }
    ]);

    const laptopCat = categories.find(c => c.CategoryName === 'Laptop');
    const mobileCat = categories.find(c => c.CategoryName === 'Mobile Phone');
    const screwCat = categories.find(c => c.CategoryName === 'Screw Driver');
    const drillCat = categories.find(c => c.CategoryName === 'Drill Machine');
    const tabletCat = categories.find(c => c.CategoryName === 'Tablet');

    const amit = employees.find(e => e.EmployeeCode === 'EMP-001');
    const priya = employees.find(e => e.EmployeeCode === 'EMP-002');
    const rohan = employees.find(e => e.EmployeeCode === 'EMP-003');

    const assets = await Asset.bulkCreate([
      { UniqueId: 'AST-L010', SerialNumber: 'BULK-LAPTOP-001', Make: 'Dell', Model: 'Latitude 5430', Value: 75000.00, Quantity: 10, Status: 'InStock', Branch: 'Chennai', PurchaseDate: '2025-01-15', CategoryId: laptopCat.CategoryId, CreatedBy: SYSTEM_USER_ID },
      { UniqueId: 'AST-L001', SerialNumber: 'SN-DELL-99881', Make: 'Dell', Model: 'Latitude 5430', Value: 75000.00, Quantity: 1, Status: 'InStock', Branch: 'Chennai', PurchaseDate: '2025-01-15', CategoryId: laptopCat.CategoryId, CreatedBy: SYSTEM_USER_ID },
      { UniqueId: 'AST-TB001', SerialNumber: 'BULK-TAB-001', Make: 'Wacom', Model: 'Intuos Pro', Value: 18000.00, Quantity: 5, Status: 'InStock', Branch: 'Bangalore', PurchaseDate: '2025-06-20', CategoryId: tabletCat.CategoryId, CreatedBy: SYSTEM_USER_ID },
      { UniqueId: 'AST-M001', SerialNumber: 'SN-SAMS-11221', Make: 'Samsung', Model: 'Galaxy S23', Value: 65000.00, Quantity: 1, Status: 'Issued', Branch: 'Bangalore', PurchaseDate: '2024-09-05', CategoryId: mobileCat.CategoryId, CurrentEmployeeId: rohan.EmployeeId, CreatedBy: SYSTEM_USER_ID },
      { UniqueId: 'AST-T001', SerialNumber: 'SN-BOSH-55661', Make: 'Bosch', Model: 'Smart Screw Driver', Value: 3500.00, Quantity: 1, Status: 'InStock', Branch: 'Chennai', PurchaseDate: '2024-11-12', CategoryId: screwCat.CategoryId, CreatedBy: SYSTEM_USER_ID },
      { UniqueId: 'AST-D001', SerialNumber: 'SN-DEWA-00991', Make: 'DeWalt', Model: 'DCD771C2', Value: 8500.00, Quantity: 1, Status: 'Scrapped', Branch: 'Bangalore', PurchaseDate: '2023-04-10', CategoryId: drillCat.CategoryId, CreatedBy: SYSTEM_USER_ID }
    ]);

    const astL010 = assets.find(a => a.UniqueId === 'AST-L010');
    const astL001 = assets.find(a => a.UniqueId === 'AST-L001');
    const astTb001 = assets.find(a => a.UniqueId === 'AST-TB001');
    const astM001 = assets.find(a => a.UniqueId === 'AST-M001');
    const astT001 = assets.find(a => a.UniqueId === 'AST-T001');
    const astD001 = assets.find(a => a.UniqueId === 'AST-D001');

    await AssetHistory.bulkCreate([
      { AssetId: astL010.AssetId, ActionType: 'Purchase', ActionDate: '2025-01-15', Notes: 'Bulk purchase of 10 laptops.', CreatedBy: SYSTEM_USER_ID },
      { AssetId: astL001.AssetId, ActionType: 'Purchase', ActionDate: '2025-01-15', Notes: 'Single laptop purchase.', CreatedBy: SYSTEM_USER_ID },
      { AssetId: astTb001.AssetId, ActionType: 'Purchase', ActionDate: '2025-06-20', Notes: 'Bulk tablets (5 units).', CreatedBy: SYSTEM_USER_ID },
      { AssetId: astM001.AssetId, ActionType: 'Purchase', ActionDate: '2024-09-05', Notes: 'Mobile phone purchase.', CreatedBy: SYSTEM_USER_ID },
      { AssetId: astM001.AssetId, EmployeeId: rohan.EmployeeId, ActionType: 'Issue', ActionDate: '2024-09-10', Notes: 'Issued to Rohan.', CreatedBy: SYSTEM_USER_ID },
      { AssetId: astT001.AssetId, ActionType: 'Purchase', ActionDate: '2024-11-12', Notes: 'Screw driver purchase.', CreatedBy: SYSTEM_USER_ID },
      { AssetId: astD001.AssetId, ActionType: 'Purchase', ActionDate: '2023-04-10', Notes: 'Drill purchase.', CreatedBy: SYSTEM_USER_ID },
      { AssetId: astD001.AssetId, EmployeeId: amit.EmployeeId, ActionType: 'Issue', ActionDate: '2023-04-15', Notes: 'Issued for warehouse setup.', CreatedBy: SYSTEM_USER_ID },
      { AssetId: astD001.AssetId, EmployeeId: amit.EmployeeId, ActionType: 'Return', ActionDate: '2025-01-05', Notes: 'Returned after repair.', CreatedBy: SYSTEM_USER_ID },
      { AssetId: astD001.AssetId, ActionType: 'Scrap', ActionDate: '2025-01-10', Notes: 'Scrapped due to damage.', CreatedBy: SYSTEM_USER_ID }
    ]);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
