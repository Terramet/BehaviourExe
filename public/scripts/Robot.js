class Robot {
    constructor(ip, callbackConnect=null, callbackDisconnect=null) {
        this.ip = ip
        this.session = new QiSession(ip)
        /**
         * Create the session by connecting to the robot.
         * Upon connection execute function
         */
        this.session.socket().on('connect', function() {
            console.log('QiSession connected!')         //log the connection for debug
            if(callbackConnect !== null) {
              callbackConnect()
            }
            /** Upon disconnect execute function */
        }).on('disconnect', function() {
            console.log('QiSession disconnected!')      //log the connection for debug
            if(callbackDisconnect !== null) {
              callbackDisconnect()
            }
            session = new QiSession(ip)
        })
    }

    getSession() {
        return this.session
    }

    startBehaviourManager(callbackStart=null, callbackStop=null) {
        sessionP.service('ALBehaviorManager').done(function (bm) {
            bm.behaviorStarted.connect( function(data) {
                console.log(data)
                if (callbackStart !== null) {
                  callbackStart(data)
                }
            })

            bm.behaviorStopped.connect(function(data) {
                if(callbackStop !== null) {
                  callbackStop(data)
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
