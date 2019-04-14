class CSP {

    constructor(variables, constraints, maintainArcConsistency = true, leastConstrainedValue = true, mostConstrainedVariable = true, delta = 1e-40) {
        this.variables = variables;
        this.constraints = constraints;
        this.binaryConstraints = this.constraints.filter(
            (constraint) => constraint.getType() === "binary"
        );
        this.maintainArcConsistency = maintainArcConsistency;
        this.leastConstrainedValue = leastConstrainedValue;
        this.mostConstrainedVariable = mostConstrainedVariable;
        this.delta = delta;
        this.unassociatedConstraints = {};
    }

    reset() {
        this.variables.forEach( (v) => v.domain = v.unaryDomain.slice() );
    }

    getBinaryConstraints() {
        return this.constraints.filter(
            (constraint) => constraint.getType() === "binary"
        );
    }

    getWeight(constraints = [], breakWeight = 0) {
        if (constraints.length == 0) {
            constraints = this.binaryConstraints;
        }
        var weight = 1, constraint, i;
        for (i = 0; i < constraints.length; i++) {
            constraint = constraints[i];
            if (constraint.varA.assigned &&
                constraint.varB.assigned &&
                constraint.conflict(constraint.varA, constraint.varB)) {
                weight *= constraint.weight;
                if (weight <= breakWeight) {
                    break;
                }
            }
        }
        return weight;
    }

    getWeightFromAssignment(assignment, constraints = [], breakWeight = 0) {
        this.applyAssignment(assignment);
        return this.getWeight(constraints, breakWeight);
    }

    // The CSP must already be assigned to previous.assignment.
    weightAfterChange(previous, variable) {
        // weightAfterChange finds the new weight of the csp, given a previous
        // state, its weight, and the changed variable.
        var assignment = previous.assignment, score = previous.score, constraint;
        for (var i = 0; i < this.binaryConstraints.length; i++) {
            constraint = this.binaryConstraints[i];
            if ((constraint.varA.id === variable.id || constraint.varB.id === variable.id) &&
                constraint.conflict(constraint.varA, constraint.varB)) {
                score *= constraint.weight;
            }
        }
        return score;
    }

    binaryConsistency(variable) {
        var queue = [];
        if (variable !== undefined) {
            queue = variable.getInwardConstraints();
        }
        if (this.softArcConsistency) {
            softBinaryConsistency(this, queue);
        }
        else {
            binaryConsistency(this, queue);
        }
    }

    assign(variable, value, assignment) {
        // assignment tracks the values of all variables.
        assignment[variable.id] = value;
        variable.value = value;
        variable.domain = [variable.value];
        variable.assigned = true;
        if (this.maintainArcConsistency) {
            this.binaryConsistency();
        }
    }

    unassign(variable, assignment) {
        // DO NOT call this to set the value of a variable; call assign for that.
        if (!!assignment[variable.id]) {
            /*
            // Reset all domains, as this variable could have restricted them
            // before but will no longer.
            for (var i in this.variables) {
                this.variables[i].domain = this.variables[i].unaryDomain.slice();
            }
            */
            variable.domain = variable.unaryDomain.slice();
            variable.value = variable.domain[0];
            variable.assigned = false;
            delete assignment[variable.id];
        }
    }

    applyAssignment(assignment) {
        for (var i = 0, variable; i < this.variables.length; i++) {
            variable = this.variables[i];
            if (!assignment[variable.id]) {
                variable.assigned = false;
            }
            else {
                variable.value = assignment[variable.id];
                variable.domain = [variable.value];
                variable.assigned = true;
            }
        }
    }

    getConflicts(assignment) {
        var conflicts = [], constraint;
        this.applyAssignment(assignment);
        for (var i = 0; i < this.binaryConstraints.length; i++) {
            constraint = this.binaryConstraints[i];
            if (constraint.varA.assigned &&
                constraint.varB.assigned &&
                constraint.conflict(constraint.varA, constraint.varB)) {
                conflicts.push(constraint);
            }
        }
        return conflicts;
    }

    getConflicting(assignment, changed = -1) {
        var constraint, i, len;
        this.applyAssignment(assignment);
        for (i = 0, len = this.variables.length; i < len; i++) {
            this.variables[i].conflict = false;
        }
        for (i = 0, len = this.binaryConstraints.length; i < len; i++) {
            constraint = this.binaryConstraints[i];
            if (!(constraint.varA.conflict && constraint.varB.conflict) && constraint.conflict(constraint.varA, constraint.varB)) {
                constraint.varA.conflict = true;
                constraint.varB.conflict = true;
            }
        }
        return this.variables.filter( (variable) => variable.conflict && variable.id != changed );
    }

    initUnassociatedConstraints() {
        this.unassociatedConstraints = {};
        var currentId, constraint;
        for (var i = 0, j; i < this.variables.length; i++) {
            currentId = this.variables[i].id;
            this.unassociatedConstraints[currentId] = [];
            for (j = 0; j < this.binaryConstraints.length; j++) {
                constraint = this.binaryConstraints[j];
                if (constraint.varA.id != currentId && constraint.varB.id != currentId) {
                    this.unassociatedConstraints[currentId].push(constraint);
                }
            }
        }
    }

    getOptimizedVariable(variable, index = -1) {
        if (index == -1) {
            index = this.variables.indexOf(variable);
        }
        // Find the option from the variable's domain that minimizes conflicts.
        // baseWeight is the summed weights of all constraints unrelated to the
        // variable at hand. To be efficient, baseWeight is henceforce added to
        // the summed weights of constraints associated with variable.
        var baseWeight = this.getWeight(this.unassociatedConstraints[variable.id]),
            minConflict = { "value": variable.value, "weight": this.getWeight() },
            originalValue = variable.value, hypotheticalWeight;
        for (var i = 0, len = variable.unaryDomain.length; i < len; i++) {
            if (variable.domain[i] === variable.value)
                continue;
            // Change the variable's value to the current test value and measure conflict.
            this.variables[index].value = variable.unaryDomain[i];
            // this.weightedConflicts takes a second parameter, breakWeight, and stops
            // summing weights if they exceed it. In this case, if the weight sum exceeds
            // the lowest associated-variables weight so far, terminate the search.
            hypotheticalWeight = baseWeight * this.getWeight(variable.binaryConstraints);
            if (hypotheticalWeight > minConflict.weight)
                minConflict = {
                    "value": variable.unaryDomain[i],
                    "weight": hypotheticalWeight
                };
        }
        // Reset the value of the optimized variable at the end.
        this.variables[index].value = originalValue;
        return minConflict;
    }
    
}

function selectUnassignedVariable(assignment, csp) {
    if (csp.mostConstrainedVariable) { // Most constrained variable
        var MCV, fewestLegalValues = 1e9;
        for (var i in csp.variables) {
            if (!assignment[csp.variables[i].id]) {
                if (csp.maintainArcConsistency) {
                    // Because arc consistency is enforced, we need only
                    // count the length of each variable's domain.
                    if (csp.variables[i].domain.length < fewestLegalValues) {
                        MCV = csp.variables[i];
                        fewestLegalValues = csp.variables[i].domain.length;
                    }
                }
                else {
                    console.log("Enable arc consistency in your CSP! I'm a lazy developer, so unless you want to come in here and program it, it won't get done. And you'll have to come in and program it if you ever want to test not enabling MAC. It's all so perfectly evil... MWAHAHAHAHA!");
                    alert("Houston, we have a problem! Billy Joe, go check the console.");
                }
            }
        }
        return MCV;
    }
    else { // Random unassigned variable
        var unassigned = [];
        for (var i = 0; i < csp.variables.length; i++) {
            if (!assignment[csp.variables[i].id]) {
                unassigned.push(csp.variables[i]);
            }
        }
        if (unassigned.length == 0) {
            throw "Attempted to find unassigned variable when all are already assigned.";
        }
        return unassigned[Math.floor( Math.random() * unassigned.length )];
    }
}

function orderDomainValues(variable, assignment, csp) {
    var domain = variable.domain;
    if (!csp.leastConstrainedValue) {
        return domain;
    }
    return domain.sort( (a, b) => a - b );
}

function getBest(csp, assignments) {
    var best =  index = 0;
    for (var j = 1; j < assignments.length; j++) {
        if (csp.getWeightFromAssignment(assignments[j]) > best) {
            best = csp.getWeightFromAssignment(assignments[j]);
            index = j;
        }
    }
    return assignments[index];
}

function getRandomAssignment(csp) {
    var assignment = {}, domain;
    for (var i = 0; i < csp.variables.length; i++) {
        domain = csp.variables[i].unaryDomain;
        assignment[i] = domain[ Math.floor( Math.random() * domain.length ) ];
    }
    return assignment;
}



function getCleanClass(variable) {
    return {
        "name": variable.name,
        "subject": variable.classInfo.subject,
        "id": variable.id,
        "value": variable.value,
        "duration": variable.classInfo.duration,
        "section": variable.classInfo.section,
        "weight": variable.classInfo.weight
    };
}

function getCleanClasses(schedule, classes) {
    var cleanClasses = [], i;
    for (i = 0; i < classes.length; i++) {
        cleanClasses.push(getCleanClass(classes[i])); 
    }
    return cleanClasses;
}

function getCleanJSON(schedule) {
    // Create clean JSON
    var cleanJSON = {
        "days": days,
        "blocks": blocks,
        "classes": [],
        "teachers": [],
        "students": []
    }, variable;
    cleanJSON.classes = getCleanClasses(schedule, schedule.variables);
    for (i = 0; i < teachers.length; i++) {
        cleanJSON.teachers.push({
            "name": teachers[i].name,
            "classes": teachers[i].classes.map( (c) => c.id ) // getCleanClasses(schedule, teachers[i].classes)
        });
    }
    for (i = 0; i < students.length; i++) {
        cleanJSON.students.push({
            "name": students[i].name,
            "grade": students[i].grade,
            "classes": students[i].classes.map( (c) => c.id ) // getCleanClasses(schedule, students[i].classes)
        });
    }
    return JSON.stringify(cleanJSON);
}

function getJSON(assignment) {
    csp.applyAssignment(assignment);
    return getCleanJSON(csp);
}

function setJSON(assignment) {
    var json = getJSON(assignment);
    document.getElementById("schedule-json").value = json;
}

function getAssignmentFromJSON(parsedJson) {
    var assignment = {}, vars = parsedJson.classes;
    vars.forEach( (variable) => assignment[variable.id] = variable.value );
    return assignment;
}
