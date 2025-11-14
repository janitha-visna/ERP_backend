const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Student = sequelize.define('Student', { 
    id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
    }, 
    userId: { 
    type: DataTypes.UUID, 
    allowNull: false, 
    references: { 
    model: 'Users', 
    key: 'id' 
    } 
    }, 
    studentId: { 
    type: DataTypes.STRING, 
    unique: true, 
    allowNull: false 
    }, 
    
     firstName: { 
    type: DataTypes.STRING, 
    allowNull: false 
    }, 
    lastName: { 
    type: DataTypes.STRING, 
    allowNull: false 
    }, 
    dateOfBirth: { 
    type: DataTypes.DATE 
    }, 
    gender: { 
    type: DataTypes.ENUM('male', 'female', 'other') 
    }, 
    contactNumber: { 
    type: DataTypes.STRING 
    }, 
    emergencyContact: { 
    type: DataTypes.STRING 
    }, 
    address: { 
    type: DataTypes.TEXT 
    }, 
    grade: { 
    type: DataTypes.STRING, 
    allowNull: false 
    }, 
    academicYear: { 
    type: DataTypes.STRING, 
    allowNull: false 
    }, 
    enrollmentDate: { 
    type: DataTypes.DATEONLY 
    }, 
    parentName: { 
    type: DataTypes.STRING 
    }, 
    parentContact: { 
    type: DataTypes.STRING 
    }, 
    parentEmail: { 
    type: DataTypes.STRING 
    }, 
    medicalInfo: { 
    type: DataTypes.JSONB 
    }, 
    documents: { 
    type: DataTypes.JSONB 
    }, 
    isActive: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
    } 
    }); 
    module.exports = Student; 