var canvases = [];
var WIDTH, HEIGHT, HALFWIDTH, HALFHEIGHT;

var schedule;

class Schedule {
    
    constructor(schedule) {
        this.days = schedule.days;
        this.blocks = schedule.blocks;
        this.classes = schedule.classes;
        this.teachers = schedule.teachers;
        this.students = schedule.students;
        this.colorBySubject = { // R    G    B
            "goal time":        [255, 255, 140],
            "studio":           [137, 255, 245],
            "math":             [216, 255, 127],
            "science":          [183, 205, 255],
            "history":          [255, 206, 109],
            "english":          [175, 255, 189],
            "computer science": [255, 195, 186],
            "art":              [178, 255, 215],
            "world language":   [255, 206, 248],
            "outer wellness":   [220, 220, 220]
        };
        this.teacherBySubject = {
            "goal time":        [undefined],
            "studio":           ["John", "Tristen"],
            "math":             ["Marcy"],
            "science":          ["Megan", "Denise"],
            "history":          ["Derek"],
            "english":          ["Brett"],
            "computer science": ["Denise"],
            "art":              ["Saloni"],
            "world language":   ["Raquel", "Sara", "Sabrina"],
            "outer wellness":   ["Devin"]
        };

        this.canvas;
    }

    setCanvas(canvas) {
        this.canvas = canvas;
    }

    getBlock(block) {
        var times = ["9:15 - 10:00", "10:00 - 10:45", "11:00 - 11:45", "11:45 - 12:30", "1:15 - 2:00", "2:00 - 2:45", "2:45 - 3:45"];
        return times[block];
    }

    getDay(day) {
        var days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
        return days[day];
    }

    getColor(classId) {
        var teacher, i;
        for (i = 0; i < this.teachers.length; i++) {
            if (this.teachers[i].classes.indexOf(classId) != -1) {
                teacher = this.teachers[i].name;
                break;
            }
        }

        var keys = Object.keys(this.teacherBySubject);
        for (i = 0; i < keys.length; i++) {
            if (this.teacherBySubject[keys[i]].indexOf(teacher) != -1)
                return this.colorBySubject[keys[i]];
        }
        throw "Error: invalid classId in Schedule.getColor";
    }

    getPerson(name) {
        var lists = [this.teachers, this.students], i, j;
        for (i = 0; i < lists.length; i++) {
            for (j = 0; j < lists[i].length; j++)
                if (lists[i][j].name == name)
                    return lists[i][j];
        }
        throw "Error: invalid name provided in Schedule.getPerson";
    }

    getClass(person, day, block) {
        // Returns the class the student is in at a given day and block.
        // The default is that the student has goal time.
        // The return is a dictionary with the class name, which may be modified
        // to continued or goal time, and the class id, which is constant.
        var slot = this.blocks*day + block + 1, classes = [], classHolder, i, j;
        for (i = 0; i < person.classes.length; i++) {
            classHolder = this.classes[person.classes[i]];
            if (slot == classHolder.value)
                classes.push({"name": classHolder.name, "id": person.classes[i]}); 
            else if (slot > classHolder.value && slot < classHolder.value + classHolder.duration)
                classes.push({"name": classHolder.name + " [cont]", "id": person.classes[i]});
        }
        if (classes.length == 0) {
            // There are no scheduled classes in the slot, so return goal time.
            return {"name": "Goal Time", "id": person.classes[i], "conflicts": []};
        }
        else if (classes.length == 1) {
            // Return the one class in the slot.
            return {"name": classes[0].name, "id": classes[0].id, "conflicts": []};
        }
        else {
            // There's a conflict: return the class with the highest weight and
            // the others noted as conflicts.
            var highestWeighted, highestWeight = -1;
            for (i = 0; i < classes.length; i++) {
                if (this.classes[classes[i].id].weight > highestWeight) {
                    highestWeight = this.classes[classes[i].id].weight;
                    highestWeighted = classes[i].id;
                }
            }
            return {
                "name": this.classes[highestWeighted].name,
                "id": highestWeighted,
                "conflicts": classes
            };
        }
   }

    displayClass(person, day, block) {
        // Get data of class in given day and block.
        var classData = this.getClass(person, day - 1, block - 1),
            color = this.getColor(classData.id);
        // Draw background rectangle in the color of the class's subject.
        this.canvas.fill(color[0], color[1], color[2]);
        this.canvas.rect(WIDTH*(-1/2 + (day + 1)/(this.blocks + 1)),
            HEIGHT*(-1/3 + 5/6 * block/(this.blocks + 1)),
            WIDTH/(this.blocks + 1), 5/6 * HEIGHT/(this.blocks + 1));
        // If there is a conflict, draw a red rectangle at the top of the box.
        if (classData.conflicts.length > 0) {
            this.canvas.fill(220, 0, 0);
            this.canvas.rect(WIDTH*(-1/2 + (day + 1)/(this.blocks + 1)),
                HEIGHT*(-1/3 + 5/6 * (block - 3/10)/(this.blocks + 1)),
                0.8 * WIDTH/(this.blocks + 1), 1/6 * HEIGHT/(this.blocks + 1));
        }
        this.canvas.fill(0, 0, 0);
        this.canvas.textWrap(classData.name,
            WIDTH*(-1/2 + (day + 1)/(this.blocks + 1)),
            HEIGHT*(-1/3 - 1/90 + 5/6 * block/(this.blocks + 1)),
            0.9 * WIDTH/(this.blocks + 1), HEIGHT/45);
    }

    displayBackground() {
        this.canvas.fill(220, 220, 220);
        this.canvas.noStroke();
        this.canvas.rect(0, 0, WIDTH, HEIGHT);
        this.canvas.stroke(0, 0, 0);
        this.canvas.fill(0, 0, 0);
    }

    display(name) {
        var person = this.getPerson(name), i, j;
        this.displayBackground();
        this.canvas.textSize(HEIGHT/20);
        this.canvas.text(name + "'s Schedule", 0, -2/5 * HEIGHT);
        for (i = 0; i < this.days + 1; i++) {
            for (j = 0; j < this.blocks + 1; j++) {
                if (i == 0 && j == 0)
                    continue;
                else if (i == 0 && j != 0) {
                    this.canvas.textSize(HEIGHT / 40);
                    this.canvas.text(this.getBlock(j - 1), WIDTH*(-1/2 + 0.8/(this.blocks + 1)),
                        HEIGHT*(-1/3 + 5/6 * (j + 0.1)/(this.blocks + 1))); 
                }
                else if (j == 0 && i != 0) {
                    this.canvas.textSize(HEIGHT / 30);
                    this.canvas.text(this.getDay(i - 1), WIDTH*(-1/2 + (i + 1)/(this.blocks + 1)),
                        HEIGHT*(-11/40 - 1/(6 * (this.blocks + 1))));
                }
                else {
                    this.displayClass(person, i, j);
                }
            }
        }
    }

}

function resize() {
    canvases.forEach( (canvas) => canvas.resize() );
}
document.getElementsByTagName("body")[0].onresize = resize;

function clearOptions(select) {
    for (var i = select.options.length - 1; i >= 0; i--) {
        select.remove(i);
    }
}

function loadLevelSelector() {
    var levelSelect = document.getElementById("level-select"), levels = ["teachers"];
    document.getElementById("ui-level-1").style.display = "block";
    clearOptions(levelSelect);
    schedule.students.forEach( (student) => {
        if (levels.indexOf(student.grade) == -1)
            levels.push(student.grade);
    });
    levels.forEach( (level) => {
        var option = document.createElement("option");
        option.textContent = level;
        levelSelect.appendChild(option);
    });
}

function loadLevels_(level, clear = true) {
    document.getElementById("ui-level-2").style.display = "block";
    var members = [];
    if (level == "teachers") {
        schedule.teachers.forEach( (teacher) => members.push(teacher.name) );
    }
    else {
        // Decypher the grade (IL).
        schedule.students.forEach( (student) => {
            if (student.grade == level)
                members.push(student.name);
        });
    }
    members = members.sort();
    
    var personSelect = document.getElementById("person-select");
    if (clear)
        clearOptions(personSelect);
    members.forEach( (member) => {
        var option = document.createElement("option");
        option.textContent = member;
        personSelect.appendChild(option);
    });
}

function loadLevels() {
    var level = document.getElementById("level-select").value;
    loadLevels_(level);
}

function loadAllLevels() {
    var levelSelector = document.getElementById("level-select"),
        options = levelSelector.options, i;
    clearOptions(document.getElementById("person-select"));
    for (i = 0; i < options.length; i++) {
        loadLevels_(options[i].textContent, false);
    }
}

function loadSchedule() {
    // When loading a single schedule, clear out the canvases div,
    // replace in it one new canvas, and call schedule.display on it.
    var personSelect = document.getElementById("person-select"),
        canvasElements = document.getElementById("canvases");
    while (canvasElements.firstChild)
        canvasElements.removeChild(canvasElements.firstChild);
    var canvas = new Canvas("canvas0");
    canvas.resize();
    schedule.setCanvas(canvas);
    schedule.display(personSelect.value);
}

function loadAllSchedules() {
    // When loading multiple schedules, clear out the canvases div, replace
    // in it multiple canvases, and call schedule.display on all of them.
    var personSelect = document.getElementById("person-select"),
        canvasElements = document.getElementById("canvases"), canvas, br, i;
    while (canvasElements.firstChild)
        canvasElements.removeChild(canvasElements.firstChild);
    for (i = 0; i < personSelect.options.length; i++) {
        br = document.createElement("br");
        document.getElementById("canvases").appendChild(br);
        canvas = new Canvas("canvas" + i);
        canvas.resize();
        schedule.setCanvas(canvas);
        schedule.display(personSelect.options[i].textContent);
    }
}

function loadJSON() {
    try {
        var parsed = JSON.parse(document.getElementById("schedule-json").value);
    }
    catch {
        throw "Error: invalid JSON";
        return;
    }

    schedule = new Schedule(parsed); 
    loadLevelSelector();
}
