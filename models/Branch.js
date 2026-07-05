const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Branch = sequelize.define('Branch', {
  BranchId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: sequelize.literal('gen_random_uuid()')
  },
  BranchName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  IsActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
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
  }
}, {
  timestamps: false
});

module.exports = Branch;
