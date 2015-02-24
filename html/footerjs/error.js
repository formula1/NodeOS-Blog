var errors = [];

function add403(){
  var topush = {
    class:"four-zero-three",
    name:"You've hit max data"
  };
  if(is_authed){
    topush.message = "Apparently, people have been using our app too much...";
  }else{
    topush.message = "If you'd like to continue, please "+
    "<button onclick='login()'>Log in</button>";
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
function parseMarkdown(item,next){
  jQuery.post("https://api.github.com/markdown",{text:item.body})
  .done(function(data){
    item.bodyHTML = data;
    next(item);
  }).fail(function(data, status, headers, config) {
    errors.push({name:"Bad markdown call: "+status, message: data.message});
    item.bodyHTML = "<pre>"+item.body+"</pre>";
    next(item);
  });
}
/*
var markdown = require("markdown").markdown;
function parseMarkdown(item,next){
  console.log("parsing");

  try{
    item.bodyHTML = markdown.toHTML(item.body);
    console.log(item.bodyHTML);
  }catch(e){
    console.log(e);
    item.bodyHTML = "<pre>"+item.body+"</pre>";
  }
  setTimeout(next.bind(next,item),1);
}
*/
