var Game = function(){
	this.canvas = document.getElementById('renderCanvas');
	this.engine = new BABYLON.Engine(this.canvas, true);
	this.keys = {left:0,right:0,fire:0};
	this.isFireing = false;
	this.readyForData = true;

	this.Motors = {
		"motor1": new Game.Motor('motor1')
	}

	//This is going to be common to all AR Pi Games
	this.get_data = function(){
		this.readyForData = false;
		new Game.Ajax('/data.json', function(data){
			conosle.log(data);
			this.readyForData = true;
		});
	};

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
	};

	//Some stuff in here should be kinda of in a class
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

	//These should be moved to a class
	this.handleKeyDown = function(evt){
        if (evt.keyCode==65){//A
         this.keys.left=1;
          this.Motors.motor1.activated('positive');
        }
        if (evt.keyCode==68){//D
          this.keys.right=1;
          this.Motors.motor1.activated('negative');
        }
        if (evt.keyCode==32){
          this.keys.fire = 1;
        }
     }

    this.handleKeyUp = function(evt){
        if (evt.keyCode==65){
          this.keys.left=0;
          this.Motors.motor1.deactivated('positive');
        }
        if (evt.keyCode==68){
          this.keys.right=0;
          this.Motors.motor1.deactivated('negative');
        }
        if (evt.keyCode==32){
          this.keys.fire = 0;
          this.isFireing = false;
        }
     }

		 //These are kinda unique for this one game
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
}
