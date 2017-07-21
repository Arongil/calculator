var LMath = {
  derivativeMargin: 1e-10,
  error:    1e-14,
  PI:       3.1415926535897932, // pi
  RECPI:    0.3183098861837907, // 1/pi
  TAU:      6.2831853071795864, // tau
  RECTAU:   0.1591549430918953, // 1/tau
  E:        2.7182818284590452, // e
  RECE:     0.3678794411714423, // 1/e
  LN2:      0.6931471805599453, // ln(2)
  SQRT2:    1.4142135623730951, // sqrt(2)
  RECSQRT2: 0.7071067811865476, // 1/sqrt(2)
  abs: function(x) {
    if (x < 0) {
      return -x;
    }
    return x;
  },
  floor: function(x) {
    if (x < 0) {
      return -LMath.floor(-x) - 1;
    }
    
    return x | 0;
  },
  ceil: function(x) {
    return LMath.floor(x + 1 - LMath.error);
  },
  round: function(x) {
    return LMath.floor(x + 0.5);
  },
  isInt: function(x) {
    if (x == LMath.floor(x)) {
      return true;
    }
    return false;
  },
  intPower: function(b, exponent) {
    if (LMath.isInt(exponent) == false) {
      throw("TYPE ERROR: intPower only takes integer exponents.");
    }
    
    var base = 1;
    
    for (var i = 0; i < exponent; i++) {
      base *= b;
    }
    return base;
  },
  factorial: function(x) {
    if (x == 0 || x == 1) {
      return 1;
    }
    
    var fact = 1;
    for (var i = 2; i < x + 1; i++) {
      fact *= i;
    }
    return fact;
  },
  derivativeApproximation: function(f, x, fx) {
    if (fx === undefined) {
      fx = f(x);
    }
    return (f(x + LMath.derivativeMargin) - fx) / LMath.derivativeMargin;
  },
  newtonianApproximation: function (f, guess) {
    if (guess === undefined) {
      guess = 1;
    }
    var adjust, fguess;
    do {
      fguess = f(guess);
      adjust = fguess / LMath.derivativeApproximation(f, guess, fguess);
      guess = guess - adjust;
    } while(LMath.abs(adjust) > LMath.error);
    
    return guess;
  },
  ln: function(x) {
    if (x < 1) {
      return -LMath.ln(1 / x);
    }
    
    // ln(x) = ln(reduced * 2^powsOf2) = ln(reduced) + ln(2^powsOf2) = ln(reduced) + powsOf2*ln(2);
    var reduced = x, powsOf2 = 0;
    while (reduced > 2) {
      reduced *= 0.5;
      powsOf2++;
    }
    
    // https://stackoverflow.com/questions/22706077/given-the-exp-function-how-to-implement-the-ln-function, answer by Nikunj Banka. We do a binary search for the correct value of the ln.
    var low = 0, high = reduced, mid, val;
    while (true) {
      mid = (low + high) * 0.5;
      val = LMath.exp(mid);
      if (val > reduced) {
        // Too high, reduce guess (mid) by lowering high.
        high = mid;
      }
      if (val < reduced) {
        // Too low, bolster guess (mid) by increasing low.
        low = mid;
      }
      if (LMath.abs(val - reduced) < LMath.error) {
        return mid + powsOf2 * LMath.LN2;
      }
    }
  },
  exp: function(x) {
    // Reduce x to a range of 0 to e, because the Taylor series for e to the x converges most quickly near 0.
    var reduced = x - LMath.floor(x), powsOfE = x - reduced;
    
    var guess = 0, i = 0, adjust = 1;
    do {
      i++;
      guess += adjust;
      // Multiply by x/i to get the next term in the series.
      adjust *= reduced / i;
    } while(LMath.abs(adjust) > LMath.error);
    return guess * LMath.intPower(Math.E, powsOfE);
  },
  pow: function(x, n) {
    // https://en.wikipedia.org/wiki/Methods_of_computing_square_roots#Exponential_identity
    return LMath.exp(LMath.ln(x) * n);
  },
  sqrt: function(x) {
    return LMath.pow(x, 0.5);
  },
  sin: function(x) {
    var reduced = x - LMath.floor(x * LMath.RECTAU) * LMath.TAU;
    
    var guess = 0, i = 0, adjust = reduced;
    do {
      i += 2;
      guess += adjust;
      // Multiply by x/i to get the next term in the series.
      adjust *= -(reduced*reduced) / (i*(i + 1));
    } while(LMath.abs(adjust) > LMath.error);
    return guess;
  },
  cos: function(x) {
    return LMath.sin(x + LMath.PI*0.5);
  },
  tan: function(x) {
    var sin = LMath.sin(x), cos = LMath.cos(x);
    if (cos == 0) {
      return undefined;
    }
    
    return sin / cos;
  },
  csc: function(x) {
    var sin = LMath.sin(x);
    if (sin == 0) {
      return undefined;
    }
    
    return 1 / sin;
  },
  sec: function(x) {
    var cos = LMath.cos(x);
    if (cos == 0) {
      return undefined;
    }
    
    return 1 / cos;
  },
  cot: function(x) {
    var sin = LMath.sin(x), cos = LMath.cos(x);
    if (sin == 0) {
      return undefined;
    }
    
    return cos / sin;
  },
  asin: function(x) {
    if (LMath.abs(x) > 1) {
      throw("DOMAIN ERROR: arcsin's domain is -1 to 1. The input passed in was out of its domain.");
    }
    var number = x;
    return LMath.newtonianApproximation(function(input) {
      return number - LMath.sin(input);
    }, 0);
  },
  acos: function(x) {
  },
  atan: function(x) {
  },
  atan2: function(y, x) {
  },
};

/***

BENCHMARKS

For iterating 100000 (1e6) times, calculating the function on a random value of the specified range each time.

LMath.floor(x)  [0<x<1e10] takes 425.320  milliseconds
Math.floor(x)   [0<x<1e10] takes 426.530  milliseconds

LMath.ln(x)     [0<x<1e10] takes 2578.095 milliseconds
Math.log(x)     [0<x<1e10] takes 415.099  milliseconds

LMath.exp(x)     [0<x<1e2] takes 2510.22  milliseconds
Math.exp(x)      [0<x<1e2] takes 457.975  milliseconds

LMath.sqrt(x)   [0<x<1e10] takes 5973.49  milliseconds    (about)
Math.sqrt(x)    [0<x<1e10] takes 467.329  milliseconds

LMath.sin(x)     [0<x<1e5] takes 932.155  milliseconds
Math.sin(x)      [0<x<1e5] takes 457.975  milliseconds

***/

var LMathAttributes = [
  {"name": "derivativeMargin", "description": "h in the limit definition of a derivative: (f(x + h) - f(x))/h"},
  {"name": "error", "description": "A guaranteed precision for results."},
  {"name": "PI", "description": "pi = 3.14159..."},
  {"name": "RECPI", "description": "1 / pi = 0.31830..."},
  {"name": "TAU", "description": "tau = 2*pi = 6.28318..."},
  {"name": "RECTAU", "description": "1 / tau = 0.15915..."},
  {"name": "E", "description": "e = 2.71828..."},
  {"name": "RECE", "description": "1/e = 0.36787..."},
  {"name": "LN2", "description": "The natural log of 2 = ln(2) = 0.69314..."},
  {"name": "SQRT2", "description": "The square root of 2 = sqrt(2) = 1.41421..."},
  {"name": "RECSQRT2", "description": "1 / sqrt(2) = 0.70710..."},
  {"name": "abs", "description": "The absolute value function returns x made positive: if the x is negative then return -x to make it positive, and if x is positive, then return it."},
  {"name": "floor", "description": "The floor function returns the greatest integer below x. floor(4.9) = 4, floor(2) = 2, floor(-3.1) = -4, and floor(123.456) = 123."},
  {"name": "ceil", "description": "The ceil function return the smallest integer above x. ceil(4.1) = 5, ceil(1) = 1, and ceil(-2.2) = -2."},
  {"name": "round", "description": "The round function returns x rounded to the nearest integer. round(9.2) = 9, round(1.5) = 2, and round(-2.8) = -3."},
  {"name": "isInt", "description": "The is integer function returns true if x is an integer and false if x isn't. x is an integer if x == floor(x)."},
  {"name": "intPower", "description": "The integer power function returns a base to the power of an integer exponent. intPower(2, 3) = 8 and intPower(2, 2.1) will throw an error because 2.1 is a float."},
  {"name": "factorial", "description": "The factorial function returns x!, or (x) * (x-1) * (x-2) * ... 3 * 2 * 1. factorial(4) = 4*3*2*1 = 24."},
  {"name": "derivativeApproximation", "description": "The derivative approximation function returns the approximate value of the first derivative of function f at x. derivativeApproximation(function() { return x*x; }, 5) will be about 10."},
  {"name": "newtonianApproximation", "description": "The newtonian root approximation function returns the approximate value of a root of a function f using a guess passed in as a first estimate."},
  {"name": "ln", "description": "The natural log function returns the natural log of x by binary searching for it with exp(reduced) and x as the guess and goal, respectively. Reduced is calculated to lower the input-range using the log property log(2^n * reduced) = n*log(2) + log(reduced), given 2^n * reduced = x."},
  {"name": "exp", "description": "The exponential function returns e to the x by calculating Taylor polynomials to the desired accuracy on a reduced input. Reduced is calculated to lower the input-range to 0-e using exponent properties. exp(x) then returns exp(reduced) * intPower(E, powersOfEDivided)."},
  {"name": "pow", "description": "The power function returns the base to the power of the exponent using the property that x^n = exp(n * ln(x))."},
  {"name": "sqrt", "description": "The square root function returns the square root of x: pow(x, 0.5). sqrt(4) = 2, sqrt(81) = 9, and sqrt(2) = 1.41421..."},
  {"name": "sin", "description": "The sine function returns the sine of x by calculating Taylor polynomials to the desired accuracy on an input reduced to the range of 0-2pi."},
  {"name": "cos", "description": "The cosine function returns the cosine of x, or sin(x + 0.5*pi)."},
  {"name": "tan", "description": "The tangent function returns the tangent of x, or sin(x)/cos(x)."},
  {"name": "csc", "description": "The cosecant function returns the cosecant of x, or 1 / sin(x)."},
  {"name": "sec", "description": "The secant function returns the secant of x, or 1 / cos(x)."},
  {"name": "cot", "description": "The cotangent function returns the cotangent of x, or cos(x)/sin(x)."},
  {"name": "asin", "description": ""},
  {"name": "acos", "description": ""},
  {"name": "atan", "description": ""},
  {"name": "atan2", "description": ""},
];
