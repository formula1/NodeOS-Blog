var async = require("async");
var version = 1;
var userversion = localStorage.getItem("cacheorUri-version");
if(!userversion || userversion === "undefined" || userversion < version){
  localStorage.clear();
}
localStorage.setItem("cacheorUri-version",version);

var in_memory = {};

function checkArrayOrder(ari){
  return !ari || ari.length < 2?
    "unk":
    ari[0].timestamp < ari[ari.length -1].timestamp?
      "asc":"desc";
}

function cacheOrUriIterator(cachename, itemCBs){
  var cached = localStorage.getItem(cachename);
  if(!cached || cached === "undefined" || cached === "[]" ){
    in_memory[cachename] = [];
    return UriIterator(cachename, void(0), itemCBs);
  }
  cached = JSON.parse(cached);
  if(!Array.isArray(cached)){
    cached = [cached];
  }
  var order = checkArrayOrder(cached);
  in_memory[cachename] = cached;
  UriIterator(cachename, cached[cached.length - 1].timestamp, itemCBs,order);
}

function UriIterator(cachename, timestamp, itemCBs, order){
  itemCBs.timestamp2URI(timestamp,function(uri){
    jQuery.get(uri).done(function(data){
      if(!Array.isArray(data)){
        data = [data];
      }
      async.eachSeries(data, function(item,next){
        itemCBs.prep(item,function(item){
          next();
        });
      },function(err,results){
        if(err) return itemCBs.error(err);
        var doublecheck_order = checkArrayOrder(data)
        if(order != "unk"){
          if(order != doublecheck_order && doublecheck_order != "unk"){
            in_memory[cachename].sort(function(a,b){
              return doublecheck_order=="asc"?
                a.timestamp-b.timestamp:
                b.timestamp-a.timestamp;
            });
            order = doublecheck_order;
          }
        }else if(doublecheck_order == "unk"){
          order = "asc";
        }

        var temp = order=="asc"?
          in_memory[cachename].concat(data):
          data.concat(in_memory[cachename]);
        delete in_memory[cachename];
        try{
          localStorage.setItem( cachename,JSON.stringify(temp) );
        }catch(e){
          return itemCBs.error(e);
        }
        async.eachSeries(temp, function(item,next){
          itemCBs.ready(item, next);
        },function(err,results){
          if(data.length === 0){
            itemCBs.done(timestamp);
          }else{
            itemCBs.done(data[data.length -1].timestamp);
          }
        });
      });
    }).fail(itemCBs.error);
  });
}
