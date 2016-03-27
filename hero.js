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

// Base vectors (Right and Bottom vectors of length 1)
// These two vectors get rotated according to the hero's angle
// then all the other vectors are deduced from them 
var uright = [1,0];
var ubottom = [0,1];

// Working vectors
// These vectors are not used as-is but rotated according to the hero's angle and stored in the hero's properties
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


// The names of the base vectors to rotate using maths, and their const equivalent
base_vectors = {
  "right": uright,
  "bottom": ubottom
}
  
// The names of the immportant vectors to rotate using the base vectors, and their const equivalent
vectors = {
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
};


// Properties
var hero = {
  x: 250, // x position of C2
  y: 200, // y position of C2
  
  angle: 0, // angle in radians (0: head on top)
  
  // Vectors (rotated with the hero)
  right: [], // Normalized vector to the "right" (relative to the hero)
  bottom: [], // and "bottom"
  
  L1: [], // Position of L1 from center (C2)
  C1: [], // etc
  R1: [],
  L2: [],
  R2: [],
  L3: [],
  C3: [],
  R3: [],
  L4: [],
  R4: [],
  L5: [],
  R5: [],

  // Speeds and accelerations:
  // Constant
  max_walk_speed: 5,
  walk_acceleration: 0.3,
  walk_idle_deceleration: -.6,
  jump_speed: -7.4,
  gravity: 2,
  
  // Variable
  walk_speed: 0,
  jump_fall_speed: 0,
  max_fall_speed: 0,
  
  // State
  freefall: true // freefall
};

// Functions
var rotate_hero = function(angle_deg){
  
  // Convert in radians
  hero.angle = angle_deg * Math.PI / 180;
  
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
  }
}

// Hero moves (left / right / jump / fall)
var move_hero = function(){
    
  // Walk left:
  if(keys.left && !keys.right){
    
    // Apply a negative walk acceleration to the hero's speed
    hero.walk_speed -= hero.walk_acceleration;
    
    // Limit the hero's speed
    if(hero.walk_speed < -hero.max_walk_speed){
      hero.walk_speed = -hero.max_walk_speed;
    }
    
  }
  
  // Walk right:
  else if(keys.right && !keys.left){
    
    // Apply a negative walk acceleration to the hero's speed
    hero.walk_speed += hero.walk_acceleration;
    
    
    // Limit the hero's speed
    if(hero.walk_speed > hero.max_walk_speed){
      hero.walk_speed = hero.max_walk_speed;
    }
    
  }
  
  // Idle:
  
  else{
    
    if(Math.abs(hero.walk_speed) < 1){
      hero.walk_speed = 0;
    }
    
    else{
      
      // If the hero stops walking, decelerate
      if(hero.walk_speed > 0){
        hero.walk_speed += hero.walk_idle_deceleration;
      }
      else if(hero.walk_speed < 0){
        hero.walk_speed -= hero.walk_idle_deceleration;
      }
    }
  }
  
  // Move really (update x and y)
  for(var i = 0; i < Math.abs(hero.walk_speed); i++){
    hero.x += hero.right[0] * Math.sign(hero.walk_speed);
    hero.y += hero.right[1] * Math.sign(hero.walk_speed);
    
    //l1.value = hero.x + hero.R1[0];
    //l2.value = hero.y + hero.R1[1];
    // Detect collision on the right (R1,R2,R4)
    if(
      (hero.walk_speed > 0 && 
        (
          is_solid(hero.x + hero.R1[0], hero.y + hero.R1[1])
          ||
          is_solid(hero.x + hero.R2[0], hero.y + hero.R2[1])
          ||
          is_solid(hero.x + hero.R3[0], hero.y + hero.R3[1])
        )
      )
    ){
      hero.walk_speed = 0;
      hero.x -= hero.right[0];
      hero.y -= hero.right[1];
      break;
    }
    
    else if(
      (hero.walk_speed < 0 && 
        (
          is_solid(hero.x + hero.L1[0], hero.y + hero.L1[1])
          ||
          is_solid(hero.x + hero.L2[0], hero.y + hero.L2[1])
          ||
          is_solid(hero.x + hero.L3[0], hero.y + hero.L3[1])
        )
      )
    ){
      hero.walk_speed = 0;
      hero.x -= -hero.right[0];
      hero.y -= -hero.right[1];
      break;
    }
  }
  
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