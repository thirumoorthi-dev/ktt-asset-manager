const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Asset = sequelize.define('Asset', {
  AssetId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: sequelize.literal('gen_random_uuid()')
  },
  UniqueId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  SerialNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  Make: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  Quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  Status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'InStock',
    validate: {
      isIn: [['InStock', 'Issued', 'Scrapped']]
    }
  },
  Branch: {
    type: DataTypes.STRING,
    allowNull: true
  },
  PurchaseDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  CategoryId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  CurrentEmployeeId: {
    type: DataTypes.UUID,
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

module.exports = Asset;
