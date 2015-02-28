var errors = [];
var has403 = false;

function add403(){
  if(has403) return;
  has403 = true;
  var topush = {
    class:"four-zero-three",
    name:"You've hit max data"
  };
  if(user.isLoggedIn){
    topush.message = "Apparently, people have been using our app too much..."+
    "<button onclick='user.login()'>Log in</button>";
  }else{
    topush.message = "If you'd like to continue, please "+
    "<button onclick='user.login()'>Log in</button>";
  }
  errors.push(topush);
}

function add404(){
  errors.push({
    name: "Your in the wrong place my friend.",
    message: "<a href='/'>Heres a hand, we'll get you back on the right track</a>"
  });
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
/* */
function parseMarkdown(item,next){
  user.asAuthority("https://api.github.com/markdown/raw",function(uri){
    jQuery.ajax({
      url:uri,
      type:'POST',
      headers: {
          'Content-Type': 'text/plain'
      },
      data:item.body
    }).done(function(data){
      item.bodyHTML = data;
    }).fail(function(response, textStatus,data) {
      if(response.status === 403){
        add403();
      }else{
        errors.push({name:"Bad markdown call: "+response.status, message: data.message});
      }
      item.bodyHTML = "<pre>"+item.body+"</pre>";
    }).always(function(){
      next(item);
    });
  });
}

/*
var markdown = require("markdown").markdown;
function parseMarkdown(item,next){
  console.log("parsing");

  try{
    var t = jQuery("<div>"+markdown.toHTML(item.body)+"</div>");
    t.find("code").wrap("<pre></pre>");

    item.bodyHTML = t.html();
    console.log(item.bodyHTML);
  }catch(e){
    console.log(e);
    item.bodyHTML = "<pre>"+item.body+"</pre>";
  }
  setTimeout(next.bind(next,item),1);
}
/* */
