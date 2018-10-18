var ses = null, sessionP, robot, assigned
var connected = false
var language = null
var loadedPlaylists = []
var loadedLanguageJSON = {}
var recording = true
var time = null

function closeModal(id) {
  $('#' + id)[0].style.display = 'none'
}

function modalEvents() {
  // Get the modal
  var connectModal = $('#connectModal')[0]

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == connectModal) {
      connectModal.style.display = 'none'
    }
  }

  // Get the modal
  var createModal = $('#createModal')[0]
  // Get the button that opens the modal
  var createBtn = $('#createPlaylistBtn')[0]
  // When the user clicks on the button, open the modal
  createBtn.onclick = function() {
    if (createPlaylist())
    createModal.style.display = 'block'
  }

  window.onclick = function(event) {
    if (event.target == createModal) {
      createModal.style.display = 'none'
    }
  }

  // Get the modal
  var assignModal = $('#assignModal')[0]
  // Get the button that opens the modal
  var assignBtn = $('#assignPlaylistsBtn')[0]

  // When the user clicks on the button, open the modal
  assignBtn.onclick = function() {
    addPlaylistsToSelects(assignModal)
    assignModal.style.display = 'block'
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == assignModal) {
      assignModal.style.display = 'none'
    }
  }

  // Get the modal
  var editModal = $('#editModal')[0]
  // Get the button that opens the modal
  var editBtn = $('#editPlaylistsBtn')[0]


  // When the user clicks on the button, open the modal
  editBtn.onclick = function() {
    addPlaylistsToSelects(editModal)
    editModal.style.display = 'block'
  }
  // When the user clicks on <span> (x), close the modal

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == editModal) {
      editModal.style.display = 'none'
    }
  }

  var viewModal = $('#viewModal')[0]
  // Get the button that opens the modal
  var viewBtn = $('#viewVideosBtn')[0]

  // When the user clicks on the button, open the modal
  viewBtn.onclick = function() {
    viewModal.style.display = 'block'
    viewVideos()
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == viewModal) {
      viewModal.style.display = 'none'
    }
  }

  var videoModal = $('#videoModal')[0]

  videoClose.onclick = function() {
    $('video').trigger('pause')
    videoModal.style.display = 'none'
  }

  // Get the modal
  var langModal = $('#langModal')[0]
  // Get the button that opens the modal
  var changeLangBtn = $('#changeLangBtn')[0]

  changeLangBtn.onclick = function() {
    langModal.style.display = 'block'
    populateLanguageModal()
  }
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == connectModal) {
      langModal.style.display = 'none'
    }
  }

  var slaveModal = $('#connectSlavesModal')[0]
  var slaveBtn = $('#connectToSlavesBtn')[0]

  slaveBtn.onclick = function() {
    slaveModal.style.display = 'block'
    populateSlavesModal()
  }
}

function xhrGetStatus(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('HEAD', url);
  xhr.onreadystatechange = function(e) {
    xhr.onreadystatechange = null;
    callback({status: xhr.status, statusText: xhr.statusText});
  };
  xhr.send();
}

function timeoutPromise (ms, promise){
  // Create a promise that rejects in <ms> milliseconds
  let timeout = new Promise((resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id)
      reject('Timed out after '+ ms/1000 + 'seconds.')
    }, ms)
  })

  // Returns a race between our timeout and the passed in promise
  return Promise.race([
    promise,
    timeout
  ])
}

function whatIsIt(object) {
  var stringConstructor = 'test'.constructor
  var arrayConstructor = [].constructor
  var objectConstructor = {}.constructor

  if (object === null) {
    return 'null'
  }
  else if (object === undefined) {
    return 'undefined'
  }
  else if (object.constructor === stringConstructor) {
    return 'String'
  }
  else if (object.constructor === arrayConstructor) {
    return 'Array'
  }
  else if (object.constructor === objectConstructor) {
    return 'Object'
  }
  else {
    return 'Unknown'
  }
}

function createSession() {
  robot = new Robot($('#IP')[0].value)
  sessionP = robot.getSession()

  let ip = timeoutPromise(5000, robot.getIP())

  ip.then(response => {
    robot.startBehaviourManager(function(data) {
      startRec(data)
    }, function(data) {
      stopRec(data)
    })
    checkSSHKey()

    getChildNameAsync(function (child) {
      if (checkCookieData(child) != null) {
        restoreSessionAsync(child, function (ans){
          if (ans) {
            ses = new Session(JSON.parse(checkCookieData(child)), loadedPlaylists)
          } else {
            ses = new Session(child, loadedPlaylists)
          }
        })
      } else {
        ses = new Session(child, loadedPlaylists)
      }
      changeMemValue("child_name", child)

      updateCookie()
      updateView()
    })
  })

  ip.catch(error => {
    alert('Connect failed reason: ' + error)
    getLanguageValue('connectBtn', 0).then(function(value) {
      connectBtn.innerHTML = value
    })
  })

}

function attemptAutoConnect() {
  let connectBtn = $('#connectBtn')[0]
  getLanguageValue('connectBtn', 1).then(function(value) {
    connectBtn.innerHTML = value
  })

  robot = new Robot('nao.local', function() {
    $('#executionForm')[0].style.display = 'block'
    connectBtn.classList.remove('red')
    connectBtn.classList.add('green')
    getLanguageValue('connectBtn', 2).then(function(value) {
      connectBtn.innerText = value
    })
    connected = true

    let modal = $('#connectModal')[0]
    modal.style.display = 'none'
  }, function() {
    $('#executionForm')[0].style.display = 'none'

    connectBtn.classList.remove('green')
    connectBtn.classList.add('red')
    getLanguageValue('connectBtn', 3).then(function(value) {
      connectBtn.innerText = value
    })
    if(!alert('Connection to the robot has been lost. The page will now refresh.')){window.location.reload();}
  })

  sessionP = robot.getSession()

  let ip = timeoutPromise(5000, robot.getIP())

  ip.then(response => {
    robot.startBehaviourManager(function(data) {
      startRec(data)
    }, function(data) {
      stopRec(data)
    })

    checkSSHKey()

    getChildNameAsync(function (child) {
      if (checkCookieData(child) != null) {
        restoreSessionAsync(child, function (ans) {
          if (ans) {
            ses = new Session(JSON.parse(checkCookieData(child)), loadedPlaylists)
          } else {
            ses = new Session(child, loadedPlaylists)
          }
        })
      } else {
        ses = new Session(child, loadedPlaylists)
      }
      changeMemValue("child_name", child)

      updateCookie()
      updateView()
    })
  })

  ip.catch(error => {
    alert('Autoconnect failed reason: ' + error + 'Please manually connect using the Connect button.')
    getLanguageValue('connectBtn', 0).then(function(value) {
      connectBtn.innerHTML = value
    })
  })
}

function restoreSessionAsync(child, callback) {
  $('#restoreTitle')[0].innerHTML = $('#restoreTitle')[0].innerHTML.replace(/%child%/g, child)
  $('#restoreModal')[0].style.display = 'block'
  $('#restoreYes').click(function() {
    $('#restoreModal')[0].style.display = 'none'
    callback(true)
  })

  $('#restoreNo').click(function() {
    $('#restoreModal')[0].style.display = 'none'
    callback(false)
  })
}

function getChildNameAsync(callback) {
  $('#childModal')[0].style.display = 'block'
  $('#childSave').click(function() {
    $('#childModal')[0].style.display = 'none'
    callback($('#cName')[0].value)
  })
}

function say() {
  let str = $('#sayText')[0].value
  let textToSay = str.replace(/%c/g, ses.getName())
  robot.say(textToSay)
  console.log('Robot said: ' + textToSay + '.')
}

function updateView() {
  setInterval(function () {
    if (ses.getAssigned() !== null && document.getElementsByClassName('donut-spinner').length === 0) {
      getLanguageValue('replayB').then(function (value) {
        $('#replayB')[0].innerHTML = value + '<br/><small>(' + ses.getAssigned().getPlaylist('main').returnLast() + ')</small>'
      })
      getLanguageValue('nextB').then(function (value) {
        $('#nextB')[0].innerHTML = value + '<br/><small>(' + ses.getAssigned().getPlaylist('main').getNext() + ')</small>'
      })
      getLanguageValue('posB').then(function (value) {
        $('#posB')[0].innerHTML = value
      })
      getLanguageValue('negB').then(function (value) {
        $('#negB')[0].innerHTML = value
      })
    }
  }, 1000)
}

function checkCookieData(cname) {
  var name = cname + '='
  var decodedCookie = decodeURIComponent(document.cookie)
  var ca = decodedCookie.split(';')
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) == ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
  return null
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date()
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
  var expires = 'expires='+d.toUTCString()
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/'
}

function updateCookie() {
  setInterval(function () {
    if (ses.getAssigned() != null)  {
      setCookie(ses.getName(), ses.asJSON(), 7)
    }
  }, 1000)
}

function playCurrent(type, btn) {
  if (ses.getAssigned() === undefined) {
    alert('No playlist assigned to buttons. \nPlease go to Settings > Assign Playlist.')
    console.error('No playlist assigned to ' + btn.innerHTML + ' button.')
  } else if (ses.getAssigned().getPlaylist(type).returnLast() !== 'Nothing') {
    robot.startBehaviour(ses.getAssigned().getPlaylist(type).returnLast(), btn)
    // console.log(assigned.getPlaylist(type).returnLast())
  }
}

function playNext(type, btn) {
  if (ses.getAssigned() === undefined) {
    alert('No playlist assigned to buttons. \nPlease go to Settings > Assign Playlist.')
    console.error('No playlist assigned to ' + btn.innerHTML + ' button.')
  } else if (ses.getAssigned().getPlaylist(type).getNext() !== 'Nothing') {
    robot.startBehaviour(ses.getAssigned().getPlaylist(type).next(), btn)
    // console.log(assigned.getPlaylist(type).next())
  }
}

function stopBehaviour() {
  robot.stopBehaviour()
  console.error('Robot behaviour forcefully stopped.')
}

function createPlaylist() {
  console.log('Getting behaviours list.')
  return listBehaviours()
}

function saveAssigned() {
  let m = $('#mainBehaviour')[0]
  let p = $('#positiveBehaviour')[0]
  let n = $('#negativeBehaviour')[0]

  let mp, pp, np = null

  for(let i = 0; i < loadedPlaylists.length; i++) {
    if (loadedPlaylists[i].getName() === m.options[ m.selectedIndex ].innerHTML) {
      mp = loadedPlaylists[i]
    } else if (loadedPlaylists[i].getName() === n.options[ n.selectedIndex ].innerHTML) {
      pp = loadedPlaylists[i]
    } else if (loadedPlaylists[i].getName() === p.options[ p.selectedIndex ].innerHTML) {
      np = loadedPlaylists[i]
    }
  }

  if (mp === pp || mp === np || np === pp) {
    alert('Is it highly suggested that you choose a different playlist for each button. Failing to do so will cause un-expected behaviour.')
  }

  assigned = new Assigned(mp, pp, np)
  ses.setAssigned(assigned)

  $('#assignModal')[0].style.display = 'none'

  console.log('Successfully assigned: <br/>'
  + mp.getName() + ' as the main behaviour list. <br/>'
  + pp.getName() + ' as the positive behaviour list. <br/>'
  + np.getName() + ' as the negative behaviour list.')
}

function removeOptions(selectbox) {
  for(var i = selectbox.options.length - 1;  i >= 0;  i--) {
    selectbox.remove(i)
  }
}

function addPlaylistsToSelects(modal) {
  var selects = modal.getElementsByTagName('select')
  for (var i = 0; i < selects.length; i++) {
    removeOptions(selects[i])

    let base = document.createElement('option')
    base.setAttribute('disabled', '')
    base.setAttribute('selected', '')
    base.innerHTML = 'Select'
    selects[i].add(base)

    loadedPlaylists.forEach(playlist => {
      let opt = document.createElement('option')
      opt.innerHTML = playlist.getName()
      selects[i].add(opt)
    })
  }
  console.log('Select boxes populated with saved playlists.')
}

function playVideo(data) {
  let videoModal = $('#videoModal')[0]
  let videoForm = $('#videoForm')[0]
  videoForm.innerHTML = ''
  let v = document.createElement('VIDEO')
  v.setAttribute('width', '320px')
  v.setAttribute('height', '240px')
  v.setAttribute('controls', '')

  let s = document.createElement('SOURCE')
  s.setAttribute('src', './videos/' + data)
  s.setAttribute('type', 'video/mp4')
  v.appendChild(s)
  videoForm.appendChild(v)
  videoModal.style.display = 'block'

}

function listBehaviours() {
  if (robot !== undefined) {
    Promise.resolve(robot.getBehaviours()).then(function (array) {
      // Create the list element:
      let list = $('#behaveListAvailable')[0]
      list.innerHTML = ''
      for (let i = 0; i < array.length; i++) {
        if (!array[i].includes('/')) {
          // Create the list item:
          let item = document.createElement('li')

          // Set its contents:
          item.appendChild(document.createTextNode(array[i]))

          // Add it to the list:
          list.appendChild(item)
        }
      }
    })
    return true
  } else {
    alert('You need to connect to the robot first')
    return false
  }
}

function getTime() {
  let time = new Date()

  return time.getDate() + '-' + time.getMonth() + '-' + time.getFullYear() + '@' + ('0' + time.getHours()).slice(-2) + '_'  +
  ('0' + time.getMinutes()).slice(-2) + '_' +
  ('0' + time.getSeconds()).slice(-2)
}

function downloadInnerHtml(filename, elId, mimeType) {
  var elHtml = $('#' + elId)[0].innerHTML
  var link = document.createElement('a')
  mimeType = mimeType || 'text/plain'

  link.setAttribute('download', filename)
  link.setAttribute('href', 'data:' + mimeType + 'charset=utf-8,' + encodeURIComponent(elHtml))
  link.click()
}

function populateLanguageModal() {
  let container = $('#langRadioContainer')[0]
  let x = 0
  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }

  Object.entries(loadedLanguageJSON['Languages']).forEach(([key, value]) => {
    let radioDiv = document.createElement('div')
    let id = 'radio-' + x++
    let item = document.createElement('input')
    item.setAttribute('name', 'radio')
    item.setAttribute('id', id)
    item.setAttribute('type', 'radio')

    let text = document.createElement('label')
    text.innerHTML = key
    text.setAttribute('for', id)
    text.classList.add('light')
    radioDiv.appendChild(item)
    radioDiv.appendChild(text)
    container.appendChild(radioDiv)
  })

  $('input[type=radio]', '#langForm').change(function () {
    setCookie('language', $('input[name=radio]:checked', '#langForm').parent().find('label')[0].innerHTML, 7)
    applyLanguage($('input[name=radio]:checked', '#langForm').parent().find('label')[0].innerHTML)
  })
}

function applyLanguageCookie(lang) {
  language = checkCookieData('language')
  if (language === null) {
    language = 'English'
  }

  loadedLanguageJSON['Languages'][language].forEach(function(lang) {
    $('#' + lang['id'])[0].innerHTML = lang['text']
  })
}

function applyLanguage(lang) {
  language = lang
  loadedLanguageJSON['Languages'][lang].forEach(function(lang) {
    if (lang['id'] === 'connectBtn') {
      $('#' + lang['id'])[0].innerHTML = lang['text'][0]
    } else {
      $('#' + lang['id'])[0].innerHTML = lang['text']
    }
  })
}

function getLanguageValue(elementId, index) {
  let prom = new Promise(function(resolve, reject) {
    loadedLanguageJSON['Languages'][language].forEach(function(lang) {
      if (lang['id'] === elementId)
      if (elementId === 'connectBtn') {
        resolve(lang['text'][index])
      } else {
        resolve(lang['text'])
      }
    })
  })
  return prom
}

function populateSlavesModal() {
  let container = $('#slaveCheckBoxContainer')[0]
  let x = 0
  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }

  $.when(getSlaves()).then(function(data) {
    data.forEach((i) => {
      let checkboxDiv = document.createElement('div')
      let id = 'checkbox-' + x++
      let item = document.createElement('input')
      item.setAttribute('name', 'checkbox')
      item.setAttribute('id', id)
      item.setAttribute('type', 'checkbox')

      let text = document.createElement('label')
      text.innerHTML = i
      text.setAttribute('for', id)
      text.classList.add('light')
      checkboxDiv.appendChild(item)
      checkboxDiv.appendChild(text)
      container.appendChild(checkboxDiv)
    })

  })
}

function changeMemValue(key, val) {
  robot.setALMemoryValue(key, val)
}

function startRec(data) {
  if(data.includes('/.') && data !== 'run_dialog_dev/.') {
    let r = $('#replayB')[0]
    let n = $('#nextB')[0]
    let p = $('#posB')[0]
    let neg = $('#negB')[0]
    r.setAttribute('disabled', '')
    n.setAttribute('disabled', '')
    p.setAttribute('disabled', '')
    neg.setAttribute('disabled', '')
    let spin = document.getElementsByClassName('donut-spinner')
    if (spin.length !== 0)
    for(let i = 0; i < spin.length; i++) {
      spin[i].remove()
    }

    time = getTime()

    sessionP.service('ALAudioRecorder').then(function (ar) {
      ar.startMicrophonesRecording('/home/nao/recordings/microphones/' + ses.getName() + '_' + time + '.wav', 'wav', 16000, [0,0,1,0])
      console.log('Recording audio.')
    })

    sessionP.service('ALVideoRecorder').then(function (vr) {
      vr.setResolution(1)
      vr.setFrameRate(10)
      vr.setVideoFormat('MJPG')
      vr.startRecording('/home/nao/recordings/cameras/', ses.getName() + '_' + time)
      console.log('Recording video.')
    })

    recording = true
    console.log('Behaviour '+ data +' started successfully.')
  }
}

function stopRec(data) {
  if(data.includes('/.') && data !== 'run_dialog_dev/.') {
    let r = $('#replayB')[0]
    let n = $('#nextB')[0]
    let p = $('#posB')[0]
    let neg = $('#negB')[0]
    r.removeAttribute('disabled')
    n.removeAttribute('disabled')
    p.removeAttribute('disabled')
    neg.removeAttribute('disabled')
    sessionP.service('ALAudioRecorder').then(function (ar) {
      ar.stopMicrophonesRecording()
      console.log('Recording audio finished.')
    })

    sessionP.service('ALVideoRecorder').then(function (vr) {
      vr.stopRecording()
      console.log('Recording video finished.')
      copyRecording(time)
    })
    recording = false

    console.log('Behaviour finished.')
  }
}
//AJAX REQUESTS
function loadLanguage() {
  console.log('Sending load language request to node.js server.')
  return $.ajax({
    type: 'GET',
    url: window.location.href + 'language/load',
    success: function(data) {
      console.log('Languages loaded successfully.')
      loadedLanguageJSON = data
      applyLanguageCookie()
      return "complete"
    }
  })
}

function savePlaylist() {
  let name = $('#playlistName')[0].value
  let listElements = $('#behaveListPlaylist')[0].childNodes
  listElements = Array.prototype.slice.call(listElements)

  playlist = new Playlist(listElements, name)

  var createModal = $('#createModal')[0]

  $.ajax({
    type: 'POST',
    data: JSON.stringify(playlist),
    contentType: 'application/json',
    url: window.location.href + 'playlists/save',
    success: function(data) {
      alert(data + ' was saved successfully')
      createModal.style.display = 'none'
    },
    error: function(xhr, aO, thrown) {
      console.log(xhr.status)
      console.log('Error thrown: ' + thrown)
    }
  }).then(function() {
    loadPlaylists()
  })
}

function loadPlaylists() {
  console.log('Sending load playlists request to node.js server.')
  return $.ajax({
    type: 'GET',
    url: window.location.href + 'playlists/load',
    success: function(data) {
      console.log('Playlists loaded successfully.')
      loadedPlaylists = []
      data['playlists'].forEach(function(playlist) {
        loadedPlaylists.push(new Playlist(playlist))
      })
      return "complete"
    }
  })
}

function clearPlaylists() {
  var response = confirm('Are you sure you want to delete all playlists? This is irreversible!')
  if (response) {
    data = {'playlists': []}
    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: window.location.href + 'playlists/clear',
      success: function(data) {
        console.log('Playlists deleted.')
      }
    })
  }
}

function checkSSHKey() {
  console.log('Beginning check for SSH file.')
  Promise.all([robot.getRobotName(), robot.getIP()]).then(function(vals) {
    let file_name = vals[1].replace(/\./g, '_')

    $.ajax({
      url: window.location.href + 'ssh\\file_check',
      data: file_name,
      contentType: 'text/plain',
      type:'POST',
      error: function() {
        console.error('File check failed or the file does not exist.')
      },
      success: function(data) {
        if (data) {
          console.log('SSH file found.')
        } else {
          if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
          || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) {
            alert('SSH Key does not exist. If you continue videos taken by the Robot will NOT be copied to the server. Please contact an Admin to attempt to resolve the issue.')
          }
          alert('In a moment, a window will appear, you may need to type \'yes\' and hit enter and then you need to type your robots PASSWORD and hit enter!')
          let gen = {}
          gen.ip = vals[1]
          gen.fileName = file_name
          gen.robotName = vals[0]
          $.ajax({
            url: window.location.href + 'ssh\\gen_key',
            data: JSON.stringify(gen),
            contentType: 'application/json',
            type:'POST',
            error: function() {
              console.error('File check failed or the file does not exist.')
            },
            success: function(data) {
              console.log(data)
            }
          })
        }
      }
    })
  })
}

function copyRecording(time) {
  Promise.all([robot.getRobotName(), robot.getIP()]).then(function(vals) {
    let file_name = vals[1].replace(/\./g, '_')
    console.log(vals)
    let data = {}
    data.ip = vals[1]
    data.sshKey = file_name
    data.filenameVideo = '/home/'+ vals[0] +'/recordings/cameras/' + ses.getName() + '_' + time + '.avi'
    data.filenameAudio = '/home/'+ vals[0] +'/recordings/microphones/' + ses.getName() + '_' + time + '.wav'
    data.endDirVideo = './public/raw_videos/'
    data.endDirAudio = './public/raw_audio/'
    data.endDir = './public/videos/'
    data.file = ses.getName() + '_' + time
    data.name = ses.getName()
    data.time = time
    data.robotName = vals[0]

    $.when(audioAJAX(data), videoAJAX(data)).done(function (aa, va) {
      $.ajax({
        url: window.location.href + 'ssh\\convert_recordings_video',
        data: JSON.stringify(data),
        contentType: 'application/json',
        type:'POST',
        error: function() {
          console.error('ERROR: Creation of .mp4 file failed')
        },
        success: function(info) {
          console.log(info)
        }
      })
    })
  })
}

function audioAJAX(data) {
  return $.ajax({
    url: window.location.href + 'ssh\\copy_recordings_audio',
    data: JSON.stringify(data),
    contentType: 'application/json',
    type:'POST',
    error: function() {
      console.error('File check failed or the file does not exist.')
    },
    success: function(info) {
      return $.ajax({
        url: window.location.href + 'ssh\\delete_nao_recording_audio',
        data: JSON.stringify(data),
        contentType: 'application/json',
        type:'POST',
        error: function() {
          console.error('ERROR: Deletion of Nao audio recording failed')
        },
        success: function(info) {
          return console.log(info)
        }
      })
    }
  })
}

function videoAJAX(data) {
  return $.ajax({
    url: window.location.href + 'ssh\\copy_recordings_video',
    data: JSON.stringify(data),
    contentType: 'application/json',
    type:'POST',
    error: function() {
      console.error('File check failed or the file does not exist.')
    },
    success: function(info) {
      console.log(info)
      return $.ajax({
        url: window.location.href + 'ssh\\delete_nao_recording_video',
        data: JSON.stringify(data),
        contentType: 'application/json',
        type:'POST',
        error: function() {
          console.error('ERROR: Deletion of Nao video recording failed')
        },
        success: function(info) {
          return console.log(info)
        }
      })
    }
  })
}

function viewVideos() {
  $.ajax({
    url: window.location.href + 'videos',
    type:'POST',
    success: function(data) {
      let viewForm = document.getElementById('viewForm')
      viewForm.innerHTML = ''
      data.forEach(datum => {
        if(datum.includes('.mp4')) {
          let d = document.createElement('DIV')
          let e = document.createElement('BUTTON')
          e.innerHTML = datum
          e.addEventListener('click', function () {
            playVideo(datum)
          }, false)
          d.appendChild(e)
          viewForm.appendChild(d)
        }
      })
    }
  })
}

function getSlaves() {
  return $.ajax({
    url: window.location.href + 'get_slaves',
    type:'get',
    success: function(data) {
      // let ip = timeoutPromise(5000, robot.getIP())
      // console.log(data)
      // ip.then(response => {
      //   socket.emit('sendToSlave', {
      //     //normally this would be dynamically added based on user input, but for examples sake
      //     socket: data[0],
      //     masterSocket: socket.id,
      //     message: response
      //   });
      // })
      return data
    }
  })
}
