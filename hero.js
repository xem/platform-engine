/* Hero */

/*
* The hero is drawn as a 32 x 32 sprite, its hitbox is 22 x 28.
* Its center point is at the center of its hitbox (x = 11; y = 14)
* A few other points are placed around the hitbox to simplify the collision tests:
* L1, C1, R1 (x = 0 / 11 / 21; y = 0)
* L2, C2, R2 (x = 0 / 11 / 21; y = 14)
* L3, R3 (x = 0 / 21; y = 20)
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
* L3 *                       * R3
*    |                       |
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
var uL3 = [-11, 8];
var uC3 = [0, 14];
var uR3 = [11, 8];
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
  x: 200, // x position of C2
  y: 199, // y position of C2
  
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
  max_walk_speed: 3,
  walk_acceleration: 0.3,
  walk_idle_deceleration: -1,
  jump_speed: -14,
  gravity: 1,
  
  // Variable
  walk_speed: 0,
  fall_speed: 0,
  max_fall_speed: 6,
  
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
  
  // Move horizontally
  for(var i = 0; i < Math.abs(hero.walk_speed) * frametime_coef; i++){
    hero.x += hero.right[0] * Math.sign(hero.walk_speed);
    hero.y += hero.right[1] * Math.sign(hero.walk_speed);

    // Detect collision on the right (R1,R2,R3)
    if(hero.walk_speed > 0){
    
      // Climb a slope on the right (one solid between R4 and R3, but R1 + 3 "up", C1, L1, R2 and R3 not solid)
      if(
        !is_solid(hero.x + hero.R1[0] + -3 * hero.bottom[0], hero.y + hero.R1[1] + -3 * hero.bottom[1])
        &&
        !is_solid(hero.x + hero.C1[0], hero.y + hero.C1[1])
        &&
        !is_solid(hero.x + hero.L1[0], hero.y + hero.L1[1])
        &&
        !is_solid(hero.x + hero.R2[0], hero.y + hero.R2[1])
        &&
        !is_solid(hero.x + hero.R3[0], hero.y + hero.R3[1])
      ){
        for(var j = 0; j < 4; j++){
          if(is_solid(hero.x + hero.R4[0] + -j * hero.bottom[0], hero.y + hero.R4[1] + -j * hero.bottom[1])){
            hero.x += -hero.bottom[0] * 4;
            hero.y += -hero.bottom[1] * 4;
            break;
          }
        }
      }
          
      // Slide if the slope is too strong on the right
      // TODO

      // Collision
      if(is_solid(hero.x + hero.R1[0], hero.y + hero.R1[1])
        ||
        is_solid(hero.x + hero.R2[0], hero.y + hero.R2[1])
        ||
        is_solid(hero.x + hero.R3[0], hero.y + hero.R3[1])
      ){
        hero.walk_speed = 0;
        hero.x -= hero.right[0];
        hero.y -= hero.right[1];
        break;
      }
    }

    // Detect collision on the left (L1,L2,L3)
    else if(hero.walk_speed < 0){
        
      // Climb a slope on the left (one solid between L4 and L3, but L1 + 3 "up", C1, R1, L2 and L3 not solid)
      if(
        !is_solid(hero.x + hero.L1[0] + -3 * hero.bottom[0], hero.y + hero.L1[1] + -3 * hero.bottom[1])
        &&
        !is_solid(hero.x + hero.C1[0], hero.y + hero.C1[1])
        &&
        !is_solid(hero.x + hero.R1[0], hero.y + hero.R1[1])
        &&
        !is_solid(hero.x + hero.L2[0], hero.y + hero.L2[1])
        &&
        !is_solid(hero.x + hero.L3[0], hero.y + hero.L3[1])
      ){
        for(var j = 0; j < 4; j++){
          if(is_solid(hero.x + hero.L4[0] + -j * hero.bottom[0], hero.y + hero.L4[1] + -j * hero.bottom[1])){
            hero.x += -hero.bottom[0] * 4;
            hero.y += -hero.bottom[1] * 4;
            break;
          }
        }
      }
          
      // Slide if the slope is too strong on the left
      // TODO
      
      // Collision
      if(
          is_solid(hero.x + hero.L1[0], hero.y + hero.L1[1])
          ||
          is_solid(hero.x + hero.L2[0], hero.y + hero.L2[1])
          ||
          is_solid(hero.x + hero.L3[0], hero.y + hero.L3[1])
        ){
        hero.walk_speed = 0;
        hero.x -= -hero.right[0];
        hero.y -= -hero.right[1];
        break;
      }
    }
  }


  // Jump:
  if(keys.up && !hero.freefall){
    hero.freefall = true;
    hero.fall_speed += hero.jump_speed;
  }
  
  // Freefall:
  hero.fall_speed += hero.gravity;
  
  if(hero.fall_speed > hero.max_fall_speed){
    hero.fall_speed = hero.max_fall_speed;
  }
  
  l1.value = hero.fall_speed;
  
  // Move vertically
  mv: for(var i = 0; i < Math.abs(hero.fall_speed) * frametime_coef; i++){
    hero.x += hero.bottom[0] * Math.sign(hero.fall_speed);
    hero.y += hero.bottom[1] * Math.sign(hero.fall_speed);
    
    // Detect collision on the bottom (L4,C3,R4)
    if(hero.fall_speed > 0){
      for(var j = 0; j < hero_w; j++){
        if(is_solid(hero.x + hero.L4[0] + j * hero.right[0], hero.y + hero.L4[1] + j * hero.right[1])){
          hero.fall_speed = 0;
          hero.x -= hero.bottom[0];
          hero.y -= hero.bottom[1];
          hero.freefall = false;
          break mv;
        }
      }
    }
    
    // Detect collision on the top (L1,C1,R1)
    else if(
      (hero.fall_speed < 0 && 
        (
          is_solid(hero.x + hero.L1[0], hero.y + hero.L1[1])
          ||
          is_solid(hero.x + hero.C1[0], hero.y + hero.C1[1])
          ||
          is_solid(hero.x + hero.R1[0], hero.y + hero.R1[1])
        )
      )
    ){
      hero.fall_speed = 0;
      hero.x -= -hero.bottom[0];
      hero.y -= -hero.bottom[1];
      break;
    }
  }
}