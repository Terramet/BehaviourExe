var ses = null;
var robot;
var assigned;
var connected = false;
var language = null;
var loadedPlaylists = [];
var connectedSlaves = [];
var loadedLanguageJSON = {};
var recording = true;
var time = null;
var update = null;
var advFeatureIDs = ['createPlaylistBtn', 'editPlaylistsBtn', 'advSettingsBtn', 'slaveBtn', 'uploadBtn'];
var miroActive = false;

function keyDownHandler(event) {
  if(event.keyCode == 39) {
      rightPressed = moveMiro(0, -1.5);
  }
  else if(event.keyCode == 37) {
      leftPressed = moveMiro(0, 1.5);
  }
  if(event.keyCode == 40) {
    downPressed = moveMiro(-400, 0);
  }
  else if(event.keyCode == 38) {
    upPressed = moveMiro(400, 0);
  }
}

function keyUpHandler(event) {
  if(event.keyCode == 39) {
      rightPressed = moveMiro(0, 0);
  }
  else if(event.keyCode == 37) {
      leftPressed = moveMiro(0, 0);
  }
  if(event.keyCode == 40) {
    downPressed = moveMiro(0, 0);
  }
  else if(event.keyCode == 38) {
    upPressed = moveMiro(0, 0);
  }
}

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

      robot.raiseDecision($('#leftD')[0], $('#rightD')[0], function(msg) { infoMessage(msg) } );
      robot.setConnected(true);
      robot.miroBarkOnNaoSpeech();

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

    getChildNameAsync(function (aData) {
      if (checkCookieData(aData.cName) != null) {
        restoreSessionAsync(aData.cName, function (ans) {
          if (ans) {
            ses = new Session(JSON.parse(checkCookieData(child)), loadedPlaylists);
          } else {
            ses = new Session(child, loadedPlaylists);
          }
        });
      } else {
        ses = new Session(aData.cName, loadedPlaylists);
      }

      robot.startBehaviourManager(function (data) {
        if (data.includes('/.') && data !== 'run_dialog_dev/.') {
          let s = $('#startB')[0];
          let r = $('#replayB')[0];
          let n = $('#nextB')[0];
          let p = $('#posB')[0];
          let neg = $('#negB')[0];
          s.classList.add('d-none');
          // r.classList.remove('d-none');
          n.classList.remove('d-none');
          p.setAttribute('disabled', '');
          neg.setAttribute('disabled', '');

          if (aData.record == true) {
            startRec(data);
          }

          time = getTime();
          console.log('Behaviour ' + data + ' started successfully.');
        }
      },

        function (data) {
          if (data.includes('/.') && data !== 'run_dialog_dev/.') {
            let s = $('#startB')[0];
            let r = $('#replayB')[0];
            let n = $('#nextB')[0];
            let p = $('#posB')[0];
            let neg = $('#negB')[0];
            s.classList.remove('d-none');
            // r.classList.add('d-none');
            n.classList.add('d-none');
            p.removeAttribute('disabled');
            neg.removeAttribute('disabled');

            if (aData.record == true) {
              stopRec(data);
            }

            console.log('Behaviour finished.');
          }
        });

      changeMemValue('child_name', aData.cName);

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

      robot.raiseDecision($('#leftD')[0], $('#rightD')[0], function(msg) { infoMessage(msg) } );
      robot.setConnected(true);
      robot.miroBarkOnNaoSpeech();

      let modal = $('#connectModal')[0];
      modal.style.display = 'none';

      getChildNameAsync(function (aData) {
        if (checkCookieData(aData.cName) != null) {
          restoreSessionAsync(aData.cName, function (ans) {
            if (ans) {
              ses = new Session(JSON.parse(checkCookieData(aData.cName)), loadedPlaylists);
            } else {
              ses = new Session(aData.cName, loadedPlaylists);
            }
          });
        } else {
          ses = new Session(aData.cName, loadedPlaylists);
        }

        robot.startBehaviourManager(function (data) {
          if (data.includes('/.') && data !== 'run_dialog_dev/.') {
            let s = $('#startBtnCont')[0];
            let r = $('#nextReplayBtnCont')[0];
            let p = $('#posB')[0];
            let neg = $('#negB')[0];
            s.classList.add('d-none');
            r.classList.remove('d-none');
            p.setAttribute('disabled', '');
            neg.setAttribute('disabled', '');

            if (aData.record == true) {
              startRec(data);
            }

            time = getTime();
            console.log('Behaviour ' + data + ' started successfully.');
          }
        },

          function (data) {
            if (data.includes('/.') && data !== 'run_dialog_dev/.') {
              let s = $('#startBtnCont')[0];
              let r = $('#nextReplayBtnCont')[0];
              let p = $('#posB')[0];
              let neg = $('#negB')[0];
              s.classList.remove('d-none');
              r.classList.add('d-none');
              p.removeAttribute('disabled');
              neg.removeAttribute('disabled');

              if (aData.record == true) {
                stopRec(data);
              }

              console.log('Behaviour finished.');
            }
          });

        changeMemValue('child_name', aData.cName);

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
      callback({
        'cName': $('#cName')[0].value,
        'record': $('#robotRecordCheck')[0].checked});
    });
}

function getSlavePresentationAsync(presentations, callback) {
  console.log(presentations);

  let container = $('#slavePresContainer')[0]

  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }

  presentations.forEach(pres => {
    if(pres !== '.gitkeep') {
      let radioDiv = document.createElement('div')
      let id = 'radio-' + pres
      let item = document.createElement('input')
      item.setAttribute('name', 'radio')
      item.setAttribute('id', id)
      item.setAttribute('type', 'radio')

      let text = document.createElement('label')
      text.innerHTML = pres
      text.setAttribute('for', id)
      text.classList.add('light')
      radioDiv.appendChild(item)
      radioDiv.appendChild(text)
      container.appendChild(radioDiv)
    }
  })

  $('#slavePresentationModal')[0].style.display = 'block'
  $('#slaveSave').click(function() {
    $('#slavePresentationModal')[0].style.display = 'none'
    console.log($('input[name=radio]:checked', '#slavePresentationModal').parent().find('label')[0].innerHTML)
    callback($('input[name=radio]:checked', '#slavePresentationModal').parent().find('label')[0].innerHTML)
  })
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

function activateMiroMovement() {
  if(!miroActive) {
    miroActive = true;
    startMiro();
  } else {
    miroActive = false;
    stopMiro();
  }
}

jQuery(document).ready(function (e) {
function t(t) {
    e(t).bind("click", function (t) {
        t.preventDefault();
        e(this).parent().fadeOut()
    })
}

e(".dropdown-toggle").click(function () {
    var t = e(this).parents(".button-dropdown").children(".dropdown-menu").is(":hidden");
    e(".button-dropdown .dropdown-menu").hide();
    e(".button-dropdown .dropdown-toggle").removeClass("active");
    if (t) {
        e(this).parents(".button-dropdown").children(".dropdown-menu").toggle().parents(".button-dropdown").children(".dropdown-toggle").addClass("active")
    }
});
e(document).bind("click", function (t) {
    var n = e(t.target);
    if (!n.parents().hasClass("button-dropdown")) e(".button-dropdown .dropdown-menu").hide();
});
e(document).bind("click", function (t) {
    var n = e(t.target);
    if (!n.parents().hasClass("button-dropdown")) e(".button-dropdown .dropdown-toggle").removeClass("active");
  })
});
