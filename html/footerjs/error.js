var errors = [];
var is_authed = false;
function add403(){
  var topush = {
    class:"four-zero-three",
    name:"You've hit max data"
  };
  if(is_authed){
    topush.message = "Apparently, people have been using our app too much...";
  }else{
    topush.message = "If you'd like to continue, please "+
    "<button onclick='hello(\"github\").login()'>Log in</button>";
  }
  errors.push(topush);
}
NodeOsBlog.controller('ErrorListCtrl', function($scope){
  $scope.removeError = function(error){
    var l = errors.length;
    while(l--){
      if(errors[l] == error) return errors.splice(l,1);
    }
  };
  $scope.errors = errors;
  var oldwinerr = window.onerror;
  window.onerror = function ( message, filename, lineno, colno, error ){
    if ( error !== undefined && error.hasOwnProperty( "name" ) && error.name == "Magic"){
      errors.push({name:"Uncaught Error: "+error.name, message: message+"<pre>"+error.stack+"</pre>"});
    }
  };
});
var hello = require("hello");
hello.on("auth.login", function(auth){
  hello(auth.network).api("/me").then(function(r){
    document.querySelector(".four-zero-three .content").innerHTML("You've authenticated!");
  });
});
