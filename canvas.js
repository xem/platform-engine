/* Canvas */

// Canvas context
var ctx = canvas.getContext("2d");

// Canvas DOMRect
canvas_rect = {}

// When the window is resized
onresize = function(){
  
  // Change the canvas style depending on the screen ratio vs. 16/9
  if(innerWidth < innerHeight * 16 / 9){
    canvas.className = "portrait";
  }
  else {
    canvas.className = "landscape";
  }
  
  // Save DOMRect
  canvas_rect = canvas.getBoundingClientRect();
}

onresize();