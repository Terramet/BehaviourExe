class Robot {
    constructor() { 
        var time = null;
        sessionP.service("ALBehaviorManager").done(function (bm) {
            bm.behaviorStarted.connect( function(data) {
                let r = document.getElementById('replayB');
                let n = document.getElementById('nextB');
                let p = document.getElementById('posB');
                let neg = document.getElementById('negB');
                r.setAttribute('disabled', '');
                n.setAttribute('disabled', '');
                p.setAttribute('disabled', '');
                neg.setAttribute('disabled', '');
                let spin = document.getElementsByClassName('donut-spinner');
                if (spin.length !== 0)
                    for(let i = 0; i < spin.length; i++) {
                        spin[i].remove();
                    }

                time = getTime().replace(/\:/g, '_');

                sessionP.service("ALVideoRecorder").then(function (vr) {
                    vr.setResolution(1)
                    vr.setFrameRate(10)
                    vr.setVideoFormat("MJPG")
                    vr.startRecording('/home/nao/recordings/cameras/', ses.getName() + "_" + time);
                    console.log("Recording.");
                })
              
                console.log("Behaviour started successfully.")
            });

            bm.behaviorStopped.connect(function(data) {
                let r = document.getElementById('replayB');
                let n = document.getElementById('nextB');
                let p = document.getElementById('posB');
                let neg = document.getElementById('negB');
                r.removeAttribute("disabled");
                n.removeAttribute("disabled");
                p.removeAttribute("disabled");
                neg.removeAttribute("disabled");

                sessionP.service("ALVideoRecorder").then(function (vr) {
                    vr.stopRecording();
                    console.log("Recording finished.");
                    copyRecording(time);
                })
            
                console.log("Behaviour finished.");
            });
        })
    }

    getBehaviours() {
        return sessionP.service("ALBehaviorManager").then(function(bm) {
            return bm.getInstalledBehaviors().then(function (data){
                return data
            })
        })
    }

    startBehaviour(behaviour, btn) {
        btn.innerHTML = "<div class=\"donut-spinner\"></div>";
        sessionP.service("ALBehaviorManager").then(function (bm) {
            bm.runBehavior(behaviour)
        })
    }

    stopBehaviour() {
        sessionP.service("ALBehaviorManager").then(function (bm) {
            bm.stopAllBehaviors()
        })
    }

    say(data) {
        sessionP.service("ALAnimatedSpeech").then(function(as) {
            as.say(data)
        })
    }

    getRobotName() {
        return sessionP.service("ALSystem").then(function(s) {
            return s.robotName();
        })
    }

    disconnect() {
        sessionP.service("ALBehaviorManager").then(function (bm) {
            bm.behaviorStarted.disconnect();
        })
    }
}