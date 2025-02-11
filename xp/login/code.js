window.onload = function(){
  document.getElementById("enter").onclick = function(){
    var value = document.getElementById("password").value;
    if(value){
      window.open("/xp", "_self");
    } else {
      document.getElementById("hint").style.color = "#F00";
      document.getElementById("hint").innerText = "Incorrect Password.";
    }
  };
  document.getElementById("password").onkeypress = function(e){
    if(e.which == 13){
      document.getElementById("enter").click();
    }
  };
};