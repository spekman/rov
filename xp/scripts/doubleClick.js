Element.prototype.ondoubleclick = function(instructions){
    this.instructions = instructions;
    /*
      This script adds the ability for you to listen for a double click & execute a defined callback function when the event fires
      
      Usage after implementation:
      myElement.ondoubleclick(function);
      
    */
    window.timeClickedElement = false;
    this.onmousedown = function(){
      if(window.timeClickedElement){
        var now = Date.now();
        var ttl = now - window.timeClickedElement;
        if(ttl <= 250){
          // doubleclicked
          this.instructions();
        }
        window.timeClickedElement = now;
      } else {
        window.timeClickedElement = Date.now();
      }
      return this;
    };
    
  };