function beamSearch(csp, beamWidth = 2, probabilityInfluence = 1) {
    csp.reset();
    csp.softArcConsistency = true;
    if (csp.maintainArcConsistency) {
        unaryConsistency(csp);
        csp.binaryConsistency();
    }
    return _beamSearch(csp, [], beamWidth, csp.variables.length - 1, probabilityInfluence);
}

function _beamSearch(csp, assignment, beamWidth, steps, probabilityInfluence = 1) {
    if (assignment.length == 0) {
        assignment = [{"score": 1, "assignment": {0: 5}}];
    }
    // Beam search is a breadth-first greedy search, but at every level in the
    // tree, only the beamWidth best nodes are kept. This curtails the
    // otherwise exponential growth of the search space.
    var assignments = assignment, scores;
    var assignmentLength, domainLength; // caching array lengths saves time, because most time is spent in the inner loops
    for (var i = 0, j, k; i < steps; i++) {
        scores = [];
        // Expand all current best nodes one level.
        for (j = 0, assignmentLength = assignments.length; j < assignmentLength; j++) {
            csp.applyAssignment(assignments[j].assignment);
            variable = selectUnassignedVariable(assignments[j].assignment, csp);
            for (k = 0, domainLength = variable.domain.length; k < domainLength; k++) {
                // Save the scores from previous assignments so that less
                // computation is necessary to find new weights
                csp.assign(variable, variable.domain[k], assignments[j].assignment);
                scores.push({"score": csp.weightAfterChange(assignments[j], variable), "assignment": Object.assign({}, assignments[j].assignment)}); // Object.assign returns a shallow copy of the second parameter.
                csp.unassign(variable, assignments[j].assignment);
            }
        }
        // Keep the best beamWidth nodes, with a little randomness to get varied results.
        assignments = getN(scores, beamWidth, probabilityInfluence, (element) => element.score, probabilityInfluence);
    }
    return assignments.map( (element) => element.assignment );
}

function getN(list, n, probabilityInfluence, extract = (element) => element) {
    // Higher probabilityInfluence means that higher scores are chosen more
    // often, homogenizing the output.
    var powerList = [], nums = [], total = 0, power;
    for (var i = 0; i < list.length; i++) {
        power = extract(list[i]) ** probabilityInfluence;
        powerList.push(power);
        total += power;
    }
    for (var i = 0, j; i < n; i++) {
        var num = Math.random() * total;
        for (j = 0; j < list.length; j++) {
            if (powerList[j] > num) {
                nums.push(list[j]);
                total -= powerList[j]
                list.splice(j, 1);
                break;
            }
            num -= powerList[j];
        }
    }
    return nums;
}

/***
function beamBacktrack(assignment, csp, beamWidth, probabilityInfluence) {
    if (Object.keys(assignment).length === csp.variables.length) {
        return assignment;
    }

    var variable = selectUnassignedVariable(assignment, csp),
        domain = orderDomainValues(variable, assignment, csp),
        scores = [], score, result, i;
    // Each domain value gets a score according to how many constraints it violates.
    for (i = 0; i < domain.length; i++) {
        // if (csp.maintainArcConsistency) {
        csp.assign(variable, domain[i], assignment);
        // Remove scores below the csp's delta.
        score = csp.getWeight(assignment);
        if (score > csp.delta) {
            scores.push({"score": score, "index": i});
        }
        // }
        csp.unassign(variable, assignment);
    }
    // The highest beamWidth scores get beamBacktracked. [A better solution,
    // now used, is to use a probability distribution so that the algorithm doesn't
    // get stuck in local ruts. The top scores are usually picked first but not
    // always. The global best might need a few bad choices first.
    var sorted = getProbabilisticN(scores, beamWidth, probabilityInfluence, (element) => element.score); // Sort highest to lowest, with an element of chance.
    var results = [];
    for (i = 0; i < sorted.length; i++) {
        csp.assign(variable, domain[sorted[i].index], assignment);
        result = beamBacktrack(assignment, csp, beamWidth, probabilityInfluence);
        if (result !== undefined) {
            return result;
        }
        csp.unassign(variable, assignment);
    }
    return undefined;
}
***/
