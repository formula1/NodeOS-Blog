
jQuery(function($){
  $("#westoredata>p a").click(function(e){
    e.preventDefault();
    $("#westoredata>div .more").toggle();
  });
});

function Template(template,contain,unique){
  this.template = Handlebars.compile(jQuery(template).html());
  this.contain = jQuery(contain);
  this.unique = {};
  if(Array.isArray(unique)){
    var l = unique.length;
    while(l--){
      this.unique[unique[l]] = false;
    }
  }
  this.contain.find(".remove").on("click",this.remove.bind(this));
}

Template.prototype.add = function(item){
  if(item.class && typeof this.unique[item.class] != "undefined"){
    if(this.unique[item.class]) return;
    this.unique[item.class] = true;
  }
  console.log("appending");
  this.contain.append(this.template(item));
};

Template.prototype.remove = function(e){
  e.preventDefault();
  var art = $(this).closest("article");
  var u = art.attr("data-unique");
  if(u){
    this.unique[u] = false;
  }
  art.remove();
};


function compileYQL(query){
  if(Array.isArray(query)){
    query = query.join(";");
  }
  if(typeof query != "string"){
    throw new Error("A yql query must be a string");
  }
  return "https://query.yahooapis.com/v1/public/yql?q=" +
    encodeURIComponent(query) +
    "&diagnostics=true&format=json";
}
function yql_access(yql_uri){
  return function(code,next){
    var url;
    try{
      url = compileYQL([
        "env \""+yql_uri+"\"",
        "select * from github where CODE=\""+code+"\""
      ]);
    }catch(e){
      return setTimeout(next.bind(next,e),1);
    }

    jQuery.ajax(url).done(function(results){
      next(void(0),results.query.results.OAuth.access_token);
    }).fail(function(x,status,e){
      next(e);
    });
  };
}


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
        addError({name:"Bad markdown call: "+response.status, message: data.message});
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


function ISOplus1(iso){
  var d = new Date(iso);
  d.setSeconds(d.getSeconds() + 1);
  return d.toISOString();
}
