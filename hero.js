/* Hero */

/*
* The hero is drawn as a 32 x 32 sprite, its hitbox is 22 x 28.
* Its center point is at the center of its hitbox (x = 11; y = 14)
* A few other points are placed around the hitbox to simplify the collision tests:
* L1, C1, R1 (x = 0 / 11 / 21; y = 0)
* L2, C2, R2 (x = 0 / 11 / 21; y = 14)
* L3, R3 (x = 0 / 21; y = 24)
* L4, L5, C3, R5, R4 (x = 0 / 4 / 11 / 16 / 21; y = 24)
* 
*               C1
* L1 *-----------*-----------* R1
*    |                       |
*    |                       |
*    |                       |
*    |                       |
*    |                       |
*    |                       |
*    |                       |
*    |                       |
*    |                       |
*    |                       |
*    |                       |
*    |           C2          |
* L2 *            *          * R2
*    |    (hero.x; hero.y)   |
*    |                       |
*    |                       |
*    |                       |
*    |                       |
*    |                       |
*    |                       |
*    |                       |
*    |                       |
* L3 *                       * R3
*    |                       |
*    |                       |
*    |                       |
* L4 *---*-------*-------*---* R4
*       L5      C3       R5
*
*/

// Constants
var hero_w = 22;
var hero_h = 28;

// Unrotated vectors
var uL1 = [-11, -14];
var uC1 = [0, -14];
var uR1 = [11, -14];
var uL2 = [-11, 0];
var uR2 = [11, 0];
var uL3 = [-11, 10];
var uC3 = [0, 14];
var uR3 = [11, 10];
var uL4 = [-11, 14];
var uR4 = [11, 14];
var uL5 = [-7, 14];
var uR5 = [7, 14];
var uwalk_speed = [0,0];
var uwalk_acceleration = [.5,0];
var uwalk_idle_deceleration = [-.5, 0];
var umax_walk_speed = [2,0];
var ujump_speed = [0,-7.4];
var ujump_fall_speed = [0,0];
var umax_fall_speed = [0,15];
var ugravity = [0,.4];

// Base vectors (all the others are computed based on these)
var uright = [1,0];
var ubottom = [0,1];

// Properties
var hero = {
  x: 250, // x position
  y: 200, // y position
  angle: 0, // angle in radians (0: head on top)
  L1: [-11, -14], // Position of L1 from center (C2)
  C1: [0, -14],
  R1: [11, -14],
  L2: [-11, 0],
  R2: [11, 0],
  L3: [-11, 10],
  C3: [0, 14],
  R3: [11, 10],
  L4: [-11, 14],
  R4: [11, 14],
  L5: [-7, 14],
  R5: [7, 14],
  walk_speed: [0,0], // current walk (horizontal) speed
  walk_acceleration: [.5,0], // walk acceleration (on the right)
  walk_idle_deceleration: [-.5, 0], // deceleration (after stopping to walk on the right)
  max_walk_speed: [2,0], // max walk speed (on the right)
  jump_speed: [0,-7.4], // jump speed when the hump starts
  jump_fall_speed: [0,0], // current jump/fall (vertical) speed
  max_fall_speed: [0,15], // max fall speed
  gravity: [0,.4], // gravity acceleration (bottom)
  right: [1,0], // Normalized vector to the "right"
  bottom: [0,1], // and "bottom"
  freefall: true // freefall
};

// Functions
var rotate_hero = function(angle_deg){
  
  // Convert in radians
  hero.angle = angle_deg * Math.PI / 180;
  
  // The names of the base vectors to rotate using maths, and their const equivalent
  var base_vectors = {
    "right": uright,
    "bottom": ubottom
  }
  
  // The names of the immportant vectors to rotate using the base vectors, and their const equivalent
  var vectors = {
    "L1": uL1,
    "C1": uC1,
    "R1": uR1,
    "L2": uL2,
    "R2": uR2,
    "L3": uL3,
    "C3": uC3,
    "R3": uR3,
    "L4": uL4,
    "R4": uR4,
    "L5": uL5,
    "R5": uR5,
    "walk_speed": uwalk_speed,
    "walk_acceleration": uwalk_acceleration,
    "walk_idle_deceleration": uwalk_idle_deceleration,
    "max_walk_speed": umax_walk_speed,
    "jump_speed": ujump_speed,
    "jump_fall_speed": ujump_fall_speed,
    "max_fall_speed": umax_fall_speed,
    "gravity": ugravity
  };
  
  // Rotate base vectors
  for(var i in base_vectors){
    hero[i] = [
      base_vectors[i][0] * Math.cos(hero.angle) - base_vectors[i][1] * Math.sin(hero.angle),
      base_vectors[i][0] * Math.sin(hero.angle) + base_vectors[i][1] * Math.cos(hero.angle)
    ];
  }
  
  // Rotate real vectors
  for(var i in vectors){
    hero[i] = [
      vectors[i][0] * hero.right[0] + vectors[i][1] * hero.bottom[0],
      vectors[i][0] * hero.right[1] + vectors[i][1] * hero.bottom[1]
    ];
    
    ctx.fillStyle = "red";
    ctx.fillRect(hero.x + hero[i][0]-2, hero.y + hero[i][1]-2,4,4);
    
    // Right: 0,1 ok
    // Bottom: -1,0 ok
    // uL1: -11, -14 ok
    // L1 = -11*0-14*-1, -11*1-14*0
    //    = 14, -11
  }
  
  //console.log(hero.right, hero.bottom, hero.L1);
  
}

// Hero moves (left / right / jump / fall)
var move_hero = function(){
    
  // Walk left:
  if(keys.left){
    
    // Apply a negative walk acceleration to the hero's speed
    hero.walk_speed[0] -= hero.walk_acceleration[0];
    hero.walk_speed[1] -= hero.walk_acceleration[1];
    
    // Limit the hero's speed
    if(Math.abs(hero.walk_speed[0]) > Math.abs(hero.max_walk_speed[0]) && Math.abs(hero.walk_speed[1]) > Math.abs(hero.max_walk_speed[1])){
      hero.walk_speed[0] = -hero.max_walk_speed[0];
      hero.walk_speed[1] = -hero.max_walk_speed[1];
    }
    
    hero.x += hero.walk_speed[0];
    hero.y += hero.walk_speed[1];
    
  }
  
  // Walk right:
  else if(keys.right){
    
    // Apply a negative walk acceleration to the hero's speed
    hero.walk_speed[0] += hero.walk_acceleration[0];
    hero.walk_speed[1] += hero.walk_acceleration[1];
    
    
    // Limit the hero's speed
    if(Math.abs(hero.walk_speed[0]) > Math.abs(hero.max_walk_speed[0]) && Math.abs(hero.walk_speed[1]) > Math.abs(hero.max_walk_speed[1])){
      hero.walk_speed[0] = hero.max_walk_speed[0];
      hero.walk_speed[1] = hero.max_walk_speed[1];
    }
    
      hero.x += hero.walk_speed[0];
      hero.y += hero.walk_speed[1];
    
  }
  
  // Idle:
  
  else{
    hero.walk_speed = [0,0];
  }
  /*else {
    
    // If the hero stops walking, decelerate
    if(hero.walk_speed[0] > 0 || hero.walk_speed[1] > 0){
      hero.walk_speed[0] += hero.walk_idle_deceleration[0];
      hero.walk_speed[1] += hero.walk_idle_deceleration[1];
    }
    else if(hero.walk_speed[0] < 0 || hero.walk_speed[1] < 0){
      hero.walk_speed[0] -= hero.walk_idle_deceleration[0];
      hero.walk_speed[1] -= hero.walk_idle_deceleration[1];
    }
  }*/
  
  // Move really (update x and y)

  
  // Stuck on the left:
  
  
  // Climb a slope on the left:
  
  
  // Slide if the slope is too strong on the left:
  
  
  // Stuck on the right:
  
  
  // Climb a slope on the right:
  
  
  // Slide if the slope is too strong on the right:
  
  
  // Jump:
  
  
  // Freefall:
  
  
  // Stuck on top:
  
  
  // Stuck on bottom:
  
  
  
  
  /*// Left
  if(keys.left && !keys.right){
    hero.walk_speed[0] -= hero.walk_acceleration[0];
    if(hero.walk_speed[0] < -hero.max_walk_speed[0]){
      hero.walk_speed[0] = -hero.max_walk_speed[0];
    }
  }

  // Right
  else if(keys.right){
    hero.walk_speed[0] += hero.walk_acceleration[0];
    if(hero.walk_speed[0] > hero.max_walk_speed[0]){
      hero.walk_speed[0] = hero.max_walk_speed[0];
    }
  }
  
  // Idle
  else{
    if(hero.walk_speed[0] > 0){
      hero.walk_speed[0] += hero.walk_idle_deceleration[0];
    }
    else if(hero.walk_speed[0] < 0){
      hero.walk_speed[0] -= hero.walk_idle_deceleration[0];
    }
  }
  
  // Move
  hero.x += hero.walk_speed[0];
  
  // Stuck left
  if(
    bottomleft() != "2"
    && ((tiles[topleft()].solid[1] == 1)||(tiles[bottomleft()].solid[1] == 1))
  ){
    hero.x = Math.floor((hero.x - (hero_w / 2)) / tile_w) * tile_w + tile_w + (hero_w / 2);
  }
  
  // Stuck right
  if((tiles[topright()].solid[3] == 1) || (tiles[bottomright()].solid[3] == 1)){
    hero.x = Math.floor((hero.x + (hero_w / 2)) / tile_w) * tile_w - (hero_w / 2);
  }

  // Jump
  if(keys.up && !hero.freefall){
    hero.freefall = true;
    hero.jump_fall_speed[1] += hero.jump_speed[1];
  }

  // Feefall
  hero.jump_fall_speed[1] += hero.gravity[1];
  
  if(hero.jump_fall_speed[1] > hero.max_fall_speed[1]){
    hero.jump_fall_speed[1] = hero.max_fall_speed[1];
  }
  
  // Move
  hero.y += hero.jump_fall_speed[1];
  hero.freefall = true;

  // Stuck on top
  if(hero.jump_fall_speed[1] <= 0){
    
    if((tiles[topleft()].solid[2] == 1) || (tiles[topright()].solid[2]) == 1){
      hero.y = Math.floor((hero.y - (hero_h / 2)) / tile_h) * tile_h + tile_h + (hero_h / 2);
      hero.jump_fall_speed[1] = 0;
    }
  }

  // Stuck on bottom
  if(hero.jump_fall_speed[1] >= 0){

    if((tiles[bottomleft()].solid[0] == 1) || (tiles[bottomright()].solid[0] == 1)){
      hero.y = Math.floor((hero.y + (hero_h / 2)) / tile_h) * tile_h - (hero_h / 2);
      hero.freefall = false;
      hero.jump_fall_speed[1] = 0;
    }
  }
  
  // Slope bottom right
  if(tiles[bottomright()].solid[0] == 2 && hero.jump_fall_speed[1] >= 0){
    
    // Projection on the slope
    var tmp = Math.ceil((hero.y + hero_h / 2 - 1) / tile_h) * tile_h - tiles[bottomright()].slope((hero.x + (hero_w / 2)) % tile_w) - (hero_h / 2 - 1);
    
    l1.value=hero.y;
    if(tmp != 241 && tmp != 240.5) l2.value=tmp;
    
    if(tmp <= hero.y){
      hero.y = tmp;
      hero.freefall = false;
      hero.jump_fall_speed[1] = 0;
    }
  }*/
}