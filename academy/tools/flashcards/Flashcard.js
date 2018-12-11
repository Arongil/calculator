var frontContent = document.getElementById("front-content");
var backContent = document.getElementById("back-content");

class Flashcard {

    constructor(front, back) {
        this.front = front;
        this.back = back;
        this.onFront = true;
    }

    flip() {
        this.onFront = !this.onFront;
        if (this.onFront) {
            this.displayFront();
        }
        else {
            this.displayBack();
        }
    }

    init() {
        this.onFront = true;
        this.displayFront();
    }

    displayFront() {
        frontContent.textContent = this.front;
        backContent.textContent = "";
    }

    displayBack() {
        frontContent.textContent = "";
        backContent.textContent = this.back;
    }

}
