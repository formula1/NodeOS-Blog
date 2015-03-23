var errorHandler;
var queue =[];
jQuery(function($){
  errorHandler = new Template(
    "script.template.error",
    "div.container.error",
    ["four-zero-three"]
  );
  var oldwinerr = window.onerror;
  window.onerror = function ( message, filename, lineno, colno, error ){
    if ( error !== undefined && error.hasOwnProperty( "name" ) && error.name == "Magic"){
      errorHandler.add({
        name:"Uncaught Error: "+error.name,
        message: message+"<pre>"+error.stack+"</pre>"
      });
    }
    if(oldwinerr){
      oldwinerr(message, filename, lineno, colno, error );
    }
  };
  queue.forEach(errorHandler.add.bind(errorHandler));
});

function addError(error){
  var e;
  if(error.status){
    e={name:"Ajax: "+error.status, message:error.responseText};
  }else{
    e = {name:error.name, message:error.stack};
  }
  if(!errorHandler) return queue.push(e);
  errorHandler.add(e);
}

function add403(){
  var topush = {
    class:"four-zero-three",
    name:"You've hit max data"
  };
  if(user.isLoggedIn){
    topush.message = "Apparently, people have been using our app too much..."+
    "<button class='btn btn-primary' onclick='user.login()'>Log in</button>";
  }else{
    topush.message = "If you'd like to continue, please "+
    "<button class='btn btn-primary' onclick='user.login()'>Log in</button>";
  }
  if(!errorHandler) return queue.push(topush);
  errorHandler.add(topush);
}

function add404(){
  e = {
    name: "Your in the wrong place my friend.",
    message: "<a href='/'>Heres a hand, we'll get you back on the right track</a>"
  };
  if(!errorHandler) return queue.push(e);
  errorHandler.add(e);
}
