function playCurrent(type, btn) {
  if (ses.getAssigned() === null) {
    getLanguageValue('noPlaylists')
      .then(value => {
        alertMessage(value);
      });

    console.error('No playlist assigned to ' + btn.innerHTML + ' button.');
  } else if (ses.getAssigned()
    .getPlaylist(type)
    .returnLast() !== 'Nothing') {
    robot.startBehaviour(ses.getAssigned()
      .getPlaylist(type)
      .returnLast(), btn);
  }
}

function playNext(type, btn) {
  if (ses.getAssigned() === null) {
    getLanguageValue('noPlaylists')
      .then(value => {
        alertMessage(value);
      });

    console.error('No playlist assigned to ' + btn.innerHTML + ' button.');
  } else if (ses.getAssigned()
    .getPlaylist(type)
    .getNext() !== 'Nothing') {
    robot.startBehaviour(ses.getAssigned()
      .getPlaylist(type)
      .next(), btn);
  }
}

function stopBehaviour() {
  robot.stopBehaviour();
  console.error('Robot behaviour forcefully stopped.');
}

function changeMemValue(key, val) {
  robot.setALMemoryValue(key, val);
}

function startRec(data) {
  robot.startRecording(ses.getName());

  recording = true;
}

function stopRec(data) {
  robot.stopRecording();

  recording = false;
  setTimeout(copyRecording(time), 2000);
}

function say() {
  let str = $('#sayText')[0].value;
  let textToSay = str.replace(/%c/g, ses.getName());
  robot.say(textToSay);
  console.log('Robot said: ' + textToSay + '.');
}

function updateView() {
  setInterval(function () {
    if (ses.getAssigned() !== null &&
      document.getElementsByClassName('donut-spinner')
      .length === 0) {
      getLanguageValue('replayB')
        .then(function (value) {
          $('#replayB')[0].innerHTML = value + ': <br/><small>' +
            ses.getAssigned()
            .getPlaylist('main')
            .returnLast() + '</small>';
        });

      getLanguageValue('nextB')
        .then(function (value) {
          $('#nextB')[0].innerHTML = value + ': <br/><small>' +
            ses.getAssigned()
            .getPlaylist('main')
            .getNext() + '</small>';
        });

      getLanguageValue('posB')
        .then(function (value) {
          $('#posB')[0].innerHTML = value;
        });

      getLanguageValue('negB')
        .then(function (value) {
          $('#negB')[0].innerHTML = value;
        });
    }
  }, 1000);

}
