var fs = require('fs');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var io = require('socket.io').listen(3000);
var server = require('http').Server(app);
var socket = io.sockets;
var app = express();

//server.listen(3000);
// WARNING: app.listen(80) will NOT work here!

var connectedUserMapSlave = new Map();
var connectedUserMapMaster = new Map();

socket.on('connect', function(socket){
  console.log('a user connected');
  let connectedUserId = socket.id;

  socket.on('recieveUserNameSlave', function(data){
    //find user by there socket in the map the update name property of value
    connectedUserMapSlave.set(socket.id, { status:'online', name: 'none' });
    let user = connectedUserMapSlave.get(connectedUserId);
    user.name = data.name + connectedUserId;
    console.log(connectedUserMapSlave)
  });

  socket.on('recieveUserNameMaster', function(data){
    //find user by there socket in the map the update name property of value
    connectedUserMapMaster.set(socket.id, { status:'online', name: 'none' });
    let user = connectedUserMapMaster.get(connectedUserId);
    user.name = data.name + connectedUserId;
    console.log(connectedUserMapMaster)
  });

  socket.on('disconnect', function () {
    console.log('a user disconnected')
    connectedUserMapSlave.delete(connectedUserId)
    connectedUserMapMaster.delete(connectedUserId)
  });
});

//implementation to accept text/plain
app.use(function(req, res, next){
  if (req.is('text/*')) {
    req.text = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ req.text += chunk });
    req.on('end', next);
  } else {
    next();
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var routes = require('./routes/index');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
