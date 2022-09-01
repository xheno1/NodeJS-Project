exports.logOutUser = (req, res) => {
  // Expire the JWT Token immediately
  res.cookie('token', '', { maxAge: 1});
  res.render('logout');
};
