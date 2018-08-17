var express = require('express');
var fs = require('fs');
var router = express.Router();

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


router.get('/users/detail', function(req, res, next) {
  res.send('detail');
});


module.exports = router;
