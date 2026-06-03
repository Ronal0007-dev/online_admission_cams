const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  applicationNumber: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },

  // === STUDENT INFO ===
  fullName: { type: DataTypes.STRING(150), allowNull: false },
  dateOfBirth: { type: DataTypes.DATEONLY, allowNull: false },
  gender: { type: DataTypes.ENUM('Male', 'Female', 'Other'), allowNull: false },
  countryOfBirth: { type: DataTypes.STRING(100), allowNull: false },
  citizenship: { type: DataTypes.STRING(100), allowNull: false },
  religion: { type: DataTypes.STRING(100) },
  languageSpoken: { type: DataTypes.STRING(200), allowNull: false },

  // === PREVIOUS SCHOOL (OPTIONAL) ===
  prevSchoolName: { type: DataTypes.STRING(200) },
  prevSchoolYearAttended: { type: DataTypes.STRING(20) },
  prevSchoolContact: { type: DataTypes.STRING(200) },
  prevSchoolClass: { type: DataTypes.STRING(50) },

  // === MOTHER ===
  motherFullName: { type: DataTypes.STRING(150) },
  motherAddress: { type: DataTypes.TEXT },
  motherOccupation: { type: DataTypes.STRING(150) },
  motherCountryOfBirth: { type: DataTypes.STRING(100) },
  motherCitizenship: { type: DataTypes.STRING(100) },
  motherReligion: { type: DataTypes.STRING(100) },
  motherPhone: { type: DataTypes.STRING(30) },
  motherEmail: { type: DataTypes.STRING(150) },

  // === FATHER ===
  fatherFullName: { type: DataTypes.STRING(150) },
  fatherAddress: { type: DataTypes.TEXT },
  fatherOccupation: { type: DataTypes.STRING(150) },
  fatherCountryOfBirth: { type: DataTypes.STRING(100) },
  fatherCitizenship: { type: DataTypes.STRING(100) },
  fatherReligion: { type: DataTypes.STRING(100) },
  fatherPhone: { type: DataTypes.STRING(30) },
  fatherEmail: { type: DataTypes.STRING(150) },

  // === EMERGENCY CONTACT ===
  emergencyName: { type: DataTypes.STRING(150), allowNull: false },
  emergencyPhone: { type: DataTypes.STRING(30), allowNull: false },

  // === MEDICAL ===
  allergies: { type: DataTypes.TEXT },
  sightless: { type: DataTypes.BOOLEAN, defaultValue: false },
  disabilities: { type: DataTypes.TEXT },

  approvedAt: { type: DataTypes.DATE },
  approvedBy: { type: DataTypes.STRING(100) }
}, {
  tableName: 'students',
  timestamps: true
});

module.exports = Student;
