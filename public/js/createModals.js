//Create modals, to avoid a clutered HTML file
function createDisplayModals() {
  var tmpl = document.getElementById('modal-template');
  let modals = ['createModal', 'editModal',
    'viewModal', 'assignModal',
    'langModal', 'connectModal',
    'childModal', 'restoreModal',
    'videoModal',
  ];

  for (let i = 0; i < modals.length; i++) {
    $('#page-content-wrapper')[0].appendChild(tmpl.content.cloneNode(true));
    $('#myModal')[0].id = modals[i];
  }

  createAssignModal();
  createPlaylistModal();
  createConnnectModal();
  createLanguageModal();
  createEditModal();
  createRestoreModal();
  createChildModal();
  createViewModal();
  createVideoModal();
}

function createAssignModal() {
  $('#assignModal .modal-title')[0].innerHTML = 'Assign Playlists';
  $('#assignModal .modal-title')[0].id = 'assignPlaylistTitle';

  $('#assignModal .modal-body')[0].innerHTML = '<div class="row p-2">' +
    '<button class="col m-1" id="mainBehave">Interaction</button>' +
    '<select class="col m-1" id="mainBehaviour"></select>' +
    '</div>' +
    '<div class="row p-2">' +
    '<button class="col m-1" id="positiveBehave">Positive</button>' +
    '<select class="col m-1" id="positiveBehaviour"></select>' +
    '</div>' +
    '<div class="row p-2">' +
    '<button class="col m-1" id="negativeBehave">Negative</button>' +
    '<select class="col m-1" id="negativeBehaviour"></select>' +
    '</div>';

  $('#assignModal .modal-content button')[0].innerHTML = 'Save';
  $('#assignModal .modal-content button')
    .on('click', (function () {
      saveAssigned();
      return false;
    }));
}

function createPlaylistModal() {
  $('#createModal .modal-title')[0].innerHTML = 'Create Playlist';
  $('#createModal .modal-title')[0].id = 'createPlaylistTitle';

  $('#createModal .modal-body')[0].setAttribute('style', 'min-width: 600px');
  $('#createModal .modal-body')[0].innerHTML = '<div class="row p-2">' +
    '<input class="form-control col" id="playlistName"' +
    'type="text" placeholder="Enter a name for your playlist" tabindex="3" autofocus="">&nbsp;' +
    '</div>' +
    '<div class="row p-2">' +
    '<ul class="sortable connectedSortable col m-1" id="behaveListAvailable"></ul>' +
    '<ul class="sortable connectedSortable col m-1" id="behaveListPlaylist"></ul>' +
    '</div>';

  $('#createModal .modal-content button')[0].innerHTML = 'Save';
  $('#createModal .modal-content button')
    .on('click', (function () {
      savePlaylist();
      return false;
    }), );
}

function createConnnectModal() {
  $('#connectModal .modal-title')[0].innerHTML = 'Connect to robot';
  $('#connectModal .modal-title')[0].id = 'connectRobotTitle';

  $('#connectModal .modal-body')[0].innerHTML = '<h6 class="p-2 text-center ' +
    ' font-weight-bold" id="enterIPTitle">Please enter the IP Address of the robot below</h4>' +
    '<input class="form-control col" id="IP" type="text" ' +
    ' placeholder="IP Address" tabindex="1" required="" autofocus="">';

  $('#connectModal .modal-content button')[0].innerHTML = 'Connect';
  $('#connectModal .modal-content button')
    .on('click', (function () {
      createSession();
      $('#connectModal')[0].style.display = 'none';
    }), );
}

function createLanguageModal() {
  $('#langModal .modal-title')[0].innerHTML = 'Change Language';
  $('#langModal .modal-title')[0].id = 'changeLangTitle';

  $('#langModal .modal-body')[0].innerHTML = '<div class="container" ' +
    ' id="langRadioContainer"></div>';
}

function createEditModal() {
  $('#editModal .modal-title')[0].innerHTML = 'Edit Playlists';
  $('#editModal .modal-title')[0].id = 'editPlaylistsTitle';

  $('#editModal .modal-body')[0].innerHTML = '<div class="container-fluid">' +
    '<button id="deleteAll" onclick="clearPlaylists()">Delete All Playlists</button>' +
    '</div>';
}

function createViewModal() {
  $('#viewModal .modal-title')[0].innerHTML = 'View Videos';
  $('#viewModal .modal-title')[0].id = 'viewVideosTitle';

  $('#viewModal .modal-body')[0].innerHTML = '<div class="container-fluid">' +
    '<div id="viewForm"> </div> </div>';
}

function createRestoreModal() {
  $('#restoreModal .modal-title')[0].remove();

  $('#restoreModal .modal-body')[0].innerHTML = '<div>' +
    '<h6 class="text-center font-weight-bold" id="restoreTitle">' +
    'You have a previous session stored for a child named: %child%. ' +
    'Would you like to restore it?</h6>' +
    '</div>';

  $('#restoreModal .foot')[0].innerHTML =
    '<button class="btn-success" id="restoreYes">Yes</button>' +
    '<button class="btn-danger" id="restoreNo">No</button>';
}

function createChildModal() {
  $('#childModal .modal-title')[0].remove();
  $('#childModal span')[0].remove();

  $('#childModal .modal-body')[0].innerHTML = '<h6 class="text-center font-weight-bold" ' +
    ' id="enterNameTitle">Please enter the name of the child</h6>' +
    '<div class="row">' +
    '<input class="soft-input col m-4" id="cName" type="text"' +
    ' placeholder="Childs name" tabindex="1" required="" autofocus="">' +
    '</div>';

  $('#childModal .modal-content button')[0].innerHTML = 'Save';
  $('#childModal .modal-content button')[0].id = 'childSave';
}

function createVideoModal() {
  $('#videoModal .modal-title')[0].remove();
  $('#videoModal .modal-body')[0].id = 'videoForm';
}
