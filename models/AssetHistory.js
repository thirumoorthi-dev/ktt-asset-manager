const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssetHistory = sequelize.define('AssetHistory', {
  AssetHistoryId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: sequelize.literal('gen_random_uuid()')
  },
  AssetId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  EmployeeId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  ActionType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['Purchase', 'Issue', 'Return', 'Scrap']]
    }
  },
  ActionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  Notes: {
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

module.exports = AssetHistory;
