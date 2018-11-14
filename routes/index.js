var express = require('express')
var fs = require('fs')
var router = express.Router()
var scp2 = require('scp2')
var Client = require('ssh2-sftp-client')
var exec = require('child_process').exec

var baseDir = __dirname.split('/routes')[0]
var io = require('socket.io').listen(3000);
var socket = io.sockets;

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

  socket.on('sendToSlave', function(data){
    socket.broadcast.to(data.socket).emit('message', data)
  });

  socket.on('sendToMaster', function(data){
    socket.broadcast.to(data.socket).emit('message', data)
  });

  socket.on('disconnect', function () {
    console.log('a user disconnected')
    connectedUserMapSlave.delete(connectedUserId)
    connectedUserMapMaster.delete(connectedUserId)
  });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('layout', { title: 'Behaviour Executor', condition: false })
})

/* GET home page. */
router.get('/slave', function(req, res, next) {
  res.render('slave', { title: 'Behaviour Executor - Slave', condition: false })
})

/* POST to get the slave page to run */
router.post('/slave/page', function(req, res) {
  fs.readFile(req.text, (err, data) => {
    res.send(data)
  })
})

/* POST to save the list of playlists */
router.post('/playlists/save', function(req, res) {
  let file_name = baseDir + '/public/playlists/file.json'
  let data = fs.readFileSync(file_name)

  let json = JSON.parse(data)
  json.playlists.push(JSON.stringify(req.body))

  fs.writeFileSync(file_name, JSON.stringify(json))

  res.send(req.body.name)
})

/* GET the list of playlists */
router.get('/playlists/load', function(req, res) {
  let file_name = baseDir + '/public/playlists/file.json'
  fs.readFile(file_name, (err, data) => {
    let json = JSON.parse(data)
    res.send(json)
  })
})

/* GET the language file */
router.get('/language/load', function(req, res) {
  let file_name = baseDir + '/public/languages/lang.json'
  fs.readFile(file_name, (err, data) => {
    let json = JSON.parse(data)
    res.send(json)
  })
})

/* POST clear all playlists */
router.post('/playlists/clear', function(req, res) {
  let file_name = baseDir + '/public/playlists/file.json'
  fs.writeFileSync(file_name, JSON.stringify(req.body))

  res.send(req.body)
})

/* POST check for robot ssh key*/
router.post('/ssh/file_check', function(req, res) {
  let file_name = baseDir + '/public/ssh/' + req.text

  res.send(fs.existsSync(file_name))
})

/* POST send SCP command to copy videos off the robot */
router.post('/ssh/copy_recordings_video', function(req, res) {
  let ssh = baseDir + '/public/ssh/' + req.body.sshKey

  fs.watchFile(req.body.endDirVideo, function() {
    fs.unwatchFile(req.body.endDirVideo)
    res.send('Successfully completed copying ' + req.body.filenameVideo + ' to ' + req.body.endDirVideo)
  })

  scp2.scp({
    host: req.body.ip,
    username: req.body.robotName,
    privateKey: fs.readFileSync(ssh),
    path: '/' + req.body.filenameVideo
  }, req.body.endDirVideo, function(err) { if (err !== null) console.log('SCP request failed: ' + err); })

  scp2.close()
})

/* POST ffmpeg command to combine video recordings and audio recordings */
router.post('/ssh/convert_recordings_video', function(req, res) {
  exec('ffmpeg -i \'' + req.body.endDirVideo + req.body.file + '.avi\' -i \'' + req.body.endDirAudio + req.body.file + '.wav\' -strict -2  \'' + req.body.endDir + req.body.file + '.mp4\'',
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout)
    console.log('stderr: ' + stderr)
    if (error !== null) {
      console.log('exec error: ' + error)
      console.log('This action requires the user has ffmpeg as a command line function.')
    } else {
      res.send('Successfully converted ' + req.body.endDirVideo + req.body.file + '.avi' + ' to ' + req.body.endDir + req.body.file + '.mp4')
    }
  })

})

/* POST send SCP command to copy audio off the robot */
router.post('/ssh/copy_recordings_audio', function(req, res) {
  let ssh = baseDir + '/public/ssh/' + req.body.sshKey

  fs.watchFile(req.body.endDirAudio, function() {
    fs.unwatchFile(req.body.endDirAudio)
    res.send('Successfully completed copying ' + req.body.filenameAudio + ' to ' + req.body.endDirAudio)
  })

  scp2.scp({
    host: req.body.ip,
    username: req.body.robotName,
    privateKey: fs.readFileSync(ssh),
    path: '/' + req.body.filenameAudio
  }, req.body.endDirAudio, function(err) { if (err !== null) console.log('SCP request failed: ' + err); })

  scp2.close()
})

/* POST send ftp command to delete the stored audio on the robot */
router.post('/ssh/delete_nao_recording_audio', function(req, res) {
  let sftp = new Client()
  let ssh = baseDir + '/public/ssh/' + req.body.sshKey

  sftp.connect({
    host: req.body.ip,
    username: req.body.robotName,
    privateKey: fs.readFileSync(ssh),
  }).then(() => {
      sftp.delete('/' + req.body.filenameAudio)
  }).then((data) => {
      res.write('File ' + req.body.filenameAudio + ' removed from Nao.')
      res.end()
  }).catch((err) => {
      console.log(err, 'catch error')
      res.status(333)
      res.send('Failed to delete ' + req.body.filename)
  })
})

/* POST send ftp command to delete the stored video on the robot */
router.post('/ssh/delete_nao_recording_video', function(req, res) {
  let sftp = new Client()
  let ssh = baseDir + '/public/ssh/' + req.body.sshKey

  sftp.connect({
    host: req.body.ip,
    username: req.body.robotName,
    privateKey: fs.readFileSync(ssh),
  }).then(() => {
      sftp.delete('/' + req.body.filenameVideo)
  }).then((data) => {
      res.write('File ' + req.body.filenameVideo + ' removed from Nao.')
      res.end()
  }).catch((err) => {
      console.log(err, 'catch error')
      res.status(333)
      res.send('Failed to delete ' + req.body.filename)
  })
})

/* POST create SSH key from interfacing with the robots file system */
router.post('/ssh/gen_key', function(req, res) {
  exec(baseDir + '/SSH-Keygen.sh \'' + baseDir + '/public/ssh/' + req.body.fileName + '\' ' + req.body.robotName + '@' + req.body.ip,
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout)
    console.log('stderr: ' + stderr)
    if (error !== null) {
      console.log('exec error: ' + error)
    } else {
      res.send('Successfully created key pair with: ' + req.body.robotName)
    }
  })

})

/* GET videos */
router.post('/videos', function(req, res) {
  let dir = './public/videos'
  res.send(fs.readdirSync(dir))
})

router.get('/get_slaves', function(req, res, next) {
  res.send(Array.from(connectedUserMapSlave.keys()))
})

module.exports = router
