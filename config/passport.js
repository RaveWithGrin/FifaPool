var dbCalls = require('../databaseCalls');
var bcrypt = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(async function (id, done) {
        var result = await dbCalls.get.userByID(id);
        done(result.error, result.data[0]);
    });

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, async function (req, email, password, done) {
        var result = await dbCalls.get.userByEmail(email);
        if (result.error) {
            return done(result.error);
        } else if (result.data.length > 0) {
            return done(null, false, req.flash('signupMessage', 'Username is already taken'))
        } else {
            newUser = {
                email: email,
                password: bcrypt.hashSync(password, null, null),
                name: req.body.name
            };
            var result = await dbCalls.save.user(newUser);
            newUser.id = result.data.insertId;
            return done(null, newUser);
        }
    }));

    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, async function (req, email, password, done) {
        var result = await dbCalls.get.userByEmail(email);
        if (result.error) {
            return done(result.error);
        } else if (!result.data.length) {
            return done(null, false, req.flash('loginMessage', 'No user found'));
        } else if (!bcrypt.compareSync(password, result.data[0].password)) {
            return done(null, false, req.flash('loginMessage', 'Incorrect password'));
        } else {
            return done(null, result.data[0]);
        }
    }));
};
