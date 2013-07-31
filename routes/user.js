var passport = require('passport');
var models = require('../models/models.js');

//login
exports.getLogin = function(req, res) {
  res.render('login', { title: 'Login', user: req.user});
};

exports.postLogin = function(req, res) {
  res.redirect('/');
};

//logout
exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};

//register
exports.getRegister = function(req, res) {
  res.render('register', {title: 'Register'});
}

exports.postRegister = function(req, res) {
  models.userModel.register(new models.userModel({username: req.body.username, email: req.body.email, name: req.body.name}), req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      return res.render('register', {user: user});
    }
    req.login(user, function(err) {
      if (err) { console.log(err); }
      return res.redirect('/');
    });

    res.redirect('/');
  })
}