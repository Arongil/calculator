class FlashcardSet {

    constructor(text) {
        this.entries = text.split("\n");
        this.flashcards = [];
        for (var i = 0, split; i < this.entries.length; i++) {
            split = this.entries[i].split("=");
            if (split.length !== 2) continue; // If the flashcard set file has a line without an =, skip the line.
            this.flashcards.push(new Flashcard(
                split[0].trim(),
                split[1].trim()
            ));
        }
        this.currentFlashcard = 0;
        this.flashcards[this.currentFlashcard].init();
    }

    randomize() {
        var randomized = [], remaining = [], i;
        for (i = 0; i < this.flashcards.length; i++) {
            remaining.push(i);
        }
        while (remaining.length > 0) {
            var index = Math.floor(Math.random() * remaining.length);
            randomized.push(this.flashcards[remaining[index]]);
            remaining.splice(index, 1);
        }
        this.flashcards = randomized;
        this.currentFlashcard = 0;
        this.flashcards[this.currentFlashcard].init();
    }

    nextFlashcard(number = 1) {
        for (var i = 0; i < number; i++) {
            this.currentFlashcard = (this.currentFlashcard + 1) % this.flashcards.length; 
            this.flashcards[this.currentFlashcard].init();
        }
    }

    previousFlashcard(number = 1) {
        for (var i = 0; i < number; i++) {
            this.currentFlashcard = this.currentFlashcard - 1;
            if (this.currentFlashcard < 0) {
                this.currentFlashcard = this.flashcards.length - 1;
            }
            this.flashcards[this.currentFlashcard].init();
        }
    }

}
