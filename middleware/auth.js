function requireAuth(req, res, next) {
  if (req.session && req.session.adminId) {
    res.locals.admin = req.session.admin;
    return next();
  }
  req.flash('error', 'Please login to access the admin panel.');
  res.redirect('/admin/login');
}
 
function redirectIfAuth(req, res, next) {
  if (req.session && req.session.adminId) {
    return res.redirect('/admin/dashboard');
  }
  next();
}
 
module.exports = { requireAuth, redirectIfAuth };