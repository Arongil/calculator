function isOperation(char) {
  if (char == "(" ||
      char == ")" ||
      char == "^" ||
      char == "*" ||
      char == "/" ||
      char == "+" ||
      char == "-") {
    return true;
  }
  
  return false;
}

function isFunction(char) {
  if (char == "ln"||
      char == "sqrt"||
      char == "sin" ||
      char == "cos" ||
      char == "tan" ||
      char == "csc" ||
      char == "sec" ||
      char == "cot" ||
      char == "asin"||
      char == "acos"||
      char == "atan") {
    return true;
  }
  
  return false;
}

function isConstant(char) {
  if (char == "pi" ||
      char == "e") {
    return true;
  }
  
  return false;
}

function organizeInput(equationInput) {
  // Take equationInput from a string to an array with each element a number, parenthesis, function, or operator.
  var equation = [equationInput.charAt(0)], char, prevChar, spaceCount = 0;
  for (var i = 1; i < equationInput.length; i++) {
    char = equationInput.charAt(i);
    prevChar = equationInput.charAt(i - 1 - spaceCount);
    if (char != " ") {
      spaceCount = 0;
      // Recombine every character that isn't an operation, so long as it can recombine.
      if (isOperation(char) || isOperation(prevChar)) {
        equation.push(char);
      }
      else {
        equation[equation.length - 1] += char;
      }
    }
    else {
      // spaceCount counts the spaces between char and the previous char, not the previous space.
      spaceCount++;
    }
  }
  
  return equation;
}

function findNextParenthesisPair(equation, lastCloserIndex) {
  var opener, closer, parenCount;
  for (var i = lastCloserIndex + 1; i < equation.length; i++) {
    if (equation[i] == "(") {
      opener = i;
      // parenCount is increased with every opener parenthesis within the first opener and decreased for every closer parenthesis within the first opener. When parenCount = 0, the true closer, on the correct level, has been found.
      parenCount = 1;
      for (var j = i + 1; j < equation.length; j++) {
        if (equation[j] == "(") {
          parenCount++;
        }
        if (equation[j] == ")") {
          parenCount--;
        }
        
        if (parenCount == 0) {
          closer = j;
          return {"opener": opener, "closer": closer};
        }
      }
    }
  }
  
  return false;
}

function replaceConstant(constant, index) {
  if (constant == "pi") {
    equation.splice(index, 1, LMath.PI);
  }
  else if (constant == "e") {
    equation.splice(index, 1, LMath.E);
  }
}

function operateFunction(equation, index) {
  var func = equation[index];
  var input = parseFloat(equation[index + 1]);
  
  if (func == "ln") {
    equation.splice(index, 2, LMath.ln(input).toString());
  }
  else if (func == "sqrt") {
    equation.splice(index, 2, LMath.sqrt(input).toString());
  }
  else if (func == "sin") {
    equation.splice(index, 2, LMath.sin(input).toString());
  }
  else if (func == "cos") {
    equation.splice(index, 2, LMath.cos(input).toString());
  }
  else if (func == "tan") {
    equation.splice(index, 2, LMath.tan(input).toString());
  }
  else if (func == "csc") {
    equation.splice(index, 2, LMath.csc(input).toString());
  }
  else if (func == "sec") {
    equation.splice(index, 2, LMath.sec(input).toString());
  }
  else if (func == "cot") {
    equation.splice(index, 2, LMath.cot(input).toString());
  }
  else if (func == "asin") {
    equation.splice(index, 2, LMath.asin(input).toString());
  }
  else if (func == "acos") {
    equation.splice(index, 2, LMath.acos(input).toString());
  }
  else if (func == "atan") {
    equation.splice(index, 2, LMath.atan(input).toString());
  }
}

function operate(equation, index) {
  var a = parseFloat(equation[index - 1]);
  var b = parseFloat(equation[index + 1]);
  var operation = equation[index];
  if (operation == "^") {
    equation.splice(index - 1, 3, LMath.pow(a, b).toString());
  }
  if (operation == "*") {
    equation.splice(index - 1, 3, (a * b).toString());
  }
  if (operation == "/") {
    equation.splice(index - 1, 3, (a / b).toString());
  }
  if (operation == "+") {
    equation.splice(index - 1, 3, (a + b).toString());
  }
  if (operation == "-") {
    equation.splice(index - 1, 3, (a - b).toString());
  }
}

function calculate(equationInput) {
  // Recurse through the equation via parentheses, doing operation by operation, compressing it until only one value, the answer, remains.
  // Organize the input first. Set in an array and remove spaces.
  var equation = equationInput;
  if (typeof equationInput === "string") {
    // If equationInput isn't a string, its presumed to be already formatted.
    equation = organizeInput(equationInput);
  }
  // PEMDAS: Parentheses, then exponentiation, then multiplication and division, then addition and subtraction.
  // First up, parentheses. For each opener parenthesis, find its closer and set the contained math within them equal to calculate(contained);
  var lastCloserIndex = -1, nextParentheses, contained;
  while (true) {
    nextParentheses = findNextParenthesisPair(equation, lastCloserIndex);
    if (nextParentheses == false) {
      break;
    }
    
    // Copy and calculate contained math.
    contained = [];
    for (var i = nextParentheses.opener + 1; i < nextParentheses.closer; i++) {
      contained.push(equation[i]);
    }
    contained = calculate(contained);
    equation.splice(nextParentheses.opener, nextParentheses.closer - nextParentheses.opener + 1, contained);
    
    // End with the opener because the parentheses will be evaluated and compressed to length 1, rendering nextParentheses.closer too far ahead. closer - (closer - opener) = new closer.
    lastCloserIndex = nextParentheses.opener;
  }
  // Constants
  for (var i = 0; i < equation.length; i++) {
    if (isConstant(equation[i])) {
      replaceConstant(equation[i], i);
    }
  }
  // Functions
  for (var i = 0; i < equation.length; i++) {
    if (isFunction(equation[i])) {
      operateFunction(equation, i);
    }
  }
  // Exponents
  for (var i = 0; i < equation.length; i++) {
    if (equation[i] == "^") {
      operate(equation, i);
      // Compressed so compensate i.
      i--;
    }
  }
  // Multiplication and Division
  for (var i = 0; i < equation.length; i++) {
    if (equation[i] == "*") {
      operate(equation, i);
      // Compressed so compensate i.
      i--;
    }
    if (equation[i] == "/") {
      operate(equation, i);
      // Compressed so compensate i.
      i--;
    }
  }
  // Addition and Subtraction
  for (var i = 0; i < equation.length; i++) {
    if (equation[i] == "+") {
      operate(equation, i);
      // Compressed so compensate i.
      i--;
    }
    if (equation[i] == "-") {
      operate(equation, i);
      // Compressed so compensate i.
      i--;
    }
  }
  
  if (equation.length == 1) {
    return equation[0];
  }
  
  return equation;
}

function outputAnswer(equationInputId, outputId) {
  var output = document.getElementById(outputId);
  var equationInput = document.getElementById(equationInputId).value;
  output.textContent = equationInput + " = " + calculate(equationInput);
}
