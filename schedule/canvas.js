/*
 * Canvas class
 *
 * Takes the id to which it will set the HTML element.
 * Creates a canvas element with the capability to be drawn on.
 * Canvas.resize() will size the canvas to fit within the window.
 */
class Canvas {

    constructor(id) {
        this.id = id;
        this.inputs = {
            "click": false,
            "mouseX": 0,
            "mouseY": 1e6
        };

        var canvasElement = document.createElement("canvas");
        canvasElement.id = id;
        document.getElementById("canvases").appendChild(canvasElement);
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext("2d");

        this.doStroke = false;

        this.canvas.onmouseup = function(e) {
            this.inputs["click"] = true;
        }.bind(this);
        this.canvas.onmousemove = function(e) {
            var rect = this.canvas.getBoundingClientRect();
            var x = e.clientX - rect.left - this.canvas.width/2;
            var y = e.clientY - rect.top - this.canvas.height/2;

            this.inputs["mouseX"] = x;
            this.inputs["mouseY"] = y;

            schedule.checkMouse(this);
        }.bind(this);
    }

    resize() {
        this.ctx.translate(-HALFWIDTH, -HALFHEIGHT);

        this.canvas.width = 4/5 * window.innerWidth;
        this.canvas.height = this.canvas.width;
        if (this.canvas.height > 7/8 * window.innerHeight) {
            // If the height is greater than the height of the screen, set it accordingly.
            this.canvas.height = 7/8 * window.innerHeight;
            this.canvas.width = this.canvas.height;
        }

        WIDTH = this.canvas.width;
        HEIGHT = this.canvas.height;
        HALFWIDTH = WIDTH / 2;
        HALFHEIGHT = HEIGHT / 2;

        this.ctx.translate(HALFWIDTH, HALFHEIGHT);
    }

    fill(red, green, blue, alpha) {
      if (alpha === undefined) {
        alpha = 1;
      }
      this.ctx.fillStyle = "rgba("+Math.floor(red)+","+Math.floor(green)+","+Math.floor(blue)+","+alpha+")";
    }
    noStroke() {
      this.doStroke = false;
    }
    stroke(red, green, blue) {
      this.ctx.strokeStyle = "rgb("+Math.floor(red)+","+Math.floor(green)+","+Math.floor(blue)+")";
      this.doStroke = true;
    }
    strokeWeight(weight) {
      this.ctx.lineWidth = weight;
      this.doStroke = true;
    }
    rect(x, y, width, height) {
      this.ctx.beginPath();
      this.ctx.rect(x - width/2, y - height/2, width, height);
      this.ctx.closePath();
      this.ctx.fill();
      if (this.doStroke) {
        this.ctx.stroke();
      }
    }
    ellipse(x, y, xRadius, yRadius) {
      this.ctx.beginPath();
      this.ctx.ellipse(x, y, xRadius, yRadius, 0, 0, 2*Math.PI);
      this.ctx.closePath();
      this.ctx.fill();
      if (this.doStroke) {
        this.ctx.stroke();
      }
    }
    line(x1, y1, x2, y2) {
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.closePath();
      this.ctx.stroke();
    }
    textSize(size) {
      this.ctx.font = size + "px Arial";
    }
    text(str, x, y, alignment) {
      if (alignment === undefined) {
        alignment = "center";
      }
      this.ctx.textAlign = alignment;
      this.ctx.fillText(str, x, y);
    }
    textWrap(str, x, y, width, fontSize) {
      // Idea adapted from https://codepen.io/ashblue/pen/fGkma?editors=0010
      
      var lines = [],
          line = "",
          lineTest = "",
          words = str.split(" "),
          currentY = y;
      
      this.textSize(fontSize);
      
      for (var i = 0, len = words.length; i < len; i++) {
        lineTest = line + words[i] + " ";
        
        if (this.ctx.measureText(lineTest).width < width) {
          line = lineTest;
        }
        else {
          currentY += fontSize;
          
          lines.push({"text": line, "currentY": currentY});
          line = words[i] + " ";
        }
      }
      
      // Catch last line in-case something is left over
      if (line.length > 0) {
        currentY += fontSize;
        lines.push({ "text": line.trim(), "currentY": currentY });
      }
      
      for (var i = 0, len = lines.length; i < len; i++) {
        this.text(lines[i]["text"], x, lines[i]["currentY"] - fontSize/2 * (lines.length - 1));
      }
    }
}
