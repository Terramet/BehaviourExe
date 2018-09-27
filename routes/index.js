var express = require('express');
var fs = require('fs');
var router = express.Router();
var scp2 = require('scp2')
var Client = require('ssh2-sftp-client');
var exec = require('child_process').exec;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Behaviour Executor', condition: false });
});

router.post('/playlists/save', function(req, res) {
  let file_name = __dirname.split('\\routes')[0] + '\\public\\playlists\\file.json';
  let data = fs.readFileSync(file_name);
  fs.closeSync(2);

  let json = JSON.parse(data);
  json.playlists.push(JSON.stringify(req.body));

  fs.writeFileSync(file_name, JSON.stringify(json));
  fs.closeSync(2);  

  res.send(req.body.name);
});

router.get('/playlists/load', function(req, res) {
  let file_name = __dirname.split('\\routes')[0] + '\\public\\playlists\\file.json';
  let data = fs.readFileSync(file_name);
  let json = JSON.parse(data);

  res.send(json);
});

router.post('/playlists/clear', function(req, res) {
  let file_name = __dirname.split('\\routes')[0] + '\\public\\playlists\\file.json';

  fs.writeFileSync(file_name, JSON.stringify(req.body));
  fs.closeSync(2);  

  res.send(req.body);
});

router.post('/ssh/file_check', function(req, res) {
  let file_name = __dirname.split('\\routes')[0] + '\\public\\ssh\\' + req.text;
  
  res.send(fs.existsSync(file_name));
});

router.post('/ssh/copy_recordings_video', function(req, res) {
  let ssh = __dirname.split('\\routes')[0] + '\\public\\ssh\\' + req.body.sshKey;
  console.log(req.body.ip)
  console.log(req.body.robotName)
  scp2.scp({
    host: req.body.ip,
    username: req.body.robotName,
    privateKey: fs.readFileSync(ssh),
    path: '/' + req.body.filenameVideo
  }, req.body.endDirVideo, function(err) { if (err !== null) console.log('SCP request failed: ' + err); })

  scp2.close();

  fs.watchFile(req.body.endDirVideo, function() {
    fs.unwatchFile(req.body.endDirVideo);
    res.send('Successfully completed copying ' + req.body.filenameVideo + ' to ' + req.body.endDirVideo);
  })

}); 

router.post('/ssh/convert_recordings_video', function(req, res) {
  exec('ffmpeg -i \"' + req.body.endDirVideo + req.body.file + '.avi\" -i \"' + req.body.endDirAudio + req.body.file + '.wav\" \"' + req.body.endDir + req.body.file + '.mp4\"',
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
      console.log('This action requires the user has ffmpeg as a command line function.')
    } else {
      res.send('Successfully converted ' + req.body.endDirVideo + req.body.file + '.avi' + ' to ' + req.body.endDir + req.body.file + '.mp4');
    }
  });

}); 

router.post('/ssh/copy_recordings_audio', function(req, res) {
  let ssh = __dirname.split('\\routes')[0] + '\\public\\ssh\\' + req.body.sshKey;
  console.log(req.body.ip)
  console.log(req.body.robotName)
  scp2.scp({
    host: req.body.ip,
    username: req.body.robotName,
    privateKey: fs.readFileSync(ssh),
    path: '/' + req.body.filenameAudio
  }, req.body.endDirAudio, function(err) { if (err !== null) console.log('SCP request failed: ' + err); })

  scp2.close();

  fs.watchFile(req.body.endDirAudio, function() {
    fs.unwatchFile(req.body.endDirAudio);
    res.send('Successfully completed copying ' + req.body.filenameAudio + ' to ' + req.body.endDirAudio);
  })
}); 

router.post('/ssh/delete_nao_recording_audio', function(req, res) {
  let sftp = new Client();
  let ssh = __dirname.split('\\routes')[0] + '\\public\\ssh\\' + req.body.sshKey;

  sftp.connect({
    host: req.body.ip,
    username: req.body.robotName,
    privateKey: fs.readFileSync(ssh),
  }).then(() => {
      sftp.delete('/' + req.body.filenameAudio);
  }).then((data) => {
      res.write('File ' + req.body.filenameAudio + ' removed from Nao.');
      res.end();
  }).catch((err) => {
      console.log(err, 'catch error');
      res.status(333);
      res.send('Failed to delete ' + req.body.filename)
  });
});

router.post('/ssh/delete_nao_recording_video', function(req, res) {
  let sftp = new Client();
  let ssh = __dirname.split('\\routes')[0] + '\\public\\ssh\\' + req.body.sshKey;

  sftp.connect({
    host: req.body.ip,
    username: req.body.robotName,
    privateKey: fs.readFileSync(ssh),
  }).then(() => {
      sftp.delete('/' + req.body.filenameVideo);
  }).then((data) => {
      res.write('File ' + req.body.filenameVideo + ' removed from Nao.');
      res.end();
  }).catch((err) => {
      console.log(err, 'catch error');
      res.status(333);
      res.send('Failed to delete ' + req.body.filename)
  });
});

router.post('/ssh/gen_key', function(req, res) {
  exec('SSH-Keygen.sh \"./public/ssh/' + req.body.fileName + '\" ' + req.body.robotName + '@' + req.body.ip,
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    } else {
      res.send('Successfully created key pair with: ' + req.body.robotName)
    }
  });

})

router.post('/videos', function(req, res) {
  let dir = './public/videos'
  res.send(fs.readdirSync(dir));
})

module.exports = router;