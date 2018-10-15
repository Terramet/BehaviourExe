class Robot {
    constructor(ip) {
        this.ip = ip
        this.session = new QiSession(ip)
        let connectBtn = $('#connectBtn')[0]

        /**
         * Create the session by connecting to the robot.
         * Upon connection execute function
         */
        this.session.socket().on('connect', function() {
            console.log('QiSession connected!')         //log the connection for debug

            $('#executionForm')[0].style.display = 'block'
            connectBtn.classList.remove('red')
            connectBtn.classList.add('green')
            getLanguageValue('connectBtn', 2).then(function(value) {
              connectBtn.innerText = value
            })
            connected = true

            let modal = $('#connectModal')[0]
            modal.style.display = 'none'

            /** Upon disconnect execute function */
        }).on('disconnect', function() {
            console.log('QiSession disconnected!')      //log the connection for debug

            $('#executionForm')[0].style.display = 'none'

            connectBtn.classList.remove('green')
            connectBtn.classList.add('red')
            getLanguageValue('connectBtn', 3).then(function(value) {
              connectBtn.innerText = value
            })
            if(!alert('Connection to the robot has been lost. The page will now refresh.')){window.location.reload();}
            session = new QiSession(ip)
            connected = false
        })
    }

    getSession() {
        return this.session
    }

    startBehaviourManager() {
        sessionP.service('ALBehaviorManager').done(function (bm) {
            bm.behaviorStarted.connect( function(data) {
                console.log(data)
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
            })

            bm.behaviorStopped.connect(function(data) {
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
            })
        })
    }

    getBehaviours() {
        return sessionP.service('ALBehaviorManager').then(function(bm) {
            return bm.getInstalledBehaviors().then(function (data){
                return data
            })
        })
    }

    startBehaviour(behaviour, btn) {
        btn.innerHTML = '<div class=\'donut-spinner\'></div>'
        sessionP.service('ALBehaviorManager').then(function (bm) {
          bm.isBehaviorInstalled(behaviour).then(function(a) {console.log(a)} )
          bm.runBehavior(behaviour)
        })
    }

    stopBehaviour() {
        sessionP.service('ALBehaviorManager').then(function (bm) {
            bm.stopAllBehaviors()
        })
    }

    say(data) {
        sessionP.service('ALAnimatedSpeech').then(function(as) {
            as.say(data)
        })
    }

    getRobotName() {
        return sessionP.service('ALSystem').then(function(s) {
            return s.robotName()
        })
    }

    getIP() {
        return sessionP.service('ALConnectionManager').then(function(cm) {
            return cm.scan().then(function(data) {
                return cm.services().then(function (data) {
                    return data[0][9][1][1][1]
                })
            })
        })
    }

    setALMemoryValue(key, val) {
      sessionP.service('ALMemory').then(function(mem) {
          mem.insertData(key, val)
      })
    }

    disconnect() {
        sessionP.service('ALBehaviorManager').then(function (bm) {
            bm.behaviorStarted.disconnect()
        })
    }
}
