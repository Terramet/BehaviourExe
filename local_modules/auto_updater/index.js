var https = require('follow-redirects').https,
path = require('path'),
url = require('url'),

EventEmitter = require('events').EventEmitter,

rootJSON = require(path.dirname(require.main.filename) + ("/../package.json")),

fs = require('fs')
Defer = require('node-promise').defer;

function versionNumberCompare(local, remote) {
  let regex = new RegExp(/^([0-9]*\.[0-9]*\.[0-9]*)$/)
  if (!regex.test(local) || !regex.test(remote)) {
    return -1
  }

  let splitLocal = local.split('.')
  let splitRemote = remote.split('.')

  for(let i = 0; i < splitLocal.length; i++) {
    if (splitRemote[i] > splitLocal[i]) {
      return 1
    }
  }

  return 0
}

function remoteDownloadUpdate(name, opts) {
  var deferred = Defer();

  if (fs.existsSync(name)) {
    deferred.resolve(true);
    return deferred;
  }

  var request = https.get(opts, function(res) {
    if (fs.existsSync('_' + name)) {
      fs.unlinkSync('_' + name)
    }

    //emitter
    var file = fs.createWriteStream('_' + name),
    size = parseInt(res.headers['content-length'], 10),
    current = 0;

    res.pipe(file)

    var dataReceive = function(chunk) {
      current += chunk.length;
      perc = (100.0 * (current / size)).toFixed(2);
      process.stdout.clearLine();
      process.stdout.write(perc + "%");
      process.stdout.cursorTo(0);
    }

    res.on('data', dataReceive);
    res.on('end', function() {
      file.end();
      process.stdout.write("\n"); // end the line
    });

    file.on('finish', function() {
      fs.renameSync('_' + name, name);
      //emit(self, 'download.end', name);

      deferred.resolve();
    });
  })

  return deferred;
}

function extract(name) {
  var admzip = require('adm-zip');

  var zip = new admzip(name);
  var deferred = Defer();

  zip.extractAllTo('./', true);
  fs.unlink(name, deferred.resolve.bind(deferred));
  return deferred;
}

module.exports = {
  compareVersions: function() {

    var options = {
      host:'api.github.com',
      path: '/repos/' + rootJSON.author.name + '/' + rootJSON.name + '/releases',
      json: true,
      port: 443,
      headers: {'user-agent': 'node.js',
      'content-type': 'json'}
    };

    let prom = new Promise(function(resolve, reject) {
      https.get(options, (res) => {
        let data = '';

        // A chunk of data has been recieved.
        res.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        res.on('end', () => {
          //most recent release
          let remote = JSON.parse(data)[0];
          if(remote) {
            if(remote.tag_name) {
              let result = versionNumberCompare(rootJSON.version, remote.tag_name)
              if(result === 1) {
                console.log(remote.assets[0].browser_download_url)
                resolve([remote.tag_name, remote.assets[0].browser_download_url])
              } else {
                resolve([result, remote.tag_name])
              }
            } else {
              reject("ERROR: Remote was reachable but no tag_name was found")
            }
          } else {
            reject("ERROR: Remote release information was unreachable")
          }
        });
      }).on("error", (err) => {
        console.log("Error: " + err.message);
        reject(err.message)
      });
    })
    return prom
  },

  downloadUpdate: function() {
    return Promise.resolve(this.compareVersions()).then((res) => {
      if (res[0] === 0 || res[0] === -1) {
        return "Project is up to date"
      } else {
        const site = new URL(res[1])
        let opts = {
          host: site.host,
          path: site.pathname,
          headers: {'user-agent': 'node.js',
          'content-type': '.zip'}
        }

        return remoteDownloadUpdate(res[0], opts).then(function(exist) {
          if (exist === true) {
            console.log('Update already exists')
          }
          console.log('Extracting...')
          return extract(res[0])
        })
      }
    })
  }
}
