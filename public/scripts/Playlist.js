class Playlist {
    constructor(list, name) {
        if(name === undefined) {
            let parsed = JSON.parse(list);
            this.name = parsed["name"];
            this.list = parsed["list"];
        } else {
            this.name = name;

            let newList = [];
            list.forEach(element => {
                newList.push(element.innerHTML);
            });

            this.list = newList;
        }

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
            return "Nothing"
        } else {
            return this.list[this.current - 1];
        }
    }

    getNext() {
        if (this.current >= this.list.length) {
            return "Nothing"
        } else {
            return this.list[this.current];
        }
    }

    next() {
        if (this.current >= this.list.length) {
            alert("No more behaviours in the list")
        } else {
            let r = this.list[this.current];
            this.current++;
            return r;
        }

        return null;
    }
}