var variableId = 0;

class Variable {

    constructor(name, domain, subject = "OPEN", section = 0, duration = 1, capacity = 15, weight = 1) {
        this.name = name;
        this.id = variableId++;
        this.domain = domain;
        this.unaryDomain = domain; // Domain after unary constraints.
        this.value = domain[0];
        this.unaryConstraints = [];
        this.binaryConstraints = [];

        this.classInfo = new Class(this.name, subject, section, duration, capacity, weight);

        this.assigned = false;
    }

    get duration() {
        return this.classInfo.duration;
    }
    get capacity() {
        return this.classInfo.capacity;
    }
    get weight() {
        return this.classInfo.weight;
    }
    get roster() {
        return this.classInfo.roster;
    }

    addUnaryConstraint(constraint) {
        if (constraint.getType() !== "unary") {
            return false;
        }
        this.unaryConstraints.push(constraint);
        return true;
    }

    removeUnaryConstraint(constraint) {
        var index = this.unaryConstraints.indexOf(constraint);
        if (index === -1) {
            return false;
        }
        this.unaryConstraint.splice(index, 1);
        return false;
    }

    addBinaryConstraint(constraint) {
        if (constraint.getType() !== "binary") {
            return false;
        }
        this.binaryConstraints.push(constraint);
        return true;
    }

    removeBinaryConstraint(constraint) {
        var index = this.binaryConstraints.indexOf(constraint);
        if (index === -1) {
            return false;
        }
        this.binaryConstraint.splice(index, 1);
        return false;
    }

    getInwardConstraints() {
        var inwardConstraints = [];
        for (var i in this.binaryConstraints) {
            if (this.binaryConstraints[i].getHead() === this) {
                inwardConstraints.push(this.binaryConstraints[i]);
            }
        }
        return inwardConstraints;
    }

    getOutwardConstraints() {
        var outwardConstraints = [];
        for (var i in this.binaryConstraints) {
            if (this.binaryConstraints[i].getHead() === this) {
                outwardConstraints.push(this.binaryConstraints[i]);
            }
        }
        return outwardConstraints;
    }

}
