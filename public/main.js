var sessionP, robot
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
    sessionP = new Session(document.getElementById('IP').value);
    robot = new Robot(sessionP);

    Promise.resolve(sessionP.connected).delay(1000).then(function(v) {
        if (v) {
            document.getElementById('executionForm').style.visibility = 'visible';
        } 
    });
}

function say() {
    robot.say(document.getElementById('sayText').value);
}

function startBehaviour() {
    // robot.startBehaviour("abc-song");
}

function stopBehaviour() {
    robot.stopBehaviour();
}

function createPlaylist() {
    return listBehaviours();
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
        }
    }).then(function() {
        loadPlaylists();
    });
}

function removeOptions(selectbox) {
    for(var i = selectbox.options.length - 1 ; i >= 0 ; i--) {
        selectbox.remove(i);
    }
}

function addPlaylistsToSelects() {
    var modal = document.getElementById("assignModal");
    var selects = modal.getElementsByTagName("select");
    // selects.forEach(function(element) {
    //     loadedPlaylists.forEach(function(playlist) {
    //         element.add(playlist.getName)
    //     })
    // });

    for (var i = 0; i < selects.length; i++) {

        removeOptions(selects[i]);

        loadedPlaylists.forEach(playlist => {
            let opt = document.createElement('option');
            opt.value = playlist;
            opt.innerHTML = playlist.getName();
            selects[i].add(opt);
        });
    }
}


function loadPlaylists() {
    $.ajax({
        type: 'POST',
        url: window.location.href + 'playlists/load',						
        success: function(data) {
            console.log(data);
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
