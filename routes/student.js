const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { countries, citizenships, religions, classLevels } = require('../config/lookups');
const { sendSubmissionEmail } = require('../config/mailer');

function generateAppNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `APP-${year}-${rand}`;
}

// ─── HOME ─────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.render('student/home', { title: 'School Admission Portal' });
});

// ─── APPLICATION FORM ─────────────────────────────────────
router.get('/apply', (req, res) => {
  res.render('student/apply', {
    title: 'Apply for Admission',
    errors: [],
    formData: {},
    countries,
    citizenships,
    religions,
    classLevels
  });
});

router.post('/apply', async (req, res) => {
  const body = req.body;
  const errors = [];

  // Basic validation
  if (!body.fullName) errors.push('Full name is required.');
  if (!body.dateOfBirth) errors.push('Date of birth is required.');
  if (!body.gender) errors.push('Gender is required.');
  if (!body.countryOfBirth) errors.push('Country of birth is required.');
  if (!body.citizenship) errors.push('Citizenship is required.');
  if (!body.languageSpoken) errors.push('Language spoken is required.');
  // Mother required
  if (!body.motherFullName) errors.push("Mother's full name is required.");
  if (!body.motherOccupation) errors.push("Mother's occupation is required.");
  if (!body.motherAddress) errors.push("Mother's physical address is required.");
  if (!body.motherCountryOfBirth) errors.push("Mother's country of birth is required.");
  if (!body.motherCitizenship) errors.push("Mother's citizenship is required.");
  if (!body.motherPhone) errors.push("Mother's phone number is required.");
  if (!body.motherEmail) errors.push("Mother's email address is required.");
  // Father required
  if (!body.fatherFullName) errors.push("Father's full name is required.");
  if (!body.fatherOccupation) errors.push("Father's occupation is required.");
  if (!body.fatherAddress) errors.push("Father's physical address is required.");
  if (!body.fatherCountryOfBirth) errors.push("Father's country of birth is required.");
  if (!body.fatherCitizenship) errors.push("Father's citizenship is required.");
  if (!body.fatherPhone) errors.push("Father's phone number is required.");
  if (!body.fatherEmail) errors.push("Father's email address is required.");
  if (!body.emergencyName) errors.push('Emergency contact name is required.');
  if (!body.emergencyPhone) errors.push('Emergency contact phone is required.');

  if (errors.length > 0) {
    return res.render('student/apply', {
      title: 'Apply for Admission',
      errors,
      formData: body,
      countries,
      citizenships,
      religions
    });
  }

  try {
    const applicationNumber = generateAppNumber();
    const newStudent = await Student.create({
      applicationNumber,
      fullName: body.fullName,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      countryOfBirth: body.countryOfBirth,
      citizenship: body.citizenship,
      religion: body.religion,
      classLevel: body.classLevel,
      languageSpoken: body.languageSpoken,
      prevSchoolName: body.prevSchoolName || null,
      prevSchoolYearAttended: body.prevSchoolYearAttended || null,
      prevSchoolContact: body.prevSchoolContact || null,
      prevSchoolClass: body.prevSchoolClass || null,
      motherFullName: body.motherFullName,
      motherAddress: body.motherAddress,
      motherOccupation: body.motherOccupation,
      motherCountryOfBirth: body.motherCountryOfBirth,
      motherCitizenship: body.motherCitizenship,
      motherReligion: body.motherReligion,
      motherPhone: body.motherPhone,
      motherEmail: body.motherEmail,
      fatherFullName: body.fatherFullName,
      fatherAddress: body.fatherAddress,
      fatherOccupation: body.fatherOccupation,
      fatherCountryOfBirth: body.fatherCountryOfBirth,
      fatherCitizenship: body.fatherCitizenship,
      fatherReligion: body.fatherReligion,
      fatherPhone: body.fatherPhone,
      fatherEmail: body.fatherEmail,
      emergencyName: body.emergencyName,
      emergencyPhone: body.emergencyPhone,
      allergies: body.allergies,
      sightless: body.sightless === 'on',
      disabilities: body.disabilities
    });

    // Send confirmation email to parent(s)
    let emailSent = false;
    let emailError = null;
    try {
      await sendSubmissionEmail(newStudent);
      emailSent = true;
    } catch (emailErr) {
      console.error('Submission email failed:', emailErr.message);
      emailError = emailErr.message;
    }

    res.render('student/success', {
      title: 'Application Submitted',
      applicationNumber,
      emailSent,
      parentEmail: newStudent.motherEmail || newStudent.fatherEmail || null
    });
  } catch (err) {
    console.error(err);
    res.render('student/apply', {
      title: 'Apply for Admission',
      errors: ['Failed to submit application. Please try again.'],
      formData: body,
      countries,
      citizenships,
      religions
    });
  }
});

// ─── CHECK STATUS ─────────────────────────────────────────
router.get('/status', (req, res) => {
  res.render('student/status', { title: 'Check Application Status', result: null, error: null });
});

router.post('/status', async (req, res) => {
  const { applicationNumber } = req.body;
  try {
    const student = await Student.findOne({ where: { applicationNumber } });
    if (!student) {
      return res.render('student/status', {
        title: 'Check Application Status',
        result: null,
        error: 'Application number not found. Please check and try again.'
      });
    }
    res.render('student/status', {
      title: 'Check Application Status',
      result: student,
      error: null
    });
  } catch (err) {
    res.render('student/status', {
      title: 'Check Application Status',
      result: null,
      error: 'Error checking status. Try again.'
    });
  }
});

module.exports = router;
