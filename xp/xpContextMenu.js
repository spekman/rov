Element.prototype.ctxMenu = function(optionsObj) {
  this.oncontextmenu = function(e) {
    e.preventDefault();
    e.stopPropagation();
    window.timeClickedElement = Date.now() + 1000;
    var element = this;
    this.element = this;
    try {
      document.getElementById("ctxMenu").parentElement.removeChild(document.getElementById("ctxMenu"));
    } catch(noCtxMenuExists) {}
    var menu = document.createElement("DIV");
    menu.style.minWidth = "250px";
    menu.style.maxWidth = "50vw";
    menu.style.backgroundColor = "#F0F0F0";
    menu.style.color = "#000000";
    menu.style.margin = "0";
    menu.style.padding = "0";
    menu.style.position = "absolute";
    menu.style.top = (parseInt(e.pageY) + 5) + "px";
    menu.style.left = (parseInt(e.pageX) + 5) + "px";
    menu.style.zIndex = "100000000";
    menu.style.border = "solid 1px #979797";
    menu.style.borderRadius = "1px";
    menu.style.boxShadow = "0px 0px 1px #000";
    menu.style.overflow = "hidden";
    menu.id = "ctxMenu";

    for (options in optionsObj) {
      var x = document.createElement("P");
      x.style.margin = "0";
      // x.style.marginBottom = "1px";
      x.style.marginLeft = "25px";
      x.style.padding = "3px";
      x.style.paddingLeft = "12px";
      x.style.backgroundColor = "#F0F0F0";
      x.style.cursor = "default";
      x.style.userSelect = "none";
      x.style.border = "solid 1px transparent";
      x.style.borderTop = "solid 1px #FEFEFE";
      x.style.borderBottom = "solid 1px #E1E1E1";
      x.style.borderLeft = "solid 1px #E1E1E1";
      x.style.borderRadius = "3px";
      x.innerText = options;
      x.className = "ctxMenuOption";
      x.onclick = function(e) {
        if (typeof(optionsObj[this.innerText]) == 'function') {
          this.parentElement.parentElement.removeChild(this.parentElement);
          optionsObj[this.innerText](element, this);
        } else if (typeof(optionsObj[this.innerText]) == 'object') {
          var so = optionsObj[this.innerText];
          var smenu = document.createElement("DIV");
          smenu.style.minWidth = "250px";
          smenu.style.maxWidth = "50vw";
          smenu.style.backgroundColor = "#F0F0F0";
          smenu.style.color = "#000000";
          smenu.style.margin = "0";
          smenu.style.padding = "0";
          smenu.style.position = "absolute";
          smenu.style.top = (parseInt(e.pageY) + 5) + "px";
          smenu.style.left = (parseInt(e.pageX) + 5) + "px";
          smenu.style.zIndex = "100000000";
          smenu.style.border = "solid 1px #979797";
          smenu.style.borderRadius = "1px";
          smenu.style.boxShadow = "0px 0px 3px #000";
          smenu.style.overflow = "hidden";
          smenu.id = "ctxMenu";

          for (options in so) {
            var sx = document.createElement("P");
            sx.style.margin = "0";
            // x.style.marginBottom = "1px";
            sx.style.marginLeft = "25px";
            sx.style.padding = "3px";
            sx.style.paddingLeft = "12px";
            sx.style.backgroundColor = "#F0F0F0";
            sx.style.cursor = "default";
            sx.style.userSelect = "none";
            sx.style.border = "solid 1px transparent";
            sx.style.borderTop = "solid 1px #FEFEFE";
            sx.style.borderBottom = "solid 1px #E1E1E1";
            sx.style.borderLeft = "solid 1px #E1E1E1";
            sx.style.borderRadius = "3px";
            sx.innerText = options;
            sx.className = "ctxMenuOption";
            sx.onclick = function() {
              this.parentElement.parentElement.removeChild(this.parentElement);
              optionsObj[this.innerText](element, this);
            };
            sx.onmouseover = function(e) {
              this.style.border = "solid 1px #AECFF7";
              this.style.borderTop = "solid 1px #AECFF7";
              this.style.borderBottom = "solid 1px #AECFF7";
              this.style.borderLeft = "solid 1px #AECFF7";
              this.style.backgroundColor = "#EDF1F6";
              this.style.boxShadow = "0 0 25% #EDF3F9 inset";
            };
            sx.onmouseout = function(e) {
              this.style.border = "solid 1px transparent";
              this.style.borderTop = "solid 1px #FEFEFE";
              this.style.borderBottom = "solid 1px #E1E1E1";
              this.style.borderLeft = "solid 1px #E1E1E1";
              this.style.backgroundColor = "#F0F0F0";
              this.style.boxShadow = "none";
            };
            smenu.appendChild(sx);
          }
          document.body.appendChild(smenu);
        } else {
          console.warn("Function called without critical data")
        }
      };
      x.onmouseover = function(e) {
        this.style.border = "solid 1px #AECFF7";
        this.style.borderTop = "solid 1px #AECFF7";
        this.style.borderBottom = "solid 1px #AECFF7";
        this.style.borderLeft = "solid 1px #AECFF7";
        this.style.backgroundColor = "#EDF1F6";
        this.style.boxShadow = "0 0 25% #EDF3F9 inset";
      };
      x.onmouseout = function(e) {
        this.style.border = "solid 1px transparent";
        this.style.borderTop = "solid 1px #FEFEFE";
        this.style.borderBottom = "solid 1px #E1E1E1";
        this.style.borderLeft = "solid 1px #E1E1E1";
        this.style.backgroundColor = "#F0F0F0";
        this.style.boxShadow = "none";
      };
      menu.appendChild(x);
    }
    document.body.appendChild(menu);
    return this;

  };
};