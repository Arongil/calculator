// Assume that the standard basis refers to the polynomials: 1, x, ..., x^n.

// Set dimension of the polynomial subspace on to which we project the function.
// This is also the degree of the final approximation plus one.
var dimension = 8;
// Set the number of steps the numeric integration performs.
// This makes the final approximation more accurate.
var steps = 1e3;
// Set the bounds in which the approximation will be valid.
// These are also the bounds of integration for the inner product.
var lowerBound = -1,
    upperBound = 1;

class Vector {

  constructor(coordinates) {
    this.coordinates = coordinates;
  }

  toString(precision = 0) {
    var string, i;
    if (precision == 0) {
      string = "(";
      for (i = 0; i < this.coordinates.length - 1; i++) {
        string += this.coordinates[i] + ", ";
      }
      return string + this.coordinates[this.coordinates.length - 1] + ")";
    }
    else {
      string = "";
      for (i = 0; i < this.coordinates.length; i++) {
        string += this.coordinates[i].toFixed(precision) + "x^{" + i + "}";
        if (i < this.coordinates.length - 1) {
          string += " + ";
        }
      }
      return string;
    }
  }
  
  clone() {
    return new Vector(this.coordinates.slice());
  }

  magSquared() {
    var p = polynomial(this.coordinates);
    return inner(p, p);
  }

  getNormalized() {
    return this.getScaled(1 / (this.magSquared() ** 0.5));
  }

  toPolynomial() {
    return polynomial(this.coordinates);
  }

  add(other) {
    for (var i = 0; i < this.coordinates.length; i++) {
      this.coordinates[i] += other.coordinates[i];
    }
  }
  getAdded(other) {
    var vector = this.clone(), i;
    for (i = 0; i < vector.coordinates.length; i++) {
      vector.coordinates[i] += other.coordinates[i];
    }
    return vector;
  }

  scale(c) {
    for (var i = 0; i < this.coordinates.length; i++) {
      this.coordinates[i] *= c;
    }
  }
  getScaled(c) {
    var vector = this.clone(), i;
    for (i = 0; i < vector.coordinates.length; i++) {
      vector.coordinates[i] *= c;
    }
    return vector;
  }
  
}

function polynomial(coordinates) {
  return (x) => {
    var total = 0, i;
    for (i = 0; i < coordinates.length; i++) {
      total += coordinates[i] * Math.pow(x, i);
    }
    return total;
  };
}

function integral(low, high, f) {
  var total = 0, i;
  for (i = 0; i < steps; i++) {
    total += f( (high-low) * i/steps + low );
  }
  return total / steps;
}

function inner(p, q) {
  return integral(lowerBound, upperBound, (x) => p(x)*q(x));
}

function vectorInner(vec1, vec2) {
  return inner(vec1.toPolynomial(), vec2.toPolynomial());
}

function getStandardBasis() {
  var basis = [], vector, i, j;
  for (i = 0; i < dimension; i++) {
    vector = [];
    for (j = 0; j < dimension; j++) {
      vector.push(i == j ? 1 : 0);
    }
    basis.push(new Vector(vector));
  }
  return basis;
}

function orthonormalize(basis) {
  // Apply the Gram-Schmidt Procedure to the given basis.
  var orth = [basis[0].getNormalized()], vector, vectorCopy, i, j;
  for (i = 1; i < basis.length; i++) {
    vector = basis[i].clone();
    vectorCopy = vector.clone();
    for (j = 0; j < i; j++) {
      vector.add(orth[j].getScaled( -vectorInner(vectorCopy, orth[j]) ));
    }
    orth.push(vector.getNormalized());
  }
  return orth;
}

function proj(f, orth) {
  var empty = [], i;
  for (i = 0; i < dimension; i++) {
    empty.push(0);
  }
  var v = new Vector(empty);
  for (i = 0; i < dimension; i++) {
    v.add(orth[i].getScaled( inner(f, orth[i].toPolynomial()) ));
  }
  return v;
}

function approximate(functionString) {
  steps = parseInt(get("steps").value);
  dimension = parseInt(get("dimension").value);
  lowerBound = parseInt(get("lowerBound").value);
  upperBound = parseInt(get("upperBound").value);
  var orth;
  if (dimension > 40 || lowerBound != -1 || upperBound != 1) {
    alert("Warning: custom approximations with degree greater than 40 take several minutes to compute. If the degree is greater than 100, you might want to close then reopen the tab.");
    orth = orthonormalize(getStandardBasis());
  }
  else {
    orth = orth40;
  }
  eval("var f = (x) => { " + (functionString.indexOf("return") == -1 ? "return " + functionString : functionString) + " };");
  var p = proj(f, orth);
  get("approximation").textContent = p.toString( parseInt(get("digits").value) );
}
