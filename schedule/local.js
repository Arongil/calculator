function localSearch(csp, assignment, steps = 100) {
    csp.reset();
    // if (this.constraintsByVariable.length == 0)
        // this.computeVariableConstraints();
    var conflictingVariables = csp.getConflicting(assignment);
    var weight = csp.getWeightFromAssignment(assignment), conflict, index, optimized, i;
    for (i = 0; i < steps; i++) {
        // If there are no conflicts, terminate. 
        if (weight == 1) {
            return assignment;
        }

        // If no more variables can be optimized, terminate.
        if (conflictingVariables.length == 0) {
            return assignment;
        }

        // Find a conflicting variable at random.
        conflictVariable = conflictingVariables[
            Math.floor(Math.random() * conflictingVariables.length)
        ];
        conflictIndex = csp.variables.indexOf(conflictVariable);

        // Find the option from the variable's domain that minimizes conflicts.
        minConflict = csp.getOptimizedVariable(conflictVariable, conflictIndex);

        // If the optimized value equals the original value, remove the
        // variable from this.conflictingVariables so it is not chosen in the
        // future. If the optimized value is not the same, recalculate
        // this.conflictingVariables, because the change likely induced new
        // conflicts. In this way, no variables proven to be un-optimizable
        // are chosen: dead ends are left untouched.
        if (conflictVariable.value == minConflict.value) {
            conflictingVariables.splice(
                conflictingVariables.indexOf(conflictVariable), 1
            );
        }
        else {
            // If the optimized value is different, set it, set conflicts,
            // and recalculate the conflicting variables, excluding the variable
            // just optimized, because it is by definition a new dead end.
            csp.assign(conflictVariable, minConflict.value, assignment);
            weight = minConflict.weight;
            conflictingVariables = csp.getConflicting(assignment, conflictIndex);
        }
    }
    return assignment;
}

function beamAndSearch(csp, beamWidth, probabilityInfluence, steps) {
    var assignment = getBest(csp, beamSearch(csp, beamWidth, probabilityInfluence));
    return localSearch(csp, assignment, steps);
}
