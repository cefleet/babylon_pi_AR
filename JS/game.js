var game;
window.addEventListener('DOMContentLoaded', function() {
     game = new Game();
     game.start();
});

var Game = function(){
	this.canvas = document.getElementById('renderCanvas');
	this.engine = new BABYLON.Engine(this.canvas, true);
	this.keys = {left:0,right:0,fire:0};
	this.isFireing = false;
	this.readyForData = true;
	this.get_data = function(){
		this.readyForData = false;
		new Game.Ajax('/data.json', function(data){
			conosle.log(data);
			this.readyForData = true;
		});
	};
	this.AjaxControls = {
		pressed :function(direct){
    		console.log(direct+' was pressed')
    		new Game.Ajax('/pressed?dir='+direct, function(data){
    	      //could do something with this in the future
    			console.log(data)
    		});
   		},
    	released : function(direct){
    	    console.log(direct+' was pressed')
    	    new Game.Ajax('/released?dir='+direct, function(data){
    	      //could do something with this in the future
    	      console.log(data)
    	    });
    	}
	};

	this.loopFunction = function(){
				if(this.readyForData){
					this.get_data()
				}
        if(this.keys.left == 1){
          this.scene.cameras[0].cameraRotation.y -= 0.001
        }
        if(this.keys.right == 1){
          this.scene.cameras[0].cameraRotation.y += 0.001
        }

        if(this.keys.fire == 1 && !this.isFireing){
          console.log('Fire!');
          console.log('I need to do a raycasting right here');
          this.isFireing = true;
          this.castRay()
        }

        if (this.sphere.movingDir == 'up'){
          this.sphere.position.y -= 0.2
          if (this.sphere.position.y < -8){
            console.log('I need to change')
            this.sphere.movingDir = 'down'
          }
        } else if (this.sphere.movingDir == 'down') {
          this.sphere.position.y += 0.2
          if (this.sphere.position.y > 8 ){
            this.sphere.movingDir = 'up'
          }
        }

        this.sphere.position.z -= 0.4;
        if (this.sphere.position.z < 0){
          this.sphere.position.z = 105
        }
        this.scene.render();
        this.arScreen.update();

	}.bind(this);

	this.handleKeyDown = function(evt){

        if (evt.keyCode==65){//A
         this.keys.left=1;
          this.AjaxControls.pressed('left');
        }
        if (evt.keyCode==68){//D
          this.keys.right=1;
          this.AjaxControls.pressed('right');
        }
        if (evt.keyCode==32){
          this.keys.fire = 1;

        }
     }

    this.handleKeyUp = function(evt){

        if (evt.keyCode==65){
          this.keys.left=0;
          this.AjaxControls.released('left');
        }
        if (evt.keyCode==68){
          this.keys.right=0;
          this.AjaxControls.released('right');
        }
        if (evt.keyCode==32){
          this.keys.fire = 0;
          this.isFireing = false;
        }

     }
     this.vecToLocal = function(vector, cam){
          var m = cam.getWorldMatrix();
          var v = BABYLON.Vector3.TransformCoordinates(vector, m);
		      return v;
    };

    this.castRay = function(){
        var origin = this.scene.cameras[0].position;

	      var forward = new BABYLON.Vector3(0,0,1);
	      forward = this.vecToLocal(forward, this.scene.cameras[0]);

	      var direction = forward.subtract(origin);
	      direction = BABYLON.Vector3.Normalize(direction);

	      var length = 300;

	      var ray = new BABYLON.Ray(origin, direction, length);
        //ray.show(scene, new BABYLON.Color3(1, 1, 0.1));

        var hit = this.scene.pickWithRay(ray);

        if (hit.pickedMesh == this.sphere){
		        hit.pickedMesh.scaling.y += 0.5;
            hit.pickedMesh.scaling.x += 0.5;
	      }
    }

	this.createScene = function() {
          // create a basic BJS Scene object
          var scene = new BABYLON.Scene(this.engine);
          var cam = new Game.Camera('MainCam',scene);
					this.arScreen = new Game.ARScreen(scene,cam);

          // create a basic light, aiming 0,1,0 - meaning, to the sky
          var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);
          this.sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, scene);
          this.sphere.movingDir = 'up';
          this.sphere.position.z = 60;

					this.target = new Game.Overlay(scene, "target.png");

        return scene;
     };

	this.scene = this.createScene();
	this.start = function(){
		//these may need bindings
		this.engine.runRenderLoop(this.loopFunction);
		window.addEventListener("keydown", this.handleKeyDown.bind(this), false);
    window.addEventListener("keyup", this.handleKeyUp.bind(this), false);
    window.addEventListener('resize', function() {
    	this.engine.resize();
    });
	}
}

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

Game.Ajax = function(u,f){
	var x=window.XMLHttpRequest?new XMLHttpRequest():new ActiveXObject('Microsoft.XMLHTTP');
	x.onreadystatechange=function(){
    	if(x.readyState==4&&x.status==200){
    		if(x.responseText){
    			console.log('I Should have a callback here')
    			console.log(x.responseText)
    		}
    	}
   	};
    x.open('GET',u,true);
    x.send(null) 
}

Game.Camera = function(name,scene){
  this.bCamera = new BABYLON.FreeCamera(name, new BABYLON.Vector3(0, 0,0), scene);
  this.bCamera.setTarget(BABYLON.Vector3.Zero());
  return this;
}

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
