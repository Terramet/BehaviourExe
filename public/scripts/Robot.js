class Robot {
    constructor(robotSession) {
        this.session = robotSession
    }

    getBehaviours() {
        return this.session.service("ALBehaviorManager").then(function(bm) {
            return bm.getInstalledBehaviors().then(function (data){
                return data
            })
        })
    }

    startBehaviour(behaviour) {
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