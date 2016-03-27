/* Inputs */

// Keys pressed
keys = {
  left: false,
  up: false,
  top: false
};


// Key down / keypress (left, top, right)
onkeydown = onkeypress = function(e){
  switch(e.keyCode){
    case 37:
      keys.left = true;
      break;
    case 38:
      keys.up = true;
      break;
    case 39:
      keys.right = true;
      break;
  }
};

// Key up (left, top, right)
onkeyup = function(e){
  switch(e.keyCode){
    case 37:
      keys.left = false;
      break;
    case 38:
      keys.up = false;
      break;
    case 39:
      keys.right = false;
      break;
  }
};