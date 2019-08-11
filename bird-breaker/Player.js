class Player {

    constructor() {
        this.coins = 0;
        this.planes = [];

        // Whenever above 0, display how many coins are owned.
        this.coinDisplay = 0;
    }

    displayCoins() {
        this.coinDisplay -= 1;

        var transparency = 1 - Math.pow(1 - this.coinDisplay/fps/3, 9);

        ctx.save();

        ctx.translate(-3/4 * HALFWIDTH, 7/8 * HALFHEIGHT);

        fill(120, 75, 0, transparency);
        rect(0, 0, HALFWIDTH / 3, HALFHEIGHT / 15);

        fill(220, 220, 220, transparency);
        textSize(HALFWIDTH / 15);
        text(this.coins, HALFWIDTH / 30, HALFHEIGHT / 45);

        fill(210, 210, 25, transparency);
        ellipse(-HALFWIDTH / 8, 0, HALFWIDTH / 45, HALFHEIGHT / 45);
        fill(0, 0, 0, transparency);
        textSize(HALFWIDTH / 25);
        text("$", -HALFWIDTH / 8, HALFHEIGHT / 70);

        ctx.restore();
    }

}
