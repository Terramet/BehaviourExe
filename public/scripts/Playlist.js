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
    }

    getList() {
        return this.list;
    }

    getName() {
        return this.name;
    }
}