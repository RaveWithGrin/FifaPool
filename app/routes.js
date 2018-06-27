var dbCalls = require('../databaseCalls');
var scores = require('../updateScores');
var path = require('path');

var groupsDeadline = new Date('2018-06-14 08:00:00 EST');

module.exports = function (app, passport) {
    app.get('/', function (req, res) {
        res.render('index.ejs');
    });

    app.get('/login', function (req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    app.get('/resetPassword', function (req, res) {
        res.render('reset.ejs', {message: req.flash('loginMessage')});
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    }), function (req, res) {
        if (req.body.remember)
            req.session.cookie.maxAge = 1000 * 60 * 3;
        else
            req.session.cookie.expires = false;
        res.redirect('/');
    });

    app.get('/signup', function (req, res) {
        var now = new Date();
        if (now >= groupsDeadline)
            res.redirect('/');
        else
            res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    app.get('/profile', isLoggedIn, async function (req, res) {
        var result = await dbCalls.get.userByEmail(req.user.email);
        if (result.error) {
            console.log(result.error);
            res.redirect('/login');
        } else {
            res.render('profile.ejs', { user: result.data[0] });
        };
    });

    app.get('/admin', isLoggedIn, function(req, res){
        if ([5, 113].indexOf(req.user.id) !== -1)
            res.sendFile(path.join(__dirname, '../views/admin.html'));
        else
            res.redirect('/profile');
    });

    app.get('/adminPasswords', isLoggedIn, async function(req, res){
        if ([5, 113].indexOf(req.user.id) !== -1){
            var result = await dbCalls.get.passwords();
            if (result.error){
                console.log(result.error);
                res.send(JSON.stringify(error));
            } else {
                res.send(JSON.stringify(data));
            }
        } else {
            res.redirect('/profile');
        }
    });

    app.post('/updatePaid', async function(req, res){
        var result = await dbCalls.update.paid(req.body.paid);
        if (result.error)
            console.log(result.error);
        res.redirect('/admin');
    });

    app.post('/passwordReset', async function(req, res){
        var result = await dbCalls.update.password(req.body);
        if (result.error){
            console.log(result.error);
            res.redirect('/resetPassword');
        } else {
            res.redirect('/login');
        }
    });
    

    app.get('/groups', isLoggedIn, function (req, res) {
        res.render('groups.ejs', { user: req.user });
    });

    app.get('/groupStandings', function (req, res) {
        res.sendFile(path.join(__dirname, '../views/groupstandings.html'));
    });

    app.get('/userStandings', function (req, res) {
        res.sendFile(path.join(__dirname, '../views/userstandings.html'));
    });

    app.get('/knockout', isLoggedIn, function (req, res) {
        res.sendFile(path.join(__dirname, '../views/knockout.html'));
    });

    app.get('/getPredictedKnockouts', isLoggedIn, async function (req, res) {
        var result = await dbCalls.get.predictedKnockouts(req.user);
        if (result.error) {
            res.send(JSON.stringify(result.error));
        } else {
            res.send(JSON.stringify(result.data));
        }
    });

    app.get('/getFirstRoundTeams', async function(req, res){
        var result = await dbCalls.get.firstRoundTeams();
        if (result.error) {
            res.send(JSON.stringify(result.error));
        } else {
            res.send(JSON.stringify(result.data));
        }
    });

    app.get('/getGroupPicks', isLoggedIn, async function (req, res) {
        var result = await dbCalls.get.groupPicks(req.user);
        if (result.error) {
            res.send(JSON.stringify(error));
        } else {
            res.send(JSON.stringify(result.data));
        };
    });

    app.get('/getGroupPercentages', async function (req, res) {
        var result = await dbCalls.get.groupPercentages();
        if (result.error) {
            res.send(JSON.stringify(error));
        } else {
            res.send(JSON.stringify(result.data));
        };
    });

    app.get('/getGroupStandings', async function (req, res) {
        var result = await dbCalls.get.groupStandings();
        if (result.error) {
            res.send(JSON.stringify(error));
        } else {
            res.send(JSON.stringify(result.data));
        };
    });

    app.get('/getUserStandings', async function (req, res) {
        var result = await dbCalls.get.userStandings();
        if (result.error) {
            res.send(JSON.stringify(error));
        } else {
            res.send(JSON.stringify(result.data));
        };
    });

    app.get('/getTeams', async function (req, res) {
        var result = await dbCalls.get.teams();
        if (result.error) {
            res.send(JSON.stringify(error));
        } else {
            res.send(JSON.stringify(result.data));
        };
    });

    app.post('/saveTeams', function (req, res) {
        var currentDate = new Date();
        if (currentDate >= groupsDeadline) {
            res.send(JSON.stringify({ error: 'Deadline for group picks has passed' }));
        }
        else {
            var result = dbCalls.save.groupPicks(req.body, req.user);
            if (result.error) {
                res.send(JSON.stringify(error));
            } else {
                res.send(JSON.stringify('Inserted row ' + result.data));
            };
        }
    });

    app.get('/schedule', function (req, res) {
        res.render('schedule.ejs');
    });

    app.get('/getSchedule', async function (req, res) {
        var result = await dbCalls.get.schedule();
        if (result.error) {
            res.send(JSON.stringify(error));
        } else {
            res.send(JSON.stringify(result.data));
        };
    });

    app.get('/updateScores', function(req, res){
        scores.update();
        res.send(JSON.stringify('Yes master'));
    });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get(/^(\/static\/.+)$/, function (req, res) {
        res.sendFile(path.join(__dirname, '../', req.params[0]));
    });

    app.get(/^(\/views\/.+)$/, function (req, res) {
        res.sendFile(path.join(__dirname, '../', req.params[0]));
    });

    app.get(/^(\/images\/.+)$/, function (req, res) {
        res.sendFile(path.join(__dirname, '../', req.params[0]));
    });

};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
};
