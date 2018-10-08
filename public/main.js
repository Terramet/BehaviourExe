var ses, sessionP, robot, assigned
var connected = false
var language = null
var loadedPlaylists = []
var loadedLanguageJSON = {}
var recording = true
var time = null

function modalEvents() {
  // Get the modal
  var connectModal = document.getElementById('connectModal');
  // Get the button that opens the modal
  var connectBtn = document.getElementById('connectBtn');
  // Get the <span> element that closes the modal
  var connectClose = document.getElementById("connectClose");
  // When the user clicks on the button, open the modal
  connectBtn.onclick = function() {
      connectModal.style.display = "block";
  }
  // When the user clicks on <span> (x), close the modal
  connectClose.onclick = function() {
      connectModal.style.display = "none";
  }
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
      if (event.target == connectModal) {
          connectModal.style.display = "none";
      }
  }

  // Get the modal
  var createModal = document.getElementById('createModal');
  // Get the button that opens the modal
  var createBtn = document.getElementById('createPlaylistBtn');
  // Get the <span> element that closes the modal
  var createClose = document.getElementById("createClose");
  // When the user clicks on the button, open the modal
  createBtn.onclick = function() {
      if (createPlaylist())
          createModal.style.display = "block";
  }
  // When the user clicks on <span> (x), close the modal
  createClose.onclick = function() {
      createModal.style.display = "none";
  }
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
      if (event.target == createModal) {
          createModal.style.display = "none";
      }
  }

  // Get the modal
  var assignModal = document.getElementById('assignModal');
  // Get the button that opens the modal
  var assignBtn = document.getElementById('assignPlaylistsBtn');
  // Get the <span> element that closes the modal
  var assignClose = document.getElementById("assignClose");
  // When the user clicks on the button, open the modal
  assignBtn.onclick = function() {
      addPlaylistsToSelects(assignModal);
      assignModal.style.display = "block";
  }
  // When the user clicks on <span> (x), close the modal
  assignClose.onclick = function() {
      assignModal.style.display = "none";
  }
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
      if (event.target == assignModal) {
          assignModal.style.display = "none";
      }
  }

  // Get the modal
  var editModal = document.getElementById('editModal');
  // Get the button that opens the modal
  var editBtn = document.getElementById('editPlaylistsBtn');
  // Get the <span> element that closes the modal
  var editClose = document.getElementById("editClose");
  // When the user clicks on the button, open the modal
  editBtn.onclick = function() {
      addPlaylistsToSelects(editModal);
      editModal.style.display = "block";
  }
  // When the user clicks on <span> (x), close the modal
  editClose.onclick = function() {
      editModal.style.display = "none";
  }
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
      if (event.target == editModal) {
          editModal.style.display = "none";
      }
  }

  var viewModal = document.getElementById('viewModal');
  // Get the button that opens the modal
  var viewBtn = document.getElementById('viewVideosBtn');
  // Get the <span> element that closes the modal
  var viewClose = document.getElementById("viewClose");
  // When the user clicks on the button, open the modal
  viewBtn.onclick = function() {
      viewModal.style.display = "block";
      viewVideos();
  }
  // When the user clicks on <span> (x), close the modal
  viewClose.onclick = function() {
      viewModal.style.display = "none";
  }
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
      if (event.target == viewModal) {
          viewModal.style.display = "none";
      }
  }

  var videoModal = document.getElementById('videoModal');

  videoClose.onclick = function() {
      $('video').trigger('pause');
      videoModal.style.display = "none";
  }

  // Get the modal
  var langModal = document.getElementById('langModal');
  // Get the button that opens the modal
  var changeLangBtn = document.getElementById('changeLangBtn');
  // Get the <span> element that closes the modal
  var langClose = document.getElementById("langClose");
  // When the user clicks on the button, open the modal
  var applyLangBtn = document.getElementById("applyLang");

  applyLangBtn.onclick = function () {
    applyLanguage($('input[name=radio]:checked', '#langForm').parent().find("label")[0].innerHTML)
  }

  changeLangBtn.onclick = function() {
      langModal.style.display = "block";
      populateLanguageModal();
  }
  // When the user clicks on <span> (x), close the modal
  langClose.onclick = function() {
      langModal.style.display = "none";
  }
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
      if (event.target == connectModal) {
          langModal.style.display = "none";
      }
  }
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
  var stringConstructor = "test".constructor
  var arrayConstructor = [].constructor
  var objectConstructor = {}.constructor

  if (object === null) {
    return "null"
  }
  else if (object === undefined) {
    return "undefined"
  }
  else if (object.constructor === stringConstructor) {
    return "String"
  }
  else if (object.constructor === arrayConstructor) {
    return "Array"
  }
  else if (object.constructor === objectConstructor) {
    return "Object"
  }
  else {
    return "don't know"
  }
}

function createSession() {
  robot = new Robot(document.getElementById('IP').value)
  sessionP = robot.getSession()
  Promise.resolve(robot.getIP()).then(function(ip) {
    ses = new Session(document.getElementById('cName').value, loadedPlaylists)
    checkSSHKey()
    robot.startBehaviourManager()
    if (ses.getName()) {
      updateCookie()
      updateView()
    }
  })
}

function attemptAutoConnect() {
  let connectBtn = document.getElementById('connectBtn')
  getLanguageValue("connectBtn", 1).then(function(value) {
    connectBtn.innerHTML = value
  })
  robot = new Robot("nao.local")
  sessionP = robot.getSession()

  let ip = timeoutPromise(20000, robot.getIP())

  ip.then(response => {
    let child = prompt("Please enter the childs name:","")
    checkSSHKey()
    robot.startBehaviourManager()
    if (checkCookieData(child) != null) {
      if (confirm("You have a previous session stored for a child named: " + child + ". Would you like to restore it?")) {
        ses = new Session(JSON.parse(checkCookieData(child)), loadedPlaylists)
      } else {
        ses = new Session(child, loadedPlaylists)
      }
    } else {
      ses = new Session(child, loadedPlaylists)
    }
    updateCookie()
    updateView()
  })

  ip.catch(error => {
    alert("Autoconnect failed reason: " + error + "Please manually connect using the Connect button.")
    getLanguageValue("connectBtn", 0).then(function(value) {
      connectBtn.innerHTML = value
    })
  })
}

function say() {
  let str = document.getElementById('sayText').value
  let textToSay = str.replace(/%c/g, ses.getName())
  robot.say(textToSay)
  console.log("Robot said: " + textToSay + ".")
}

function updateView() {
  setInterval(function () {
    if (ses.getAssigned() !== null && document.getElementsByClassName("donut-spinner").length === 0) {
      getLanguageValue("replayB").then(function (value) {
        document.getElementById("replayB").innerHTML = value + "<br/><small>(" + ses.getAssigned().getPlaylist("main").returnLast() + ")</small>"
      })
      getLanguageValue("nextB").then(function (value) {
        document.getElementById("nextB").innerHTML = value + "<br/><small>(" + ses.getAssigned().getPlaylist("main").getNext() + ")</small>"
      })
      getLanguageValue("posB").then(function (value) {
        document.getElementById("posB").innerHTML = value
      })
      getLanguageValue("negB").then(function (value) {
        document.getElementById("negB").innerHTML = value
      })
    }
  }, 1000)
}

function checkCookieData(cname) {
  var name = cname + "="
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
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function updateCookie() {
  setInterval(function () {
    setCookie("language", language, 7)
    if (ses.getAssigned() != null)  {
      setCookie(ses.getName(), ses.asJSON(), 7)
    }
  }, 1000)
}

function playCurrent(type, btn) {
  if (ses.getAssigned() === undefined) {
    alert("No playlist assigned to buttons. \nPlease go to Settings > Assign Playlist.")
    console.error("No playlist assigned to " + btn.innerHTML + " button.")
  } else if (ses.getAssigned().getPlaylist(type).returnLast() !== "Nothing") {
    robot.startBehaviour(ses.getAssigned().getPlaylist(type).returnLast(), btn)
    // console.log(assigned.getPlaylist(type).returnLast())
  }
}

function playNext(type, btn) {
  if (ses.getAssigned() === undefined) {
    alert("No playlist assigned to buttons. \nPlease go to Settings > Assign Playlist.")
    console.error("No playlist assigned to " + btn.innerHTML + " button.")
  } else if (ses.getAssigned().getPlaylist(type).getNext() !== "Nothing") {
    robot.startBehaviour(ses.getAssigned().getPlaylist(type).next(), btn)
    // console.log(assigned.getPlaylist(type).next())
  }
}

function stopBehaviour() {
  robot.stopBehaviour()
  console.error("Robot behaviour forcefully stopped.")
}

function createPlaylist() {
  console.log("Getting behaviours list.")
  return listBehaviours()
}

function saveAssigned() {
  let m = document.getElementById('mainBehaviour')
  let p = document.getElementById('positiveBehaviour')
  let n = document.getElementById('negativeBehaviour')

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
    alert("Is it highly suggested that you choose a different playlist for each button. Failing to do so will cause un-expected behaviour.")
  }

  assigned = new Assigned(mp, pp, np)
  ses.setAssigned(assigned)

  document.getElementById('assignModal').style.display = 'none'

  console.log("Successfully assigned: <br/>"
  + mp.getName() + " as the main behaviour list. <br/>"
  + pp.getName() + " as the positive behaviour list. <br/>"
  + np.getName() + " as the negative behaviour list.")
}

function removeOptions(selectbox) {
  for(var i = selectbox.options.length - 1;  i >= 0;  i--) {
    selectbox.remove(i)
  }
}

function addPlaylistsToSelects(modal) {
  var selects = modal.getElementsByTagName("select")
  for (var i = 0; i < selects.length; i++) {
    removeOptions(selects[i])

    let base = document.createElement('option')
    base.setAttribute('disabled', '')
    base.setAttribute('selected', '')
    base.innerHTML = "Select"
    selects[i].add(base)

    loadedPlaylists.forEach(playlist => {
      let opt = document.createElement('option')
      opt.innerHTML = playlist.getName()
      selects[i].add(opt)
    })
  }
  console.log("Select boxes populated with saved playlists.")
}

function playVideo(data) {
  let videoModal = document.getElementById('videoModal')
  let videoForm = document.getElementById('videoForm')
  videoForm.innerHTML = ''
  let v = document.createElement('VIDEO')
  v.setAttribute('width', "320px")
  v.setAttribute('height', "240px")
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
      let list = document.getElementById('behaveListAvailable')
      list.innerHTML = ""
      for (let i = 0; i < array.length; i++) {
        if (!array[i].includes("/")) {
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
    alert("You need to connect to the robot first")
    return false
  }
}

function getTime() {
  let time = new Date()

  return time.getDate() + '-' + time.getMonth() + '-' + time.getFullYear() + '@' + ("0" + time.getHours()).slice(-2) + '_'  +
  ("0" + time.getMinutes()).slice(-2) + '_' +
  ("0" + time.getSeconds()).slice(-2)
}

function downloadInnerHtml(filename, elId, mimeType) {
  var elHtml = document.getElementById(elId).innerHTML
  var link = document.createElement('a')
  mimeType = mimeType || 'text/plain'

  link.setAttribute('download', filename)
  link.setAttribute('href', 'data:' + mimeType + 'charset=utf-8,' + encodeURIComponent(elHtml))
  link.click()
}

function populateLanguageModal() {
  let container = document.getElementById("langRadioContainer")
  let x = 0
  while (container.firstChild) {
      container.removeChild(container.firstChild);
  }

  Object.entries(loadedLanguageJSON["Languages"]).forEach(([key, value]) => {
    let radioDiv = document.createElement('div')
    let id = "radio-" + x++
    let item = document.createElement('input')
    item.setAttribute("name", "radio")
    item.setAttribute("id", id)
    item.setAttribute("type", "radio")

    let text = document.createElement('label')
    text.innerHTML = key
    text.setAttribute('for', id)
    text.classList.add('light')
    radioDiv.appendChild(item)
    radioDiv.appendChild(text)
    container.appendChild(radioDiv)
  })
}

function applyLanguageCookie(lang) {
  language = checkCookieData("language")
  console.log(language)
  if (language === null) {
    language = "English"
  }

  loadedLanguageJSON["Languages"][language].forEach(function(lang) {
    document.getElementById(lang["id"]).innerHTML = lang["text"];
  })
}

function applyLanguage(lang) {
  language = lang
  loadedLanguageJSON["Languages"][lang].forEach(function(lang) {
    if (lang["id"] === "connectBtn") {
      document.getElementById(lang["id"]).innerHTML = lang["text"][0]
    } else {
      document.getElementById(lang["id"]).innerHTML = lang["text"];
    }
  })
}

function getLanguageValue(elementId, index) {
  var prom = new Promise(function(resolve, reject) {
    loadedLanguageJSON["Languages"][language].forEach(function(lang) {
      if (lang["id"] === elementId)
        if (elementId === "connectBtn") {
          resolve(lang["text"][index])
        } else {
          resolve(lang["text"]);
        }
    })
  })
  return prom
}
//AJAX REQUESTS

function loadLanguage() {
  console.log("Sending load language request to node.js server.")
  $.ajax({
    type: 'GET',
    url: window.location.href + 'language/load',
    success: function(data) {
      console.log("Languages loaded successfully.")
      loadedLanguageJSON = data;
      applyLanguageCookie()
    }
  })
}

function savePlaylist() {
  let name = document.getElementById('playlistName').value
  let listElements = document.getElementById('behaveListPlaylist').childNodes
  listElements = Array.prototype.slice.call(listElements)

  playlist = new Playlist(listElements, name)

  var createModal = document.getElementById('createModal')

  $.ajax({
    type: 'POST',
    data: JSON.stringify(playlist),
    contentType: 'application/json',
    url: window.location.href + 'playlists/save',
    success: function(data) {
      alert(data + " was saved successfully")
      createModal.style.display = "none"
    },
    error: function(xhr, aO, thrown) {
      console.log(xhr.status)
      console.log("Error thrown: " + thrown)
    }
  }).then(function() {
    loadPlaylists()
  })
}

function loadPlaylists() {
  console.log("Sending load playlists request to node.js server.")
  $.ajax({
    type: 'GET',
    url: window.location.href + 'playlists/load',
    success: function(data) {
      console.log("Playlists loaded successfully.")
      loadedPlaylists = []
      data["playlists"].forEach(function(playlist) {
        loadedPlaylists.push(new Playlist(playlist))
      })
    }
  })
}

function clearPlaylists() {
  var response = confirm('Are you sure you want to delete all playlists? This is irreversible!')
  if (response) {
    data = {"playlists": []}
    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: window.location.href + 'playlists/clear',
      success: function(data) {
        console.log("Playlists deleted.")
      }
    })
  }
}

function checkSSHKey() {
  console.log("Beginning check for SSH file.")
  Promise.all([robot.getRobotName(), robot.getIP()]).then(function(vals) {
    let file_name = vals[1].replace(/\./g, '_')

    $.ajax({
      url: window.location.href + "ssh\\file_check",
      data: file_name,
      contentType: 'text/plain',
      type:'POST',
      error: function() {
        console.error("File check failed or the file does not exist.")
      },
      success: function(data) {
        if (data) {
          console.log("SSH file found.")
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
            url: window.location.href + "ssh\\gen_key",
            data: JSON.stringify(gen),
            contentType: 'application/json',
            type:'POST',
            error: function() {
              console.error("File check failed or the file does not exist.")
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
    data.filenameVideo = '/home/'+ vals[0] +'/recordings/cameras/' + ses.getName() + "_" + time + '.avi'
    data.filenameAudio = '/home/'+ vals[0] +'/recordings/microphones/' + ses.getName() + "_" + time + '.wav'
    data.endDirVideo = './public/raw_videos/'
    data.endDirAudio = './public/raw_audio/'
    data.endDir = './public/videos/'
    data.file = ses.getName() + "_" + time
    data.name = ses.getName()
    data.time = time
    data.robotName = vals[0]

    $.ajax({
      url: window.location.href + "ssh\\copy_recordings_audio",
      data: JSON.stringify(data),
      contentType: 'application/json',
      type:'POST',
      error: function() {
        console.error("File check failed or the file does not exist.")
      },
      success: function(info) {
        console.log(info)
        $.ajax({
          url: window.location.href + "ssh\\delete_nao_recording_audio",
          data: JSON.stringify(data),
          contentType: 'application/json',
          type:'POST',
          error: function() {
            console.error("File check failed or the file does not exist.")
          },
          success: function(info) {
            console.log(info)
          }
        })
      }
    })

    $.ajax({
      url: window.location.href + "ssh\\copy_recordings_video",
      data: JSON.stringify(data),
      contentType: 'application/json',
      type:'POST',
      error: function() {
        console.error("File check failed or the file does not exist.")
      },
      success: function(info) {
        console.log(info)
        $.ajax({
          url: window.location.href + "ssh\\delete_nao_recording_video",
          data: JSON.stringify(data),
          contentType: 'application/json',
          type:'POST',
          error: function() {
            console.error("File check failed or the file does not exist.")
          },
          success: function(info) {
            console.log(info)
          }
        })

        $.ajax({
          url: window.location.href + "ssh\\convert_recordings_video",
          data: JSON.stringify(data),
          contentType: 'application/json',
          type:'POST',
          error: function() {
            console.error("File check failed or the file does not exist.")
          },
          success: function(info) {
            console.log(info)
          }
        })
      }
    })
  })
}

function viewVideos() {
  $.ajax({
    url: window.location.href + "videos",
    type:'POST',
    success: function(data) {
      let viewForm = document.getElementById('viewForm')
      viewForm.innerHTML = ''
      data.forEach(datum => {
        if(datum.includes('.mp4')) {
          let d = document.createElement('DIV')
          let e = document.createElement('BUTTON')
          e.innerHTML = datum
          e.addEventListener("click", function () {
            playVideo(datum)
          }, false)
          d.appendChild(e)
          viewForm.appendChild(d)
        }
      })
    }
  })
}
