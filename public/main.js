var ses, sessionP, robot, assigned
var loadedPlaylists = []
var recording = true

function delay(t, v) {
    return new Promise(function(resolve) { 
        setTimeout(resolve.bind(null, v), t);
    });
}
 
 Promise.prototype.delay = function(t) {
     return this.then(function(v) {
         return delay(t, v);
     });
}

function createSession() {
    ses = new Session(document.getElementById('IP').value, document.getElementById('cName').value)
    sessionP = ses.getSession();
    robot = new Robot();
}

function attemptAutoConnect() {
    document.getElementById("connectBtn").innerHTML = "<p>Connecting</p> <div class=\"donut-spinner\"></div>";
    ses = new Session("nao.local")
    sessionP = ses.getSession();
    robot = new Robot();
}

function say() {
    let str = document.getElementById('sayText').value;
    let textToSay = str.replace(/%c/g, ses.getName());
    robot.say(textToSay);
    Promise.resolve(robot.getIP()).then(function(d) {console.log(d)}) 
    console.log("Robot said: " + textToSay + ".")
}

function updateView() {
    setInterval(function () {
        if (assigned !== undefined && document.getElementsByClassName("donut-spinner").length === 0) {
            document.getElementById("replayB").innerHTML = "Replay <br/><small>(" + assigned.getPlaylist("main").returnLast() + ")</small>";
            document.getElementById("nextB").innerHTML = "Next <br/><small>(" + assigned.getPlaylist("main").getNext() + ")</small>";
            document.getElementById('posB').innerHTML = "Positive";
            document.getElementById('negB').innerHTML = "Negative";
        }
    }, 1000)
}

function playCurrent(type, btn) {
    if (assigned === undefined) {
        alert("No playlist assigned to buttons. \nPlease go to Settings > Assign Playlist.");
        console.error("No playlist assigned to " + btn.innerHTML + " button.")
    } else if (assigned.getPlaylist(type).returnLast() !== "Nothing") {
        robot.startBehaviour(assigned.getPlaylist(type).returnLast(), btn);
        // console.log(assigned.getPlaylist(type).returnLast());
    }
}

function playNext(type, btn) {
    if (assigned === undefined) {
        alert("No playlist assigned to buttons. \nPlease go to Settings > Assign Playlist.");
        console.error("No playlist assigned to " + btn.innerHTML + " button.")
    } else if (assigned.getPlaylist(type).getNext() !== "Nothing") {
        robot.startBehaviour(assigned.getPlaylist(type).next(), btn);
        // console.log(assigned.getPlaylist(type).next());
    }
}

function stopBehaviour() {
    robot.stopBehaviour();
    console.error("Robot behaviour forcefully stopped.");
}

function createPlaylist() {
    console.log("Getting behaviours list.")
    return listBehaviours();
}

function saveAssigned() {
    let m = document.getElementById('mainBehaviour');
    let p = document.getElementById('positiveBehaviour');
    let n = document.getElementById('negativeBehaviour');

    let mp, pp, np = null

    for(let i = 0; i < loadedPlaylists.length; i++) {
        if (loadedPlaylists[i].getName() === m.options[ m.selectedIndex ].innerHTML) {
            mp = loadedPlaylists[i];
        } else if (loadedPlaylists[i].getName() === n.options[ n.selectedIndex ].innerHTML) {
            pp = loadedPlaylists[i];
        } else if (loadedPlaylists[i].getName() === p.options[ p.selectedIndex ].innerHTML) {
            np = loadedPlaylists[i];
        }
    }

    if (mp === pp || mp === np || np === pp) {
        alert("Is it highly suggested that you choose a different playlist for each button. Failing to do so will cause un-expected behaviour.")
    }
    
    assigned = new Assigned(mp, pp, np);

    document.getElementById('assignModal').style.display = 'none';

    console.log("Successfully assigned: <br/>"
     + mp.getName() + " as the main behaviour list. <br/>"
     + pp.getName() + " as the positive behaviour list. <br/>"
     + np.getName() + " as the negative behaviour list.")
}

function removeOptions(selectbox) {
    for(var i = selectbox.options.length - 1 ; i >= 0 ; i--) {
        selectbox.remove(i);
    }
}

function addPlaylistsToSelects(modal) {
    var selects = modal.getElementsByTagName("select");
    for (var i = 0; i < selects.length; i++) {
        removeOptions(selects[i]);

        let base = document.createElement('option');
        base.setAttribute('disabled', '');
        base.setAttribute('selected', '');
        base.innerHTML = "Select";
        selects[i].add(base);

        loadedPlaylists.forEach(playlist => {
            let opt = document.createElement('option');
            opt.innerHTML = playlist.getName();
            selects[i].add(opt);
        })
    }
    console.log("Select boxes populated with saved playlists.")
}

function savePlaylist() {
    let name = document.getElementById('playlistName').value
    let listElements = document.getElementById('behaveListPlaylist').childNodes;
    listElements = Array.prototype.slice.call(listElements);

    playlist = new Playlist(listElements, name);

    var createModal = document.getElementById('createModal');

    $.ajax({
        type: 'POST',
        data: JSON.stringify(playlist),
        contentType: 'application/json',
        url: window.location.href + 'playlists/save',						
        success: function(data) {
            alert(data + " was saved successfully");
            createModal.style.display = "none";
        },
        error: function(xhr, aO, thrown) {
            console.log(xhr.status);
            console.log("Error thrown: " + thrown);
        }
    }).then(function() {
        loadPlaylists();
    });
}

function loadPlaylists() {
    console.log("Sending load request to node.js server.")
    $.ajax({
        type: 'GET',
        url: window.location.href + 'playlists/load',						
        success: function(data) {
            console.log("Playlists loaded successfully.");
            loadedPlaylists = [];
            data["playlists"].forEach(function(playlist) {
                loadedPlaylists.push(new Playlist(playlist));
            });
        }
    })
}

function checkSSHKey() {
    fileName = "id_rsa";

    $.ajax({
        url: window.location.href + "ssh\\file_check",
        data: fileName,
        contentType: 'text/plain',
        type:'POST',
        error: function() {
            console.error("File check failed or the file does not exist.");
        },
        success: function(data) {
            if (data) {
                console.log("SSH file found.")
            } else {
                Promise.all([robot.getRobotName(), robot.getIP()]).then(function(vals) {
                    console.log(vals);
                    alert('In a moment, a window will appear, you may need to type \'yes\' and hit enter and then you need to type your robots PASSWORD and hit enter!');
                    let gen = {};
                    gen.ip = vals[1];
                    gen.fileName = fileName;
                    gen.robotName = vals[0];
                    $.ajax({
                        url: window.location.href + "ssh\\gen_key",
                        data: JSON.stringify(gen),
                        contentType: 'application/json',
                        type:'POST',
                        error: function() {
                            console.error("File check failed or the file does not exist.");
                        },
                        success: function(data) {
                            console.log(data);
                        }
                    });
                });
            }
        }
    });
}

function copyRecording(time) {
    Promise.all([robot.getRobotName(), robot.getIP()]).then(function(vals) {
        console.log(vals);
        let data = {}
        data.ip = vals[1];
        data.sshKey = "id_rsa";
        data.filenameVideo = '/home/'+ vals[0] +'/recordings/cameras/' + ses.getName() + "_" + time + '.avi';
        data.filenameAudio = '/home/'+ vals[0] +'/recordings/microphones/' + ses.getName() + "_" + time + '.wav';
        data.endDirVideo = './public/raw_videos/'; 
        data.endDirAudio = './public/raw_audio/';
        data.endDir = './public/videos/'
        data.file = ses.getName() + "_" + time;
        data.name = ses.getName();
        data.time = time;
        data.robotName = vals[0];

        $.ajax({
            url: window.location.href + "ssh\\copy_recordings_audio",
            data: JSON.stringify(data),
            contentType: 'application/json',
            type:'POST',
            error: function() {
                console.error("File check failed or the file does not exist.");
            },
            success: function(info) {
                console.log(info);
                $.ajax({
                    url: window.location.href + "ssh\\delete_nao_recording_audio",
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    type:'POST',
                    error: function() {
                        console.error("File check failed or the file does not exist.");
                    },
                    success: function(info) {
                        console.log(info);
                    }
                });
            }
        });

        $.ajax({
            url: window.location.href + "ssh\\copy_recordings_video",
            data: JSON.stringify(data),
            contentType: 'application/json',
            type:'POST',
            error: function() {
                console.error("File check failed or the file does not exist.");
            },
            success: function(info) {
                console.log(info);
                $.ajax({
                    url: window.location.href + "ssh\\delete_nao_recording_video",
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    type:'POST',
                    error: function() {
                        console.error("File check failed or the file does not exist.");
                    },
                    success: function(info) {
                        console.log(info);
                    }
                });

                $.ajax({
                    url: window.location.href + "ssh\\convert_recordings_video",
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    type:'POST',
                    error: function() {
                        console.error("File check failed or the file does not exist.");
                    },
                    success: function(info) {
                        console.log(info);
                    }
                });
            }
        });
    })
}

function viewVideos() {
    $.ajax({
        url: window.location.href + "videos",
        type:'POST',
        success: function(data) {
            let viewForm = document.getElementById('viewForm');
            viewForm.innerHTML = '';
            data.forEach(datum => {
                if(datum.includes('.mp4')) {
                    let d = document.createElement('DIV');
                    let e = document.createElement('BUTTON');
                    e.innerHTML = datum;
                    e.addEventListener("click", function () {
                        playVideo(datum);
                    }, false);
                    d.appendChild(e);
                    viewForm.appendChild(d); 
                }
            })
        }
    });
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
                console.log("Playlists deleted.");
            }
        })
    }
}

function playVideo(data) {
    console.log(data);
    let videoModal = document.getElementById('videoModal');
    let videoForm = document.getElementById('videoForm');
    videoForm.innerHTML = '';
    let v = document.createElement('VIDEO');
    v.setAttribute('width', "320px");
    v.setAttribute('height', "240px");
    v.setAttribute('controls', '');

    let s = document.createElement('SOURCE');
    s.setAttribute('src', './videos/' + data);
    s.setAttribute('type', 'video/mp4');
    v.appendChild(s);
    videoForm.appendChild(v);
    videoModal.style.display = 'block';

}

function listBehaviours() {
    if (sessionP) {
        Promise.resolve(robot.getBehaviours()).then(function (array) {
            // Create the list element:
            let list = document.getElementById('behaveListAvailable');
            list.innerHTML = "";
            for (let i = 0; i < array.length; i++) {
                if (!array[i].includes("/")) {
                    // Create the list item:
                    let item = document.createElement('li');
            
                    // Set its contents:
                    item.appendChild(document.createTextNode(array[i]));
            
                    // Add it to the list:
                    list.appendChild(item);
                }
            }
        })
        return true;
    } else {
        alert("You need to connect to the robot first");
        return false;
    }
}

function getTime() {
    let time = new Date();

    return time.getDate() + '-' + time.getMonth() + '-' + time.getFullYear() + '@' + ("0" + time.getHours()).slice(-2) + '_'  + 
           ("0" + time.getMinutes()).slice(-2) + '_' + 
           ("0" + time.getSeconds()).slice(-2);
}

function downloadInnerHtml(filename, elId, mimeType) {
    var elHtml = document.getElementById(elId).innerHTML;
    var link = document.createElement('a');
    mimeType = mimeType || 'text/plain';

    link.setAttribute('download', filename);
    link.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(elHtml));
    link.click(); 
}
