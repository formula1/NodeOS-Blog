var browserify = require("browserify");
var UglifyJS = require("uglify-js");
var fs = require("fs");
var async = require("async");
var ejs = require('ejs');

module.exports.compileHTML = function compileHTML(inputdir, templatepath, outputdir, next){
  fs.readdir(pagepath,function(e,files){
    if(e) return next(e);
    async.each(files,function(file,next){
      var input = inputdir+"/"+file;
      fs.stat(input,function(e,s){
        if(e) return next(e);
        if(s.isDirectory()){
          return next("things to be compiled are not expecting a directory");
        }
        var filename = file.split(".")[0];
        var output = outputdir+"/"+filename+".html";
        ejs.renderFile(
          input,
          {
            cur_page:{},
            templatepath:templatepath
          },
          function(e,file){
            if(e) return next(e);
            fs.writeFile(
              output,
              file,
              function(e){
                if(e) return next(e);
                next(void(0), {
                  input:input,
                  output:output
                });
              }
            );
          }
        );
      })
    },next);
  });
};

module.exports.compileJS = function compileJS(inputrequire, outputdir,next){
  var b = browserify();
  var l = inputrequire.length;
  while(l--){
    var item = inputrequire[l];
    if(typeof item === "string"){
      return b.require(item);
    }
    if(!item.name){
      return next("when specifying something to require, "+
        "\n\t you must provide a valid string or"+
        "\n\t you must provide an object with {path:\"valid path or name\"}");
    }
    b.require(item.path, item.options);
  }
  b.require("./AuthProvider", {expose:"AuthProvider"});
  //b.require("markdown");
  b.require(__dirname+"/node_modules/highlight.js/lib/index.js", {expose:"highlight"});
  b.require("querystring");
  b.require("async");
  b.bundle(function(e,buff){
    if(e) return next(e);
    async.parrallel([
      function(){
        fs.writeFile(
          outputdir+"/api.js",
          buff,
          function(e){
            if(e) return next(e);
            next(void(0), {input:inputrequire,output:outputdir+"/api.js"});
          }
        );
      },function(next){
        var min = UglifyJS.parse(buff.toString("utf-8"));
        min.figure_out_scope();
        fs.writeFile(
          outputdir+"/api.min.js",
          min.print_to_string(),
          function(e){
            if(e) return next(e);
            next(void(0), {input:inputrequire,output:outputdir+"/api.min.js"});
          }
        );
      }
    ],next);
  });
};

module.exports.compile = function(inputs, templatepath, outputdir, next){
  async.parrallel([
    compileHTML.bind(void(0),inputs.dir, templatepath, outputdir),
    compileJS.bind(void(0),inputs.require, outputdir)
  ],function(e,results){
    if(e) return next(e);
    var net = [];
    var l = results.length;
    while(l--){
      net = net.concat(results[l]);
    }
    next(void(0),net);
  });
};

if(!module.parent){
  var inputs = {
    require:[
      {path:"./AuthProvider", options:{expose:"AuthProvider"}},
      {path:__dirname+"/node_modules/highlight.js/lib/index.js", options:{expose:"highlight"}},
      "querystring",
      "async",
//    "markdown"
    ],
    dir:__dirname+"/html"
  };
}
