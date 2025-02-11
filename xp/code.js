if(document.referrer != "http://127.0.0.1:5500/xp/login/"){
  window.open("bootloader", "_self");
} 
window.onload = function() {
	window.toggles = {
		startMenu: false,
    crtFx : false,
	};
	window.apps = {
		"chattable": {
			title: "Chattable",
			source: "apps/chat.html",
			type: "min",
			dims: ["300px", "500px"],
		},
		"cmd": {
			title: "cmd.exe",
			source: "apps/cmd.html",
			type: "min",
			dims: ["500px", "500px"],
			config : {
			 scrollbarHidden : true,
			}
		},
		"x": {
			title: "https://aery.neocities.org/",
			source: "apps/x.html",
			type: "full",
		},
		"info": {
			title: "Hello World",
			source: "apps/test.html",
			type: "min",
			dims: ["50vw", "75vh"],
		},
		"ie": {
			title: "https://shrevv.carrd.co/",
			source: "apps/ie.html",
			type: "full",
		},
		"paint" : {
		  title: "Paint",
			source: "apps/paint.html",
			type: "min",
			dims: ["700px", "500px"],
	  }
	};
	window.activePanes = {};

	function appWindow(title, contentSrc, size, unload, data) {
		this.title = title;
		this.contentSrc = contentSrc;
		this.size = size;
		this.unload = unload ? unload : false;
		this.focused = true;
		this.data = data ? data : false;
		var wid = "w" + Date.now();
		this.wid = wid;
		this.returnWindowElement = function() {
			return document.getElementById(this.wid);
		};
		this.focusWindow = function() {
			var aws = document.getElementById("windowsEnv").children;
			for (var i = 0; i < aws.length; i++) {
				document.getElementById("windowsEnv").children[i].style.zIndex = 0;
				window.activePanes[document.getElementById("windowsEnv").children[i].id].focused = false;
			}
			var atb = document.getElementsByClassName("taskbarAppBtnActive");
			if(atb[0]){
			  for(var i = 0; i < atb.length; i++){
			    atb[i].className = "taskbarAppBtn";
			  }
			}
			document.getElementsByName(wid)[0].className = "taskbarAppBtnActive";
			document.getElementById(wid).style.zIndex = 1;
			this.focused = true;
			window.activePanes[wid] = this;
			window.selectedWindow = document.getElementById(wid);
			return this;
		};
		this.unfocusWindow = function() {
			this.focused = false;
			document.getElementById(wid).style.zIndex = 0;
			window.activePanes[wid] = this;
			return this;
		};
		this.resize = function(w, h) {
			this.dims = [w, h];
			var win = document.getElementById(wid);
			win.style.width = w;
			win.style.height = h;
			window.activePanes[wid] = this;
			return this;
		};
		this.reposition = function(x, y) {
			this.position = [x, y];
			var win = document.getElementById(wid);
			win.style.left = x;
			win.style.top = y;
			window.activePanes[wid] = this;
			return this;
		};
		this.minimize = function() {
			this.size = "min";
			var win = document.getElementById(wid);
			if (this.dims) {
				win.style.width = this.dims[0];
				win.style.height = this.dims[1];
				win.style.left = "15%";
				win.style.top = "25%";
				win.style.borderRadius = "5px";
			} else {
				win.style.width = "50%";
				win.style.height = "75%";
				win.style.left = "15%";
				win.style.top = "25%";
				win.style.borderRadius = "5px";
			}
			window.activePanes[wid] = this;
			return this;
		};
		this.maximize = function() {
			this.size = "full";
			this.focused = true;
			this.position = [0, 0];
			var win = document.getElementById(wid);
			win.style.width = "calc(100% - 4px)";
			win.style.height = "calc(100% - 39px)";
			win.style.left = "0";
			win.style.top = "0";
			win.style.borderRadius = "none";
			window.activePanes[wid] = this;
			return this;
		};
		this.close = function() {
			var win = document.getElementById(wid);
			var taskbarBtn = document.getElementsByName(wid)[0];
			taskbarBtn.parentElement.removeChild(taskbarBtn);
			win.parentElement.removeChild(win);
			delete activePanes[wid];
		};
		this.hide = function() {
			this.size = "hidden";
			this.focused = false;
			var win = document.getElementById(wid);
			win.style.top = "100vh";
			window.activePanes[wid] = this;
			var atb = document.getElementsByClassName("taskbarAppBtnActive");
			if(atb[0]){
			  for(var i = 0; i < atb.length; i++){
			    atb[i].className = "taskbarAppBtn";
			  }
			}
			return this;
		};
		this.render = function(dims) {
			/*
			  title: (string) title
			  
			  contentSrc: (string) source, window body content should be from a separate HTML source e.g. "/files/innerWindow.html"
			  
			  size: (string) full|min|hidden
			  
			  unload: (function) an unload callback function, will be executed before the window closes if the user closes the window. Your function must return true in order for the window to complete your function & close. If declared, you must manually close the window at the end of your unload function with,
			  window.activePanes[Window ID].close();
			  
			*/
			var windowWrap = document.createElement("DIV");
			windowWrap.id = this.wid;
			windowWrap.className = "window";
			windowWrap.style.display = "block";
			windowWrap.style.position = "absolute";
			windowWrap.style.border = "solid 2px #0055EA";
			windowWrap.style.background = "#ECE9D8";
			windowWrap.style.transition = "left 40ms linear, top 40ms linear, width 40ms linear, height 40ms linear";
			windowWrap.style.resize = "both";
			windowWrap.style.overflow = "hidden";
			windowWrap.style.minHeight = "100px";
			windowWrap.style.minWidth = "200px";
			windowWrap.style.margin = "0";
			windowWrap.style.padding = "0";
			windowWrap.onclick = function(e) {
			  try {
					window.activePanes[this.id].focusWindow();
					window.selectedWindow = this;
					
				} catch (e) {
					// user interacted with close button
				}
			};

			switch (this.size) {
				case "full":
					windowWrap.style.width = "calc(100% - 4px)";
					windowWrap.style.height = "calc(100% - 39px)";
					windowWrap.style.left = "0";
					windowWrap.style.top = "0";
					windowWrap.style.borderRadius = "none";
					this.position = [0, 0];
					break;
				case "min":
					windowWrap.style.width = "50%";
					windowWrap.style.height = "70%";
					windowWrap.style.left = this.position ? this.position[0] : "25%";
					windowWrap.style.top = this.position ? this.position[1] : "15%";
					windowWrap.style.borderRadius = "5px";
					break;
				case "hidden":
					windowWrap.style.width = "calc(100% - 4px)";
					windowWrap.style.height = "calc(100% - 39px)";
					windowWrap.style.left = "0";
					windowWrap.style.top = "100vh";
					windowWrap.style.borderRadius = "5px";
					break;
				default:
					windowWrap.style.width = "75%";
					windowWrap.style.height = "75%";
					windowWrap.style.left = "12.5%";
					windowWrap.style.top = "12.5%";
					break;
			}
			if (dims) {
				this.dims = dims;
				windowWrap.style.width = dims[0];
				windowWrap.style.height = dims[1];
			}
			var hideBtn = document.createElement("IMG");
			hideBtn.className = wid;
			hideBtn.src = "resources/min.svg";
			hideBtn.style.height = "12pt";
			hideBtn.style.width = "12pt";
			hideBtn.style.border = "none";
			hideBtn.style.outline = "none";
			hideBtn.style.cursor = "pointer";
			hideBtn.style.margin = "2px";
			hideBtn.onclick = function(e) {
			  e.preventDefault();
			  e.stopPropagation();
				activePanes[this.className].hide();
			};
			var maxBtn = document.createElement("IMG");
			maxBtn.className = wid;
			maxBtn.src = "resources/max.svg";
			maxBtn.style.height = "12pt";
			maxBtn.style.width = "12pt";
			maxBtn.style.border = "none";
			maxBtn.style.outline = "none";
			maxBtn.style.cursor = "pointer";
			maxBtn.style.margin = "2px";
			maxBtn.onclick = function(e) {
			  e.preventDefault();
			  e.stopPropagation();
				switch (window.activePanes[this.className].size) {
					case "min":
						activePanes[this.className].maximize();
						break;
					case "full":
						activePanes[this.className].minimize();
						break;
				}
			};
			var closeBtn = document.createElement("IMG");
			closeBtn.className = wid;
			closeBtn.src = "resources/close.svg";
			closeBtn.style.height = "12pt";
			closeBtn.style.width = "12pt";
			closeBtn.style.border = "none";
			closeBtn.style.outline = "none";
			closeBtn.style.cursor = "pointer";
			closeBtn.style.margin = "2px";
			closeBtn.onclick = function(e) {
			  e.preventDefault();
			  e.stopPropagation();
				if (activePanes[this.className].unload) {
					activePanes[this.className].unload();
				} else {
					activePanes[this.className].close();
				}
			};
			var windowControls = document.createElement("DIV");
			windowControls.style.display = "inline-flex";
			windowControls.style.float = "right";
			windowControls.appendChild(hideBtn);
			windowControls.appendChild(maxBtn);
			windowControls.appendChild(closeBtn);

			var titlebarWrap = document.createElement("DIV");
			titlebarWrap.style.width = "99%";

			var titlebar = document.createElement("DIV");
			titlebar.id = "t" + this.wid
			titlebar.className = "titlebar";
			titlebar.style.display = "flex";
			titlebar.style.alignItems = "center";
			titlebar.style.justifyContent = "center";
			titlebar.style.background = "#0055EA";
			titlebar.style.boxShadow = "0 2px 3px #3888E9 inset,  0 -1px 2px #333 inset";
			titlebar.style.color = "#FFF";
			titlebar.style.height = "25px";
			titlebar.style.width = "100%";
			titlebar.style.userSelect = "none";
			titlebar.style.overflow = "hidden";
			titlebar.onmousedown = function(e) {
				window.selectedWindow = this.parentElement;
				window.activePanes[selectedWindow.id].focusWindow();
				window.mousedownOnTitle = true;
				window.alertDragging = true;
				var rect = e.target.parentElement.getBoundingClientRect();
				window.alertOffsetX = e.clientX - rect.x;
				window.alertOffsetY = e.clientY - rect.y;
			};
			var titleIco = document.createElement("IMG");
			titleIco.style.pointerEvents = "none";
			titleIco.style.userSelect = "none";
			var titleText = document.createElement("DIV");
			titleText.innerHTML = this.title ? this.title : "Windows";
			titleText.style.fontFamily = "WinXP";
			titleText.style.fontWeight = "bolder";
			titleText.style.float = "left";
			titleText.appendChild(titleIco);


			titlebarWrap.appendChild(titleText);
			titlebarWrap.appendChild(windowControls);

			titlebar.appendChild(titlebarWrap);

			var winBody = document.createElement("DIV");
			// winBody.src = this.contentSrc; // discontinued iframe method, injecting content with HTTPRequest
			winBody.id = "b" + this.wid;
			winBody.className = "winBody";
			if(this.data && this.data.scrollbarHidden){
			  winBody.className += " scrollbarHidden";
			}
			winBody.style.height = "calc(100% - 25px)";
			winBody.style.width = "100%";
			winBody.style.border = "none";
			winBody.style.outline = "none";
			winBody.style.margin = "0";
			winBody.style.padding = "0";
			winBody.style.overflowY = "auto";
			winBody.style.overflowX = "hidden";

			// FOR TASKBAR BUTTONS TO EACH ACTIVE APPLICATION
			var tBtn = document.createElement("DIV");
			tBtn.className = "taskbarAppBtn " + this.wid;
			tBtn.setAttribute("name", this.wid);
			tBtn.name = this.wid;
			tBtn.innerText = window.activePanes[this.wid].title;
			tBtn.onclick = function() {
				var winObj = window.activePanes[this.name];
				// winObj.focusWindow();

				/*
				for(var i = 0; i < document.getElementById("windowsEnv").children.length; i++){
				   var elem = document.getElementById("windowsEnv").children[i];
				   window.activePanes[elem.id].unfocusWindow();
				}
				*/
        var runningAppNodes = document.getElementsByClassName("taskbarAppBtnActive");
				if(runningAppNodes[0]){
			    for(var i = 0; i < runningAppNodes.length; i++){
			      runningAppNodes[i].className = "taskbarAppBtn";
			    }
				}
			  this.className = "taskbarAppBtnActive";
				switch (winObj.size) {
					case "hidden":
						var appsLength = document.getElementById("activeApplications").children.length;
						var cw = document.getElementById(this.name);
						cw.style.zIndex = appsLength;
						document.getElementById("taskbar").style.zIndex = appsLength + 1;
						if (winObj.position) {
						  cw.style.left = winObj.position[0] + "px";
							cw.style.top = winObj.position[1] + "px";
							var ws = document.getElementsByClassName("window");
							if(ws[0]){
							   for(var i = 0; i < ws.length; i++){
							     ws[i].style.zIndex = 1;
							   }
							}
							cw.style.zIndex = 2;
							winObj.size = "min";
							winObj.focused = true;
						} else {
							var x = parseInt(cw.clientWidth) / 2;
							var y = parseInt(cw.clientHeight) / 2;
							cw.style.left = ((window.innerWidth / 2) - x) + "px";
							cw.style.top = ((window.innerHeight / 2) - y) + "px";
							var ws = document.getElementsByClassName("window");
							if(ws[0]){
							   for(var i = 0; i < ws.length; i++){
							     ws[i].style.zIndex = 1;
							   }
							}
							cw.style.zIndex = 2;
							winObj.size = "min";
							winObj.focused = true;
						}
						break;
					case "min":
						if (winObj.focused) {
							winObj.hide();
						} else {
							winObj.focusWindow();
						}
						break;
					case "full":
						if (winObj.focused) {
							winObj.hide();
						} else {
							winObj.focusWindow();
						}
						break;
					default:
						var apps = document.getElementById("activeApplications").children.length;
						document.getElementById(this.name).style.zIndex = appsLength;
						document.getElementById("taskbar").style.zIndex = appsLength + 1;
						winObj.focusWindow();
						console.error("Something went wrong.");
						break;
						
				}
			};

			document.getElementById("activeApplications").appendChild(tBtn);

			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					var response = this.responseText;
					document.getElementById("b" + wid).innerHTML = response;
					var winCount = document.getElementsByClassName("winBody");
					for (var i = 0; i < winCount.length; i++) {
						var scripts = winCount[i].querySelectorAll("script");
						for (var e = 0; e < scripts.length; e++) {
							var instructions = scripts[e].innerHTML;
							var f = new Function(instructions);
							f();
						}
					}
				}
			};
			xhttp.open("GET", contentSrc, true);
			xhttp.send();
			windowWrap.appendChild(titlebar);
			windowWrap.appendChild(winBody);
			document.getElementById("windowsEnv").appendChild(windowWrap);
			return this;
		};
		window.activePanes[wid] = this;
		return this;
	}
  for(var i = 0; i < document.getElementsByClassName("startItemApp").length; i++){
    var e = document.getElementsByClassName("startItemApp")[i];
    e.onclick = function(){
      window.startApp(this.getAttribute("name"));
    }
  }

	document.getElementById("startBtnWrap").onclick = function(e) {
		e.stopPropagation();
		var menuRender = document.getElementById("startMenu");
		if (window.toggles.startMenu) {
			menuRender.style.display = "none";
			window.toggles.startMenu = false;
		} else {
			menuRender.style.display = "block";
			window.toggles.startMenu = true;
		}
	};

	document.body.onclick = function() {
		document.getElementById("startMenu").style.display = "none";
		window.toggles.startMenu = false;
		if (document.getElementById("ctxMenu")) {
			var ctx = document.getElementById("ctxMenu");
			ctx.parentElement.removeChild(ctx);
		}
	};
	window.onblur = function() {
		if (document.activeElement.tagName === "IFRAME") {
			var parent = document.activeElement.parentElement;
			var grandparent = parent.parentElement;
			window.activePanes[grandparent.id].focusWindow();
		} // if window contains iframe & user clicks on iframe the event doesnt bubble to window so need custom func to focus that window in such an event
	};
	window.startApp = function(appName, callback) {
	  if (appName && window.apps[appName]) {
			var appData = window.apps[appName];
			if(appData.config){
			  var metadata = appData.config;
			} else {
			  var metadata = false;
			}
			callback = callback ? callback : false;
			new appWindow(appData.title, appData.source, appData.type, callback, metadata).render(appData.dims ? appData.dims : false);
			if (callback) {
				try {
				  if(typeof(callback) == "function"){
					  callback();
				  }
				} catch (scriptErr) {
					console.warn("Error code 0x000F"); // unable to execute callback function.
					console.error(scriptErr);
				}
			}
		} else {
			console.warn("Error code 0x001F"); // attempted opening an app that is not installed
		}
	};
	for (var a = 0; a < document.getElementsByClassName("shortcuts").length; a++) {
		var shortcut = document.getElementsByClassName("shortcuts")[a].parentElement;
		shortcut.setAttribute("tabindex", a);
		shortcut.ondoubleclick(function() {
			var aName = this.getAttribute("name");
			window.startApp(aName);
		});
		shortcut.ctxMenu({
			"Open": function(elem) {
				window.startApp(elem.getAttribute("name"));
			},
			"Copy": function() {

			},
			"Rename": function(elem) {
				elem.style.backgroundColor = "transparent";
				var dtAppBtnTxt = elem.querySelector(".dtAppBtnTxt");
				dtAppBtnTxt.setAttribute("contenteditable", true);
				dtAppBtnTxt.onkeypress = function(e) {
					if (e.which == 13) {
						e.preventDefault();
						this.blur();
						this.setAttribute("contenteditable", false);
						delete this.style.backgroundColor;
					}
				}
				setTimeout(function() {
					dtAppBtnTxt.focus();
				}, 60)
			},
			"Properties": function() {

			},
			"Nevermind...": function() {

			}
		});
	};
	document.getElementById("logout").onclick = function(){
	 window.open("login", "_self"); 
	};
	/*
	document.getElementById("desktop").onclick = function(){
	  for(apps in window.activePanes){
	    window.activePanes[apps].hide();
	   }
	 };
	*/
	document.getElementById("desktop").ctxMenu({
		"Paste": function() {},
		"New": {
			"Shortcut": function() {},
			"Folder": function() {},
		},
		"Personalize": function() {}
	});
	var dtElement = document.getElementById("dateTime");
	window.timeKeeper = setInterval(function() {
		var d = new Date();
		var months = {
			0: "Jan",
			1: "Feb",
			2: "Mar",
			3: "Apr",
			4: "May",
			5: "June",
			6: "July",
			7: "Aug",
			8: "Sept",
			9: "Oct",
			10: "Nov",
			11: "Dec"
		}
		var time = {
			mins: d.getMinutes(),
			hours: d.getHours(),
			month: months[d.getMonth()],
			day: d.getDate(),
			year: d.getFullYear()
		}
		if (time.hours > 12) {
			time.hours -= 12;
			time.ampm = "PM";
		} else {
			time.ampm = "AM";
		}
		if (time.mins < 10) {
			time.mins = "0" + time.mins;
		}
		var timeHTML = "<p>" + time.hours + ":" + time.mins + " " + time.ampm + "</p>";
		var dateHTML = "<p>" + time.month + " " + time.day + " " + time.year + "</p>";
		dtElement.innerHTML = timeHTML + dateHTML;
	}, 1000);


  var test = new appWindow("Hello World", "apps/test.html", "min", function() {
		window.xp_popup("Windows", "Are you sure you want to close this tab? Everything is still being built and there's nothing else to interact with yet.", {
			"CONTINUE": function() {
				test.close();
				return true;
			},
			"CANCEL": function() {
				return false;
			}
		});
	}).render();

  var startupFx = new Audio("/xp/resources/startup.mp3");
  startupFx.play();
  window.xp_popup("Windows", "If you experience any graphical issues, please try reloading the page. If that doesn't resolve the issue please describe the issue in the Chattable app. Thanks!", {
    "OK" : function(){}
  });
};