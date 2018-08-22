var express = require('express');
var fs = require('fs');
var router = express.Router();
var scp2 = require('scp2')

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

router.post('/playlists/load', function(req, res, next) {
  let file_name = __dirname.split('\\routes')[0] + '\\public\\playlists\\file.json';
  let data = fs.readFileSync(file_name);
  let json = JSON.parse(data);

  res.send(json);
});

router.post('/ssh/file_check', function(req, res) {
  let file_name = __dirname.split('\\routes')[0] + '\\public\\ssh\\' + req.text;
  
  res.send(fs.existsSync(file_name));
});

router.post('/ssh/copy_recordings', function(req, res) {
  setTimeout( function(){
    let dir = './public/videos/'
    let ssh = __dirname.split('\\routes')[0] + '\\public\\ssh\\' + req.body.sshKey;

    scp2.scp({
      host: req.body.ip,
      username: 'nao',
      privateKey: fs.readFileSync(ssh),
      path: '/' + req.body.filename
    }, dir, function(err) { if (err !== null) console.log("SCP request failed: " + err); })

    res.send("Copying complete.")

  },5000);
}); 

router.post('/videos', function(req, res) {
  let dir = './public/videos'
  res.send(fs.readdirSync(dir));
})

module.exports = router;