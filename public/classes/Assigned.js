class Assigned {
  constructor(playlist) {
    this.playlist = playlist;
  }

  getPlaylist(list) {
    if (list === 'main') {
      return this.playlist.getMain();
    } else if (list === 'pos') {
      return this.playlist.getPos();
    } else if (list === 'neg') {
      return this.playlist.getNeg();
    } else {
      return null;
    }
  }
}
