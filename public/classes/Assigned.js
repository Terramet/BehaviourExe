class Assigned {
  constructor(interaction, positive, negative) {
    this.main = interaction;
    this.positive = positive;
    this.negative = negative;
  }

  getPlaylist(list) {
    if (list === 'main') {
      return this.main;
    } else if (list === 'pos') {
      return this.positive;
    } else if (list === 'neg') {
      return this.negative;
    } else {
      return null;
    }
  }
}
