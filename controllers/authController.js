const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login', error: null, isLoginPage: true });
};

exports.postLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user) {
    return res.render('auth/login', { title: 'Login', error: 'Invalid credentials', isLoginPage: true });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.render('auth/login', { title: 'Login', error: 'Invalid credentials', isLoginPage: true });
  }
  // set session
  req.session.userId = user.UserId;
  req.session.username = user.username;
  req.session.role = user.role;
  res.redirect('/');
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};
