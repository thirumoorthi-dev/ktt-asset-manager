const sequelize = require('../config/database');
const AssetCategory = require('./AssetCategory');
const Employee = require('./Employee');
const Asset = require('./Asset');
const AssetHistory = require('./AssetHistory');
const Branch = require('./Branch');
const Department = require('./Department');
const User = require('./User');
const ReturnReason = require('./ReturnReason');

AssetCategory.hasMany(Asset, { foreignKey: 'CategoryId', as: 'Assets' });
Asset.belongsTo(AssetCategory, { foreignKey: 'CategoryId', as: 'Category' });

Employee.hasMany(Asset, { foreignKey: 'CurrentEmployeeId', as: 'Assets' });
Asset.belongsTo(Employee, { foreignKey: 'CurrentEmployeeId', as: 'CurrentEmployee' });

Asset.hasMany(AssetHistory, { foreignKey: 'AssetId', as: 'History' });
AssetHistory.belongsTo(Asset, { foreignKey: 'AssetId', as: 'Asset' });

Employee.hasMany(AssetHistory, { foreignKey: 'EmployeeId', as: 'History' });
AssetHistory.belongsTo(Employee, { foreignKey: 'EmployeeId', as: 'Employee' });

module.exports = {
  sequelize,
  AssetCategory,
  Employee,
  Asset,
  AssetHistory,
  Branch,
  Department,
  User,
  ReturnReason
};
