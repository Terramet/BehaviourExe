var express = require('express');
var fs = require('fs');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Behaviour Executor', condition: false });
});

/* GET users listing. */
router.post('/playlists/', function(req, res, next) {
  let data = fs.readFileSync(__dirname + '/playlists/file.json')
  let json = JSON.parse(data)
  res.send(json);
});

router.get('/users/detail', function(req, res, next) {
  res.send('detail');
});


module.exports = router;
