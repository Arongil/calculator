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
    
    var floored = 0, approx = 1;
    while (approx*10 < x) {
      approx *= 10;
    }
    while (floored + 1 <= x) {
      while (floored + approx <= x) {
        floored += approx;
      }
      approx *= 0.1;
    }
    
    return floored;
  },
  ceil: function(x) {
    return LMath.floor(x) + 1;
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
      throw("ERROR: intPower only takes integer exponents.");
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
  derivativeApproximation: function(f, x) {
    return (f(x + LMath.derivativeMargin) - f(x)) / LMath.derivativeMargin;
  },
  newtonianApproximation: function (f, guess) {
    var adjust;
    do {
      adjust = f(guess) / LMath.derivativeApproximation(f, guess);
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
    while (reduced > 4) {
      reduced /= 2;
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
};
