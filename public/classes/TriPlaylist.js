class TriPlaylist {
  constructor(name, mainList, posList, negList) {
    if (mainList === undefined) {
      let parsed = JSON.parse(name);
      this.name = parsed.name;
      this.mainList = new Playlist(parsed.mainList.list, parsed.mainList.name);
      this.posList = new Playlist(parsed.posList.list, parsed.posList.name);
      this.negList = new Playlist(parsed.negList.list, parsed.negList.name);
    } else {
      this.name = name
      this.mainList = mainList
      this.posList = posList
      this.negList = negList
    }
  }

  getName() {
    return this.name
  }

  setCurrentMain(pointer) {
    this.mainList.setCurrent(pointer)
  }
  getMain() {
    return this.mainList
  }

  getPos() {
    return this.posList
  }

  getNeg() {
    return this.negList
  }
}
