Game.ARScreen = function(scene, camera){
  this.videoCanvas = document.createElement("canvas");
  this.videoCanvas.id = 'jpgs';

  this.screen = BABYLON.Mesh.CreatePlane("ArScreen", 100, scene);
  this.screen.scaling.y = 0.5
  this.screen.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
  this.screen.position = new BABYLON.Vector3(0, 0, 60);
  var mat = new BABYLON.StandardMaterial("mat", scene);
  this.canvasTexture = new BABYLON.DynamicTexture("dynamic texture", this.videoCanvas, scene, true);
  mat.diffuseTexture = this.canvasTexture;

  //adds the video feed to the plane
  this.screen.material = mat;

  //makes the plan a child of the camera...This will be the basis for all of my AR projects
  this.screen.parent = camera.bCamera;

  this.loadImage = function() {
		var ctx = this.videoCanvas.getContext('2d');
        //Loading of the home test image - img1
    	var img1 = new Image();
        //drawing of the test image - img1
    	img1.onload = function () {
            //draw background image
    		ctx.drawImage(img1, 0, 0);
    	};
    	img1.src = 'http://localhost:5000/image.jpg?' + new Date().getTime();
	};

  this.update = function(){
    this.loadImage();
    this.canvasTexture.update();
  }

  return this;
}
