'use strict';
var debug = require('debug');
var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');

var app = express();
var port = process.env.PORT || 8082;

app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', 'ejs');

app.use(session({
    secret: 'uniquesecretkey',
    resave: true,
    saveUninitialized: true
}));
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./app/routes.js')(app, passport);

app.listen(port);
console.log('The magic happens on port ' + port);

process.on('unhandledRejection', function(error){
    console.error(error);
    process.exit(1);
});
