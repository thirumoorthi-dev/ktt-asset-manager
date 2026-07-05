const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssetCategory = sequelize.define('AssetCategory', {
  CategoryId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: sequelize.literal('gen_random_uuid()')
  },
  CategoryName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Description: {
    type: DataTypes.TEXT,
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

module.exports = AssetCategory;
