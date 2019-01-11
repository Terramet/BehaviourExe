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

function advancedFeatures(value) {
  if (value === true || value === 'true') {
    $('#advCheck')
      .prop('checked', true);
    getLanguageValue('advModeON')
      .then(value1 => {
        infoMessage(value1);
      });
  } else {
    $('#advCheck')
      .prop('checked', false);
    getLanguageValue('advModeOFF')
      .then(value1 => {
        infoMessage(value1);
      });
  }

  advFeatureIDs.forEach(element => {
    if (value === true || value === 'true') {
      $('#' + element)[0]
        .style.display = 'block';
    } else {
      $('#' + element)[0]
        .style.display = 'none';
    }
  });
}

function checkBehaveList(p) {
  return new Promise(function (resolve, reject) {

    p.list.forEach(b => {
      robot.isBehaviorInstalled(b)
        .then((a) => {
          if (!a) {
            return resolve(false);
          } else if (b === p.list[p.list.length - 1]) {
            return resolve(true);
          }
        });
    });
  });
}

function closeModal(id) {
  $('#' + id)[0].style.display = 'none';
}

function alertMessage(value, cb) {
  let tmpl = document.getElementById('error-template');
  $('#message-holder')[0].appendChild(tmpl.content.cloneNode(true));
  $('#message-value-error')[0].innerHTML = '<i class="fa fa-times-circle"></i> ' + value;
  $('#message-value-error')
    .css('opacity', '1')
    .hide()
    .fadeIn(4000)
    .delay(4000)
    .fadeOut(4000, () => {
      $('message-value-error')
        .remove();
      if (cb) {
        cb();
      }
    });

  return false;
}

function infoMessage(value, cb) {
  let tmpl = document.getElementById('info-template');
  $('#message-holder')[0].appendChild(tmpl.content.cloneNode(true));
  $('#message-value-info')[0].innerHTML = '<i class="fa fa-info-circle"></i> ' + value;
  $('#message-value-info')
    .css('opacity', '1')
    .hide()
    .fadeIn(4000)
    .delay(4000)
    .fadeOut(4000, () => {
      $('#message-value-info')
        .remove();
      if (cb) {
        cb();
      }
    });

  return false;
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

function say() {
  let str = $('#sayText')[0].value;
  let textToSay = str.replace(/%c/g, ses.getName());
  robot.say(textToSay);
  console.log('Robot said: ' + textToSay + '.');
}

function updateView() {
  setInterval(function () {
    if (ses.getAssigned() !== null &&
      document.getElementsByClassName('donut-spinner')
      .length === 0) {
      getLanguageValue('replayB')
        .then(function (value) {
          $('#replayB')[0].innerHTML = value + ': <br/><small>' +
            ses.getAssigned()
            .getPlaylist('main')
            .returnLast() + '</small>';
        });

      getLanguageValue('nextB')
        .then(function (value) {
          $('#nextB')[0].innerHTML = value + ': <br/><small>' +
            ses.getAssigned()
            .getPlaylist('main')
            .getNext() + '</small>';
        });

      getLanguageValue('posB')
        .then(function (value) {
          $('#posB')[0].innerHTML = value;
        });

      getLanguageValue('negB')
        .then(function (value) {
          $('#negB')[0].innerHTML = value;
        });
    }
  }, 1000);

}

function checkCookieData(cname) {
  var name = cname + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    };

    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  };

  return null;
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function updateCookie() {
  setInterval(function () {
    if (ses.getAssigned() != null) {
      setCookie(ses.getName(), ses.asJSON(), 7);
    }
  }, 1000);

}

function playCurrent(type, btn) {
  if (ses.getAssigned() === null) {
    getLanguageValue('noPlaylists')
      .then(value => {
        alertMessage(value);
      });

    console.error('No playlist assigned to ' + btn.innerHTML + ' button.');
  } else if (ses.getAssigned()
    .getPlaylist(type)
    .returnLast() !== 'Nothing') {
    robot.startBehaviour(ses.getAssigned()
      .getPlaylist(type)
      .returnLast(), btn);
  }
}

function playNext(type, btn) {
  if (ses.getAssigned() === null) {
    getLanguageValue('noPlaylists')
      .then(value => {
        alertMessage(value);
      });

    console.error('No playlist assigned to ' + btn.innerHTML + ' button.');
  } else if (ses.getAssigned()
    .getPlaylist(type)
    .getNext() !== 'Nothing') {
    robot.startBehaviour(ses.getAssigned()
      .getPlaylist(type)
      .next(), btn);
  }
}

function stopBehaviour() {
  robot.stopBehaviour();
  console.error('Robot behaviour forcefully stopped.');
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

function changeMemValue(key, val) {
  robot.setALMemoryValue(key, val);
}

function startRec(data) {
  if (data.includes('/.') && data !== 'run_dialog_dev/.') {
    let r = $('#replayB')[0];
    let n = $('#nextB')[0];
    let p = $('#posB')[0];
    let neg = $('#negB')[0];
    r.setAttribute('disabled', '');
    n.setAttribute('disabled', '');
    p.setAttribute('disabled', '');
    neg.setAttribute('disabled', '');
    let spin = document.getElementsByClassName('donut-spinner');
    if (spin.length !== 0) {
      for (let i = 0; i < spin.length; i++) {
        spin[i].remove();
      };
    }

    time = getTime();

    robot.startRecording(ses.getName());

    recording = true;
    console.log('Behaviour ' + data + ' started successfully.');
  }
}

function stopRec(data) {
  if (data.includes('/.') && data !== 'run_dialog_dev/.') {
    let r = $('#replayB')[0];
    let n = $('#nextB')[0];
    let p = $('#posB')[0];
    let neg = $('#negB')[0];
    r.removeAttribute('disabled');
    n.removeAttribute('disabled');
    p.removeAttribute('disabled');
    neg.removeAttribute('disabled');

    robot.stopRecording();

    recording = false;

    console.log('Behaviour finished.');
    setTimeout(copyRecording(time), 2000);
  }
}
