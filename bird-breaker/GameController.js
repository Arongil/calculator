class GameController {

    constructor() {
        this.plane = new Plane({
            "propellers": [
                new Propeller(new Vector2D(0, 0), HEIGHT / 20)
            ],
            "rects": [
                new Rect(0, 0, 5/16 * WIDTH, HEIGHT / 30, 0)
            ],
            "circles": [
            ]
        });

        this.ball = new Ball();
        this.birds = [];
        this.birdsFlight = true;
        this.initBirds();

        this.coins = [];
        this.player = new Player();

        this.TOTALLIVES = 2;
        this.lives = 2;

        this.slowMotion = false;
        this.slowMotionTimer = 0;

        this.ai = false; // Is the artificial unintelligence playing?

        this.screen = "menu";
        this.level = "default";
        this.paused = false;
        // Don't allow more than one button press per frame.
        this.hitButton = false;
        this.buttons = {}; // data stored in gameData.js

        this.shopShelves = []; // data stored in gameData.js

        setGameData(this); // All data is filled in with this method.

        this.levelSegment = 0;
        this.levels = {
            "default": function() {
                GC.screen = "gameover";
                // Reward the player with 5 coins for the succesfully completed level.
                for (var i = 0; i < 5; i++) {
                    var angle = pi*(1 + Math.random());
                    GC.coins.push(new Coin(new Vector2D(0, 0), Vector2D.FromPolar(angle, HALFWIDTH / 150)));
                }
            },
            "graveyard": function() {
                GC.screen = "gameover";
                // Reward the player with 5 coins for the succesfully completed level.
                for (var i = 0; i < 5; i++) {
                    var angle = pi*(1 + Math.random());
                    GC.coins.push(new Coin(new Vector2D(0, 0), Vector2D.FromPolar(angle, HALFWIDTH / 150)));
                }
            },
            "bird king": function() {
                GC.screen = "gameover";
                // Reward the player with 10 coins for the succesfully completed level.
                for (var i = 0; i < 10; i++) {
                    var angle = pi*(1 + Math.random());
                    GC.coins.push(new Coin(new Vector2D(0, 0), Vector2D.FromPolar(angle, HALFWIDTH / 150)));
                }
            },
            "endless": function() {
                GC.levelSegment += 1;
                GC.setTimer();
                GC.ball.reset();
                GC.initBirds();

                // Reward the player with 2*levelSegment + 1 coins
                for (var i = 0; i < (2*GC.levelSegment + 1); i++) {
                    var angle = pi*(1 + Math.random());
                    GC.coins.push(new Coin(new Vector2D(0, 0), Vector2D.FromPolar(angle, HALFWIDTH / 150)));
                }
            }
        };

        // Set to 3 whenever the player loses a life. It gives the player a few seconds to recover.
        this.prevTime = Date.now() - start;
        this.lossStart = 0;
    }

    callButtons(buttons) {
        for (var i = 0; i < buttons.length; i++) {
            var button = buttons[i];
            button.display();
            if (this.hitButton == false) {
                if (button.clicked()) {
                    this.hitButton = true;
                }
            }
        }
    }
    callButtonsDisplay(buttons) {
        for (var i = 0; i < buttons.length; i++) {
            var button = buttons[i];
            button.display();
        }
    }
    callButtonsClicked(buttons) {
        for (var i = 0; i < buttons.length; i++) {
            var button = buttons[i];
            if (this.hitButton == false) {
                if (button.clicked()) {
                    this.hitButton = true;
                }
            }
        }
    }

    update() {
        this.callButtons(this.buttons[this.screen]);

        if (this.screen == "menu") {
            this.menuScreen();
        }
        else if (this.screen == "levels") {
            this.levelsScreen();
        }
        else if (this.screen == "game") {
            this.gameScreen();
        }
        else if (this.screen == "gameover") {
            this.gameoverScreen();
        }
        else if (this.screen == "shop") {
            this.shopScreen();
        }

        this.hitButton = false;
    }

    slowMotionCheck() {
        this.slowMotion = debug && InputFlags["32"];
        this.slowMotionTimer--;
        if (this.slowMotionTimer < 0) {
            this.slowMotionTimer = 10;
        }

        return this.slowMotion && this.slowMotionTimer > 0;
    }

    gameScreen() {
        if (this.paused) {
            this.updateDisplay();

            fill(5, 20, 60, 0.8);
            rect(0, 0, 7/8 * HALFWIDTH, 9/10 * HALFHEIGHT);

            fill(160, 170, 200);
            textSize(HALFWIDTH / 6);
            text("PAUSED", 0, -HALFHEIGHT / 4);

            this.callButtons(this.buttons["paused"]);
        }
        else {
            if (this.lossTimer > 0 && this.birdsFlight) {
                // Make birds fly in.
                for (var i = 0; i < this.birds.length; i++) {
                    var bird = this.birds[i];
                    var m = this.lossTimer/3;

                    bird.anchorPos = bird.destination.getShifted(new Vector2D(bird.flyInNumbers[3]*Math.cos(bird.flyInNumbers[0]*m), Math.sin(bird.flyInNumbers[1]*m)).getScaled(m*bird.flyInNumbers[2]).getScaled(HALFWIDTH));
                }
            }
            else {
                this.birdsFlight = false;
            }

            this.updatePhysics();
            this.updateDisplay();
            this.updateCoins();

            if (this.lives == -1 || this.birds.length <= 0) {
                if (this.birds.length <= 0) {
                    this.levels[this.level]();
                }
                else {
                    this.screen = "gameover";
                }
                return 0;
            }

            if (this.lossTimer > 0) {
                this.lossTimer -= (millis() - this.prevTime) / 1000;

                if (this.birdsFlight == false) {
                    // Birds only fly in on the first timer so it's ideal for checking whether or not to display the red tinge.
                    fill(255, 0, 0, Math.pow(this.lossTimer/3, 3));
                    rect(0, 0, WIDTH, HEIGHT);
                }

                fill(0, 0, 0);
                textSize(HALFWIDTH);
                var time = Math.ceil(this.lossTimer);
                if (time == 0) {
                    time = 1;
                }
                text(time, 0, -HALFHEIGHT / 6);
            }
        }
    }

    menuScreen() {
        this.plane.updatePhysics();
        this.plane.display();

        fill(0, 0, 0);
        textSize(HALFWIDTH / 4);
        text("Bird Breaker", 0, -HALFHEIGHT / 2);
    }

    levelsScreen() {
        this.plane.updatePhysics();
        this.plane.display();

        fill(0, 0, 0);
        textSize(HALFWIDTH / 4);
        text("Levels", 0, -HALFHEIGHT / 2);
    }

    gameoverScreen() {
        fill(0, 0, 0);
        textSize(Math.sin(millis()/500)*HALFWIDTH/20 + HALFWIDTH/4);

        ctx.save();

        ctx.rotate(Math.sin(millis()/250) / 10);
        if (this.lives == -1) {
            text("GAME OVER", 0, 0);
        }
        else {
            text("YOU WON", 0, 0);
        }

        ctx.restore();

        this.updateCoins();
    }

    shopScreen() {
        this.plane.updatePhysics();
        this.plane.display();

        // Shop sign
        fill(90, 60, 20);
        rect(0, -3/4 * HALFHEIGHT, HALFWIDTH, HALFHEIGHT / 2);
        fill(20, 20, 20);
        ellipse(2/5 * HALFWIDTH, -3/4 * HALFHEIGHT + HALFHEIGHT / 5, HALFWIDTH / 55, HALFWIDTH / 55);
        fill(15, 15, 15);
        ellipse(-2/5 * HALFWIDTH, -3/4 * HALFHEIGHT + HALFHEIGHT / 5, HALFWIDTH / 55, HALFWIDTH / 50);
        fill(25, 25, 25);
        ellipse(2/5 * HALFWIDTH, -3/4 * HALFHEIGHT - HALFHEIGHT / 5, HALFWIDTH / 55, HALFWIDTH / 55);
        fill(20, 20, 20);
        ellipse(-2/5 * HALFWIDTH, -3/4 * HALFHEIGHT - HALFHEIGHT / 5, HALFWIDTH / 50, HALFWIDTH / 50);

        fill(0, 0, 0);
        textSize(HALFWIDTH / 4);
        text("SHOP", 0, -7/10 * HALFHEIGHT);

        fill(60, 30, 10, 0.5);
        rect(HALFWIDTH / 16, -187/320 * HALFHEIGHT, 4/9 * HALFWIDTH, HALFHEIGHT / 12);

        fill(0, 0, 0);
        textSize(HALFWIDTH / 10);
        text(this.player.coins, 9/32 * HALFWIDTH, -11/20 * HALFHEIGHT, "right");

        fill(210, 210, 25);
        ellipse(-HALFWIDTH / 4, -187/320 * HALFHEIGHT, HALFWIDTH / 16, HALFHEIGHT / 16);
        textSize(HALFWIDTH / 8);
        fill(0, 0, 0);
        text("$", -HALFWIDTH / 4, -87/160 * HALFHEIGHT);

        // Split up the display and click checking for the scroll buttons to give them "priority" over the item buttons. Click must be called first so that they are checked before the shopItems buttons, and display must be called after, so that they are drawn over the shopItems buttons.
        this.callButtonsClicked(this.buttons["shopScroll"]);
        // Shop shelves
        for (var i = 0; i < this.shopShelves.length; i++) {
            var shelf = this.shopShelves[i];

            // Shelves
            fill(110, 115, 120);
            rect(WIDTH / 40, 2/7 * i * HALFHEIGHT - HALFHEIGHT / 4, 19/20 * WIDTH, HALFHEIGHT / 4);

            this.callButtons(this.buttons["shopItems"][i]);

            fill(150, 200, 255);
            rect(-WIDTH / 2, 2/7 * i * HALFHEIGHT - HALFHEIGHT / 4, WIDTH / 10, HALFHEIGHT / 4);
            fill(110, 115, 120);
            rect(-WIDTH / 4, 2/7 * i * HALFHEIGHT - HALFHEIGHT / 4, 8/20 * WIDTH, HALFHEIGHT / 4);

            fill(100, 105, 110);
            rect(WIDTH / 40, 2/7 * i * HALFHEIGHT - HALFHEIGHT / 4 + HALFHEIGHT / 7, 19/20 * WIDTH, HALFHEIGHT / 24);
            // Shelf name
            fill(175, 175, 175);
            rect(-WIDTH / 4, 2/7 * i * HALFHEIGHT - 22/71 * HALFHEIGHT, WIDTH / 3, HALFHEIGHT / 10);
            fill(0, 0, 0);
            textSize(HALFWIDTH / 12);
            text(shelf["name"], -WIDTH / 4, 2/7 * i * HALFHEIGHT - 20/71 * HALFHEIGHT);
        }
        this.callButtonsDisplay(this.buttons["shopScroll"]);
    }

    updatePhysics() {
        // Plane
        this.plane.updatePhysics();
        // Ball
        if (this.lossTimer <= 0) {
            this.ball.updatePhysics();
        }
        // Birds
        for (var i = 0; i < this.birds.length; i++) {
            var bird = this.birds[i];
            bird.fall();
            bird.wiggle();
        }
    }
    updateDisplay() {
        // Plane
        this.plane.display();
        // Ball
        this.ball.display();
        // Birds
        for (var i = 0; i < this.birds.length; i++) {
            var bird = this.birds[i];
            bird.display();
        }
    }

    updateCoins() {
        for (var i = 0; i < this.coins.length; i++) {
            var coin = this.coins[i];
            coin.display();
            coin.updatePhysics();
        }

        if (this.player.coinDisplay > 0) {
            this.player.displayCoins();
        }
    }
    setTimer() {
        this.lossTimer = 3;
    }

    initLevel() {
        this.levelSegment = 0;
        this.setTimer();
        this.lives = this.TOTALLIVES;
        this.ball.reset();
        this.initBirds();
    }

    initBirds() {
        this.birds = [];
        this.birdsFlight = true;

        if (this.level == "default" || this.level == "endless") {
            this.initBirdsDefault();
        }
        else if (this.level == "graveyard") {
            this.initBirdsGraveyard();
        }
        else if (this.level == "bird king") {
            this.initBirdsBirdKing();
        }
    }
    initBirdsDefault() {
        var rows = 5;
        for (var row = 1; row < rows; row++) {
            for (var col = -row; col < row + 1; col++) {
                this.birds.push(new Bird(new Vector2D((col+(Math.random()*2-1)/(row+1)) * WIDTH / (3*row), -(row + rows-4) * HALFHEIGHT / (rows+1))));
            }
        }
    }
    initBirdsGraveyard() {
        var rows = 5;
        for (var row = 1; row < rows; row++) {
            for (var col = -row; col < row + 1; col++) {
                this.birds.push(new Zombird(new Vector2D((col+(Math.random()*2-1)/(row+1)) * WIDTH / (3*row), -(row + rows-4) * HALFHEIGHT / (rows+1))));
            }
        }
    }
    initBirdsBirdKing() {
        this.birds.push(new BirdKing(new Vector2D(0, -2/3 * HALFHEIGHT)));
    }

}
