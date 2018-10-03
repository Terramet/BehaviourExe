class Session {
    constructor(input, loadedPlaylists) {
        console.log(input)
        if (whatIsIt(input) === "Object") {
            this.name = input["name"];

            let mp, pp, np = null

            for(let i = 0; i < loadedPlaylists.length; i++) {
                if (loadedPlaylists[i].getName() === input["assigned"]["main"]["name"]) {
                    mp = loadedPlaylists[i];
                } else if (loadedPlaylists[i].getName() === input["assigned"]["negative"]["name"]) {
                    pp = loadedPlaylists[i];
                } else if (loadedPlaylists[i].getName() === input["assigned"]["positive"]["name"]) {
                    np = loadedPlaylists[i];
                }
            }

            mp.setCurrent(input["assigned"]["main"]["current"])
            pp.setCurrent(input["assigned"]["negative"]["current"])
            np.setCurrent(input["assigned"]["positive"]["current"])

            this.assigned = new Assigned(mp, pp, np);
        } else {
            this.name = input
            this.assigned = null
        }
        console.log("Session successfully created. Current session is for child named: " + this.name)
    }

    getName() {
        return this.name;
    }

    setName(name) {
        this.name = name;
    } 

    getConnected() {
        return this.connected;
    }

    getAssigned() {
        return this.assigned;
    }


    setAssigned(assigned) {
        this.assigned = assigned;
    }

    asJSON() {
        return JSON.stringify(this);
    }
}