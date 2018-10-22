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
      return data
    }
  })
}
