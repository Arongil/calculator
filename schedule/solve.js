function solve(csp, timeLimit) {
    var limit = performance.now() + timeLimit * 1000; // performance.now() returns milliseconds.
    var assignment, best, weight = 0;
    while (performance.now() < limit) {
        assignment = getRandomAssignment(csp); // getBest(csp, beamSearch(csp, 1, 2));
        assignment = localSearch(csp, assignment, 10000);
        if (csp.getWeightFromAssignment(assignment) >= weight) {
            weight = csp.getWeightFromAssignment(assignment);
            best = assignment;
        }
    }
    return best;
}
