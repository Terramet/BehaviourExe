var express = require('express');
var fs = require('fs');
var router = express.Router();
var scp2 = require('scp2');
var Client = require('ssh2-sftp-client');
var exec = require('child_process')
  .exec;
var auto = require('auto_updater');
var toPdf = require("office-to-pdf");
var pdf2img = require('pdf2img');
var pptComposer = require('pptx-compose');
var baseDir = __dirname.split('/routes')[0];
var io = require('socket.io')
  .listen(3000);
var socket = io.sockets;

var pythonProcess = null;

io.origins('*:*')

var connectedUserMapSlave = new Map();
var connectedUserMapMaster = new Map();

var miroInt = null;


socket.on('connect', function (socket) {
  console.log('a user connected');
  let connectedUserId = socket.id;

  socket.on('recieveUserNameSlave', function (data) {
    //find user by there socket in the map the update name property of value
    connectedUserMapSlave.set(socket.id, {
      status: 'online',
      name: 'none',
    });
    let user = connectedUserMapSlave.get(connectedUserId);
    user.name = data.name + connectedUserId;
    console.log(connectedUserMapSlave);
  });

  socket.on('recieveUserNameMaster', function (data) {
    //find user by there socket in the map the update name property of value
    connectedUserMapMaster.set(socket.id, {
      status: 'online',
      name: 'none',
    });
    let user = connectedUserMapMaster.get(connectedUserId);
    user.name = data.name + connectedUserId;
    console.log(connectedUserMapMaster);
  });

  socket.on('sendToSlave', function (data) {
    socket.broadcast.to(data.socket)
      .emit('message', data);
  });

  socket.on('nextSlide', function (data) {
    socket.broadcast.to(data.socket)
      .emit('nextSlide', data);
  });

  socket.on('prevSlide', function (data) {
    socket.broadcast.to(data.socket)
      .emit('prevSlide', data);
  });

  socket.on('sendPresentationToSlave', function(data){
    socket.broadcast.to(data.socket).emit('presentation', data)
  });

  socket.on('sendToMaster', function (data) {
    socket.broadcast.to(data.socket)
      .emit('message', data);
  });

  socket.on('disconnect', function () {
    console.log('a user disconnected');
    connectedUserMapSlave.delete(connectedUserId);
    connectedUserMapMaster.delete(connectedUserId);
  });
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('layout', {
    title: 'Behaviour Executor',
    condition: false,
  });
});

/* GET home page. */
router.get('/slave', function (req, res, next) {
  res.render('slave', {
    title: 'Behaviour Executor - Slave',
    condition: false,
  });
});

/* POST to get the slave page to run */
router.post('/slave/page', function (req, res, next) {
  fs.readFile(req.text, (err, data) => {
    res.send(data);
  });
});

router.get('/slave/get/:dir/:img', function(req, res, next) {
  console.log(baseDir + '/public/uploads/' + req.params.dir + '/images/' + req.params.img)
  res.send(fs.readFileSync(baseDir + '/public/uploads/' + req.params.dir + '/images/' + req.params.img))
})

/* POST to save the list of playlists */
router.post('/playlists/save', function (req, res, next) {
  let fileName = baseDir + '/public/playlists/file.json';
  let data = fs.readFileSync(fileName);

  let json = JSON.parse(data);
  json.playlists.push(JSON.stringify(req.body));

  fs.writeFileSync(fileName, JSON.stringify(json));

  res.send(req.body.name);
});

/* GET the list of playlists */
router.get('/playlists/load', function (req, res, next) {
  let fileName = baseDir + '/public/playlists/file.json';
  fs.readFile(fileName, (err, data) => {
    let json = JSON.parse(data);
    res.send(json);
  });
});

/* GET the language file */
router.get('/language/load', function (req, res, next) {
  let fileName = baseDir + '/public/languages/lang.json';
  fs.readFile(fileName, (err, data) => {
    let json = JSON.parse(data);
    res.send(json);
  });
});

/* POST clear all playlists */
router.post('/playlists/clear', function (req, res, next) {
  let fileName = baseDir + '/public/playlists/file.json';
  fs.writeFileSync(fileName, JSON.stringify(req.body));
  res.send(req.body);
});

/* POST check for robot ssh key*/
router.post('/ssh/file_check', function (req, res, next) {
  let fileName = baseDir + '/public/ssh/' + req.text;

  res.send(fs.existsSync(fileName));
});

/* POST send SCP command to copy videos off the robot */
router.post('/ssh/copy_recordings_video', function (req, res, next) {
  fs.watchFile(req.body.endDirVideo, function () {
    fs.unwatchFile(req.body.endDirVideo);
    res.send('Successfully completed copying ' + req.body.filenameVideo + ' to ' + req.body
      .endDirVideo);
  });

  let sftp = new Client();
  sftp.connect({
      host: req.body.ip,
      port: 22,
      user: req.body.robotName,
      tryKeyboard: true,
    })
    .then(() => {
      return sftp.fastGet('/' + req.body.filenameVideo, req.body.endDirVideo + req.body.file +
        '.avi');
    })
    .then((data) => {
      console.log(data, 'the data info');
      sftp.end();
    })
    .catch((err) => {
      console.log(err, 'catch error');
    });
  sftp
    .on('keyboard-interactive', function (name, instructions, lang, prompts, finish) {
      console.log('Connection :: keyboard');
      finish([req.body.robotPass]);
    });

  sftp
    .on('error', function (e) {
      res.status(111);
      res.send(e);
    });
});

/* POST ffmpeg command to combine video recordings and audio recordings */
router.post('/ssh/convert_recordings_video', function (req, res, next) {
  exec('ffmpeg -i \'' + req.body.endDirVideo + req.body.file + '.avi\' -i \'' +
    req.body.endDirAudio + req.body.file + '.wav\' -strict -2  \'' +
    req.body.endDir + req.body.file + '.mp4\'',
    function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
        console.log('This action requires the user has ffmpeg as a command line function.');
      } else {
        res.send('Successfully converted ' + req.body.endDirVideo + req.body.file + '.avi' +
          ' to ' + req.body.endDir + req.body.file + '.mp4');
      }
    });

});

/* POST send SCP command to copy audio off the robot */
router.post('/ssh/copy_recordings_audio', function (req, res, next) {
  let ssh = baseDir + '/public/ssh/' + req.body.sshKey;

  fs.watchFile(req.body.endDirAudio, function () {
    fs.unwatchFile(req.body.endDirAudio);
    res.send('Successfully completed copying ' + req.body.filenameAudio + ' to ' + req.body
      .endDirAudio);
  });

  let sftp = new Client();
  sftp.connect({
      host: req.body.ip,
      port: 22,
      user: req.body.robotName,
      tryKeyboard: true,
    })
    .then(() => {
      return sftp.fastGet('/' + req.body.filenameAudio, req.body.endDirAudio + req.body.file +
        '.wav');
    })
    .then((data) => {
      console.log(data, 'the data info');
      sftp.end();
    })
    .catch((err) => {
      console.log(err, 'catch error');
    });
  sftp
    .on('keyboard-interactive', function (name, instructions, lang, prompts, finish) {
      console.log('Connection :: keyboard');
      finish([req.body.robotPass]);
    });

  sftp
    .on('error', function (e) {
      res.status(111);
      res.send(e);
    });
});

/* POST send ftp command to delete the stored audio on the robot */
router.post('/ssh/delete_nao_recording_audio', function (req, res, next) {
  let sftp = new Client();

  sftp.connect({
      host: req.body.ip,
      port: 22,
      username: req.body.robotName,
      tryKeyboard: true,
    })
    .then(() => {
      sftp.delete('/' + req.body.filenameAudio);
    })
    .then((data) => {
      res.write('File ' + req.body.filenameAudio + ' removed from Nao.');
      res.end();
    })
    .catch((err) => {
      console.log(err, 'catch error');
      res.status(333);
      res.send('Failed to delete ' + req.body.filename);
    });
  sftp
    .on('keyboard-interactive', function (name, instructions, lang, prompts, finish) {
      console.log('Connection :: keyboard');
      finish([req.body.robotPass]);
    });

  sftp
    .on('error', function (e) {
      res.status(111);
      res.send(e);
    });
});

/* POST send ftp command to delete the stored video on the robot */
router.post('/ssh/delete_nao_recording_video', function (req, res, next) {
  let sftp = new Client();

  sftp.connect({
      host: req.body.ip,
      port: 22,
      username: req.body.robotName,
      tryKeyboard: true,
    })
    .then(() => {
      sftp.delete('/' + req.body.filenameVideo);
    })
    .then((data) => {
      res.write('File ' + req.body.filenameVideo + ' removed from Nao.');
      res.end();
    })
    .catch((err) => {
      console.log(err, 'catch error');
      res.status(333);
      res.send('Failed to delete ' + req.body.filename);
    });
  sftp
    .on('keyboard-interactive', function (name, instructions, lang, prompts, finish) {
      console.log('Connection :: keyboard');
      finish([req.body.robotPass]);
    });

  sftp
    .on('error', function (e) {
      res.status(111);
      res.send(e);
    });
});

/* GET videos */
router.post('/videos', function (req, res, next) {
  let dir = './public/videos';
  res.send(fs.readdirSync(dir));
});

/* GET a list of slaves that are */
router.get('/get_slaves', function (req, res, next) {
  res.send(Array.from(connectedUserMapSlave.keys()));
});

/* GET details of the current update */
router.get('/check_update', function (req, res, next) {
  fs.readFile('./package.json', (err, data) => {
    let pjson = JSON.parse(data);
    auto.compareVersions()
      .then((remote) => {
        let d = [pjson.version === remote[1], pjson.version];
        res.send(d);
      });
  });
});

router.post('/post_pptx', function(req, res, next) {
  if(fs.existsSync(req.file.path)) {
    console.log(req.file)

    var wordBuffer = fs.readFileSync(req.file.path)

    toPdf(wordBuffer).then(
      (pdfBuffer) => {
        fs.writeFileSync(req.file.path.split('.')[0] + '.pdf', pdfBuffer);
        let composer = new pptComposer(); //instantiate
        composer.parse(req.file.path, function (err, json) {
          var input   = req.file.path.split('.')[0] + '.pdf';

          pdf2img.setOptions({
            type: 'png',                                // png or jpg, default jpg
            size: 1024,                                 // default 1024
            density: 600,                               // default 600
            outputdir: req.file.destination + 'images', // output folder, default null (if null given, then it will create folder name same as file name)
            outputname: 'slide',
            page: null                                  // convert selected page, default null (if null given, then it will convert all pages)
          });

          pdf2img.convert(input, function(err, info) {
            if (err) {
              console.log(err);
            } else {
              console.log(info);
              res.send('Successfully uploaded ' + req.file.filename);
            }
          });
        });
      }, (err) => {
        console.log(err);
      });
  } else {
    res.send('Upload failed! Redirecting...');
  }
})

router.post('/presentations', function(req, res) {
  let dir = './public/uploads'
  res.send(fs.readdirSync(dir))
})

router.post('/slave/getPresentation', function(req, res) {
  let dir = './public/uploads/' + req.body.pres + '/images'
  let data = { dir: req.body.pres,
              img: fs.readdirSync(dir),
              slide: 1 }
  res.send(JSON.stringify(data))
})

/* POST execute the file in order to move Miro in the direction */
router.post('/barkMiro', function (req, res, next) {
  let spawn = require("child_process").spawn;
  let p = spawn("python", ["./public/robot_resources/bark.py", "robot=rob01"], {});

  p.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });

  res.send('Success');
})

/* POST execute the file in order to move Miro in the direction */
router.post('/startMiro', function (req, res, next) {
  if (pythonProcess != null) {
    pythonProcess.kill('SIGTERM');
  }
  var spawn = require("child_process").spawn;
  pythonProcess = spawn("python", ["./public/robot_resources/miromove.py", "robot=rob01"], {});

  pythonProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });

  res.send('Success');
})

router.post('/moveMiro', function (req, res, next) {
  let fileName = './public/robot_resources/movement.json';
  let data = fs.readFileSync(fileName);

  let json = JSON.parse(data);
  json.x = req.body.velX;
  json.y = req.body.velY;

  fs.writeFileSync(fileName, JSON.stringify(json));

  res.send('Success');
})

/* Clear the interval created by the MoveMiro*/
router.post('/stopMiro', function (req, res, next) {
  pythonProcess.kill('SIGTERM');
  pythonProcess = null
  res.send('Success');
})

/* Force the server to restart in order to update it. Will not update is server is started with -nu or --no-update*/
router.get('/get_update', function (req, res, next) {
  if (process.argv.includes('-nu') || process.argv.includes('--no-update')) {
    res.send('Application will not update as you are running the server with either "-nu" or "--no-update".')
  } else {
    process.exit(1);
  }
});

module.exports = router;
