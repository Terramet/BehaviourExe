class Robot {
  constructor() {
    this.ip = null;
    this.session = null;
    this.connected = false;
    this.movement = [0,0,0];
    this.listenersActive = false;
    this.moveInterval = null;
  }

  startSession(ip, callbackConnect = null, callbackDisconnect = null) {
    this.session = new QiSession(ip + ':80');
    /**
     * Create the session by connecting to the robot.
     * Upon connection execute function
     */
    this.session.socket()
      .on('connect', () => {
        console.log('QiSession connected!'); //log the connection for debug
        if (callbackConnect !== null) {
          callbackConnect();
        }
        /** Upon disconnect execute function */
      })
      .on('disconnect', () => {
        console.log('QiSession disconnected!'); //log the connection for debug
        if (callbackDisconnect !== null) {
          callbackDisconnect();
        }
      });

    return this.session;
  }

  getSession() {
    return this.session;
  }

  setConnected(state) {
    this.connected = state;
  }

  startBehaviourManager(callbackStart = null, callbackStop = null) {
    this.session.service('ALBehaviorManager')
      .done(function (bm) {
        bm.behaviorStarted.connect(function (data) {
          console.log(data);
          if (callbackStart !== null) {
            callbackStart(data);
          }
        });

        bm.behaviorStopped.connect(function (data) {
          if (callbackStop !== null) {
            callbackStop(data);
          }
        });
      });
  }

  getBehaviours() {
    return this.session.service('ALBehaviorManager')
      .then(function (bm) {
        return bm.getInstalledBehaviors()
          .then(function (data) {
            return data;
          });
      });
  }

  isBehaviorInstalled(behaviour) {
    let prom = new Promise((resolve, reject) => {
      this.session.service('ALBehaviorManager')
        .then(function (bm) {
          bm.isBehaviorInstalled(behaviour)
            .then(function (a) {
              resolve(a);
            });
        });
    });

    return prom;
  }

  startBehaviour(behaviour, btn) {
    btn.innerHTML = '<div class=\'donut-spinner\'></div>';
    this.session.service('ALBehaviorManager')
      .then((bm) => {
        if (this.isBehaviorInstalled(behaviour)) {
          bm.runBehavior(behaviour);
        }
      });
  }

  stopBehaviour() {
    this.session.service('ALBehaviorManager')
      .then(function (bm) {
        bm.stopAllBehaviors();
      });
  }

  say(data) {
    this.session.service('ALAnimatedSpeech')
      .then(function (as) {
        as.say(data);
      });
  }

  getRobotName() {
    return this.session.service('ALSystem')
      .then(function (s) {
        return s.robotName();
      });
  }

  getIP() {
    return this.session.service('ALConnectionManager')
      .then(function (cm) {
        return cm.services()
          .then(function (data) {
            return data[0][9][1][1][1];
          });
      });
  }

  setALMemoryValue(key, val) {
    this.session.service('ALMemory')
      .then(function (mem) {
        mem.insertData(key, val);
      });
  }

  disconnect() {
    this.session.service('ALBehaviorManager')
      .then(function (bm) {
        bm.behaviorStarted.disconnect();
      });
  }

  startRecording(childName) {
    this.session.service('ALAudioRecorder')
      .then(function (ar) {
        ar.startMicrophonesRecording('/home/nao/recordings/microphones/' + childName + '_' +
          time + '.wav', 'wav', 16000, [0, 0, 1, 0]);
        console.log('Recording audio.');
      });

    this.session.service('ALVideoRecorder')
      .then(function (vr) {
        vr.setResolution(1);
        vr.setFrameRate(10);
        vr.setVideoFormat('MJPG');
        vr.startRecording('/home/nao/recordings/cameras/', childName + '_' + time);
        console.log('Recording video.');
      });
  }

  stopRecording() {
    this.session.service('ALAudioRecorder')
      .then(function (ar) {
        ar.stopMicrophonesRecording();
        console.log('Recording audio finished.');
      });

    this.session.service('ALVideoRecorder')
      .then(function (vr) {
        vr.stopRecording();
        console.log('Recording video finished.');
      });
  }

  startMovementListeners() {
    this.listenersActive = true;
    this.session.service('ALMotion')
      .then((m) => {
        this.moveInterval = setInterval(() => {
          console.log(this.movement);
          m.move(this.movement[0], this.movement[1], this.movement[2]);
        }, 500)
      });
  }

  stopMovementListeners() {
    this.listenersActive = false;
    clearInterval(this.moveInterval);
  }
}
