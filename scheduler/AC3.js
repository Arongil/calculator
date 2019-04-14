function unaryConsistency(csp) {
    var variable, domain, unaryConstraints, constraint, i, j, k;
    for (i = 0; i < csp.variables.length; i++) {
        variable = csp.variables[i];
        domain = variable.domain;
        unaryConstraints = variable.unaryConstraints;
        // Make domain consistent with unary constraints.
        var original = variable.value, newDomain = [], consistent;
        for (j = 0; j < domain.length; j++) {
            variable.value = domain[j];
            consistent = true;
            for (k = 0; k < unaryConstraints.length; k++) {
                constraint = unaryConstraints[k];
                if (constraint.conflict(constraint.varA)) {
                    consistent = false;
                    break;
                }
            }
            if (consistent) {
                newDomain.push(domain[j]);
            }
        }
        variable.value = original;
        variable.domain = newDomain;
        variable.unaryDomain = newDomain.slice();
    }
}

function arcIsUnique(arcs, binaryConstraint) {
    for (var i = 0; i < arcs.length; i++) {
        if (arcs[i].varA === binaryConstraint.varA && arcs[i].varB === binaryConstraint.varB) {
            return false;
        }
    }
    return true;
}

function binaryConsistency(csp, queue) {
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
        if (arcReduce(arc)) {
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
    
    for (var i = 0; i < csp.variables.length; i++) {
        csp.variables[i].value = csp.variables[i].domain[0];
    }
}

function arcReduce(arc) {
    var change = false, exists;
    var varAOriginal = arc.varA.value, varBOriginal = arc.varB.value;
    for (var i = 0; i < arc.varA.domain.length; i++) {
        arc.varA.value = arc.varA.domain[i];
        exists = false;
        for (var j = 0; j < arc.varB.domain.length; j++) {
            arc.varB.value = arc.varB.domain[j];
            if (!arc.conflict(arc.varA, arc.varB)) {
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

function AC3(csp, queue = []) {
    unaryConsistency(csp);
    binaryConsistency(csp, queue);
}
