var flashcards;

function readFile(file) {
    var reader = new FileReader(), text;
    reader.onload = function() {
        text = reader.result; 
        flashcards = new FlashcardSet(text);
    }
    reader.readAsText(file);
}

document.getElementById("flashcard").onclick = function(e) {
    if (flashcards === undefined) {
        return;
    }
    flashcards.flashcards[flashcards.currentFlashcard].flip();
}
