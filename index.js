var browserify = require("browserify");
var fs = require("fs");
var path = require("path");
var async = require("async");
var ejs = require('ejs');

var ob = module.exports = {};
//  git@github.com:NodeOS/GitBlog.git

ob.compileHTML = function compileHTML(inputdir, templatepath, outputdir, next){
  fs.readdir(inputdir,function(e,files){
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
            templatepath:templatepath,
            htmlpath:path.resolve(templatepath, "../")
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
      });
    },next);
  });
};

ob.compileJS = function compileJS(inputrequire, outputdir,next){
  var createBundle = function(inputrequire){
    var b =   browserify();
    var l = inputrequire.length;
    inputrequire = inputrequire.map(function(item){
      if(typeof item === "string"){
        b.require(path.normalize(item));
        return;
      }
      if(!item.path){
        throw new Error("when specifying something to require, "+
          "\n\t you must provide a valid string or"+
          "\n\t you must provide an object with {path:\"valid path or name\"}");
      }
      b.require(path.normalize(item.path), item.options);
      return item.path;
    })
    return b;
  }
  async.parallel([
    function(next){
      createBundle(inputrequire).bundle()
      .pipe(fs.createWriteStream(outputdir+"/api.js"))
      .on("end",function(){
        next(void(0), {input:inputrequire,output:outputdir+"/api.js"});
      }).on("error",next)
    },function(next){
      createBundle(inputrequire).transform({
        global: true
      }, 'uglifyify')
      .bundle()
      .pipe(fs.createWriteStream(outputdir+"/api.min.js"))
      .on("end",function(){
        next(void(0), {input:inputrequire,output:outputdir+"/api.min.js"});
      }).on("error",next);
    }
  ],next);
};

ob.compileAll = function compileAll(inputs, templatepath, outputdir, next){
  console.log("compiling all");
  async.parallel([
    ob.compileHTML.bind(ob,inputs.dir, templatepath, outputdir),
    ob.compileJS.bind(ob,inputs.require, outputdir)
  ],function(e,results){
    if(e) return next(e);
    var net = [];
    console.log(results);
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
      "auth-provider",
      {path:__dirname+"/node_modules/highlight.js/lib/index.js", options:{expose:"highlight"}},
      "async",
//    "markdown"
    ],
    dir:__dirname+"/html/input"
  };
  ob.compileAll(
    inputs,
    __dirname+"/html/template.ejs",
    __dirname+ "/dist",
    function(e,results){
    if(e) throw e;
    console.log(results);
  });
}
