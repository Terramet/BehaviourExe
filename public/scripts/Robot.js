class Robot {
    constructor(robotSession) {
        this.session = robotSession

        this.session.service("ALBehaviorManager").done(function (bm) {
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

                console.log("Behaviour finished.")
            });
        })
    }

    getBehaviours() {
        return this.session.service("ALBehaviorManager").then(function(bm) {
            return bm.getInstalledBehaviors().then(function (data){
                return data
            })
        })
    }

    startBehaviour(behaviour, btn) {
        btn.innerHTML = "<div class=\"donut-spinner\"></div>";
        this.session.service("ALBehaviorManager").then(function (bm) {
            bm.runBehavior(behaviour)
        })
    }

    stopBehaviour() {
        this.session.service("ALBehaviorManager").then(function (bm) {
            bm.stopAllBehaviors()
        })
    }

    say(data) {
        this.session.service("ALAnimatedSpeech").then(function(as) {
            as.say(data)
        })
    }
}