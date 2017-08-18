function Tile(row, col, value, workingValue) { // workingValue is optional
  this.row = row;
  this.col = col;
  this.value = value; // this.value is what one would see on the tile, be it 0, 1, 2, 3, a question mark, or a flag.
  this.workingValue = workingValue; // this.workingValue is a variable exlusive to numbered tiles. It tracks how many more mines one needs to reach its value. If a Tile with value 2 had one flag around it (assumed to be placed correctly), then its this.workingValue would equal 1 to say, "I need one more mine to be satisfied."
  if (this.workingValue === undefined) {
    this.workingValue = value;
  }
  if (this.value != "?" && this.value != "x") {
    // If the value isn't an unknown nor a mine, convert the string to an int.
    this.value = parseInt(this.value);
    this.workingValue = parseInt(this.workingValue);
  }
  
  this.clone = function() {
    return new Tile(this.row, this.col, this.value, this.workingValue);
  }
  
  this.updateWorkingValue = function(minefield) {
    this.workingValue = this.value - minefield.getTilesSurrounding(this).filter(function(tile) { return tile.value == "x"; }).length;
    return this.workingValue;
  };
}

function Minefield(map, n) {
  /***
        ? => unknown
        number => how many surrounding mines
          # => placeholder value for hypothetical numbers
        x => mine
          * => contradiction/guessed mine
  ***/
  this.minefield = map;
  if (typeof this.minefield == "string") {
    this.minefield = minefieldMatrixToTiles(minefieldStringToMatrix(this.minefield));
  }
  this.n = n;
  
  this.clone = function() {
    var clonedMinefield = [], row, col;
    for (row = 0; row < this.minefield.length; row++) {
      clonedMinefield.push([]);
      for (col = 0; col < this.minefield[row].length; col++) {
        clonedMinefield[row].push(this.getTile(row, col));
      }
    }
    return new Minefield(clonedMinefield, this.n);
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
  this.getUnknownTiles = function() {
    return this.getTiles().filter(function(tile) { return tile.value == "?"; });
  };
  this.getUnclonedUnknownTiles = function() {
    return this.getUnclonedTiles().filter(function(tile) { return tile.value == "?"; });
  };
  this.getNumericTiles = function() {
    return this.getTiles().filter(function(tile) { return typeof tile.value == "number"; });
  };
  this.getUnclonedNumericTiles = function() {
    return this.getUnclonedTiles().filter(function(tile) { return typeof tile.value == "number"; });
  };
  this.set = function(tile) {
    this.minefield[tile.row][tile.col] = tile;
  };
  this.open = function(tile) {
    this.set(new Tile(tile.row, tile.col, parseInt(open(tile.row, tile.col))));
    this.getUnclonedTile(tile.row, tile.col).updateWorkingValue(this);
  };
  this.flag = function(tile) {
    this.set(new Tile(tile.row, tile.col, "x"));
  };
  
  this.findSafeTiles = function() {
    // For all unknown tiles, if any surrounding tile has a this.workingValue of 0, it's safe to open.
    var safeTiles = [];
    
    var unknownTiles = this.getUnknownTiles();
    unknownTiles.forEach(function(unknownTile) {
      var neighborsWithWorkingValueZero = this.getTilesSurrounding(unknownTile).filter(function(tile) { return tile.workingValue == 0; });
      if (neighborsWithWorkingValueZero.length > 0) {
        safeTiles.push(unknownTile);
      }
    }, this);
    
    // If any the board's mines have all been flagged, all leftover squares are open.
    if (this.getTiles().filter(function(tile) { return tile.value == "x"; }).length == this.n) {
      this.getUnclonedUnknownTiles().forEach(function(leftOverTile) { safeTiles.push(leftOverTile); });
    }
    
    return safeTiles;
  };
  this.findMines = function() {
    // For all numeric tiles with a this.workingValue > 0, if the number of unknown surrounding tiles equals this.workingValue, all surrounding tiles must be mines and should be flagged.
    var mines = [];
    
    var nonZeroNumericTiles = this.getUnclonedNumericTiles().filter(function(tile) { return tile.value > 0; });
    nonZeroNumericTiles.forEach(function(numericTile) {
      var surroundingUnknowns = this.getUnclonedTilesSurrounding(numericTile).filter(function(tile) { return tile.value == "?"; });
      if (surroundingUnknowns.length == numericTile.workingValue) {
        // All surrounding unknowns must be mines: flag them.
        surroundingUnknowns.forEach(function(mine) {
          mines.push(mine);
          this.getUnclonedTilesSurrounding(mine).filter(function(tile) { return typeof tile.value == "number"; }).forEach(function(tile) {
            tile.workingValue -= 1;
          }, this);
        }, this);
      }
    }, this);
    
    return mines;
  };
  this.iterateEasyLogic = function() {
    /***
      1) Logically open tiles.
      2) Logically flag mines.
    ***/
    var changedTiles = []; // For recording actions as they occur. It will also be helpful when deciding whether or not to try a contradiction search, because it will tell us if nothing happened.
    
    // 1)
    this.findSafeTiles().forEach(function(safeTile) {
      changedTiles.push(safeTile);
      this.open(safeTile);
    }, this);
    
    // 2)
    this.findMines().forEach(function(mine) {
      changedTiles.push(mine);
      this.flag(mine);
    }, this);
    
    return changedTiles;
  };
  
  this.contradictionSearch = function() {
    /***
      Until a safe square is found, every unknown tile bordered by a numeric tile, one by one, can be assumed to be a mine.
      From that assumption, a modified easyLogic* would be run until either
        A) the modified easy logic runs out moves to make. At this point, abort and try the next tile.
        B) the modified easy logic runs into an impossibility, such as a 2 tile with 3 surrounding mines.
           That tile cannot be a mine because it caused an impossibility as one, so it must be safe.
      
      * The modified easy logic would not open any tiles. As it's running off of an assumption, this would be dangerous.
        Rather, it would note how existing tiles would update if it was a mine, and flag more mines (still hypothetically)
        based off of this assumption, until either A or B occurs.
    ***/
    
    var unknownTilesBorderingNumericTiles = this.getUnknownTiles().filter(function(unknownTile) {
      return this.getTilesSurrounding(unknownTile).filter(function(tile) { return typeof tile.value == "number"; }).length > 0;
    }, this);
    
    var unknownTile, hypotheticalMinefield, hypotheticalMines, impossibilities, strandedTiles, minesLeftToFlag;
    for (var i in unknownTilesBorderingNumericTiles) {
      unknownTile = unknownTilesBorderingNumericTiles[i];
      
      minesLeftToFlag = this.n - this.getTiles().filter(function(tile) { return tile.value == "x"; }).length; // How many mines
      
      hypotheticalMinefield = this.clone();
      
      hypotheticalMinefield.getUnclonedNumericTiles()
        .filter(function(numericTile) { return numericTile.value > 0; })
        .forEach(function(numericTile) { numericTile.updateWorkingValue(hypotheticalMinefield); });
      
      var addPlaceholderNumbersAround = function(assumptionMine) {
       hypotheticalMinefield.getUnclonedTilesSurrounding(assumptionMine)
          .filter(function(tile) { return tile.workingValue == 0; })
          .forEach(function(numericTile) {
            hypotheticalMinefield.getUnclonedTilesSurrounding(numericTile)
            .filter(function(tile) { return tile.value == "?"; })
            .forEach(function(tile) {
              tile.value = "#"; tile.workingValue = "#";
            });
          });
      }
      
      // Update working values around the assumption mine.
      var hypotheticalAssumptionMine = hypotheticalMinefield.getUnclonedTile(unknownTile.row, unknownTile.col);
      hypotheticalAssumptionMine.value = "*"; hypotheticalAssumptionMine.workingValue = "*";
      hypotheticalMinefield.getUnclonedTilesSurrounding(unknownTile).filter(function(tile) { return typeof tile.value == "number"; }).forEach(function(numericTile) {
        numericTile.workingValue -= 1;
      });
      addPlaceholderNumbersAround(hypotheticalAssumptionMine);
      minesLeftToFlag -= 1;
      
      do {
        hypotheticalMines = hypotheticalMinefield.findMines(); // A
        hypotheticalMines.forEach(function(hypotheticalMine) {
          hypotheticalMine.value = "*"; hypotheticalMine.workingValue = "*";
          addPlaceholderNumbersAround(hypotheticalMine);
        });
        minesLeftToFlag -= hypotheticalMines.length;
        if (minesLeftToFlag == 0) {
          // All tiles are safe, for all mines have been flagged.
          hypotheticalMinefield.getUnclonedUnknownTiles().forEach(function(unknownTile) {
            unknownTile.value =  "#"; unknownTile.workingValue =  "#";
          });
        }
        // B part 1: Are there any tiles with too many mines around them?
        impossibilities = hypotheticalMinefield.getNumericTiles()
          .filter(function(numericTile) { return numericTile.workingValue < 0; });
        // B part 2: Are there any "stranded" tiles who need more mines than they have unknown tiles around them?
        strandedTiles = hypotheticalMinefield.getNumericTiles().filter(function(numericTile) {
          return numericTile.workingValue > hypotheticalMinefield.getTilesSurrounding(numericTile).filter(function(tile) {
            return tile.value == "?";
          }).length;
        });
        strandedTiles.forEach(function(strandedTile) {
          impossibilities.push(strandedTile);
        });
        // B part 3: Are there more mines on the board than there can be?
        if (minesLeftToFlag < 0) {
          impossibilities.push("impossible number of mines");
        }
        // B part 4: Are there less mines on the board than there must be?
        if (minesLeftToFlag > hypotheticalMinefield.getUnknownTiles().length) {
          impossibilities.push("impossible number of mines");
        }
      } while(hypotheticalMines.length > 0 && impossibilities.length == 0);
      
      if (impossibilities.length > 0) {
        // Impossibility found: the original assumption mine cannot be. It must be safe!
        this.open(unknownTile);
        return unknownTile;
      }
    }
    
    // No impossibilities found: the board must be ambiguous, impossible to solve!
    console.log(minefieldMatrixToString(minefieldTilesToMatrix(this.minefield)));
    return "?";
  };
}

function minefieldStringToMatrix(string) {
  var minefield = string.split("\n"), row;
  for (row = 0; row < minefield.length; row++) {
    minefield[row] = minefield[row].split(" ");
  }
  return minefield;
}
function minefieldMatrixToString(matrix) {
  var minefield = "", row, col;
  for (row = 0; row < matrix.length; row++) {
    for (col = 0; col < matrix[row].length; col++) {
      minefield += matrix[row][col];
      minefield += (col == matrix[row].length-1) ? (row == matrix.length-1 ? "" : "\n") : " ";
    }
  }
  return minefield;
}
function minefieldMatrixToTiles(matrix) {
  var minefield = [], row, col, value;
  for (row = 0; row < matrix.length; row++) {
    minefield.push([]);
    for (col = 0; col < matrix[row].length; col++) {
      value = matrix[row][col];
      if (typeof value == "number") {
        parseInt(value);
      }
      minefield[row].push(new Tile(row, col, value));
    }
  }
  return minefield;
}
function minefieldTilesToMatrix(tiles) {
  var minefield = [], row, col, value;
  for (row = 0; row < tiles.length; row++) {
    minefield.push([]);
    for (col = 0; col < tiles[row].length; col++) {
      value = tiles[row][col].value;
      if (typeof value == "number") {
        value.toString();
      }
      minefield[row].push(value);
    }
  }
  return minefield;
}

function solveMine(map,n) {
  var minefield = new Minefield(map, n), easyLogic, contradictionSearch;
  while (minefield.getUnknownTiles().length > 0) {
    easyLogic = minefield.iterateEasyLogic();
    if (easyLogic.length == 0) {
      // easyLogic did nothing, so try a contradiction search.
      contradictionSearch = minefield.contradictionSearch();
      if (contradictionSearch == "?") {
        // The board is ambiguous, impossible to solve.
        return "?";
      }
    }
  }
  
  return minefieldMatrixToString(minefieldTilesToMatrix(minefield.minefield));
}
function Tile(row, col, value, workingValue) { // workingValue is optional
  this.row = row;
  this.col = col;
  this.value = value; // this.value is what one would see on the tile, be it 0, 1, 2, 3, a question mark, or a flag.
  this.workingValue = workingValue; // this.workingValue is a variable exlusive to numbered tiles. It tracks how many more mines one needs to reach its value. If a Tile with value 2 had one flag around it (assumed to be placed correctly), then its this.workingValue would equal 1 to say, "I need one more mine to be satisfied."
  if (this.workingValue === undefined) {
    this.workingValue = value;
  }
  if (this.value != "?" && this.value != "x") {
    // If the value isn't an unknown nor a mine, convert the string to an int.
    this.value = parseInt(this.value);
    this.workingValue = parseInt(this.workingValue);
  }
  
  this.clone = function() {
    return new Tile(this.row, this.col, this.value, this.workingValue);
  }
  
  this.updateWorkingValue = function(minefield) {
    this.workingValue = this.value - minefield.getTilesSurrounding(this).filter(function(tile) { return tile.value == "x"; }).length;
    return this.workingValue;
  };
}

function Minefield(map, n) {
  /***
        ? => unknown
        number => how many surrounding mines
          # => placeholder value for hypothetical numbers
        x => mine
          * => contradiction/guessed mine
  ***/
  this.minefield = map;
  if (typeof this.minefield == "string") {
    this.minefield = minefieldMatrixToTiles(minefieldStringToMatrix(this.minefield));
  }
  this.n = n;
  
  this.clone = function() {
    var clonedMinefield = [], row, col;
    for (row = 0; row < this.minefield.length; row++) {
      clonedMinefield.push([]);
      for (col = 0; col < this.minefield[row].length; col++) {
        clonedMinefield[row].push(this.getTile(row, col));
      }
    }
    return new Minefield(clonedMinefield, this.n);
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
  this.getUnknownTiles = function() {
    return this.getTiles().filter(function(tile) { return tile.value == "?"; });
  };
  this.getUnclonedUnknownTiles = function() {
    return this.getUnclonedTiles().filter(function(tile) { return tile.value == "?"; });
  };
  this.getNumericTiles = function() {
    return this.getTiles().filter(function(tile) { return typeof tile.value == "number"; });
  };
  this.getUnclonedNumericTiles = function() {
    return this.getUnclonedTiles().filter(function(tile) { return typeof tile.value == "number"; });
  };
  this.set = function(tile) {
    this.minefield[tile.row][tile.col] = tile;
  };
  this.open = function(tile) {
    this.set(new Tile(tile.row, tile.col, parseInt(open(tile.row, tile.col))));
    this.getUnclonedTile(tile.row, tile.col).updateWorkingValue(this);
  };
  this.flag = function(tile) {
    this.set(new Tile(tile.row, tile.col, "x"));
  };
  
  this.findSafeTiles = function() {
    // For all unknown tiles, if any surrounding tile has a this.workingValue of 0, it's safe to open.
    var safeTiles = [];
    
    var unknownTiles = this.getUnknownTiles();
    unknownTiles.forEach(function(unknownTile) {
      var neighborsWithWorkingValueZero = this.getTilesSurrounding(unknownTile).filter(function(tile) { return tile.workingValue == 0; });
      if (neighborsWithWorkingValueZero.length > 0) {
        safeTiles.push(unknownTile);
      }
    }, this);
    
    // If any the board's mines have all been flagged, all leftover squares are open.
    if (this.getTiles().filter(function(tile) { return tile.value == "x"; }).length == this.n) {
      this.getUnclonedUnknownTiles().forEach(function(leftOverTile) { safeTiles.push(leftOverTile); });
    }
    
    return safeTiles;
  };
  this.findMines = function() {
    // For all numeric tiles with a this.workingValue > 0, if the number of unknown surrounding tiles equals this.workingValue, all surrounding tiles must be mines and should be flagged.
    var mines = [];
    
    var nonZeroNumericTiles = this.getUnclonedNumericTiles().filter(function(tile) { return tile.value > 0; });
    nonZeroNumericTiles.forEach(function(numericTile) {
      var surroundingUnknowns = this.getUnclonedTilesSurrounding(numericTile).filter(function(tile) { return tile.value == "?"; });
      if (surroundingUnknowns.length == numericTile.workingValue) {
        // All surrounding unknowns must be mines: flag them.
        surroundingUnknowns.forEach(function(mine) {
          mines.push(mine);
          this.getUnclonedTilesSurrounding(mine).filter(function(tile) { return typeof tile.value == "number"; }).forEach(function(tile) {
            tile.workingValue -= 1;
          }, this);
        }, this);
      }
    }, this);
    
    return mines;
  };
  this.iterateEasyLogic = function() {
    /***
      1) Logically open tiles.
      2) Logically flag mines.
    ***/
    var changedTiles = []; // For recording actions as they occur. It will also be helpful when deciding whether or not to try a contradiction search, because it will tell us if nothing happened.
    
    // 1)
    this.findSafeTiles().forEach(function(safeTile) {
      changedTiles.push(safeTile);
      this.open(safeTile);
    }, this);
    
    // 2)
    this.findMines().forEach(function(mine) {
      changedTiles.push(mine);
      this.flag(mine);
    }, this);
    
    return changedTiles;
  };
  
  this.contradictionSearch = function() {
    /***
      Until a safe square is found, every unknown tile bordered by a numeric tile, one by one, can be assumed to be a mine.
      From that assumption, a modified easyLogic* would be run until either
        A) the modified easy logic runs out moves to make. At this point, abort and try the next tile.
        B) the modified easy logic runs into an impossibility, such as a 2 tile with 3 surrounding mines.
           That tile cannot be a mine because it caused an impossibility as one, so it must be safe.
      
      * The modified easy logic would not open any tiles. As it's running off of an assumption, this would be dangerous.
        Rather, it would note how existing tiles would update if it was a mine, and flag more mines (still hypothetically)
        based off of this assumption, until either A or B occurs.
    ***/
    
    var unknownTilesBorderingNumericTiles = this.getUnknownTiles().filter(function(unknownTile) {
      return this.getTilesSurrounding(unknownTile).filter(function(tile) { return typeof tile.value == "number"; }).length > 0;
    }, this);
    
    var unknownTile, hypotheticalMinefield, hypotheticalMines, impossibilities, strandedTiles, minesLeftToFlag;
    for (var i in unknownTilesBorderingNumericTiles) {
      unknownTile = unknownTilesBorderingNumericTiles[i];
      
      minesLeftToFlag = this.n - this.getTiles().filter(function(tile) { return tile.value == "x"; }).length; // How many mines
      
      hypotheticalMinefield = this.clone();
      
      hypotheticalMinefield.getUnclonedNumericTiles()
        .filter(function(numericTile) { return numericTile.value > 0; })
        .forEach(function(numericTile) { numericTile.updateWorkingValue(hypotheticalMinefield); });
      
      var addPlaceholderNumbersAround = function(assumptionMine) {
       hypotheticalMinefield.getUnclonedTilesSurrounding(assumptionMine)
          .filter(function(tile) { return tile.workingValue == 0; })
          .forEach(function(numericTile) {
            hypotheticalMinefield.getUnclonedTilesSurrounding(numericTile)
            .filter(function(tile) { return tile.value == "?"; })
            .forEach(function(tile) {
              tile.value = "#"; tile.workingValue = "#";
            });
          });
      }
      
      // Update working values around the assumption mine.
      var hypotheticalAssumptionMine = hypotheticalMinefield.getUnclonedTile(unknownTile.row, unknownTile.col);
      hypotheticalAssumptionMine.value = "*"; hypotheticalAssumptionMine.workingValue = "*";
      hypotheticalMinefield.getUnclonedTilesSurrounding(unknownTile).filter(function(tile) { return typeof tile.value == "number"; }).forEach(function(numericTile) {
        numericTile.workingValue -= 1;
      });
      addPlaceholderNumbersAround(hypotheticalAssumptionMine);
      minesLeftToFlag -= 1;
      
      do {
        hypotheticalMines = hypotheticalMinefield.findMines(); // A
        hypotheticalMines.forEach(function(hypotheticalMine) {
          hypotheticalMine.value = "*"; hypotheticalMine.workingValue = "*";
          addPlaceholderNumbersAround(hypotheticalMine);
        });
        minesLeftToFlag -= hypotheticalMines.length;
        if (minesLeftToFlag == 0) {
          // All tiles are safe, for all mines have been flagged.
          hypotheticalMinefield.getUnclonedUnknownTiles().forEach(function(unknownTile) {
            unknownTile.value =  "#"; unknownTile.workingValue =  "#";
          });
        }
        // B part 1: Are there any tiles with too many mines around them?
        impossibilities = hypotheticalMinefield.getNumericTiles()
          .filter(function(numericTile) { return numericTile.workingValue < 0; });
        // B part 2: Are there any "stranded" tiles who need more mines than they have unknown tiles around them?
        strandedTiles = hypotheticalMinefield.getNumericTiles().filter(function(numericTile) {
          return numericTile.workingValue > hypotheticalMinefield.getTilesSurrounding(numericTile).filter(function(tile) {
            return tile.value == "?";
          }).length;
        });
        strandedTiles.forEach(function(strandedTile) {
          impossibilities.push(strandedTile);
        });
        // B part 3: Are there more mines on the board than there can be?
        if (minesLeftToFlag < 0) {
          impossibilities.push("impossible number of mines");
        }
        // B part 4: Are there less mines on the board than there must be?
        if (minesLeftToFlag > hypotheticalMinefield.getUnknownTiles().length) {
          impossibilities.push("impossible number of mines");
        }
      } while(hypotheticalMines.length > 0 && impossibilities.length == 0);
      
      if (impossibilities.length > 0) {
        // Impossibility found: the original assumption mine cannot be. It must be safe!
        this.open(unknownTile);
        return unknownTile;
      }
    }
    
    // No impossibilities found: the board must be ambiguous, impossible to solve!
    console.log(minefieldMatrixToString(minefieldTilesToMatrix(this.minefield)));
    return "?";
  };
}

function minefieldStringToMatrix(string) {
  var minefield = string.split("\n"), row;
  for (row = 0; row < minefield.length; row++) {
    minefield[row] = minefield[row].split(" ");
  }
  return minefield;
}
function minefieldMatrixToString(matrix) {
  var minefield = "", row, col;
  for (row = 0; row < matrix.length; row++) {
    for (col = 0; col < matrix[row].length; col++) {
      minefield += matrix[row][col];
      minefield += (col == matrix[row].length-1) ? (row == matrix.length-1 ? "" : "\n") : " ";
    }
  }
  return minefield;
}
function minefieldMatrixToTiles(matrix) {
  var minefield = [], row, col, value;
  for (row = 0; row < matrix.length; row++) {
    minefield.push([]);
    for (col = 0; col < matrix[row].length; col++) {
      value = matrix[row][col];
      if (typeof value == "number") {
        parseInt(value);
      }
      minefield[row].push(new Tile(row, col, value));
    }
  }
  return minefield;
}
function minefieldTilesToMatrix(tiles) {
  var minefield = [], row, col, value;
  for (row = 0; row < tiles.length; row++) {
    minefield.push([]);
    for (col = 0; col < tiles[row].length; col++) {
      value = tiles[row][col].value;
      if (typeof value == "number") {
        value.toString();
      }
      minefield[row].push(value);
    }
  }
  return minefield;
}

function solveMine(map,n) {
  var minefield = new Minefield(map, n), easyLogic, contradictionSearch;
  while (minefield.getUnknownTiles().length > 0) {
    easyLogic = minefield.iterateEasyLogic();
    if (easyLogic.length == 0) {
      // easyLogic did nothing, so try a contradiction search.
      contradictionSearch = minefield.contradictionSearch();
      if (contradictionSearch == "?") {
        // The board is ambiguous, impossible to solve.
        return "?";
      }
    }
  }
  return minefieldMatrixToString(minefieldTilesToMatrix(minefield.minefield));
}
