//AJAX REQUESTS
function removeHASH() {
  if (window.location.href.indexOf('#') != -1)
    return window.location.href.substring(0, window.location.href.indexOf('#'));
  else {
    return window.location.href;
  }
}

function loadLanguage() {
  console.log('Sending load language request to node.js server.');
  return $.ajax({
    type: 'GET',
    url: removeHASH() + 'language/load',
    success: (data) => {
      console.log('Languages loaded successfully.');
      loadedLanguageJSON = data;
      applyLanguageCookie();
      return 'complete';
    },
  });
}

function startMiro() {
  $.ajax({
      type: 'POST',
      contentType: 'application/json',
      url: removeHASH() + 'startMiro',
      success: (data) => { console.log(data) }
    })

  var data = {};
  data.velX = 0;
  data.velY = 0;
  $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: removeHASH() + 'moveMiro',
      success: (data) => { console.log(data) }

    })
}

function barkMiro() {
  $.ajax({
      type: 'POST',
      contentType: 'application/json',
      url: removeHASH() + 'barkMiro',
      success: (data) => { console.log(data) }
    })
}

function moveMiro(x, y) {
  var data = {};
  data.velX = x;
  data.velY = y;
  $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: removeHASH() + 'moveMiro',
      success: (data) => { console.log(data) }

    })
}

function stopMiro() {
  $.ajax({
      type: 'POST',
      url: removeHASH() + 'stopMiro',
      success: (data) => { console.log(data) }

    })
}

function savePlaylist() {
  let name = $('#playlistName')[0].value;
  let mainListElements = $('#behaveListMain')[0].childNodes;
  console.log(mainListElements)
  mainListElements = Array.prototype.slice.call(mainListElements);
  let posListElements = $('#behaveListPositive')[0].childNodes;
  console.log(posListElements)
  posListElements = Array.prototype.slice.call(posListElements);
  let negListElements = $('#behaveListNegative')[0].childNodes;
  console.log(negListElements)
  negListElements = Array.prototype.slice.call(negListElements);

  let mainList = []
  mainListElements.forEach( e => {
    mainList.push(e.innerText)
  })

  let posList = []
  posListElements.forEach( e => {
    posList.push(e.innerText)
  })

  let negList = []
  negListElements.forEach( e => {
    negList.push(e.innerText)
  })

  mainPlaylist = new Playlist(mainList, 'main' + name);
  posPlaylist = new Playlist(posList, 'pos' + name);
  negPlaylist = new Playlist(negList, 'neg' + name);

  playlist = new TriPlaylist(name, mainPlaylist, posPlaylist, negPlaylist);

  var createModal = $('#createModal')[0];

  $.ajax({
      type: 'POST',
      data: JSON.stringify(playlist),
      contentType: 'application/json',
      url: removeHASH() + 'playlists/save',
      success: (data) => {
        infoMessage(data + ' was saved successfully');
        createModal.style.display = 'none';
      },

      error: (xhr, aO, thrown) => {
        console.log(xhr.status);
        console.log('Error thrown: ' + thrown);
      },
    })
    .then(() => {
      loadPlaylists();
    });
}

function loadPlaylists() {
  console.log('Sending load playlists request to node.js server.');
  return $.ajax({
    type: 'GET',
    url: removeHASH() + 'playlists/load',
    success: (data) => {
      console.log('Playlists loaded successfully.');
      loadedPlaylists = [];
      data.playlists.forEach((playlist) => {
        loadedPlaylists.push(new TriPlaylist(playlist));
      });

      return 'complete';
    },
  });
}

function copyRecording(time) {
  Promise.all([robot.getRobotName(), robot.getIP()])
    .then((vals) => {
      let fileName = vals[1].replace(/\./g, '_');
      let data = {};
      data.ip = vals[1];
      data.sshKey = fileName;
      data.filenameVideo = '/home/' +
        vals[0] +
        '/recordings/cameras/' +
        ses.getName() + '_' +
        time +
        '.avi';
      data.filenameAudio = '/home/' +
        vals[0] +
        '/recordings/microphones/' +
        ses.getName() +
        '_' +
        time +
        '.wav';
      data.endDirVideo = './public/raw_videos/';
      data.endDirAudio = './public/raw_audio/';
      data.endDir = './public/videos/';
      data.file = ses.getName() + '_' + time;
      data.name = ses.getName();
      data.time = time;
      data.robotName = vals[0];

      if (checkCookieData('robotPass') !== null) {
        data.robotPass = checkCookieData('robotPass');
      } else {
        setCookie('robotPass', 'nao', 7);
        data.robotPass = checkCookieData('robotPass');
      }

      $.when(audioAJAX(data), videoAJAX(data))
        .done((aa, va) => {
          $.ajax({
            url: removeHASH() + 'ssh\\convert_recordings_video',
            data: JSON.stringify(data),
            contentType: 'application/json',
            type: 'POST',
            error: () => {
              console.error('ERROR: Creation of .mp4 file failed');
            },

            success: (info) => {
              console.log(info);
            },
          });
        });
    });
}

function audioAJAX(data) {
  return $.ajax({
    url: removeHASH() + 'ssh\\copy_recordings_audio',
    data: JSON.stringify(data),
    contentType: 'application/json',
    type: 'POST',
    error: () => {
      getLanguageValue('robotAuthenticationFailed')
        .then(value => {
          alertMessage(value, function () {
            getLanguageValue('robotAuthenticationFailedHelp')
              .then(value1 => {
                infoMessage(value1);
              });
          });
        });
    },

    success: (info) => {
      $.ajax({
        url: removeHASH() + 'ssh\\delete_nao_recording_audio',
        data: JSON.stringify(data),
        contentType: 'application/json',
        type: 'POST',
        error: () => {
          console.error('ERROR: Deletion of Nao audio recording failed');
        },

        success: info => {
          console.log(info);
        },
      });
    },
  });
}

function videoAJAX(data) {
  return $.ajax({
    url: removeHASH() + 'ssh\\copy_recordings_video',
    data: JSON.stringify(data),
    contentType: 'application/json',
    type: 'POST',
    error: () => {

      getLanguageValue('robotAuthenticationFailed')
        .then(value => {
          alertMessage(value, function () {
            getLanguageValue('robotAuthenticationFailedHelp')
              .then(value1 => {
                infoMessage(value1);
              });
          });
        });
    },

    success: (info) => {

      $.ajax({
        url: removeHASH() + 'ssh\\delete_nao_recording_video',
        data: JSON.stringify(data),
        contentType: 'application/json',
        type: 'POST',
        error: () => {
          console.error('ERROR: Deletion of Nao video recording failed');
        },

        success: (info) => {
          console.log(info);
        },
      });
    },
  });
}

function viewVideos() {
  $.ajax({
    url: removeHASH() + 'videos',
    type: 'POST',
    success: (data) => {
      let viewForm = document.getElementById('viewForm');
      viewForm.innerHTML = '';

      data.forEach(datum => {
        if (datum.includes('.mp4')) {
          let d = document.createElement('DIV');
          d.classList.add('ml-2', 'mt-2', 'mr-2', 'row');
          let e = document.createElement('BUTTON');
          d.classList.add('col');
          e.innerHTML = datum;
          e.addEventListener('click', () => {
            playVideo(datum);
          }, false);
          d.appendChild(e);
          viewForm.appendChild(d);
        }
      });
    },
  });
}

function getPresentations() {
  console.log('Requesting Presentations')
  return $.ajax({
    url: window.location.href + 'presentations',
    type:'POST',
    success: (data) => {
      return data;
    }
  })
}

function getSlaves() {
  return $.ajax({
    url: removeHASH() + 'get_slaves',
    type: 'get',
    success: function (data) {
      return data;
    },
  });
}

function getUpdate() {
  return $.ajax({
    url: removeHASH() + 'get_update',
    type: 'get',
    success: function (data) {
      alertMessage(data);
    },
  });
}

function checkUpdate() {
  return $.ajax({
    url: removeHASH() + 'check_update',
    type: 'get',
    success: function (data) {
      update = data;
    },
  });
}
