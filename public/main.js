var sessionP, robot

function delay(t, v) {
    return new Promise(function(resolve) { 
        setTimeout(resolve.bind(null, v), t)
    });
 }
 
 Promise.prototype.delay = function(t) {
     return this.then(function(v) {
         return delay(t, v);
     });
 }
 

function createSession() {
    sessionP = new Session(document.getElementById('IP').value)
    robot = new Robot(sessionP)

    Promise.resolve(sessionP.connected).delay(1000).then(function(v) {
        if (v) {
            document.getElementById('executionForm').style.visibility = 'visible'
        } 
    });
}

function say() {
    robot.say(document.getElementById('sayText').value)
}

function startBehaviour() {
    // robot.startBehaviour("abc-song");
}

function stopBehaviour() {
    robot.stopBehaviour();
}

function createPlaylist() {
    document.getElementById('playlistForm').style.visibility = 'visible'
    document.getElementById('playlistForm').style.display = 'initial'
    listBehaviours()
}

function savePlaylist() {
    let name = document.getElementById('playlistName').value
    let listElements = document.getElementById('behaveListPlaylist').childNodes

    playlist = new Playlist(name, listElements)

    console.log(playlist.getList()) // [ <li>, <li>, ... ]
    let URL = window.location.href
    var newWindow = window.open("","_blank");

    $.ajax({
        type: "POST",
        url: newWindow.location.href = URL + "playlists/",
        data: playlist.getList()
        }).done(function(msg) {
            alert("Complete: " + msg)
            newWindow.close()
        });
}

function listBehaviours() {
    if (sessionP) {
        Promise.resolve(robot.getBehaviours()).then(function (array) {
            document.getElementById('behaveListAvailable').style.display = 'block'
            document.getElementById('behaveListPlaylist').style.display = 'block'
            document.getElementById('playlistName').style.display = 'initial'
            document.getElementById('savePlaylistBtn').style.display = 'initial'
            document.getElementById('createPlaylistBtn').style.display = 'none'

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
    } else {
        alert("You need to connect to the robot first")
    }
}
