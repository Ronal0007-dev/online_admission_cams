const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const { requireAuth, redirectIfAuth } = require('../middleware/auth');
const { sendApprovalEmail } = require('../config/mailer');
const { Op } = require('sequelize');
const { countries, citizenships, religions } = require('../config/lookups');

// ─── LOGIN ───────────────────────────────────────────────
router.get('/login', redirectIfAuth, (req, res) => {
  res.render('admin/login', {
    title: 'Admin Login',
    error: req.flash('error'),
    success: req.flash('success')
  });
});

router.post('/login', redirectIfAuth, async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ where: { email } });
    if (!admin || !(await admin.validatePassword(password))) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/admin/login');
    }
    req.session.adminId = admin.id;
    req.session.admin = { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Login failed. Try again.');
    res.redirect('/admin/login');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// ─── DASHBOARD ────────────────────────────────────────────
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const total = await Student.count();
    const pending = await Student.count({ where: { status: 'pending' } });
    const approved = await Student.count({ where: { status: 'approved' } });
    const rejected = await Student.count({ where: { status: 'rejected' } });

    const recent = await Student.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.render('admin/dashboard', {
      title: 'Dashboard',
      admin: req.session.admin,
      stats: { total, pending, approved, rejected },
      recent,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (err) {
    console.error(err);
    res.render('admin/dashboard', {
      title: 'Dashboard',
      admin: req.session.admin,
      stats: { total: 0, pending: 0, approved: 0, rejected: 0 },
      recent: [],
      error: ['Failed to load dashboard data.']
    });
  }
});

// ─── PRINT STUDENTS LIST ──────────────────────────────────
router.get('/students/print', requireAuth, async (req, res) => {
  const { status, search } = req.query;
  const where = {};

  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    where.status = status;
  }
  if (search) {
    where[Op.or] = [
      { fullName: { [Op.like]: `%${search}%` } },
      { applicationNumber: { [Op.like]: `%${search}%` } }
    ];
  }

  try {
    const students = await Student.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.render('admin/students-print', {
      title: 'Print – Student List',
      admin: req.session.admin,
      students,
      status: status || null,
      search: search || null,
      printDate: new Date().toLocaleString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to generate print view.');
    res.redirect('/admin/students');
  }
});

// ─── STUDENTS LIST ────────────────────────────────────────
router.get('/students', requireAuth, async (req, res) => {
  const { status, search, page = 1 } = req.query;
  const limit = 10;
  const offset = (page - 1) * limit;

  const where = {};
  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    where.status = status;
  }
  if (search) {
    where[Op.or] = [
      { fullName: { [Op.like]: `%${search}%` } },
      { applicationNumber: { [Op.like]: `%${search}%` } }
    ];
  }

  try {
    const { count, rows: students } = await Student.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.render('admin/students', {
      title: 'Students',
      admin: req.session.admin,
      students,
      status,
      search,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      total: count,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load students.');
    res.redirect('/admin/dashboard');
  }
});

// ─── VIEW STUDENT ─────────────────────────────────────────
router.get('/students/:id', requireAuth, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      req.flash('error', 'Student not found.');
      return res.redirect('/admin/students');
    }
    res.render('admin/student-view', {
      title: `${student.fullName} – Application`,
      admin: req.session.admin,
      student,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load student.');
    res.redirect('/admin/students');
  }
});

// ─── EDIT STUDENT GET ─────────────────────────────────────
router.get('/students/:id/edit', requireAuth, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      req.flash('error', 'Student not found.');
      return res.redirect('/admin/students');
    }
    res.render('admin/student-edit', {
      title: `Edit – ${student.fullName}`,
      admin: req.session.admin,
      student,
      countries,
      citizenships,
      religions,
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    req.flash('error', 'Failed to load student for editing.');
    res.redirect('/admin/students');
  }
});

// ─── EDIT STUDENT POST ────────────────────────────────────
router.post('/students/:id/edit', requireAuth, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      req.flash('error', 'Student not found.');
      return res.redirect('/admin/students');
    }
    const body = req.body;
    await student.update({
      fullName: body.fullName,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      countryOfBirth: body.countryOfBirth,
      citizenship: body.citizenship,
      religion: body.religion,
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
    req.flash('success', 'Student record updated successfully.');
    res.redirect(`/admin/students/${student.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update student record.');
    res.redirect(`/admin/students/${req.params.id}/edit`);
  }
});

// ─── APPROVE ──────────────────────────────────────────────
router.post('/students/:id/approve', requireAuth, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      req.flash('error', 'Student not found.');
      return res.redirect('/admin/students');
    }
    await student.update({
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: req.session.admin.name
    });

    // Send email
    try {
      await sendApprovalEmail(student);
      req.flash('success', `Application approved! Confirmation email sent to parent.`);
    } catch (emailErr) {
      console.error('Email failed:', emailErr.message);
      req.flash('success', `Application approved! (Email delivery failed – check SMTP config.)`);
    }

    res.redirect(`/admin/students/${student.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to approve application.');
    res.redirect('/admin/students');
  }
});

// ─── REJECT ───────────────────────────────────────────────
router.post('/students/:id/reject', requireAuth, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      req.flash('error', 'Student not found.');
      return res.redirect('/admin/students');
    }
    await student.update({ status: 'rejected' });
    req.flash('success', 'Application has been rejected.');
    res.redirect(`/admin/students/${student.id}`);
  } catch (err) {
    req.flash('error', 'Failed to reject application.');
    res.redirect('/admin/students');
  }
});

// ─── DELETE ───────────────────────────────────────────────
router.post('/students/:id/delete', requireAuth, async (req, res) => {
  try {
    await Student.destroy({ where: { id: req.params.id } });
    req.flash('success', 'Student record deleted.');
    res.redirect('/admin/students');
  } catch (err) {
    req.flash('error', 'Failed to delete student.');
    res.redirect('/admin/students');
  }
});

module.exports = router;
