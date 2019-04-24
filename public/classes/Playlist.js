class Playlist {
  constructor(list, name) {
    this.name = name;
    this.list = list;
    this.current = 0;
  }

  setCurrent(current) {
    this.current = current;
  }

  getList() {
    return this.list;
  }

  getName() {
    return this.name;
  }

  returnLast() {
    if (this.current === 0) {
      return 'Nothing';
    } else {
      return this.list[this.current - 1];
    }
  }

  getNext() {
    if (this.current >= this.list.length) {
      return 'Nothing';
    } else {
      return this.list[this.current];
    }
  }

  next() {
    if (this.current >= this.list.length) {
      alertMessage('No more behaviours in the list');
    } else {
      let r = this.list[this.current];
      this.current++;
      return r;
    }

    return null;
  }
}
