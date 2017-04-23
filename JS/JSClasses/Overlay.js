Game.Overlay = function(scene, image){
  this.canvas = new BABYLON.ScreenSpaceCanvas2D(scene, {
    id: "overlayCanvas"
  });
 this.texture = new BABYLON.Texture(image, scene, false, true, 1);
  this.texture.hasAlpha = true;
  this.sprite = new BABYLON.Sprite2D(this.texture, {
      parent: this.canvas, id: "sprite1", marginAlignment: "h: center, v: center"
    });
    return this;
}
