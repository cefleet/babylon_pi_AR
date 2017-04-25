//Motors primarally send data to the sever.
//Instead of being left or right it is positive or negative. That way the motors only are able to send
Game.Motor = function(name){
  this.name = name;
  this.atEnd = {
    positive:false,
    negative:false
  };
  
  this.activated = function(direction){
    new Game.Ajax('/activated?motor='+name+'&dir='+direction, function(data){
        //could do something with this in the future
      console.log(data)
    });
  };

  this.deactivated = function(direction){
    new Game.Ajax('/deactivted?motor='+name+'&dir='+direction, function(data){
        //could do something with this in the future
      console.log(data)
    });
  };

  this.checkEndStop = function(direction){
    new Game.Ajax('/checkEndStop?motor='+name+'&dir='+direction, function(data){
      if(data == 'false'){
        this.atEnd[position] = false;
      } else if (data == 'true') {
        this.atEnd[position] = true;
      }
    });
  }
}
