function hexToRgb(hex) {
    var result = [ hex[1] + hex[2], hex[3] + hex[4], hex[5] + hex[6] ];
    return {
        r: parseInt(result[0], 16),
        g: parseInt(result[1], 16),
        b: parseInt(result[2], 16)
    };
}

function componentToHex(c) {
    if (c > 255) {
        return "ff";
    }
    var hex = Math.floor(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
