// When expanding over sections and meetings, the class name is temporarily
// converted into an array with three elements. The first is the class number,
// the second is the section number, and the third is the meeting number. Once
// classes have been fully expanded, they are recondensed into a final array.
function getExpandedSectionsAndMeetings(variables) {
    var expandedVariables = [], IdCount = 0, sectionCount = 0, variable, i, j, k;
    for (i = 0; i < variables.length; i++) {
        variable = variables[i];
        expandedVariables.push([]);
        for (j = 0; j < variable.sections; j++) {
            expandedVariables[i].push([]);
            for (k = 0; k < variable.meetings; k++) {
                expandedVariables[i][j].push({
                    "name": variable["name"] + " " + (j + 1) + " (" + (k + 1) + ")",
                    "subject": variable["subject"],
                    "id": IdCount, 
                    "weight": variable["weight"],
                    "section": sectionCount,
                    "meetings": variable["meetings"],
                    "capacity": variable["capacity"],
                    "duration": variable["duration"],
                    "domain": variable["domain"],
                    "members": []
                });
                IdCount++;
            }
            sectionCount++;
        }
    }
    return expandedVariables;
}
function getArrayedVariables(variables) {
    var arrayedVariables = [], i, j, k;
    for (i = 0; i < variables.length; i++) {
        for (j = 0; j < variables[i].length; j++) {
            for (k = 0; k < variables[i][j].length; k++) {
                arrayedVariables.push(variables[i][j][k]);
            }
        }
    }
    return arrayedVariables;
}
function getExpandedVariables(variables) {
    variables = getExpandedSectionsAndMeetings(variables);

    return variables;
}

var variables = [], teachers = [], students = [];
function readClasses(writeClasses = false) {
    variables = [];

    // TEXT OUTPUT
    document.getElementById("class-ids").innerHTML = "";
    // END TEXT OUTPUT
    var fullDomain = [];
    for (var i = 1; i <= blocks * days; i++) {
        fullDomain.push(i);
    }
    // Read the input from the user.
    var variablesStr = [];//document.getElementById("classes").value.split("\n");
		var classElement = document.getElementById('classes-list');
		[...classElement.children].forEach(function(v) {
			variablesStr.push(v.children[0].innerHTML);
		});

    var line, info, list, splitList;
    for (var varLine in variablesStr) {
        line = variablesStr[varLine].split(": ");
        info = line[1].split(" ");
        list = fullDomain.slice();
        if (info.length == 6) {
            list = [];
            splitList = info[5].split(",");
            for (var i in splitList) {
                list.push(parseInt(splitList[i]));
            }
        }
        variables.push({
            "name": line[0],
            "subject": info[0],
            "weight": parseFloat(info[1]),
            "sections": parseInt(info[2]),
            "meetings": parseInt(info[3]),
            "duration": parseInt(info[4]),
            "capacity": parseInt(info[5]),
            "domain": info.length == 7 ? list : fullDomain
        });
        // TEXT OUTPUT
        if (writeClasses) {
            document.getElementById("class-ids").innerHTML += varLine + ": " + line[0] + "<br>";
        }
        // END TEXT OUTPUT
    }

}

function readStudentsAndTeachers() {
    teachers = [];
    students = [];

		var teachersStr = [];
		var teachElement = document.getElementById('teachers-list');
		[...teachElement.children].forEach(function(v) {
			teachersStr.push(v.children[0].innerHTML); 
		});
		var studentsStr = [];
		var studElement = document.getElementById('students-list');
		[...studElement.children].forEach(function(v) {
			studentsStr.push(v.children[0].innerHTML);
		});

    for (var varLine in teachersStr) {
        info = teachersStr[varLine].split(" ");
        list = [];
        splitList = info[3].split(",");
        for (var i in splitList) {
            list.push(parseInt(splitList[i]));
        }
        teachers.push({
            "name": info[0] + " " + info[1],
            "weight": parseFloat(info[2]),
            "classes": list
        });
    }

    for (var varLine in studentsStr) {
        info = studentsStr[varLine].split(" ");
        list = [];
        splitList = info[4].split(",");
        for (var i in splitList) {
            list.push(parseInt(splitList[i]));
        }
        students.push({
            "name": info[0] + " " + info[1],
            "grade": info[2],
            "weight": parseFloat(info[3]),
            "classes": list
        });
    }

    variables = getExpandedVariables(variables);
    arrayedVariables = getArrayedVariables(variables);

    teachers.forEach( (teacher, index) => teacher["id"] = index );
    students.forEach( (student, index) => student["id"] = index );

    function calibrateClasses(persons, variables) {
        // Calibrate classes according to sections and meetings per week, initially
        // without preference (i.e. done randomly).
        var calibratedClasses, classes, sections, section, choice, i, j, k;
        for (i = 0; i < persons.length; i++) {
            classes = [];
            for (j = 0; j < persons[i].classes.length; j++) {
                var loop = 0;
                do {
                    loop++;
                    choice = Math.floor( Math.random() * variables[persons[i].classes[j]].length );
                    section = variables[persons[i].classes[j]][choice];
                } while (loop<100 && (section[0].members.indexOf(i) != -1 ||
                    section[0].members.length >= section[0].capacity));
                for (k = 0; k < section.length; k++) {
                    classes.push(section[k]);
                    section[k].members.push(i);
                }
            }
            persons[i].classes = classes.map( (current) => arrayedVariables[current.id] );
        }
    }

    calibrateClasses(teachers, variables);
    // Erase teacher membership in classes to prevent confusion when the optimizer
    // later tries to reorganize students between sections.
    variables.forEach( (variable) => {
        variable.forEach( (section) => {
            section.forEach( (meeting) => {
                meeting.members = [];
            });
        });
    });
    calibrateClasses(students, variables);

    variables = arrayedVariables;
}

function readStructure() {
    days = parseInt(document.getElementById("days").value || 5);
    blocks = parseInt(document.getElementById("blocks").value || 7);
    totalBlocks = days*blocks;
    setBreaks();
}
