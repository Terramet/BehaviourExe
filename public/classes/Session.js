class Session {
  constructor(input, loadedPlaylists) {
    if (whatIsIt(input) === 'Object') {
      this.name = input.name;
      console.log();

      let p = null;


      for (let i = 0; i < loadedPlaylists.length; i++) {
        if (loadedPlaylists[i].getName() === input.assigned.playlist.name) {
          p = loadedPlaylists[i];
        }
      }

      p.setCurrentMain(input.assigned.playlist.mainList.current);


      this.assigned = new Assigned(p);
    } else {
      this.name = input;
      this.assigned = null;
    }

    console.log('Session successfully created. Current session is for child named: ' + this.name);
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
