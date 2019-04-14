function track(csp, beamWidth, stepSize, probabilityInfluence = 1, output = true) {
    initCSP();
    var r = [{0:25, 1:32, 2:25, 3:32}], best;
    for (var i = 0; Object.keys(r[0]).length < csp.variables.length; i++) {
        r = _beamSearch(csp, r, beamWidth, Math.min(stepSize, csp.variables.length - Object.keys(r[0]).length), probabilityInfluence);
        best = getBest(csp, r);
        if (output) {
            console.log(best);
            console.log(csp.getWeightFromAssignment(best));
        }
    }
    return best;
}

function trackN(csp, beamWidth, stepSize, n, probabilityInfluence = 1) {
    var solutions = [];
    for (var i = 0; i < n; i++) {
        solutions.push(track(csp, beamWidth, stepSize, probabilityInfluence, false));
    }
    return getBest(csp, solutions);
}

function test() {
    for (var i = 0; i <= 2; i++) {
        for (var j = 0; j < 3; j++) {
            console.log("Starting " + 10**j + " beam width track with probability influence " + (0.5 + i*i/2) + ".");
            track(csp, 10**j, 10, 0.5 + (i**2)/2);
        }
    }
}
