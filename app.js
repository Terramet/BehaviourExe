var fs = require('fs');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var auto = require('auto_updater')
var pjson = require('./package.json');
var multer = require('multer');

var app = express();

if (!process.argv.includes("-nu") && !process.argv.includes("--no-update")) {
  auto.compareVersions().then((remote) => {
    console.log('Current local version: ' + pjson.version + '\nCurrent release version: ' + remote[1]);
    if (remote === 1) {
      auto.downloadUpdate().then((result) => {
        console.log(result == null ? 'Updated':'')
      })
    }
  })
}

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

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let path = './public/uploads/' + file.originalname.replace(' ', '_').split('.')[0] + '/'

    if(!fs.existsSync(path)) {
      fs.mkdirSync(path)
    }

    cb(null, path)
  },
  filename: function (req, file, cb) {
    console.log()
    cb(null, file.originalname.replace(' ', '_'))
  }
})

app.use(multer({storage: storage}).single('pptx'))

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
