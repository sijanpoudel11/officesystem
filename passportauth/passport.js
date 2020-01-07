let employee = require('../models/allusers');
let passport = require('passport');
let bcrypt = require('bcryptjs');
let localstrategy = require('passport-local').Strategy;

module.exports = function (passport) {

    passport.serializeUser(function (employee, done) {

        done(null, employee.id);

    });


    passport.deserializeUser(function (id, done) {

        employee.findById(id, function (err, employee) {

            done(err, employee);

        });

    });

    passport.use('login', new localstrategy({
        usernameField: 'username',
        passwordField: 'password',
       passReqToCallback : true
    }, function (req, username, password, done) {
        employee.findOne({
            username: username
        }, (err, user) => {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }
            if (! bcrypt.compareSync(password, user.password)) {
                return done(null, false);
            }
            if (user) {
                console.log(user + " from passport");
                return done(null, user);
            }
        })

    }))
}
