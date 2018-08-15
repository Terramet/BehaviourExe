class Session {
    constructor(ip) {
        var session = new QiSession(ip)
        /**
         * Create the session by connecting to the robot.
         * Upon connection execute function
         */
        session.socket().on('connect', function() {
            console.log('QiSession connected!')         //log the connection for debug
            
            document.getElementById('executionForm').style.display = 'block'
            let connectBtn = document.getElementById('connectBtn')
            connectBtn.classList.remove('red')
            connectBtn.classList.add('green')
            connectBtn.innerText = 'Connected'
            this.connected = true

            let modal = document.getElementById('connectModal');
            modal.style.display = "none";

            /** Upon disconnect execute function */
        }).on('disconnect', function() {
            console.log('QiSession disconnected!')      //log the connection for debug

            document.getElementById('executionForm').style.display = 'none'

            let connectBtn = document.getElementById('connectBtn')
            connectBtn.classList.remove('green')
            connectBtn.classList.add('red')
            connectBtn.innerText = 'Disconnected'
            this.connected = false

            session = new QiSession(ip)
        })

        return session
    }
}