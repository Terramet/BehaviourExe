var ses, sessionP, robot, assigned
var loadedPlaylists = []

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
    if (ses !== null) {
        ses = null;
    }

    ses = new Session(document.getElementById('IP').value, document.getElementById('cName').value)
    sessionP = ses.getSession();
    robot = new Robot(sessionP);
}

function say() {
    let str = document.getElementById('sayText').value;
    let textToSay = str.replace("%c", ses.getName());
    robot.say(textToSay); 
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
    } else {
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
        type: 'POST',
        url: window.location.href + 'playlists/load',						
        success: function(data) {
            console.log("Playlists loaded successfully.");
            data["playlists"].forEach(function(playlist) {
                loadedPlaylists.push(new Playlist(playlist));
            });
        }
    })
}

function listBehaviours() {
    if (sessionP) {
        Promise.resolve(robot.getBehaviours()).then(function (array) {
            // Create the list element:
            let list = document.getElementById('behaveListAvailable');
        
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

    return ("0" + time.getHours()).slice(-2)   + ":" + 
           ("0" + time.getMinutes()).slice(-2) + ":" + 
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