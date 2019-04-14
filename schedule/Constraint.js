// The parent class for all constraints holds name and weight information.
class Constraint {

    constructor(name, weight = 1) {
        this.name = name;
        /* Weight conveys the importance of a constraint.
         * A weight of 0 means the constraint MUST be satisfied.
         * A weight of 1 means the constraint doesn't matter at all.
         * All other weights interpolate between these extremes.
        **/
        this.weight = weight;
    }
 
}

class UnaryConstraint extends Constraint {

    constructor(name, varA, constraint, weight = 1) {
        super(name, weight);
        this.varA = varA;
        this.constraint = constraint;
        this.varA.addUnaryConstraint(this);
    }
    
    getType() {
        return "unary";
    }

    conflict(varA) {
        return this.constraint(varA);
    }

}

class BinaryConstraint extends Constraint {

    constructor(name, varA, varB, constraint, weight = 1) {
        super(name, weight);
        // BinaryConstraints point from varA to varB
        this.varA = varA;
        this.varB = varB;
        this.constraint = constraint;
        this.varA.addBinaryConstraint(this);
        this.varB.addBinaryConstraint(this);
    }

    getType() {
        return "binary";
    }

    getTail() {
        return this.varA;
    }
    
    getHead() {
        return this.varB;
    }

    getFlippedDirection() {
        return new BinaryConstraint(
            this.name, this.varB, this.varA, this.constraint, this.weight
        );
    }

    conflict(varA, varB) {
        return this.constraint(varA, varB);
    }

}

function getBothDirections(constraints) {
    var arcs = constraints, length = constraints.length;
    for (var i = 0; i < length; i++) {
        if (constraints[i].getType() === "unary") {
            continue;
        }
        arcs.push(constraints[i].getFlippedDirection());
    }
    return arcs;
}

function differentConstraint(varA, varB) {
    // Return true if there is a conflict; return false if there is not.
    return (varA.value <= varB.value && varA.value + varA.duration > varB.value) ||
           (varB.value <= varA.value && varB.value + varB.duration > varA.value);
}

var days = 5, blocks = 7, totalBlocks = days*blocks;
var breaks = [];
function setBreaks() {
    for (var i = 0; i < days; i++) {
        breaks.push(blocks*i + 2);
        breaks.push(blocks*i + 4);
        breaks.push(blocks*i + blocks);
    }
}
setBreaks();
function dayConstraint(varA) {
    for (var i = 0; i < breaks.length; i++) {
        if (varA.value <= breaks[i] && varA.value + varA.duration > breaks[i] + 1) {
            return true;
        }
    }
    return false;
}
function differentDayConstraint(varA, varB) {
    for (var i = 0, next; i < totalBlocks; i = next) {
        next = i + blocks;
        if (varA.value >= i && varA.value < next && varB.value >= i && varB.value < next) {
            return true;
        }
    }
    return false;
}
