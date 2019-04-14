function studentIndexOf(student, varA, varB) {
    var varAIn = false, varBIn = false;
    for (var i = 0; i < student.classes.length; i++) {
        if (student.classes[i].id === varA.id) {
            varAIn = true;
        }
        if (student.classes[i].id === varB.id) {
            varBIn = true;
        }
    }
    return varAIn && varBIn;
}
function peopleInBoth(varA, varB) {
    var people = [];
    for (var i = 0; i < students.length; i++) {
        if (studentIndexOf(students[i], varA, varB)) {
            people.push(students[i]);
        }
    }
    for (var i = 0; i < teachers.length; i++) {
        if (studentIndexOf(teachers[i], varA, varB)) {
            people.push(teachers[i]);
        }
    }
    return people;
}

var csp;

function initCSP() {
    variableId = 0;
    readStructure();
    readClasses(false);
    readStudentsAndTeachers();

    var domain = [];
    for (var i = 1; i <= blocks * days; i++) {
        domain.push(i);
    }

    // Create Variables
    var vars = [];
    for (var i = 0; i < variables.length; i++) {
        vars.push(new Variable(variables[i].name, variables[i].domain, variables[i].subject, variables[i].section, variables[i].duration, variables[i].capacity, variables[i].weight));
        vars[i].id = parseInt(i);
    }

    // Add Binary Constraints
    // Ensure that classes don't occur twice in a day.
    var constraints = [], classes, people, weight, i, j, k;
    for (i = 0; i < vars.length - 1; i++) {
        classes = [vars[i]];
        for (; i < vars.length && vars[i + 1].classInfo.section == vars[i].classInfo.section; classes.push(vars[++i])) {}
        for (j = 0; j < classes.length; j++) {
            for (k = j + 1; k < classes.length; k++) {
                constraints.push(new BinaryConstraint(classes[j].name + " --DIFFERENT DAY THAN-- " + classes[k].name, classes[j], classes[k], differentDayConstraint, classes[j].weight * classes[k].weight * 1e-4));
            }
        }
    }
    // Ensure that classes don't force people into two places at once.
    for (i = 0; i < vars.length; i++) {
        for (j = i + 1; j < vars.length; j++) {
            people = peopleInBoth(vars[i], vars[j]);
            if (people.length > 0) {
                weight = vars[i].weight * vars[j].weight;
                for (var person = 0; person < people.length; person++) {
                    weight *= people[person].weight;
                }
                constraints.push(new BinaryConstraint(vars[i].name + " --/-- " + vars[j].name, vars[i], vars[j], differentConstraint, weight));
            }
        }
    }
    // Add Day Constraints
    for (var i = 0; i < vars.length; i++) {
        constraints.push(new UnaryConstraint(vars[i].name + " Day Constraint", vars[i], dayConstraint, 1));
    }
    constraints = getBothDirections(constraints);

    csp = new CSP(vars, constraints);
    csp.initUnassociatedConstraints();
    unaryConsistency(csp);

    /*********/
    csp.maintainArcConsistency = false;
    csp.mostConstrainedVariable = false;
    /*********/
}

//document.getElementById("classes").innerHTML = "IL5 Studio: STUDIO 0.9 1 2 3 1000000000\nIL6 Studio: STUDIO 0.9 1 2 3 1000000000\nMS Math: MATH 0.9 1 3 1 20\nPre-Algebra: MATH 0.9 2 1 2 20\nMath I: MATH 0.9 2 1 2 20\nMath II: MATH 0.9 2 1 2 20\nMath III: MATH 0.9 1 2 2 20\nCalculus: MATH 0.9 1 2 2 20\nMS English: ENGLISH 0.5 3 2 2 20\nUS English: ENGLISH 0.5 2 2 2 20\nGeography: HISTORY 0.5 3 2 2 20\nUS History: HISTORY 0.5 2 2 2 20\nInt Science: SCIENCE 0.5 3 2 2 20\nBiology: SCIENCE 0.5 1 2 2 20\nAdv Biology: SCIENCE 0.5 1 2 2 15\nPhysics: SCIENCE 0.5 1 2 2 20\nCS I: COMPUTER-SCIENCE 0.9 2 1 1 20\nCS II: COMPUTER-SCIENCE 0.9 3 1 1 20\nJava I: COMPUTER-SCIENCE 0.9 1 2 2 20\nJava II: COMPUTER-SCIENCE 0.9 1 2 2 20\nArt I: ART 0.95 6 1 1 20\nArt II: ART 0.95 1 1 1 20\nSpanish I: WORLD-LANGUAGE 0.9 1 2 2 20\nSpanish II: WORLD-LANGUAGE 0.9 1 2 2 20\nSpanish III: WORLD-LANGUAGE 0.9 1 2 2 20\nSpanish IV: WORLD-LANGUAGE 0.9 1 2 2 20\nOW: OUTER-WELLNESS 0.9 7 1 1 25";
//document.getElementById("teachers").innerHTML = "Tristen Chang 0.1 0\nJohn Lubushkin 0.1 1\nMarcy Conn 0.1 2,3,3,4,4,5,5,6,7\nBrett Ramsay 0.1 8,8,8,9,9\nDerek Vanderpool 0.1 10,10,10,11,11\nMegan Burns 0.1 12,12,12,13,14\nDenise Gurer 0.1 15,16,16,17,17,17,18,19\nSaloni Kalkat 0.1 20,20,20,20,20,20,21\nRaquel Garrido-Rubalcaba 0.1 22,23,24,25\nDevin Harris 0.1 26,26,26,26,26,26,26";
//document.getElementById("students").innerHTML = "Timothy Chien IL5 0.9 0,10,11,20,14,18,8,5,26\nKabir Goklani IL5 0.9 0,10,20,4,12,23,8,26,17\nAdrian Panezic IL5 0.9 0,12,20,3,26,8,10,17\nPeter Watson IL5 0.9 0,8,3,20,17,12,10,26\nJasper Johnson IL5 0.9 0,8,20,3,26,12,10,16\nMegan Chien IL5 0.9 0,8,12,3,10,20,26,17\nSoren Williams IL5 0.9 0,10,3,20,17,12,8,26\nBharat Saiju IL5 0.9 0,11,6,14,9,20,26,18\nMary Beeler IL5 0.9 0,10,20,4,12,8,26,17\nJANE BEELER IL6 0.9 1,13,9,6,26,11,21,17\nDILAN KUDVA IL6 0.9 1,13,11,6,9,22,26,17\nLAKER NEWHOUSE IL6 0.9 1,9,19,22,14,11,26\nMARIA MAHERAS IL6 0.9 1,13,9,26,11,5,21,17\nISABELLA TANEJA IL6 0.9 1,13,9,17,11,5,21,26\nNICHOLAS VERZIC IL6 0.9 1,15,11,19,26,9,7\nCALEB CHOI IL6 0.9 1,9,19,22,14,11,7,26\nABHINAV VEDATI IL6 0.9 1,15,9,6,26,11,19\nSOHM DUBEY IL6 0.9 1,11,19,22,14,9,26,5,20\nANJELI MAYORAZ IL6 0.9 1,15,9,26,18,11,20,5\nNIKHIL GARGEYA IL6 0.9 1,15,9,19,26,11,23,20,7\nARJUN CHOPRA IL6 0.9 1,15,9,6,26,18,11,23,20\nMeghna Chopra IL5 0.9 0,10,3,20,16,26,12,8\nARUNA GUABA IL6 0.9 1,11,15,9,20,22,26,5\nANGELICA ZHUANG IL6 0.9 1,13,11,26,9,5,21,18\nKATARINA FALLON IL6 0.9 1,15,9,17,11,5,21,26\nSOPHIE FAN IL6 0.9 1,9,6,14,18,11,26,23\nROBERT BELIVEAU IL6 0.9 1,13,11,19,26,9,5\nSIMON CAPPER IL6 0.9 1,13,11,26,9,5,16,20\nTRISTAN PERRY IL6 0.9 1,9,14,11,20,7,26,17\nVIVEK SUNKAM IL6 0.9 1,9,19,22,14,11,7,26\nSHIRA SHEPPARD IL6 0.9 1,15,11,17,9,20,22,26,5\nVIVEK PUNN IL6 0.9 1,11,14,9,5,16,26,20\nMARGOT HALL IL6 0.9 1,15,11,17,9,20,22,26,5\nERIC COHAN IL6 0.9 1,13,9,6,26,11,20\nETHAN CHANG IL6 0.9 1,13,9,26,11,20,5,16\nAARON KWOK IL6 0.9 1,15,11,16,26,9,20,5\nMILLER DAYTON IL6 0.9 1,13,9,16,26,11,20,5\nSarah Fernandes IL5 0.9 0,10,4,26,12,8,16\nMISHAL JUNAID IL6 0.9 1,13,11,4,9,26,21,17\nAlisha Junaid IL5 0.9 0,8,12,3,10,26,20,17\nAmeera Hoodbhoy IL5 0.9 0,8,3,12,10,26,17,20\nJay Bhan IL5 0.9 0,10,26,12,8,5,20,17\nParinita Thapliyal IL5 0.9 0,10,2,12,8,16,26\nMatthias Fallon IL5 0.9 0,10,12,3,8,26,20\nEdan Cho IL5 0.9 0,12,17,26,10,8,5\nAryan Prodduturri IL5 0.9 0,13,9,26,18,5,11,20\nKepler Boyce IL5 0.9 0,15,9,10,26,19,20,7\nJay Warrier IL5 0.9 0,8,12,19,4,26,10,20\nMadeline Wang IL5 0.9 0,12,3,8,26,10,20,17\nPranav Tatavarti IL5 0.9 0,10,12,4,26,8,17,20\nLeia MacAskill IL5 0.9 0,8,2,17,26,12,10,20\nLogan MacAskill IL5 0.9 0,10,3,19,12,26,8,20\nAvril Cierniak IL5 0.9 0,15,20,26,18,10,8,5\nAmartya Iyer IL5 0.9 0,26,18,12,10,8,5\nPARTH IYER IL6 0.9 1,15,11,19,9,26,7\nNeil Devnani IL5 0.9 0,13,26,9,10,5,20,17\nGurshan Jolly IL5 0.9 0,8,12,4,26,10,20,17\nStella Petzova IL5 0.9 0,8,16,12,10,20,26\nHolly Thompson IL5 0.9 0,10,3,16,20,26,12,8\nLeo Spalter IL5 0.9 0,8,26,12,10,16\nAvani Sundaresan IL5 0.9 0,10,16,26,12,20,8\nCharles Kunz IL5 0.9 0,3,12,8,26,10,17,20\nMeher Halder IL5 0.9 0,10,20,3,26,12,8,16\nAthena Cho IL5 0.9 0,8,3,16,26,12,20,10\nSita Vemuri IL5 0.9 0,12,2,16,26,8,10,20\nSharanya Nemane IL5 0.9 0,3,20,17,12,8,10,26\nEegan Ram IL5 0.9 0,10,16,26,8,5,20\nRenn Blanco IL5 0.9 0,10,2,16,26,12,20,8\nVarin Sikka IL5 0.9 0,8,2,16,26,12,10,20\nAdarsh Krishnan IL5 0.9 0,10,12,26,8,5,20,17\nIshansh Kwatra IL5 0.9 0,8,20,4,12,26,10,17\nSophia DeMedeiros IL5 0.9 0,2,17,12,8,10,26,20";
//document.getElementById("days").value = "5";
//document.getElementById("blocks").value = "7";

function createRemoveButton() {
	var bt = document.createElement('button');
	var i = document.createElement('i');
	i.classList.add('fas');
	i.classList.add('fa-trash');
	bt.appendChild(i);
	bt.classList.add('remove');
	bt.onclick = function(e) {
		this.parentElement.parentElement.removeChild(this.parentElement);
	}
	return bt;
}

initScrolling();

[...document.getElementsByClassName('classes-fields')].forEach(function(v) { v.onkeydown = function(evt) {
	if(evt.keyCode === 13) {
		evt.preventDefault();
		var fields = [...document.getElementsByClassName('classes-fields')];
		if(fields[0].value.length === 0) {
			return;
		}
		var line = fields[0].value + ':';
		for(var i=1;i<fields.length;i++){
			if(fields[i].value.length === 0) { return; }
			line += ' ' + fields[i].value;
		}
		var li = document.createElement('li');
		var h1 = document.createElement('h1');
		var bt = createRemoveButton();
		h1.innerHTML = line;
		li.appendChild(h1);
		li.appendChild(bt);
		document.getElementById('classes-list').appendChild(li);
	}
}});
[...document.getElementsByClassName('teachers-fields')].forEach(function(v) { v.onkeydown = function(evt) {
	if(evt.keyCode === 13) {
		evt.preventDefault();
		var fields = [...document.getElementsByClassName('teachers-fields')];
		for(var i=0;i<fields.length;i++) {
			if(fields[i].value.length === 0) { return; }
		}
		var line = fields.map(function(v) {
			return v.value;
		}).join(' ');
		var li = document.createElement('li');
		var h1 = document.createElement('h1');
		var bt = createRemoveButton();
		h1.innerHTML = line;
		li.appendChild(h1);
		li.appendChild(bt);
		document.getElementById('teachers-list').appendChild(li);
	}
}});
[...document.getElementsByClassName('students-fields')].forEach(function(v) { v.onkeydown = function(evt) {
	if(evt.keyCode === 13) {
		evt.preventDefault();
		var fields = [...document.getElementsByClassName('students-fields')];
		for(var i=0;i<fields.length;i++) {
			if(fields[i].value.length === 0) { return; }
		}
		var line = fields.map(function(v) {
			return v.value;
		}).join(' ');
		var li = document.createElement('li');
		var h1 = document.createElement('h1');
		var bt = createRemoveButton();
		h1.innerHTML = line;
		li.appendChild(h1);
		li.appendChild(bt);
		document.getElementById('students-list').appendChild(li);
	}
}});
[...document.getElementsByClassName('remove')].forEach(function(v) { v.onclick = function(evt) {
	this.parentElement.parentElement.removeChild(this.parentElement);
}});
initCSP();
