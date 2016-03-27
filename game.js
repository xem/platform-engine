/* Game loop */

game = function(){

  //zzz+=1;
  //rotate_hero(zzz);
  
  // Make the hero move, walk, jump, fall...
  move_hero();
  
  // Draw the scene
  canvas.width = canvas.width;
  ctx.fillStyle = "black";
  for(i in maps[0]){
    for(j in maps[0][i]){
      if(maps[0][i][j] != "0"){
        ctx.drawImage(tiles[maps[0][i][j]].sprite, j * tile_w, i * tile_h, tile_w, tile_h);
      }
    }
  }
  
  // Draw the hero
  ctx.save();
  ctx.translate(hero.x, hero.y);
  ctx.rotate(hero.angle);
  ctx.drawImage(hero_sprite, -16, -16, tile_w, tile_h);
  ctx.restore();
  
  // Debug
  for(var i in vectors){
    ctx.fillStyle = "red";
    ctx.fillRect(hero.x + hero[i][0]-1, hero.y + hero[i][1]-1,2,2);
  }
  
  // Next frame
  requestAnimationFrame(game);
};

onload = function(){
  zzz = Math.floor(Math.random()*8) * 45;
  rotate_hero(zzz);
  game();
}