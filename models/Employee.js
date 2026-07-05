const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
  EmployeeId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: sequelize.literal('gen_random_uuid()')
  },
  EmployeeCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  EmployeeName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  Branch: {
    type: DataTypes.STRING,
    allowNull: true
  },
  Department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  CreatedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  CreatedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  UpdatedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  UpdatedDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  IsActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
});

module.exports = Employee;
