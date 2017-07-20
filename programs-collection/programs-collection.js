var Program = (function() {
  
  function Program(name, language, link, imageSource, description) {
    this.name = name;
    this.language = language;
    this.link = link;
    this.imageSource = imageSource;
    this.description = description;
  }
  
  Program.prototype.createDivElement = function() {
    // There are five steps. First, create the div to wrap the information. Second, name the program using this.name, linking the name to the program URL itself. Third, create a small note for which language was used. Fourth, attach the linked image below the language. Finally, append the description.
    // First step
    var wrapper = document.createElement("div");
    // Second step
    var nameLink = document.createElement("a");
    nameLink.textContent = this.name;
    nameLink.className += "program-name";
    nameLink.href = this.link;
    wrapper.appendChild(nameLink);
    // Third step
    var languageParagraph = document.createElement("p");
    languageParagraph.textContent = "(" + this.language + ")";
    languageParagraph.className += "program-language";
    wrapper.appendChild(languageParagraph);
    // Fourth step
    var imageElement = document.createElement("img");
    imageElement.src = this.imageSource;
    imageElement.className += "program-image";
    var linkElement = document.createElement("a");
    linkElement.href = this.link;
    linkElement.appendChild(imageElement);
    wrapper.appendChild(linkElement);
    // Fifth step
    var descriptionParagraph = document.createElement("p");
    descriptionParagraph.textContent = this.description;
    descriptionParagraph.className += "program-description";
    wrapper.appendChild(descriptionParagraph);
    
    return wrapper;
  };
  
  return Program;
}());

function populateProgramsList(programs, outputId) {
  // Append the createDivElement() of each program to the programs list.
  var list = document.getElementById(outputId);
  for (var i = 0; i < programs.length; i++) {
    var program = programs[i];
    var listItem = document.createElement("li");
    listItem.className += "program-list-item";
    listItem.appendChild(program.createDivElement());
    list.appendChild(listItem);
  }
}

var listPrograms = [
  new Program("3D Engine", "javascript", "https://s.codepen.io/Arongil/debug/RgEwoO", "http://i.imgur.com/JojQBB9.png",
              "A Perspective-3D engine I built from scratch. By default, the camera moves with WASD and orients itself with the mouse, looking at a cube of spheres."),
  new Program("Void", "javascript", "http://www.arongil.com/void", "http://i.imgur.com/GJUcZOr.jpg",
              "But a speck in space, harnessing void energies may be your last chance for survival. Use the WASD keys and mouse to explore an artificial world. [Not Completed]"),
  new Program("Waves", "javascript", "https://s.codepen.io/Arongil/debug/zwBEMO", "https://imgur.com/kDxPBNc.png",
             "The Wave Equation implemented in 3D using methods adapted from the Projecting Heightmaps program. Click to create a distubance and behold a wave ripple, reflect, and interfere with itself, much the way a pebble thrown into a pond does."),
  new Program("Ooze", "javascript", "https://s.codepen.io/Arongil/debug/eWNZXE/YvAgOPaXQbDA", "https://i.imgur.com/N8B4sg6.png",
             "Watch the eternal battle of source blocks unfold, and create new sources yourself by clicking! Enter hypermode to calculate blazingly fast or reset the canvas to a blank state. Explore Ooze!"),
  new Program("Bird Breaker", "javascript", "http://www.arongil.com/bird-breaker", "https://i.imgur.com/UvM603K.png",
             "Bird Breaker is a 2D game to kill birds. Fly through the sky in a plane, bouncing a ball-of-bird-death in a manner similar to Atari's Breakout. Try three different levels: Normal, Endless, and Bird King, and buy different planes to best each bird that you fly by."),
  new Program("Chess", "python", "https://trinket.io/library/trinkets/d56d41fffa", "https://imgur.com/NEE7lap.png",
             "Classic chess with good old castling and clocks."),
  new Program("Hangman Solver", "python", "https://trinket.io/library/trinkets/d64e49300f", "https://trinket-snapshots.trinket.io/d64e49300f-1482533805984.png",
             "Hangman solver near-instantly solves any word you throw at it in a minimum of errors. Enter words for it to guess or play against it!"),
  new Program("Projecting Heightmaps", "processing javascript", "https://www.khanacademy.org/computer-programming/projecting-noise-heightmaps/4566593228046336", "https://www.khanacademy.org/computer-programming/projecting-noise-heightmaps/4566593228046336/5718998062727168.png",
             "Rendering graphics in 3D has always awed me, especially the math. Projecting Heightmaps projects 3D, taking points' positions and a camera's angle. Thank goodness for wikipedia's mathematical sections."),
  new Program("Grapher", "python", "https://trinket.io/library/trinkets/6830489b27", "https://i.imgur.com/QLd8BnJ.png",
             "Type any equation and behold the graph. With many options including colors, and variables, graphing with Grapher is a customizable experience."),
  new Program("Dungeons and Dragons", "python", "https://trinket.io/library/trinkets/4013f5db96", "https://trinket-snapshots.trinket.io/4013f5db96-1486337887045.png",
             "Play a text-based adventure! Defeat monsters with purchased vorpal swords and shell shields. Scavenge, shop, rest, and enjoy."),
  new Program("Planet Generation", "processing javascript", "https://www.khanacademy.org/computer-programming/planet-generation/6269456501571584", "https://www.khanacademy.org/computer-programming/planet-generation/6269456501571584/5735553819475968.png",
             "Inspired by trailers from the game No Man's Sky, Planet Generation builds a world to walk around in. I was going for something similar to perlin noise, and, although it's probably not the most efficient algorithm, I'm proud of it even working at all."),
  new Program("Gravity Crash", "python", "https://trinket.io/library/trinkets/2534a0e391", "https://i.imgur.com/yJRw9re.png",
             "Hit balls into holes, just like billiards, but use little black holes to move the white ball, not a stick! With realistic collisions, this game is very fun to play. It's also the largest Python program I had made, pulling from lots of the vector math from Vector Playground by using a python Vector2D class. The Vector2D class is used in almost every program since then, because it's so useful and easy."),
  new Program("Vector Playground", "processing javascript", "https://www.khanacademy.org/computer-programming/vector-playground/3151965113", "https://www.khanacademy.org/computer-programming/vector-playground/3151965113/2840001.png",
             "Vector Playground is a program that includes vector math I had learned just prior. It's fun to play around with, though not particularly useful."),
  new Program("Blackjack", "python", "https://trinket.io/library/trinkets/fe8e9b583c", "https://trinket-snapshots.trinket.io/fe8e9b583c-1456447624788.png",
             "The first Python program to be shown, Blackjack is just like you know it, but in text."),
  new Program("Lines", "processing javascript", "https://www.khanacademy.org/computer-programming/lines/6704873765994496", "https://www.khanacademy.org/computer-programming/lines/6704873765994496/5704837555552256.png",
             "A simulation in which twenty dots bounce around the screen, connecting to other dots within some distance. But connections act like springs, pulling both dots together. Many dots can coalesce into oscillating 'organisms' that rapidly devour dots that stray too close and fling dots near the edge out. I've watched this simulation for hours as I tweaked variables, always with fun results."),
  new Program("Shooter", "processing javascript", "https://www.khanacademy.org/computer-programming/shooter/4930218433576960", "https://www.khanacademy.org/computer-programming/shooter/4930218433576960/5638404075159552.png",
             "Shoot enemies with bullets to level up. It's not much now, but getting the enemies to rotate towards the player took everything I knew about trigonometry at the time, and a bit of luck."),
  new Program("Cookie Clicker", "processing javascript", "https://www.khanacademy.org/computer-programming/cookie-clicker/4886769556652032", "https://www.khanacademy.org/computer-programming/cookie-clicker/4886769556652032/130001.png",
             "Click the cookie to get cookies to buy buildings to buy more buildings! In this recreated Cookie Clicker, you can save, prestige, and get achievements, all with cleaner object oriented programming."),
  new Program("Fractal Tree", "processing javascript", "https://www.khanacademy.org/computer-programming/fractal-tree/5416106726129664", "https://www.khanacademy.org/computer-programming/fractal-tree/5416106726129664/5196828823781376.png",
             "I made this at a time when I was super in to fractals. It's simple, but I like it. Branches recursively sprout until the final layer becomes leaves."),
  new Program("Ball Learning", "processing javascript", "https://www.khanacademy.org/computer-programming/ball-learning/6456830273912832", "https://www.khanacademy.org/computer-programming/ball-learning/6456830273912832/5723088213770240.png",
             "My first attempt to build a genetic algorithm: an algorithm that can learn. Five values, ranging from starting velocity to environmental friction, are fine-tuned by generations breeding the best scorers to try to maximize the number of red balls the balls can collect. With the built-in graph of fitness for each generation, it's clear that some basic improvement is made over time."),
  new Program("Helicopter Game", "processing javascript", "https://www.khanacademy.org/computer-programming/helicopter-game/6098109669703680", "https://www.khanacademy.org/computer-programming/helicopter-game/6098109669703680/5697124062724096.png",
             "Fly around in a helicopter collecting coins, but don't pick up the bad ones. Helicopter Game was my first real attempt at anything 3D (side on view, so no fancy quaternions or anything). To pick up coins the helicopter must be in the correct x-y position, as well as the correct z position."),
  new Program("Snowy City", "processing javascript", "https://www.khanacademy.org/computer-programming/spin-off-of-project-make-it-rain/6241828895981568", "https://www.khanacademy.org/computer-programming/spin-off-of-project-make-it-rain/6241828895981568/5728757302165504.png",
             "Snowy City is a view into a city as a storm is over it. Cars drive by and snow or rain falls. When it rains, wait for a bit and the street will begin to flood, forcing the cars to float up and down."),
  new Program("Cookie Clicker (Old)", "processing javascript", "https://www.khanacademy.org/computer-programming/cookie-clicker/5425064094728192", "https://www.khanacademy.org/computer-programming/cookie-clicker/5425064094728192/5687280266117120.png",
             "This is the earliest project of those in here so it isn't programmed the best and doesn't have the best art. But it was one of my first larger projects, so enjoy clicking that cookie!"),
];
