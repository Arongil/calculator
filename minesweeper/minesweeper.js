var canvas, ctx;
var WIDTH, HEIGHT, HALFWIDTH, HALFHEIGHT;

var pi = Math.PI;

var start, doStroke;

var GC;

var InputFlags = {
  "click": false,
  "mousebutton": 0,
  "mousepos": {
    "x": 0,
    "y": 99999
  }
};

function GameTile(row, col, value, workingValue) { // workingValue is optional
  this.row = row;
  this.col = col;
  this.value = value; // this.value is what one would see on the tile, be it 0, 1, 2, 3, a question mark, or a flag.
  
  this.clone = function() {
    return new GameTile(this.row, this.col, this.value);
  }
}

function GameMinefield(map, n) {
  /***
        ? => unknown
        number => how many surrounding mines
        x => mine
  ***/
  this.minefield = map;
  this.n = n;
  
  this.clone = function() {
    var clonedMinefield = [], row, col;
    for (row = 0; row < this.minefield.length; row++) {
      clonedMinefield.push([]);
      for (col = 0; col < this.minefield[row].length; col++) {
        clonedMinefield[row].push(this.getTile(row, col));
      }
    }
    return new GameMinefield(clonedMinefield, this.n);
  };
  
  // Make a getUnknownTiles() function and a getNumericTiles() function?
  this.getTile = function(row, col) {
    return this.minefield[row][col].clone();
  };
  this.getUnclonedTile = function(row, col) {
    return this.minefield[row][col];
  };
  this.getTiles = function() {
    var tiles = [], row, col;
    for (row = 0; row < this.minefield.length; row++) {
      for (col = 0; col < this.minefield[row].length; col++) {
        tiles.push(this.getTile(row, col));
      }
    }
    return tiles;
  };
  this.getUnclonedTiles = function() {
    var tiles = [], row, col;
    for (row = 0; row < this.minefield.length; row++) {
      for (col = 0; col < this.minefield[row].length; col++) {
        tiles.push(this.getUnclonedTile(row, col));
      }
    }
    return tiles;
  };
  this.getTilesSurrounding = function(tile) {
    var tiles = [], i, j;
    for (i = tile.row - 1; i <= tile.row + 1; i++) {
      for (j = tile.col - 1; j <= tile.col + 1; j++) {
        if ((i == tile.row && j == tile.col) || i < 0 || i > this.minefield.length-1 || j < 0 || j > this.minefield[i].length-1) { continue; }
        tiles.push(this.getTile(i, j));
      }
    }
    return tiles;
  };
  this.getUnclonedTilesSurrounding = function(tile) {
    var tiles = [], i, j;
    for (i = tile.row - 1; i <= tile.row + 1; i++) {
      for (j = tile.col - 1; j <= tile.col + 1; j++) {
        if ((i == tile.row && j == tile.col) || i < 0 || i > this.minefield.length-1 || j < 0 || j > this.minefield[i].length-1) { continue; }
        tiles.push(this.getUnclonedTile(i, j));
      }
    }
    return tiles;
  };
  this.set = function(tile) {
    this.minefield[tile.row][tile.col] = tile;
  };
}

var GameController = (function() {
  
  function GameController() {
    this.n = 80; // how many mines
    this.minefield = new GameMinefield([], this.n);
    this.playerView = new GameMinefield([], this.n);
    this.width = 25;
    this.height = this.width * 3/5;
    this.blockSize = 1/(this.width) * WIDTH;
    
    this.solved = false;
  }
  
  GameController.prototype.initMinefield = function() {
    var row, col;
    for (row = 0; row < this.height; row++) {
      this.minefield.minefield.push([]);
      this.playerView.minefield.push([]);
      for (col = 0; col < this.width; col++) {
        this.minefield.minefield[row].push(new GameTile(row, col, "?"));
        this.playerView.minefield[row].push(new GameTile(row, col, "?"));
      }
    }
    
    var minesPlaced = 0, row, col;
    while (minesPlaced <= this.n) {
      row = Math.floor(Math.random() * this.height);
      col = Math.floor(Math.random() * this.width);
      if (this.minefield.minefield[row][col] == "x") {
        continue;
      }
      this.minefield.minefield[row][col] = new GameTile(row, col, "x");
      minesPlaced++;
    }
  }
  
  GameController.prototype.displayEndScreen = function(won) {
    this.solved = true;
    
    fill(0, 0, 0, 0.6);
    noStroke();
    rect(0, -0.28 * HEIGHT, 3/4 * WIDTH, 3/10 * HEIGHT);
    var wonOrLost = won ? "won!" : "lost.";
    fill(100, 220, 180);
    textSize(WIDTH / 14);
    text("You have " + wonOrLost, 0, -3/10 * HEIGHT);
    text("(" + (millis()/1000) + " seconds)", 0, -1/5 * HEIGHT);
  };
  
  GameController.prototype.fillByTile = function(tile) {
    switch (tile.value) {
      case "x":
        fill(0, 0, 0);
        break;
      case "#":
        fill(160, 60, 80);
        break;
      case "1":
        fill(0, 80, 200);
        break;
      case "2":
        fill(20, 160, 0);
        break;
      case "3":
        fill(255, 20, 20);
        break;
      case "4":
        fill(60, 0, 130);
        break;
      case "5":
        fill(100, 20, 0);
        break;
      case "6":
        fill(0, 160, 140);
        break;
      case "7":
        fill(40, 40, 40);
        break;
      case "8":
        fill(160, 120, 0);
        break;
      default:
        fill(0, 0, 0, 0);
    }
  };
  GameController.prototype.display = function(tile) {
    fill(190, 190, 190);
    if (tile.value != "?" && tile.value != "#") {
      fill(175, 175, 175);
    }
    rect(this.blockSize*(tile.col+1/2 - this.width/2), this.blockSize*(tile.row+1/2 - this.height/2), this.blockSize, this.blockSize);
    ctx.font = (WIDTH / 16)*(15 / this.width) + "px Arial";
    this.fillByTile(tile);
    text(tile.value, this.blockSize*(tile.col+1/2 - this.width/2), this.blockSize*(tile.row+5/6 - this.height/2));
  };
  GameController.prototype.displayMinefield = function() {
    stroke(0, 0, 0);
    this.playerView.getTiles().forEach(function(tile) {
      this.display(tile);
    }, this);
  };
  
  GameController.prototype.getTileMousedOver = function() {
    var mouseX = InputFlags.mousepos.x, mouseY = InputFlags.mousepos.y, row, col;
    row = Math.floor(mouseY / this.blockSize);
    col = Math.floor(mouseX / this.blockSize);
    if (row > -1 && row < this.height && col > -1 && col < this.width) {
      return this.minefield.getTile(row, col);
    }
  };
  GameController.prototype.getMinesSurrounding = function(tile) {
    if (this.minefield.getTile(tile.row, tile.col).value == "x") {
      return "x";
    }
    
    return this.minefield.getTilesSurrounding(tile).filter(function(tile) { return tile.value == "x"; }).length.toString();
  };
  GameController.prototype.uncover = function(tile) {
    if (tile.value == "?") {
      this.minefield.getUnclonedTile(tile.row, tile.col).value = this.getMinesSurrounding(tile);
      this.playerView.getUnclonedTile(tile.row, tile.col).value = this.getMinesSurrounding(tile);
      
      if (this.playerView.getTile(tile.row, tile.col).value == "0") {
        this.minefield.getTilesSurrounding(tile).forEach(function(borderingTile) {
          this.uncover(borderingTile);
        }, this);
      }
    }
    else if (tile.value == "x") {
      // Whoops, clicked on a mine! Show them all.
      this.minefield.getTiles().filter(function(tile) { return tile.value == "x"; }).forEach(function(mine) {
        this.playerView.set(mine);
      }, this);
      return;
    }
  };
  
  GameController.prototype.checkBoardCompletion = function() {
    var unknownTiles = this.playerView.getTiles().filter(function(tile) { return tile.value == "?"; });
    var mines = this.playerView.getTiles().filter(function(tile) { return tile.value == "x"; });
    if (unknownTiles.length == 0 && mines.length == 0) {
      this.displayEndScreen(true);
    }
    else if (mines.length > 0) {
      this.displayEndScreen(false);
    }
  };
  
  GameController.prototype.update = function() {
    // A click has occured.
    var tile = this.getTileMousedOver();
    if (tile === undefined) {
      return;
    }
    
    if (InputFlags["mousebutton"] == 0) {
      // Left click
      this.uncover(tile);
    }
    else if (InputFlags["mousebutton"] == 2) {
      // Right click
      var playerViewTile = this.playerView.getUnclonedTile(tile.row, tile.col);
      if (playerViewTile.value == "?") {
        playerViewTile.value = "#";
      }
      else if (playerViewTile.value == "#") {
        playerViewTile.value = "?";
      }
    }
    
    this.displayMinefield();
    this.checkBoardCompletion();
  };
  
  return GameController;
}());

// New context fuctions here.
function fill(red, green, blue, alpha) {
  if (alpha === undefined) {
    alpha = 1;
  }
  ctx.fillStyle = "rgba("+Math.floor(red)+","+Math.floor(green)+","+Math.floor(blue)+","+alpha+")";
}
function noStroke() {
  doStroke = false;
}
function stroke(red, green, blue) {
  ctx.strokeStyle = "rgb("+Math.floor(red)+","+Math.floor(green)+","+Math.floor(blue)+")";
  doStroke = true;
}
function strokeWeight(weight) {
  ctx.lineWidth = weight;
  doStroke = true;
}
function rect(x, y, width, height) {
  ctx.beginPath();
  ctx.rect(x - width/2, y - height/2, width, height);
  ctx.closePath();
  ctx.fill();
  if (doStroke) {
    ctx.stroke();
  }
}
function ellipse(x, y, xRadius, yRadius) {
  ctx.beginPath();
  ctx.ellipse(x, y, xRadius, yRadius, 0, 0, 2*pi);
  ctx.closePath();
  ctx.fill();
  if (doStroke) {
    ctx.stroke();
  }
}
function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  ctx.stroke();
}
function triangle(x1, y1, x2, y2, x3, y3) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  // Line to the from the first point to the second.
  ctx.lineTo(x2, y2);
  // Line to the from the second point to the third.
  ctx.lineTo(x3, y3);
  // Line to the from the third point to the first.
  ctx.lineTo(x1, y1);
  ctx.closePath();
  ctx.fill();
  if (doStroke) {
    ctx.stroke();
  }
}
function polygon(points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  // Do lines between each point.
  for (var i = 0; i < points.length; i++) {
    var point = points[(i + 1) % points.length]
    ctx.lineTo(point.x, point.y);
  }
  ctx.closePath();
  ctx.fill();
  if (doStroke) {
    ctx.stroke();
  }
}
function textSize(size) {
  ctx.font = size + "px Arial";
}
function text(str, x, y, alignment) {
  if (alignment === undefined) {
    alignment = "center";
  }
  ctx.textAlign = alignment;
  ctx.fillText(str, x, y);
}

function millis() {
  return Date.now() - start;
}

function resize() {
  ctx.translate(-HALFWIDTH, -HALFHEIGHT);
  
  canvas.width = 2/5 * window.innerWidth;
  canvas.height = 3/5 * canvas.width;
  if (canvas.height > 1/2 * window.innerHeight) {
    // If the height is greater than the height of the screen, set it accordingly.
    canvas.height = 1/2 * window.innerHeight;
    canvas.width = 5/3 * canvas.height;
  }
  
  WIDTH = canvas.width;
  HEIGHT = canvas.height;
  HALFWIDTH = WIDTH / 2;
  HALFHEIGHT = HEIGHT / 2;
  
  ctx.translate(HALFWIDTH, HALFHEIGHT);
}

function init() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  
  var body = document.getElementsByTagName("body")[0];
  body.onresize = resize;
  resize();
  
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  
  ctx.translate(HALFWIDTH, HALFHEIGHT);
  
  start = Date.now();
  doStroke = true;
  
  canvas.onmouseup = function(e) {
    InputFlags["click"] = true;
    InputFlags["mousebutton"] = e.button;
  };
  document.onmousemove = function(e) {
    var x = e.clientX - (window.innerWidth - WIDTH)/2;
    var y = e.clientY - (document.body.clientHeight - HEIGHT)/2;
    InputFlags["mousepos"]["x"] = x;
    InputFlags["mousepos"]["y"] = y;
  };
  
  GC = new GameController();
  GC.initMinefield();
  GC.displayMinefield();
  
  window.requestAnimationFrame(loop);
}

function loop() {
  ctx.save();
  
  if (InputFlags["click"] && !GC.solved) {
    GC.update();
  }
  
  ctx.restore();
  
  InputFlags["click"] = false;
  window.requestAnimationFrame(loop);
}

window.onload = init;
