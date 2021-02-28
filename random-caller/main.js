const getById = (id) => document.getElementById(id);

const arrEqual = (a, b) => {
    return a.length === b.length && a.every((val, index) => val == b[index]);
}

var names = [], poolSize, last, current;

function generate() {
    readNames = getById("names").value.split(",").map(a => a.trim());
    if (!arrEqual(names, readNames)) {
        names = readNames;
         // size of active pool of possible names
        poolSize = Math.floor(names.length / 2);
        last = [];
        while (last.length < poolSize) {
            let candidate = names[Math.floor(Math.random() * names.length)];
            if (!last.includes(candidate))
                last.push(candidate);
        }
    }

    // pick next name to call
    do {
        current = names[Math.floor(Math.random() * names.length)];
    } while (last.includes(current));

    last.shift(); // remove first name in queue
    last.push(current); // add new name to queue

    getById("output").textContent = current;
}
