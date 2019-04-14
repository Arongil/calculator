function backtrackingSearch(csp) {
    csp.maintainArcConsistency = true;
    csp.softArcConsistency = false;
    if (csp.maintainArcConsistency) {
        AC3(csp);
    }
    return backtrack({}, csp);
}

function backtrack(assignment, csp) {
    if (Object.keys(assignment).length === csp.variables.length) {
        return assignment;
    }
    var variable = selectUnassignedVariable(assignment, csp),
        domain = orderDomainValues(variable, assignment, csp),
        result;
    for (var i = 0; i < domain.length; i++) {
        if (csp.maintainArcConsistency) {
            csp.assign(variable, domain[i], assignment);
            result = backtrack(assignment, csp);
            if (result !== undefined) {
                return result;
            }
        }
        csp.unassign(variable, assignment);
    }
    return undefined;
}

function displayPerfect(assignment) {
    if (assignment === undefined) {
        document.getElementById("perfect-solution").innerHTML = "There is no perfect solution.";
    }
    else {
        document.getElementById("perfect-solution").innerHTML = "Perfect solution found!";
        setJSON(assignment);
    }
}
