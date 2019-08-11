function setGameData(GC) {
    setButtons(GC);
    setShopShelves(GC);
}

function setButtons(GC) {
    GC.buttons = {
        "menu": [
            new Button(0, -HALFHEIGHT / 5, HALFWIDTH / 2, HALFHEIGHT / 6, "PLAY", HALFHEIGHT / 7, function() {
                GC.screen = "levels";
            }),
            new Button(0, 0, HALFWIDTH / 2, HALFHEIGHT / 6, "SHOP", HALFHEIGHT / 7, function() {
                GC.screen = "shop";
            })
        ],
        "levels": [
            new Button(4/5 * HALFWIDTH, 15/16 * HALFHEIGHT, WIDTH / 6, HEIGHT / 24, "BACK", HALFHEIGHT / 16, function() {
                GC.screen = "menu";
            }),
            new Button(-HALFWIDTH / 2, -HALFHEIGHT / 5, 53/64 * HALFWIDTH, HALFHEIGHT / 5, "NORMAL", 11/72 * HALFHEIGHT, function() {
                GC.screen = "game";
                GC.level = "default";
                GC.initLevel();
            }),
            new Button(HALFWIDTH / 2, -HALFHEIGHT / 5, 53/64 * HALFWIDTH, HALFHEIGHT / 5, "ENDLESS", 11/72 * HALFHEIGHT, function() {
                GC.screen = "game";
                GC.level = "endless";
                GC.initLevel();
            }),
            new Button(-HALFWIDTH / 2, HALFHEIGHT / 16, 53/64 * HALFWIDTH, HALFHEIGHT / 5, "ZOMBIRD", 11/72 * HALFHEIGHT, function() {
                GC.screen = "game";
                GC.level = "graveyard";
                GC.initLevel();
            }),
            new Button(HALFWIDTH / 2, HALFHEIGHT / 16, 53/64 * HALFWIDTH, HALFHEIGHT / 5, "BIRD KING", 11/72 * HALFHEIGHT, function() {
                GC.screen = "game";
                GC.level = "bird king";
                GC.initLevel();
            })
        ],
        "game": [
            new Button(4/5 * HALFWIDTH, 15/16 * HALFHEIGHT, WIDTH / 6, HEIGHT / 24, "PAUSE", HALFHEIGHT / 16, function() {
                GC.paused = true;
            }),
        ],
        "paused": [
            new Button(0, -2/32 * HALFHEIGHT, WIDTH / 3, HEIGHT / 13, "RESUME", HALFHEIGHT / 8, function() {
                GC.paused = false;
            }),
            new Button(0, 4 * HALFHEIGHT / 32, WIDTH / 3, HEIGHT / 13, "MENU", HALFHEIGHT / 8, function() {
                GC.paused = false;
                GC.screen = "menu";
            }),
            new Button(0, 10 * HALFHEIGHT / 32, WIDTH / 3, HEIGHT / 13, "RESTART", HALFHEIGHT / 8, function() {
                GC.paused = false;
                GC.initLevel();
            })
        ],
        "gameover": [
            new Button(0, HALFHEIGHT / 4, WIDTH / 3, HEIGHT / 12, "RESTART", HALFHEIGHT / 8, function() {
                GC.screen = "game";
                GC.initLevel();
            }),
            new Button(0, 15 * HALFHEIGHT / 32, WIDTH / 3, HEIGHT / 12, "MENU", HALFHEIGHT / 8, function() {
                GC.screen = "menu";
            })
        ],
        "shop": [
            new Button(4/5 * HALFWIDTH, 15/16 * HALFHEIGHT, WIDTH / 6, HEIGHT / 24, "BACK", HALFHEIGHT / 16, function() {
                GC.screen = "menu";
            })
        ],
        "shopScroll": [],
        "shopItems": []
    };
}

function setShopShelves(GC) {
    GC.shopShelves = [
        {
            "name": "WINGS",
            "scroll": 0,
            "items": [
                {
                    "cost": 10,
                    "action": function() {
                        if (GC.player.coins >= 10) {
                            GC.player.coins -= 10;
                            GC.plane.parts["rects"] = [
                                new Rect(0, 0, 5/16 * WIDTH, HEIGHT / 30, 0)
                            ];

                            GC.plane.turnSpeed = 0.004;
                            GC.plane.baseReliability = 0.25 * 1.5;
                            GC.plane.engineRecovery = 0.1;
                        }
                    },
                    "name": "1",
                    "description": "Using one wing provides the default values of engine recovery against birds and agility."
                },
                {
                    "cost": 45,
                    "action": function() {
                        if (GC.player.coins >= 45) {
                            GC.player.coins -= 45;
                            GC.plane.parts["rects"] = [
                                new Rect(WIDTH / 10, 0, WIDTH / 60, 1/16 * HEIGHT, 0, [100, 70, 20]),
                                new Rect(-WIDTH / 10, 0, WIDTH / 60, 1/16 * HEIGHT, 0, [100, 70, 20]),
                                new Rect(0, HEIGHT / 50, 5/16 * WIDTH, HEIGHT / 40, 0),
                                new Rect(0, -HEIGHT / 50, 5/16 * WIDTH, HEIGHT / 40, 0)
                            ];

                            GC.plane.turnSpeed = 0.004 * 0.85;
                            GC.plane.baseReliability = 0.25 * 1.25;
                            GC.plane.engineRecovery = 0.1 * 1.25;
                        }
                    },
                    "name": "2",
                    "description": "Using two wings provides a 25% increase in engine recovery against birds, but a 15% decrease in agility."
                },
                {
                    "cost": 55,
                    "action": function() {
                        if (GC.player.coins >= 55) {
                            GC.player.coins -= 55;
                            GC.plane.parts["rects"] = [
                                new Rect(WIDTH / 10, 0, WIDTH / 60, 1/16 * HEIGHT, 0, [100, 70, 20]),
                                new Rect(-WIDTH / 10, 0, WIDTH / 60, 1/16 * HEIGHT, 0, [100, 70, 20]),
                                new Rect(0, HEIGHT / 25, 5/16 * WIDTH, HEIGHT / 40, 0),
                                new Rect(0, -HEIGHT / 25, 5/16 * WIDTH, HEIGHT / 40, 0),
                                new Rect(0, 0, 5/16 * WIDTH, HEIGHT / 40, 0)
                            ];

                            GC.plane.turnSpeed = 0.004 * 0.7;
                            GC.plane.baseReliability = 0.25 * 1.5;
                            GC.plane.engineRecovery = 0.1 * 1.5;
                        }
                    },
                    "name": "3",
                    "description": "Using three wings provides a 50% increase in engine recovery against birds, but a 30% decrease in agility."
                },
                {
                    "cost": 65,
                    "action": function() {
                        if (GC.player.coins >= 65) {
                            GC.player.coins -= 65;
                            GC.plane.parts["rects"] = [
                                new Rect(0, 0, 5/16 * WIDTH, HEIGHT / 24, 0),
                                new Rect(-5/32 * WIDTH, 0, WIDTH / 30, HEIGHT / 12, 0),
                                new Rect(5/32 * WIDTH, 0, WIDTH / 30, HEIGHT / 12, 0),
                                new Rect(-9/64 * WIDTH, -1/17 * HEIGHT, WIDTH / 30, HEIGHT / 16, -pi/5),
                                new Rect(9/64 * WIDTH, -1/17 * HEIGHT, WIDTH / 30, HEIGHT / 16, pi/5),
                                new Rect(-9/64 * WIDTH, 1/17 * HEIGHT, WIDTH / 30, HEIGHT / 16, pi/5),
                                new Rect(9/64 * WIDTH, 1/17 * HEIGHT, WIDTH / 30, HEIGHT / 16, -pi/5)
                            ];

                            GC.plane.turnSpeed = 0.004 * 1.5;
                        }
                    },
                    "name": "TIE",
                    "description": "Using the TIE fighter configuration provides incredible agility (150%) at the cost of a clumsy surface."
                }
            ]
        },
        {
            "name": "PROPELLERS",
            "scroll": 0,
            "items": [
                {
                    "cost": 15,
                    "action": function() {
                        if (GC.player.coins >= 15) {
                            GC.player.coins -= 15;
                            GC.plane.parts["propellers"] = [
                                new Propeller(new Vector2D(0, 0), HEIGHT / 20)
                            ];

                            GC.plane.speed = WIDTH / 50;
                        }
                    },
                    "name": "1",
                    "description": "Using one propeller provides the default plane speed."
                },
                {
                    "cost": 45,
                    "action": function() {
                        if (GC.player.coins >= 45) {
                            GC.player.coins -= 45;
                            GC.plane.parts["propellers"] = [
                                new Propeller(new Vector2D(WIDTH / 12, 0), HEIGHT / 20),
                                new Propeller(new Vector2D(-WIDTH / 12, 0), HEIGHT / 20)
                            ];

                            GC.plane.speed = WIDTH / 50 * 1.1;
                        }
                    },
                    "name": "2",
                    "description": "Using two propellers provides a 10% increase in plane speed."
                },
                {
                    "cost": 75,
                    "action": function() {
                        if (GC.player.coins >= 75) {
                            GC.player.coins -= 75;
                            GC.plane.parts["propellers"] = [
                                new Propeller(new Vector2D(WIDTH / 31, 0), HEIGHT / 32),
                                new Propeller(new Vector2D(-WIDTH / 31, 0), HEIGHT / 32),
                                new Propeller(new Vector2D(WIDTH / 10, 0), HEIGHT / 32),
                                new Propeller(new Vector2D(-WIDTH / 10, 0), HEIGHT / 32)
                            ];

                            GC.plane.speed = WIDTH / 50 * 1.2;
                        }
                    },
                    "name": "4",
                    "description": "Using four propellers provides a 20% increase in plane speed."
                }
            ]
        },
        {
            "name": "DOODADS",
            "scroll": 0,
            "items": [
                {
                    "cost": 1,
                    "action": function() {
                        if (GC.player.coins >= 1) {
                            GC.player.coins -= 1;
                            GC.ai = false;
                        }
                    },
                    "name": "RI",
                    "description": "Regular intelligence... no... unintelligence."
                },
                {
                    "cost": 250,
                    "action": function() {
                        if (GC.player.coins >= 250) {
                            GC.player.coins -= 250;
                            GC.ai = true;
                        }
                    },
                    "name": "AI",
                    "description": "The label is a misprint. It really stands for Artificial Unintelligence."
                },
            ]
        }
    ];

    // Set the left and right scroll buttons for the shop's shelves.
    GC.scrollSpeed = WIDTH / 4;
    for (var i = 0; i < GC.shopShelves.length; i++) {
        GC.buttons["shopItems"].push([]);
        for (var j = 0; j < GC.shopShelves[i]["items"].length; j++) {
            // Item buttons
            var item = GC.shopShelves[i]["items"][j];

            GC.buttons["shopItems"][i].push(new Button(1/4 * j * WIDTH + WIDTH / 16, 2/7 * i * HALFHEIGHT - 16/71 * HALFHEIGHT, 7/16 * HALFWIDTH, HALFHEIGHT / 6, item.name, HALFWIDTH / 6, item.action, {"cost": item.cost, "description": item.description}));
            GC.buttons["shopItems"][i][GC.buttons["shopItems"][i].length - 1].onMouseOver = function() {
                if (this.x < -1/12 * WIDTH) {
                    return 0;
                }
                // Show the pricetag.
                fill(160, 160, 160);
                rect(this.x, this.y, this.width, this.height);

                textSize(13/16 * this.labelSize);
                fill(0, 0, 0);
                text(this.data.cost, this.x + 7/16 * this.width, this.y + this.labelSize / 4, "right");

                fill(210, 210, 25);
                ellipse(this.x - HALFWIDTH / 7, this.y, HALFWIDTH / 16, HALFHEIGHT / 16);
                fill(0, 0, 0);
                textSize(3/4 * this.labelSize);
                text("$", this.x - HALFWIDTH / 7, this.y + this.labelSize / 4);

                // Show the description.
                fill(5, 20, 60, 0.8);
                rect(this.x, this.y - 21/10 * this.height, this.width, 3 * this.height);

                fill(160, 170, 200);
                textWrap(this.data.description, this.x, this.y - 18/5 * this.height, this.width, this.width / 8);
            };
        }

        // Scroll buttons
        GC.buttons["shopScroll"].push(new Button(-WIDTH / 4 + HALFWIDTH / 10, 2/7 * i * HALFHEIGHT - 14/71 * HALFHEIGHT, WIDTH / 12, HEIGHT / 24, ">", HALFHEIGHT / 12, function() {
            GC.shopShelves[this.data]["scroll"] -= GC.scrollSpeed;
            for (var i = 0; i < GC.buttons["shopItems"][this.data].length; i++) {
                var item = GC.buttons["shopItems"][this.data][i];

                item.x -= GC.scrollSpeed;
            }
        }, i));
        GC.buttons["shopScroll"].push(new Button(-WIDTH / 4 - HALFWIDTH / 10, 2/7 * i * HALFHEIGHT - 14/71 * HALFHEIGHT, WIDTH / 12, HEIGHT / 24, "<", HALFHEIGHT / 12, function(i) {
            if (GC.shopShelves[this.data]["scroll"] < 0) {
                GC.shopShelves[this.data]["scroll"] += GC.scrollSpeed;
                for (var i = 0; i < GC.buttons["shopItems"][this.data].length; i++) {
                    var item = GC.buttons["shopItems"][this.data][i];

                    item.x += GC.scrollSpeed;
                }
            }
        }, i));
    }
}
