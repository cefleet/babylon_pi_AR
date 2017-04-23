Game.Camera = function(name,scene){
  this.bCamera = new BABYLON.FreeCamera(name, new BABYLON.Vector3(0, 0,0), scene);
  this.bCamera.setTarget(BABYLON.Vector3.Zero());
  return this;
}
