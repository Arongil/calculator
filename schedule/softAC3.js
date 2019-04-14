function softBinaryConsistency(csp, queue) {
    var arcs = queue;
    if (arcs.length === 0) {
        arcs = csp.getBinaryConstraints();
    }
    var removedArcs = []; // Store constraints not in arcs to prevent arcIsUnique calls.

    var arc;
    while (arcs.length > 0) {
        arc = arcs[0];
        removedArcs.push(arcs[0]);
        arcs.splice(0, 1);
        if (softArcReduce(arc, csp)) {
            if (arc.varA.domain.length === 0) {
                return false; // The CSP has no solutions.
            }
            else {
                // If there is a successful arc reduction and there is no
                // failure, add back all arcs connected to the pruned one.
                for (var i = 0; i < removedArcs.length; i++) {//csp.binaryConstraints.length; i++) {
                    // if (arcIsUnique(arcs, csp.binaryConstraints[i])) {
                    if (removedArcs[i].varA !== arc.varB &&
                        removedArcs[i].varB !== arc.varB &&
                       (removedArcs[i].varA === arc.varA ||
                        removedArcs[i].varB === arc.varA)) {
                        arcs.push(removedArcs[i]);
                        removedArcs.splice(i, 1);
                        i--;
                    }
                    // }
                }
            }
        }
    }
    
    for (var i in csp.variables) {
        csp.variables[i].value = csp.variables[i].domain[0];
    }
}

function softArcReduce(arc, csp) {
    var change = false, exists;
    var varAOriginal = arc.varA.value, varBOriginal = arc.varB.value;
    var constraintsInvolvingArc = [];
    
    for (var i = 0; i < arc.varA.domain.length; i++) {
        arc.varA.value = arc.varA.domain[i];
        exists = false;
        for (var j = 0; j < arc.varB.domain.length; j++) {
            arc.varB.value = arc.varB.domain[j];
            if (arc.weight > 0 || !arc.conflict(arc.varA, arc.varB)) { // If the weight is nonzero,
                // then the constraint is not necessary to solve.
                exists = true;
                break;
            }
        }
        if (!exists) {
            arc.varA.domain.splice(i, 1);
            i--;
            change = true;
        }
    }
    arc.varA.value = varAOriginal;
    arc.varB.value = varBOriginal;
    return change;
}

function softAC3(csp, queue = []) {
    unaryConsistency(csp);
    softBinaryConsistency(csp, queue);
}
