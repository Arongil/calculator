/*****

Scheduler aims to solve scheduling with constraint satisfaction problem (CSP) approaches.

The schedule has time slots as follows:

|_____________|_MONDAY____|_TUESDAY___|_WEDNESDAY_|_THURSDAY__|_FRIDAY____|
|__9:15-10:00_|_(1)_______|_(8)_______|_(15)______|_(22)______|_(29)______|
|_10:00-10:45_|_(2)_______|_(9)_______|_(16)______|_(23)______|_(30)______|
|_11:00-11:45_|_(3)_______|_(10)______|_(17)______|_(24)______|_(31)______|
|_11:45-12:30_|_(4)_______|_(11)______|_(18)______|_(25)______|_(32)______|
|___1:15-2:00_|_(5)_______|_(12)______|_(19)______|_(26)______|_(33)______|
|___2:00-2:45_|_(6)_______|_(13)______|_(20)______|_(27)______|_(34)______|
|___2:45-3:45_|_(7)_______|_(14)______|_(21)______|_(28)______|_(35)______|

Blocks 26, 27, 28, 33, 34, 35 are studio blocks for all students.

Constraints are allDifferent for all student's class times and allDifferent for 
all teacher's class times.

*****/

class CSP {
 
  constructor(variables, constraints, constraintsByVariable = []) {
    this.variables = variables;
    this.constraints = constraints;
    // constraintsByVariable stores the constraints associated and the
    // constraints not associated with each variable. It is set in
    // computeVariableConstraints if it's not provided and is used in
    // getOptimizedVariable to narrow the constraints needed to check.
    this.constraintsByVariable = constraintsByVariable;
  }

  printVariables() {
    var output = "", i;
    for (i = 0; i < this.variables.length; i++) {
      output += "[" + i + "] " + this.variables[i].name + ": " + this.variables[i].value + "\n";
    }
    console.log(output);
  }
 
  randomizeVariables() {
    var state = this.variables, i, j;
    for (i = 0; i < state.length; i++) {
      state[i].value = state[i].domain[ Math.floor(Math.random()*state[i].domain.length) ];
    }
  }

  getVariables() {
    return JSON.parse(JSON.stringify(this.variables));
  }
 
  computeVariableConstraints() {
      var constraintsByVariable = [], constraint, i, j;
      for (i = 0; i < this.variables.length; i++) {
          constraintsByVariable.push({
              "associated": [],
              "unassociated": [] 
          });
      }
      for (i = 0; i < this.constraints.length; i++) {
          constraint = this.constraints[i];
          if (constraint.type === "DifferentConstraint") {
              constraintsByVariable[constraint.variableA].associated.push(i);
              constraintsByVariable[constraint.variableB].associated.push(i);
          }
          else if (constraint.type === "RepeatConstraint") {
              for (j = 0; j < constraint.ids.length; j++)
                  constraintsByVariable[constraint.ids[j]].associated.push(i);
          }
          else if (constraint.type === "QuantityConstraint") {
              for (j = 0; j < this.variables.length; j++)
                  constraintsByVariable[j].associated.push(i);
          }
      }
      // The algorithm below populates the unnoassociated list with every
      // element not in the associated list. Starting from the first
      // constraint, it only needs to check whether the next largest in the
      // associated list exists. Because the associated list is sorted from
      // smallest to largest, we increment an index counter every time the
      // largest is exceeded.
      var constraints, index;
      for (i = 0; i < this.variables.length; i++) {
          constraints = constraintsByVariable[i];
          index = 0;
          for (j = 0; j < this.constraints.length; j++) {
              if (constraints.associated[index] === j) {
                  index++;
                  continue;
              }
              constraints.unassociated.push(j);
          }
      }
      constraintsByVariable.forEach( ((variable) => {
          variable.associated = variable.associated.map( ((constraintIndex) => {
              return this.constraints[constraintIndex];
          }).bind(this));
          variable.unassociated = variable.unassociated.map( ((constraintIndex) => {
              return this.constraints[constraintIndex];
          }).bind(this));
      }).bind(this));
      this.constraintsByVariable = constraintsByVariable;
  }

  conflicts(variables = this.variables) {
    var conflicts = [], i;
    for (i = 0; i < this.constraints.length; i++)
      if (this.constraints[i].conflict(variables))
        conflicts.push(this.constraints[i]);
    return conflicts;
  }
 
  weightedConflicts(variables = this.variables, constraints = this.constraints,
                    breakWeight = 1e99, recordConflicts = true) {
    // breakWeight is an optional parameter that stops the summing if the weight
    // ever exceeds its threshold.
    // constraints is an optional parameter that focuses weightedConflicts to
    // only look at certain constraints.
    var sum = 0, i;
    for (i = 0; i < constraints.length; i++) {
      if (constraints[i].conflict(variables)) {
        sum += constraints[i].weight;
        // If desired, violated constraints can be incremented in an ordering
        // weight so that often-broken constraints can be evaluated first.
        if (recordConflicts)
          constraints[i].orderingWeight++;
        if (sum > breakWeight)
       	  break;
      }
    }
    return sum;
  }
 
  markConflictingVariables(variables = this.variables) {
    // Consider whether checking only DifferentConstraints is enough.
    for (i = 0; i < variables.length; i++)
      variables[i].conflicts = 0;
    var constraint;
    for (i = 0; i < this.constraints.length; i++) {
      constraint = this.constraints[i];
      if (constraint.type === "DifferentConstraint" &&
         (variables[constraint.variableA].conflicts === 0 || variables[constraint.variableB].conflicts === 0)) {
        if (constraint.conflict(variables)) {
          variables[this.constraints[i].variableA].conflicts++;
          variables[this.constraints[i].variableB].conflicts++;
        }
      }
    }
  }

  getConflictingVariables(variables = this.variables) {
    var conflictingVariables = [], i;
    this.markConflictingVariables();
    for (i = 0; i < variables.length; i++)
      if (variables[i].conflicts > 0)
        conflictingVariables.push(variables[i]);
    return conflictingVariables;
  }

  getOptimizedVariable(variable) {
    // Find the option from the variable's domain that minimizes conflicts.
    // baseWeight is the summed weights of all constraints unrelated to the
    // variable at hand. To be efficient, baseWeight is henceforce added to
    // the summed weights of constraints associated with variable.
    var variableIndex = this.variables.indexOf(variable),
        baseWeight = this.weightedConflicts(this.variables,
            this.constraintsByVariable[variableIndex].unassociated),
        minConflict = {
            "value": variable.value,
            "conflicts": baseWeight + this.weightedConflicts(this.variables,
                this.constraintsByVariable[variableIndex].associated)
        }, originalValue = variable.value, hypotheticalConflicts, i;
    for (i = 0; i < variable.domain.length; i++) {
      if (variable.domain[i] === variable.value)
        continue;
      // Change the variable's value to the current test value and measure conflict.
      this.variables[variableIndex].value = variable.domain[i];
      // this.weightedConflicts takes a second parameter, breakWeight, and stops
      // summing weights if they exceed it. In this case, if the weight sum exceeds
      // the lowest associated-variables weight so far, terminate the search.
      hypotheticalConflicts = baseWeight + this.weightedConflicts(this.variables,
          this.constraintsByVariable[variableIndex].associated,
          minConflict.conflicts - baseWeight);
      if (hypotheticalConflicts < minConflict.conflicts)
        minConflict = {
            "value": variable.domain[i],
            "conflicts": hypotheticalConflicts
        };
    }
    // Reset the value of the optimized variable at the end.
    this.variables[variableIndex].value = originalValue;
    return minConflict;
  }

  plateaued() {
    // A plateau is when all changes are detrimental except doing nothing.
    var weightedConflicts = this.weightedConflicts(),
        conflictingVariables = this.getConflictingVariables(),
        conflictVariable, minConflict, i;
    for (i = 0; i < conflictingVariables.length; i++) {
      conflictVariable = conflictingVariables[i];
      minConflict = this.getOptimizedVariable(conflictVariable);
      if (minConflict.value !== conflictVariable.value) {
        return false; // There is a possible improvement or, at least, shift.
      }
    }
    // After checking all possibilities for all variables, the schedule's improvement is stagnant.
    return true;
  }

  minimizeConflicts(maxSteps = 1e3, plateauInterval = 1e2) {
    // Before starting anything, compute the constraints associated
    // with each variable so that getOptimizedVariable is more efficient.
    if (this.constraintsByVariable.length == 0)
        this.computeVariableConstraints();
    var conflicts = this.weightedConflicts(), conflictingVariables, conflictVariable, minConflict, i;
    for (i = 0; i < maxSteps; i++) {
      // If the current state has no conflicts, return the solution.
      if (conflicts === 0)
        return this.variables;
      
      // Every plateauInterval steps, check for a plateau (all changes are detrimental except doing nothing).
      if (i % plateauInterval === 0) {
        if (this.plateaued()) {
          // console.log("Plateau at " + i + "!");
          return this.variables;
        }
      }
      
      // Find a conflicting variable at random.
      conflictingVariables = this.getConflictingVariables(this.variables);
      conflictVariable = conflictingVariables[Math.floor(Math.random() * conflictingVariables.length)];
      
      // Find the option from the variable's domain that minimizes conflicts.
      minConflict = this.getOptimizedVariable(conflictVariable);
      
      // Set the chosen conflicting variable's value to the minimizing one.
      conflictVariable.value = minConflict.value;
      // Update conflicts.
      conflicts = minConflict.conflicts;
    }
    
    return this.variables;
  }
 
}

// The parent class for all constraints holds name and weight information.
class Constraint {
 
  constructor(name, weight) {
    this.name = name;
    // weight conveys the importance of a constraint. Constraints with high weights
    // must be solved with a higher priority than constraints with low weights.
    this.weight = weight;
    // orderingWeight describes how often this constraint is violated.
    // When minimizing conflicts, constraints are sorted by their
    // orderingWeight at constant intervals so that often-broken constraints
    // are evaluated first.
    this.orderingWeight = 0;
  }
 
}
// DifferentConstraint can test for two classes scheduled at the same time.
class DifferentConstraint extends Constraint {
  
  constructor(student, weight, variableA, variableB) {
    super(student, weight);
    this.variableA = variableA;
    this.variableB = variableB;
    this.type = "DifferentConstraint";
  }
  
  conflict(variables) {
    // Return true if there is a conflict; return false if there is not.
    var variableA = variables[this.variableA],
        variableB = variables[this.variableB];
    return (variableA.value <= variableB.value && variableA.value + variableA.duration > variableB.value) ||
           (variableB.value <= variableA.value && variableB.value + variableB.duration > variableA.value);
  }

}
// QuantityConstraint can test for too many classes scheduled at the same time.
class QuantityConstraint extends Constraint {
  
  constructor(student, weight, value, maximum) {
    super(student, weight);
    // The class time to moniter.
    this.value = value;
    // The maximum classes during the time.
    this.maximum = maximum;
    this.type = "QuantityConstraint";
  }
  
  conflict(variables) {
    // Return true if there is a conflict; return false if there is not.
    var overlap = 0, i;
    // Loop through once across all quantity constraints and check that none are more than max.
    for (i = 0; i < variables.length; i++) {
      if (variables[i].value === this.value) {
        overlap++;
        if (overlap > this.maximum)
          return true;
      }
    }
    return false;
  }

}
// RepeatConstraint can test for repeated classes in some time frame.
class RepeatConstraint extends Constraint {
  
  constructor(student, weight, ids, slots, maximum) {
    super(student, weight);
    // The IDs of the classes that can't overlap.
    this.ids = ids;
    // The slots during which the classes can't overlap in a dictionary.
    this.slots = slots;
    // The maximum number of overlapped classes during the given range.
    this.maximum = maximum;
    this.type = "RepeatConstraint";
  }
  
  conflict(variables) {
    // Return true if there is a conflict; return false if there is not.
    var overlap = 0, i;
    for (i = 0; i < this.ids.length; i++) {
      if (!!this.slots[variables[this.ids[i]].value]) {
        overlap++;
        if (overlap > this.maximum)
          return true;
      }
    }
    return false;
  }
  
}

function constraintIndex(constraints, constraint) {
  for (var i = 0; i < constraints.length; i++) {
    // Test for DifferentConstraint.
    if (constraints[i].type === "DifferentConstraint")
      if (constraints[i].variableA === constraint.variableA && constraints[i].variableB === constraint.variableB)
        return i;
    // Test for QuantityConstraint
    else if (constraints[i].type === "QuantityConstraint")
      if (constraints[i].value === constraint.value && constraints[i].maximum === constraint.maximum)
        return i;
  }
  return -1;
}

function getWeight(student, classA, classB) {
  return student.weight * (classA.weight + classB.weight);
}

function setDifferentConstraints(constraints, variables, list) {
  var variableA, variableB, constraint, weight, index, i, j, k;
  for (i = 0; i < list.length; i++) {
    for (j = 0; j < list[i].classes.length; j++) {
      variableA = list[i].classes[j];
      for (k = j + 1; k < list[i].classes.length; k++) {
        variableB = list[i].classes[k];
        weight = getWeight(list[i], variables[variableA], variables[variableB]);
        constraint = new DifferentConstraint(list[i].name, weight, variableA, variableB);
        index = constraintIndex(constraints, constraint);
        if (index === -1) {
          constraints.push(constraint);
        }
        else {
          constraints[index].weight += weight;
        }
      }
    }
  } 
}

function getBestSchedule(variables, constraints, iterations = 1e2, minConflictsSteps = 1e3, plateauInterval = 1e2) {
  // For iterations random schedules, compute minimizeConflicts for minConflictsSteps steps. Every plateauInterval, check to be sure that the schedule hasn't plateaued (all changes are detrimental except doing nothing). Run minimizeConflicts for additionalSteps steps on the best schedule.
  var bestSchedule = {"schedule": null, conflicts: 1e99}, schedule, conflicts, i;
  for (i = 0; i < iterations; i++) {
    schedule = new CSP(variables, constraints, constraintsByVariable);
    schedule.randomizeVariables();
    schedule.minimizeConflicts(minConflictsSteps, plateauInterval);
    conflicts = schedule.weightedConflicts();
    if (i % Math.floor(iterations/100) == 0) {
      console.log(Math.floor(i/iterations * 100) + "%");
      console.log(conflicts);
    }
    if (conflicts < bestSchedule.conflicts) {
      bestSchedule = {"variables": schedule.getVariables(), "conflicts": conflicts};
      if (conflicts < 6000) {
        // Add each new best schedule to the localStorage, just in case.
        var cleanJSON = JSON.stringify(schedule.getVariables());
        localStorage.setItem("[" + i + "] Conflicts: " + conflicts + " (" + Math.random().toFixed(8) + ")", cleanJSON);
      }
    }
  }
  bestSchedule = new CSP(bestSchedule.variables, constraints);
  return bestSchedule;
}

function getCleanJSON(schedule, teachers, students) {
  // Create clean JSON
  var cleanJSON = {
      "days": days,
      "blocks": blocks,
      "classes": [],
      "teachers": [],
      "students": []
  }, variable;
  for (i = 0; i < schedule.variables.length; i++) {
    variable = schedule.variables[i];
    cleanJSON.classes.push({
        "name": variable.name,
        "value": variable.value,
        "duration": variable.duration,
        "weight": variable.weight
    });
  }
  for (i = 0; i < teachers.length; i++) {
    cleanJSON.teachers.push({
        "name": teachers[i].name,
        "classes": teachers[i].classes
    });
  }
  for (i = 0; i < students.length; i++) {
    cleanJSON.students.push({
        "name": students[i].name,
        "grade": students[i].grade,
        "classes": students[i].classes
    });
  }
  return JSON.stringify(cleanJSON);
}

// There are five schooldays in a week, each with seven blocks.
var days = 5, blocks = 7;
// Cutoffs are slots (mod blocks) in which polyblock classes cannot intersect: break, lunch, and the end of the day.
var cutoffs = [2, 4, 0];
// Initialize variables. Duration denotes how many blocks a class lasts; meetings denotes how many times per week a class meets. Classes with multiple meetings per week are duplicated and assigned the original class's number plus a decimal. Flooring returns the original values number. (class 14.9 => 14)
var variablesDictionary = {
  "0": {"name": "IL5 Studio",     "weight": 1e3, "duration": 3, "meetings": 2},
  "1": {"name": "IL6 Studio",     "weight": 1e3, "duration": 3, "meetings": 2},
  "2": {"name": "MS Math",        "weight": 1e1, "duration": 1, "meetings": 3},
  "3": {"name": "Pre-Algebra 1",  "weight": 1e1, "duration": 1, "meetings": 2},
  "4": {"name": "Pre-Algebra 2",  "weight": 1e1, "duration": 1, "meetings": 2},
  "5": {"name": "Algebra I 1",    "weight": 1e1, "duration": 2, "meetings": 2},
  "6": {"name": "Algebra I 2",    "weight": 1e1, "duration": 2, "meetings": 2},
  "7": {"name": "Math II 1",      "weight": 1e2, "duration": 2, "meetings": 2},
  "8": {"name": "Math II 2",      "weight": 1e2, "duration": 2, "meetings": 2},
  "9": {"name": "Math III",       "weight": 1e2, "duration": 2, "meetings": 2},
  "10": {"name": "Calculus",      "weight": 1e2, "duration": 2, "meetings": 2},
  "11": {"name": "MS English 1",  "weight": 1e1, "duration": 2, "meetings": 2},
  "12": {"name": "MS English 2",  "weight": 1e1, "duration": 2, "meetings": 2},
  "13": {"name": "MS English 3",  "weight": 1e1, "duration": 2, "meetings": 2},
  "14": {"name": "US English 1",  "weight": 1e2, "duration": 2, "meetings": 2},
  "15": {"name": "US English 2",  "weight": 1e2, "duration": 2, "meetings": 2},
  "16": {"name": "Geography 1",   "weight": 1e1, "duration": 2, "meetings": 2},
  "17": {"name": "Geography 2",   "weight": 1e1, "duration": 2, "meetings": 2},
  "18": {"name": "Geography 3",   "weight": 1e1, "duration": 2, "meetings": 2},
  "19": {"name": "US History 1",  "weight": 1e2, "duration": 2, "meetings": 2},
  "20": {"name": "US History 2",  "weight": 1e2, "duration": 2, "meetings": 2},
  "21": {"name": "Int Science 1", "weight": 1e1, "duration": 2, "meetings": 2},
  "22": {"name": "Int Science 2", "weight": 1e1, "duration": 2, "meetings": 2},
  "23": {"name": "Int Science 3", "weight": 1e1, "duration": 2, "meetings": 2},
  "24": {"name": "Biology",       "weight": 1e2, "duration": 2, "meetings": 2},
  "25": {"name": "Adv Biology",   "weight": 1e2, "duration": 2, "meetings": 2},
  "26": {"name": "Physics",       "weight": 1e2, "duration": 2, "meetings": 2},
  "27": {"name": "CS I 1",        "weight": 1e1, "duration": 1, "meetings": 1},
  "28": {"name": "CS I 2",        "weight": 1e1, "duration": 1, "meetings": 1},
  "29": {"name": "CS II 1",       "weight": 1e1, "duration": 1, "meetings": 1},
  "30": {"name": "CS II 2",       "weight": 1e1, "duration": 1, "meetings": 1},
  "31": {"name": "CS II 3",       "weight": 1e1, "duration": 1, "meetings": 1},
  "32": {"name": "Java I",        "weight": 1e2, "duration": 2, "meetings": 2},
  "33": {"name": "Java II",       "weight": 1e2, "duration": 2, "meetings": 2},
  "34": {"name": "Art I 1",       "weight": 1e0, "duration": 1, "meetings": 1},
  "35": {"name": "Art I 2",       "weight": 1e0, "duration": 1, "meetings": 1},
  "36": {"name": "Art I 3",       "weight": 1e0, "duration": 1, "meetings": 1},
  "37": {"name": "Art I 4",       "weight": 1e0, "duration": 1, "meetings": 1},
  "38": {"name": "Art I 5",       "weight": 1e0, "duration": 1, "meetings": 1},
  "39": {"name": "Art I 6",       "weight": 1e0, "duration": 1, "meetings": 1},
  "40": {"name": "Art II",        "weight": 1e0, "duration": 1, "meetings": 1},
  "41": {"name": "Spanish I",     "weight": 1e0, "duration": 1, "meetings": 2},
  "42": {"name": "Spanish II",    "weight": 1e0, "duration": 1, "meetings": 2},
  "43": {"name": "Spanish III",   "weight": 1e0, "duration": 1, "meetings": 2},
  "44": {"name": "Spanish IV",    "weight": 1e0, "duration": 1, "meetings": 2},
  "45": {"name": "OW 1",          "weight": 1e0, "duration": 1, "meetings": 1},
  "46": {"name": "OW 2",          "weight": 1e0, "duration": 1, "meetings": 1},
  "47": {"name": "OW 3",          "weight": 1e0, "duration": 1, "meetings": 1},
  "48": {"name": "OW 4",          "weight": 1e0, "duration": 1, "meetings": 1},
  "49": {"name": "OW 5",          "weight": 1e0, "duration": 1, "meetings": 1},
  "50": {"name": "OW 6",          "weight": 1e0, "duration": 1, "meetings": 1},
  "51": {"name": "OW 7",          "weight": 1e0, "duration": 1, "meetings": 1} 
};

function expandMeetings(variablesDictionary, idIncrement) {
  var keys = Object.keys(variablesDictionary), variable;
  for (i = 0; i < keys.length; i++) {
    variable = variablesDictionary[keys[i]];
    variable["domain"] = [];
    // Set the value to i so that, when later calibrating classes with multiple meetings per week, the original IDs hold meaning.
    variable["value"] = i;
    for (j = 1; j < variable.meetings; j++)
      variablesDictionary[(parseFloat(keys[i]) + j*idIncrement).toString()] = {"name": variable.name + " (" + (j + 1) + ")", "weight": variable.weight, "duration": variable.duration, "meetings": variable.meetings, "domain": [], "value": i};
    variable.name += " (1)";
  }
}
function getArrayedVariables(variableDictionary, idIncrement) {
  var variables = [], keys = Object.keys(variablesDictionary);
  for (i = 0; i < keys.length; i++) {
    // If the duplicate classes for multiple meetings have been reached, stop.
    if (Math.floor(parseFloat(keys[i])) !== parseFloat(keys[i]))
      continue;
    // Otherwise, add the original and its duplicates to variables.
    for (j = 0; j < variablesDictionary[keys[i]].meetings; j++) {
      variables.push(variablesDictionary[(parseFloat(keys[i]) + j*idIncrement).toString()]);
    }
  }
  return variables;
}
function expandDomains(variables) {
  var slots = [], slot, i, j, k;
  for (i = 1; i <= days*blocks; i++) {
    slots.push(i);
  } 
  var possible;
  for (i = 0; i < variables.length; i++) {
    for (j = 0; j < slots.length; j++) {
      slot = slots[j];
      possible = true;
      for (k = 0; k < variables[i].duration - 1; k++) {
        if (cutoffs.indexOf((slot + k) % blocks) !== -1) {
          // If there is an intersection, the slot cannot be used.
          possible = false;
          break;
        }
      }
      if (possible)
        variables[i].domain.push(slot);
    }
  }
}
function getExpandedVariables(variablesDictionary) {
  var idIncrement = 0.1;
  
  expandMeetings(variablesDictionary, idIncrement);
  var variables = getArrayedVariables(variablesDictionary, idIncrement);
  expandDomains(variables);
  
  return variables;
}

var variables = getExpandedVariables(variablesDictionary);
// Add a little topography to the problem.
// variables.forEach( (variable) => variable.weight += Math.random() );

// Initialize constraints: there may not exist overlap between the classes in which a student is enrolled.
var teachers = [
  /* TEACHERS */
  {"name": "Tristen", "weight": 1e6, "classes": [0]},
  {"name": "John", "weight": 1e6,    "classes": [1]},
  {"name": "Marcy", "weight": 1e6,   "classes": [2, 3, 4, 5, 6, 7, 8, 9, 10]},
  {"name": "Brett", "weight": 1e6,   "classes": [11, 12, 13, 14, 15]},
  {"name": "Derek", "weight": 1e6,   "classes": [16, 17, 18, 19, 20]},
  {"name": "Megan", "weight": 1e6,   "classes": [21, 22, 23, 24, 25]},
  {"name": "Denise", "weight": 1e6,  "classes": [26, 27, 28, 29, 30, 31, 32, 33]},
  {"name": "Saloni", "weight": 1e6,  "classes": [34, 35, 36, 37, 38, 39, 40]},
  {"name": "Raquel", "weight": 1e6,  "classes": [41, 42, 43, 44]},
  {"name": "Devin", "weight": 1e6,   "classes": [45, 46, 47, 48, 49, 50, 51]}
];
var students = [
  {"name": "Timothy Chien", "weight": 1, "grade": "IL5", "classes": [0, 18, 19, 38, 25, 32, 13, 7, 47, 49]},
  {"name": "Kabir Goklani", "weight": 1, "grade": "IL5", "classes": [0, 18, 38, 5, 22, 42, 11, 50, 29]},
  {"name": "Adrian Panezic", "weight": 1, "grade": "IL5", "classes": [0, 23, 38, 4, 45, 13, 17, 47, 29]},
  {"name": "Peter Watson", "weight": 1, "grade": "IL5", "classes": [0, 12, 3, 38, 30, 22, 16, 47, 50]},
  {"name": "Jasper Johnson", "weight": 1, "grade": "IL5", "classes": [0, 12, 38, 4, 45, 21, 17, 27]},
  {"name": "Megan Chien", "weight": 1, "grade": "IL5", "classes": [0, 12, 23, 4, 16, 37, 47, 50, 29]},
  {"name": "Soren Williams", "weight": 1, "grade": "IL5", "classes": [0, 18, 3, 38, 30, 21, 11, 47, 50]},
  {"name": "Bharat Saiju", "weight": 1, "grade": "IL5", "classes": [0, 19, 9, 25, 15, 37, 47, 32, 51]},
  {"name": "Mary Beeler", "weight": 1, "grade": "IL5", "classes": [0, 18, 38, 5, 22, 11, 47, 51, 31]},
  {"name": "JANE BEELER", "weight": 1, "grade": "IL6", "classes": [1, 24, 14, 9, 45, 20, 46, 40, 29]},
  {"name": "DILAN KUDVA", "weight": 1, "grade": "IL6", "classes": [1, 24, 19, 9, 15, 41, 47, 50, 31]},
  {"name": "LAKER NEWHOUSE", "weight": 1, "grade": "IL6", "classes": [1, 14, 33, 41, 25, 20, 47, 49]},
  {"name": "MARIA MAHERAS", "weight": 1, "grade": "IL6", "classes": [1, 24, 14, 45, 20, 7, 40, 50, 31]},
  {"name": "ISABELLA TANEJA", "weight": 1, "grade": "IL6", "classes": [1, 24, 14, 30, 20, 7, 40, 51]},
  {"name": "NICHOLAS VERZIC", "weight": 1, "grade": "IL6", "classes": [1, 26, 19, 33, 45, 15, 10, 49]},
  {"name": "CALEB CHOI", "weight": 1, "grade": "IL6", "classes": [1, 14, 33, 41, 25, 20, 10, 49, 51]},
  {"name": "ABHINAV VEDATI", "weight": 1, "grade": "IL6", "classes": [1, 26, 14, 9, 45, 20, 33, 47]},
  {"name": "SOHM DUBEY", "weight": 1, "grade": "IL6", "classes": [1, 19, 33, 41, 25, 15, 47, 8, 39]},
  {"name": "ANJELI MAYORAZ", "weight": 1, "grade": "IL6", "classes": [1, 26, 14, 45, 32, 20, 37, 47, 8]},
  {"name": "NIKHIL GARGEYA", "weight": 1, "grade": "IL6", "classes": [1, 26, 14, 33, 45, 20, 42, 37, 10, 49]},
  {"name": "ARJUN CHOPRA", "weight": 1, "grade": "IL6", "classes": [1, 26, 14, 9, 45, 32, 20, 42, 37, 47]},
  {"name": "Meghna Chopra", "weight": 1, "grade": "IL5", "classes": [0, 18, 3, 38, 27, 48, 21, 11, 47]},
  {"name": "ARUNA GUABA", "weight": 1, "grade": "IL6", "classes": [1, 19, 26, 15, 35, 41, 47, 7]},
  {"name": "ANGELICA ZHUANG", "weight": 1, "grade": "IL6", "classes": [1, 24, 19, 45, 15, 7, 40, 32, 51]},
  {"name": "KATARINA FALLON", "weight": 1, "grade": "IL6", "classes": [1, 26, 14, 30, 20, 7, 40, 49]},
  {"name": "SOPHIE FAN", "weight": 1, "grade": "IL6", "classes": [1, 14, 9, 25, 32, 20, 47, 49, 42]},
  {"name": "ROBERT BELIVEAU", "weight": 1, "grade": "IL6", "classes": [1, 24, 19, 33, 45, 15, 7, 50]},
  {"name": "SIMON CAPPER", "weight": 1, "grade": "IL6", "classes": [1, 24, 19, 45, 15, 7, 28, 39]},
  {"name": "TRISTAN PERRY", "weight": 1, "grade": "IL6", "classes": [1, 14, 25, 20, 37, 10, 49, 51, 31]},
  {"name": "VIVEN SUNKAM", "weight": 1, "grade": "IL6", "classes": [1, 14, 33, 41, 25, 20, 10, 49, 51]},
  {"name": "SHIRA SHEPPARD", "weight": 1, "grade": "IL6", "classes": [1, 26, 19, 30, 15, 35, 41, 47, 8]},
  {"name": "VIVEK PUNN", "weight": 1, "grade": "IL6", "classes": [1, 19, 25, 15, 7, 28, 49, 51, 36]},
  {"name": "MARGOT HALL", "weight": 1, "grade": "IL6", "classes": [1, 26, 19, 30, 15, 35, 41, 47, 8]},
  {"name": "ERIC COHAN", "weight": 1, "grade": "IL6", "classes": [1, 24, 14, 9, 45, 20, 35, 50]},
  {"name": "ETHAN CHANG", "weight": 1, "grade": "IL6", "classes": [1, 24, 14, 45, 20, 35, 7, 28, 50]},
  {"name": "AARON KWOK", "weight": 1, "grade": "IL6", "classes": [1, 26, 19, 27, 45, 15, 35, 7, 49]},
  {"name": "MILLER DAYTON", "weight": 1, "grade": "IL6", "classes": [1, 24, 14, 27, 45, 20, 35, 7, 50]},
  {"name": "Sarah Fernandes", "weight": 1, "grade": "IL5", "classes": [0, 18, 5, 46, 21, 11, 28]},
  {"name": "MISHAL JUNAID", "weight": 1, "grade": "IL6", "classes": [1, 24, 19, 5, 15, 46, 40, 50, 30]},
  {"name": "Alisha Junaid", "weight": 1, "grade": "IL5", "classes": [0, 12, 23, 4, 16, 46, 39, 50, 31]},
  {"name": "Ameera Hoodbhoy", "weight": 1, "grade": "IL5", "classes": [0, 12, 3, 22, 16, 46, 50, 29, 36]},
  {"name": "Jay Bhan", "weight": 1, "grade": "IL5", "classes": [0, 18, 45, 22, 13, 7, 39, 51, 31]},
  {"name": "Parinita Thapliyal", "weight": 1, "grade": "IL5", "classes": [0, 18, 2, 22, 11, 28, 50]},
  {"name": "Matthias Fallon", "weight": 1, "grade": "IL5", "classes": [0, 18, 23, 4, 13, 46, 50, 36]},
  {"name": "Edan Cho", "weight": 1, "grade": "IL5", "classes": [0, 23, 30, 48, 16, 11, 8, 50]},
  {"name": "Aryan Prodduturri", "weight": 1, "grade": "IL5", "classes": [0, 24, 14, 45, 32, 7, 20, 36]},
  {"name": "Kepler Boyce", "weight": 1, "grade": "IL5", "classes": [0, 26, 14, 16, 46, 33, 37, 10]},
  {"name": "Jay Warrier", "weight": 1, "grade": "IL5", "classes": [0, 12, 23, 33, 5, 48, 17, 51, 36]},
  {"name": "Madeline Wang", "weight": 1, "grade": "IL5", "classes": [0, 23, 4, 13, 46, 17, 49, 39, 31]},
  {"name": "Pranav Tatavarti", "weight": 1, "grade": "IL5", "classes": [0, 18, 23, 5, 46, 11, 47, 29, 36]},
  {"name": "Leia MacAskill", "weight": 1, "grade": "IL5", "classes": [0, 12, 2, 30, 48, 21, 17, 39]},
  {"name": "Logan MacAskill", "weight": 1, "grade": "IL5", "classes": [0, 18, 3, 33, 22, 46, 11, 50, 36]},
  {"name": "Avril Cierniak", "weight": 1, "grade": "IL5", "classes": [0, 26, 38, 45, 32, 48, 16, 11, 8]},
  {"name": "Amartya Iyer", "weight": 1, "grade": "IL5", "classes": [0, 45, 32, 22, 16, 46, 11, 8]},
  {"name": "PARTH IYER", "weight": 1, "grade": "IL6", "classes": [1, 26, 19, 33, 15, 46, 10, 49]},
  {"name": "Neil Devnani", "weight": 1, "grade": "IL5", "classes": [0, 24, 45, 15, 48, 16, 7, 37, 29]},
  {"name": "Gurshan Jolly", "weight": 1, "grade": "IL5", "classes": [0, 12, 23, 5, 48, 17, 39, 31]},
  {"name": "Stella Petzova", "weight": 1, "grade": "IL5", "classes": [0, 12, 27, 22, 16, 37, 50]},
  {"name": "Holly Thompson", "weight": 1, "grade": "IL5", "classes": [0, 18, 3, 27, 35, 46, 21, 11, 50]},
  {"name": "Leo Spalter", "weight": 1, "grade": "IL5", "classes": [0, 12, 45, 48, 21, 17, 28]},
  {"name": "Avani Sundaresan", "weight": 1, "grade": "IL5", "classes": [0, 18, 27, 45, 22, 35, 11, 50]},
  {"name": "Charles Kunz", "weight": 1, "grade": "IL5", "classes": [0, 3, 22, 13, 46, 17, 49, 29, 36]},
  {"name": "Meher Halder", "weight": 1, "grade": "IL5", "classes": [0, 18, 38, 4, 46, 21, 11, 27, 50]},
  {"name": "Athena Cho", "weight": 1, "grade": "IL5", "classes": [0, 12, 3, 27, 45, 22, 35, 36, 17]},
  {"name": "Sita Vemuri", "weight": 1, "grade": "IL5", "classes": [0, 23, 2, 27, 48, 13, 17, 59, 39]},
  {"name": "Sharanya Nemane", "weight": 1, "grade": "IL5", "classes": [0, 3, 38, 30, 22, 13, 17, 49, 51]},
  {"name": "Eegan Ram", "weight": 1, "grade": "IL5", "classes": [0, 18, 27,48, 13, 7, 50, 36]},
  {"name": "Renn Blanco", "weight": 1, "grade": "IL5", "classes": [0, 18, 2, 27, 45, 22, 35, 11, 50]},
  {"name": "Varin Sikka", "weight": 1, "grade": "IL5", "classes": [0, 12, 2, 27, 45, 22, 16, 37, 50]},
  {"name": "Adarsh Krishnan", "weight": 1, "grade": "IL5", "classes": [0, 18, 23, 48, 13, 7, 37, 50, 29]},
  {"name": "Ishansh Kwatra", "weight": 1, "grade": "IL5", "classes": [0, 12, 38, 5, 22, 46, 17, 31]},
  {"name": "Sophia DeMedeiros", "weight": 1, "grade": "IL5", "classes": [0, 2, 30, 22, 13, 17, 49, 51, 36]}
];

function calibrateClasses(persons, variables) {
  // Calibrate classes according to meetings per week.
  var calibratedClasses, classes;
  for (i = 0; i < persons.length; i++) {
    classes = persons[i].classes
    calibratedClasses = [];
    // For each original class ID, run through the variables array and add any class whose value (set when making the variablesDictionary into an array) equals the original ID.
    for (j = 0; j < classes.length; j++)
      for (k = 0; k < variables.length; k++)
        if (classes[j] === variables[k].value)
          calibratedClasses.push(k);
    persons[i].classes = calibratedClasses;
  }
}

calibrateClasses(teachers, variables);
calibrateClasses(students, variables);

// Set constraints.
var constraints = [], ids, slots, slotsDict;
// Create teachers' DifferentConstraint constraints.
setDifferentConstraints(constraints, variables, teachers);
// Create students' DifferentConstraint constraints.
 setDifferentConstraints(constraints, variables, students);
// Create the QuantityConstraint constraints.
for (i = 1; i <= days*blocks; i++) {
  constraint = new QuantityConstraint("Slot " + i, 1e6, i, 6);
  constraints.push(constraint);
}
// Create the RepeatConstraint constraints.
for (i = 0; i < variables.length; i += variables[i].meetings) {
  ids = [i];
  for (j = 1; j < variables[i].meetings; j++)
    ids.push(i + j);
  for (j = 0; j < days; j++) {
    slotsDict = {};
    slots = (Array(blocks)).fill(0).map( (block, index) => index + 1 + blocks*j );
    slots.forEach( (slot) => { slotsDict[slot] = true; } );
    constraint = new RepeatConstraint(variables[i].name, 1e6, ids, slotsDict, 1);
    constraints.push(constraint);
  }
}

// Compute constraints pertaining to each variable.
var temp = new CSP(variables, constraints), constraintsByVariable;
temp.computeVariableConstraints();
constraintsByVariable = temp.constraintsByVariable;

// var schedule = new CSP(variables, constraints);
// schedule.randomizeVariables();
// schedule.minimizeConflicts(10000, 100);
// schedule.printVariables();
// var iterations = 1;
// var start = performance.now();
// for (i = 0; i < iterations; i++) {
//   schedule.plateaued();
// }
// var end = performance.now();
// console.log("The calculation took " + (end - start)/iterations + " milliseconds.");

function measureBestSchedule(iterations, steps, plateauInterval = 100) {
    var start = performance.now();
    var bestSchedule = getBestSchedule(variables, constraints, iterations, steps, plateauInterval);
    var end = performance.now();
    console.log("The calculation took " + (end - start)/1000 + " seconds.");
    console.log("The best schedule has " + bestSchedule.conflicts().length + " conflicts weighted at " + bestSchedule.weightedConflicts() + ".");
//    bestSchedule.printVariables();
    var cleanJSON = getCleanJSON(bestSchedule, teachers, students); 
 //   console.log(cleanJSON);
    document.getElementById("schedule-json").value = cleanJSON;

    // var cleanJSON = getCleanJSON(bestSchedule, teachers, students);
    // console.log(cleanJSON);

    return bestSchedule;
}
