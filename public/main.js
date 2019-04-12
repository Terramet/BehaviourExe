var ses = null;
var robot;
var assigned;
var connected = false;
var language = null;
var loadedPlaylists = [];
var loadedLanguageJSON = {};
var recording = true;
var time = null;
var update = null;
var advFeatureIDs = ['createPlaylistBtn', 'editPlaylistsBtn', 'advSettingsBtn'];

function closeModal(id) {
  $('#' + id)[0].style.display = 'none';
}

function modalEvents() {
  var createBtn = $('#createPlaylistBtn')[0];

  // When the user clicks on the button, open the modal
  createBtn.onclick = function () {
    createPlaylist();
  };

  // Get the button that opens the modal
  var assignBtn = $('#assignPlaylistsBtn')[0];

  // When the user clicks on the button, open the modal
  assignBtn.onclick = function () {
    addPlaylistsToSelects(assignModal);
  };

  var viewBtn = $('#viewVideosBtn')[0];

  // When the user clicks on the button, open the modal
  viewBtn.onclick = function () {
    viewVideos();
  };

  var changeLangBtn = $('#changeLangBtn')[0];

  changeLangBtn.onclick = function () {
    populateLanguageModal();
  };

  var slaveModalBtn = $('#slaveModalBtn')[0];

  slaveModalBtn.onclick = function () {
    populateSlaveModal();
  };
}

function xhrGetStatus(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('HEAD', url);
  xhr.onreadystatechange = function (e) {
    xhr.onreadystatechange = null;
    callback({
      status: xhr.status,
      statusText: xhr.statusText,
    });
  };

  xhr.send();
}

function timeoutPromise(ms, promise) {
  // Create a promise that rejects in <ms> milliseconds
  let timeout = new Promise((resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id);
      reject('Timed out after ' + ms / 1000 + 'seconds.');
    }, ms);
  });

  // Returns a race between our timeout and the passed in promise
  return Promise.race([
    promise,
    timeout,
  ]);
}

function whatIsIt(object) {
  var stringConstructor = 'test'.constructor;
  var arrayConstructor = [].constructor;
  var objectConstructor = {}.constructor;

  if (object === null) {
    return 'null';
  } else if (object === undefined) {
    return 'undefined';
  } else if (object.constructor === stringConstructor) {
    return 'String';
  } else if (object.constructor === arrayConstructor) {
    return 'Array';
  } else if (object.constructor === objectConstructor) {
    return 'Object';
  } else {
    return 'Unknown';
  }
}

function createSession() {
  robot = new Robot();

  robot.startSession($('#IP')[0].value, function () {
      $('#executionForm')[0].style.display = 'block';
      $('#connectBtn')
        .parent()[0].classList.remove('red');
      $('#connectBtn')
        .parent()[0].classList.add('green');
      getLanguageValue('connectBtn', 2)
        .then(function (value) {
          connectBtn.innerText = value;
        });

      robot.setConnected(true);

      let modal = $('#connectModal')[0];
      modal.style.display = 'none';

    },

    function () {
      $('#executionForm')[0].style.display = 'none';

      $('#connectBtn')
        .parent()[0].classList.remove('green');
      $('#connectBtn')
        .parent()[0].classList.add('red');
      getLanguageValue('connectBtn', 3)
        .then(function (value) {
          connectBtn.innerText = value;
        });

      robot.setConnected(false);

      if (!alertMessage(getLanguageValue('connectionLostalertMessage'))) {
        window.location.reload();
      }
    });

  let ip = timeoutPromise(10000, robot.getIP());

  ip.then(response => {
    robot.startBehaviourManager(function (data) {
        startRec(data);
      },

      function (data) {
        stopRec(data);
      });

    getChildNameAsync(function (child) {
      if (checkCookieData(child) != null) {
        restoreSessionAsync(child, function (ans) {
          if (ans) {
            ses = new Session(JSON.parse(checkCookieData(child)), loadedPlaylists);
          } else {
            ses = new Session(child, loadedPlaylists);
          }
        });
      } else {
        ses = new Session(child, loadedPlaylists);
      }

      changeMemValue('child_name', child);

      updateCookie();
      updateView();
    });
  });

  ip.catch(error => {
    getLanguageValue('connectIPCatch')
      .then(value => {
        alertMessage(value + error);
      });

    getLanguageValue('connectBtn', 0)
      .then(value => {
        connectBtn.innerHTML = value;
      });
  });

}

function attemptAutoConnect() {
  let connectBtn = $('#connectBtn')[0];
  getLanguageValue('connectBtn', 1)
    .then(value => {
      connectBtn.innerHTML = value;
    });

  robot = new Robot();

  robot.startSession('nao.local', function () {
      $('#executionForm')[0].style.display = 'block';
      $('#connectBtn')
        .parent()[0].classList.remove('red');
      $('#connectBtn')
        .parent()[0].classList.add('green');
      getLanguageValue('connectBtn', 2)
        .then(value => {
          connectBtn.innerText = value;
        });

      robot.setConnected(true);

      let modal = $('#connectModal')[0];
      modal.style.display = 'none';

      robot.startBehaviourManager(function (data) {
          startRec(data);
        },

        function (data) {
          stopRec(data);
        });

      getChildNameAsync(function (child) {
        if (checkCookieData(child) != null) {
          restoreSessionAsync(child, function (ans) {
            if (ans) {
              ses = new Session(JSON.parse(checkCookieData(child)), loadedPlaylists);
            } else {
              ses = new Session(child, loadedPlaylists);
            }
          });
        } else {
          ses = new Session(child, loadedPlaylists);
        }

        changeMemValue('child_name', child);

        updateCookie();
        updateView();
      });
    },

    function () {
      $('#executionForm')[0].style.display = 'none';

      $('#connectBtn')
        .parent()[0].classList.remove('green');
      $('#connectBtn')
        .parent()[0].classList.add('red');
      getLanguageValue('connectBtn', 3)
        .then(function (value) {
          connectBtn.innerText = value;
        });

      robot.setConnected(false);

      getLanguageValue('connectionLostalertMessage')
        .then((value) => {
          if (!alertMessage(value)) {
            window.location.reload();
          }
        });
    });

  let ip = timeoutPromise(10000, robot.getIP());

  ip.catch(error => {
    getLanguageValue('connectIPCatch')
      .then(value => {
        alertMessage(value + error, () => {
          getLanguageValue('helpManualConnect')
            .then(value2 => {
              infoMessage(value2);
            });
        });
      });

    getLanguageValue('connectBtn', 0)
      .then(function (value) {
        connectBtn.innerHTML = value;
      });
  });
}

function restoreSessionAsync(child, callback) {
  $('#restoreTitle')[0].innerHTML = $('#restoreTitle')[0].innerHTML.replace(/%child%/g, child);
  $('#restoreModal')[0].style.display = 'block';

  $('#restoreYes')
    .click(function () {
      $('#restoreModal')[0].style.display = 'none';
      callback(true);
    });

  $('#restoreNo')
    .click(function () {
      $('#restoreModal')[0].style.display = 'none';
      callback(false);
    });
}

function getChildNameAsync(callback) {
  $('#childModal')[0].style.display = 'block';

  $('#childSave')
    .click(function () {
      $('#childModal')[0].style.display = 'none';
      callback($('#cName')[0].value);
    });
}

function removeOptions(selectbox) {
  for (var i = selectbox.options.length - 1; i >= 0; i--) {
    selectbox.remove(i);
  }
}

function addPlaylistsToSelects(modal) {
  var selects = modal.getElementsByTagName('select');
  for (var i = 0; i < selects.length; i++) {
    removeOptions(selects[i]);

    let base = document.createElement('option');
    base.setAttribute('disabled', '');
    base.setAttribute('selected', '');
    base.innerHTML = 'Select';
    selects[i].add(base);

    loadedPlaylists.forEach(playlist => {
      let opt = document.createElement('option');
      opt.innerHTML = playlist.getName();
      selects[i].add(opt);
    });
  };

  console.log('Select boxes populated with saved playlists.');
}

function getTime() {
  let time = new Date();

  return time.getDate() + '-' + time.getMonth() + '-' + time.getFullYear() + '@' +
    ('0' + time.getHours())
    .slice(-2) + '_' +
    ('0' + time.getMinutes())
    .slice(-2) + '_' +
    ('0' + time.getSeconds())
    .slice(-2);
}

function downloadInnerHtml(filename, elId, mimeType) {
  var elHtml = $('#' + elId)[0].innerHTML;
  var link = document.createElement('a');
  mimeType = mimeType || 'text/plain';

  link.setAttribute('download', filename);
  link.setAttribute('href', 'data:' + mimeType + 'charset=utf-8,' + encodeURIComponent(elHtml));
  link.click();
}

function setMovementValue(key, val) {
  robot.movement[key] = val;
}

function activateMovement() {
  if(!robot.listenersActive) {
    robot.startMovementListeners();
  } else {
    robot.stopMovementListeners();
  }
}
