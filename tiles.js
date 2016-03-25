/* Tiles */

// Size
var tile_w = 32;
var tile_h = 32;


// Sprites / tileset
// Solid => 0: non-solid, 1: solid, 2: other (slope)
// Solidity(x,y) => tells if a pixel is solid in a given tile

var tiles = {
  
  // 0: void
  "0": {
    sprite: void_sprite,
    solid: 0
  },
  
  // 1: wall "unportalable"
  "1": {
    sprite: wall_unportalable_sprite,
    solid: 1
  },
  
  // 2: slope 45deg right
  "2": {
    sprite: slope_45deg_right,
    solid: 2,
    solidity: function(x,y){
      return y > tile_w - x;
    }
  },
  
  // 3: slope 45deg left
  "3": {
    sprite: slope_45deg_left,
    solid: 2,
    solidity: function(x,y){
      return y > x;
    }
  },
  
  // 4: slope 45deg right
  "4": {
    sprite: slope_minus_45deg_right,
    solid: 2,
    solidity: function(x,y){
      return y < x;
    }
  },
  
  // 5: slope 45deg right
  "5": {
    sprite: slope_minus_45deg_left,
    solid: 2,
    solidity: function(x,y){
      return y < tile_w - x;
    }
  }
};


// Check if a coordinate (x:y) is on a solid pixel or not
var is_solid = function(x,y){
  
  var tile_y = Math.floor(y / tile_h);

  // Return false if the pixel is at undefined map coordinates
  if(!maps[current_map][tile_y]){
    return false;
  }
  
  var tile_x = Math.floor(x / tile_w);
  
  if(!maps[current_map][tile_y][tile_x]){
    return false;
  }
  
  // Return false if the tile is not solid
  if(maps[current_map][tile_y][tile_x].solid === 0){
    return false;
  }
  
  // Return true if the tile is solid
  if(maps[current_map][tile_y][tile_x].solid === 1){
    return true;
  }
  
  // Finally, return the solidity of the current pixel if the tile is semi-solid
  var pixel_x = x - tile_x * tile_w;
  var pixel_y = y - tile_y * tile_h;
  return tiles[maps[current_map][tile_y][tile_x]].solidity(pixel_x, pixel_y);
}