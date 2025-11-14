const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Budget = sequelize.define('Budget', { 
    id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
    }, 
    budgetCode: { 
    type: DataTypes.STRING, 
    unique: true, 
    allowNull: false 
    }, 
    budgetName: { 
    type: DataTypes.STRING, 
    allowNull: false 
    }, 
    department: { 
    type: DataTypes.STRING, 
    allowNull: false 
    }, 
    
     fiscalYear: { 
    type: DataTypes.STRING, 
    allowNull: false 
    }, 
    budgetType: { 
    type: DataTypes.ENUM('operational', 'capital', 'project', 'departmental'), 
    allowNull: false 
    }, 
    allocatedAmount: { 
    type: DataTypes.DECIMAL(15, 2), 
    allowNull: false 
    }, 
    utilizedAmount: { 
    type: DataTypes.DECIMAL(15, 2), 
        defaultValue: 0 
      }, 
      remainingAmount: { 
        type: DataTypes.DECIMAL(15, 2) 
      }, 
      startDate: { 
        type: DataTypes.DATEONLY, 
        allowNull: false 
      }, 
      endDate: { 
        type: DataTypes.DATEONLY, 
        allowNull: false 
      }, 
      status: { 
        type: DataTypes.ENUM('draft', 'approved', 'active', 'closed', 'cancelled'), 
        defaultValue: 'draft' 
      }, 
      description: { 
        type: DataTypes.TEXT 
      }, 
      createdBy: { 
        type: DataTypes.UUID, 
        allowNull: false, 
        references: { 
          model: 'Users', 
          key: 'id' 
        } 
      }, 
      approvedBy: { 
        type: DataTypes.UUID, 
        references: { 
          model: 'Users', 
          key: 'id' 
        } 
      } 
    }); 
     
    module.exports = Budget; 