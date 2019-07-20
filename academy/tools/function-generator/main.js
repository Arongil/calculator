var getById = (id) => document.getElementById(id);

var output = getById("output");

var nums, vars, funcs, multSymbol, expSymbol;

function settings() {
    nums = getById("numbers").value.split(",");
    if (nums.length === 1 && nums[0] === "") {
        nums = [];
    }
    vars = getById("variables").value.split(",");
    funcs = getById("functions").value.split(",");
    multSymbol = getById("mult-symbol").value;
    multSymbol = (multSymbol === "()" ? "" : " " + multSymbol + " ");
    expSymbol = getById("exponential-symbol").value;
}

function generate() {
    settings();

    var generateButton = getById("generate");
    generateButton.textContent = "working ...";

    var hidden = getById("hidden-copier");
    hidden.style.display = "inline";
    hidden.value = _generate(parseInt(getById("length").value));
    getById("output").textContent = hidden.value;
    hidden.select();
    document.execCommand("copy");
    hidden.style.display = "none";

    generateButton.textContent = "Copied to Clipboard";
    window.setTimeout(() => {
        generateButton.textContent = "Generate!";
    }, 500);
}

function close(length) {
    return Math.random() > length;
}

function _generate(length) {
    var split = Math.random();
    if (split < 0.2) {
        return func(length/2) + operator(length/2);
    } else if (split < 0.4) {
        return num(length/2, 5, [0]) + operator(length/2);
    } else {
        return variable(length/2) + operator(length/2);
    }
}

function getRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function func(length) {
    var f = getRandom(funcs);
    return f + "(" + _generate(length / 2) + ")";
}

function num(length, spread, blackList = []) {
    var n, specialCharacterSpace = "";
    var split = Math.random();
    if (split < 0.2 && nums.length > 0) {
        n = getRandom(nums);
        specialCharacterSpace = " ";
    } else {
        do {
            n = Math.floor( spread * Math.sqrt(-Math.log(Math.random())) );
        } while (blackList.indexOf(n) !== -1);
    }
    if (close(length)) { return n; }
    var split = Math.random();
    if (split < 0.1) {
        return n + expSymbol + exponent(length) + operator(length/2);
    } else if (split < 0.6) {
        return n + (multSymbol === "" ? specialCharacterSpace : multSymbol) + variable(length);
    } else {
        return n + operator(length/2);
    }
}

function variable(length, whiteList = vars) {
    var v = getRandom(whiteList);
    if (close(length)) { return v; }
    var split = Math.random();
    if (split < 0.2) {
        return v + expSymbol + exponent(length) + operator(length/2);
    } else if (split < 0.4) {
        var wList = whiteList.slice();
        wList.splice(whiteList.indexOf(v), 1);
        if (wList.length > 0) {
            return v + multSymbol + variable(length, wList);
        }
    }
    return v + operator(length/2);
}

function exponent(length) {
    if (close(length)) { return num(0, 2, [0, 1]); }
    var split = Math.random();
    var openBracket = (multSymbol === "" ? "{" : "("),
        closeBracket = (multSymbol === "" ? "}" : ")");
    if (split < 0.2) {
        return openBracket + _generate(length/4) + closeBracket;
    } else {
        return openBracket + num(length/2, 2, [0, 1]) + closeBracket;
    }
}

function operator(length) {
    if (close(length)) { return ""; }
    var split = Math.random();
    if (split < 0.3) {
        return " + " + _generate(length/2);
    } else if (split < 0.6) {
        return " - " + _generate(length/2);
    } else {
        return multSymbol + "(" + _generate(length/2) + ")";
    }
}
