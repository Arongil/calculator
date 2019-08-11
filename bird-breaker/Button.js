class Button {

    constructor(x, y, width, height, label, labelSize, onClick, data) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.label = label;
        this.labelSize = labelSize;
        this.onClick = onClick;
        this.data = data;

        this.onMouseOver = function() {};
    }

    clicked() {
        var mouseX = InputFlags["mouseX"];
        var mouseY = InputFlags["mouseY"];
        if (mouseX > this.x - this.width/2 && mouseX < this.x + this.width/2 && mouseY > this.y - this.height/2 && mouseY < this.y + this.height/2) {
            // Mouse is within the button. Is it clicking?
            if (InputFlags["click"]) {
                this.onClick();
                return true;
            }
        }
        return false;
    }

    display() {
        var mouseOver = false;

        fill(200, 200, 200);
        var mouseX = InputFlags["mouseX"];
        var mouseY = InputFlags["mouseY"];
        if (mouseX > this.x - this.width/2 && mouseX < this.x + this.width/2 && mouseY > this.y - this.height/2 && mouseY < this.y + this.height/2) {
            fill(160, 160, 160);
            mouseOver = true;
        }
        rect(this.x, this.y, this.width, this.height);

        textSize(this.labelSize);
        fill(0, 0, 0);
        text(this.label, this.x, this.y + this.labelSize / 3);

        if (mouseOver) {
            this.onMouseOver();
        }
    }

}
