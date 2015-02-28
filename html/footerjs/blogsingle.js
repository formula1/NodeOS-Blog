var num = (function(){
  var temp = document.location.href.split("#!")[1];
  console.log(temp);
  if(/[0-9]+/.test(temp)) return temp;
  temp = document.location.href.split("?");
  if(temp.length == 1){
    return add404();
  }
  temp = require("querystring").parse(temp[1]);
  if(!temp._escaped_fragment_){
    return add404();
  }
  return temp._escaped_fragment_;
})();
NodeOsBlog.controller('BlogSingleCtrl', function ($scope, $http) {
  if(!num) return;
  $scope.uriPath = "/NodeOS/NodeOS/issues/"+num;
  $scope.user = user;
  $scope.blog = [];
  $scope.parseMarkdown = parseMarkdown;

  var cached = localStorage.getItem("issue-"+num);
  if(cached){
    cached = JSON.parse(cached);
    var d = new Date(cached.updated_at);
    if(Date.now() - d.getTime() < 1000*60*60*24){
      console.log("cached");
      $scope.blog.push(cached);
      return;
    }
  }

  var markdown = require("markdown").markdown;
  $scope.user.asAuthority('https://api.github.com/repos'+$scope.uriPath,function(uri){
    $http.get(uri).success(function(data,status,headers) {
      var l = data.labels.length;
      while(l--){
        if(data.labels[l].name === "blog"){
          break;
        }
      }
      if(l < 0){
        return errors.push({
          name:"Trying to load a non-blog?",
          message: "I technically can't stop you since this is clientside."+
            " Hopefully my code feels clean enough to hack"
        });
      }
      $scope.parseMarkdown(data,function(item){
        item.date = Date.now();
        try{
          localStorage.setItem("issue-"+num,JSON.stringify(item));
        }catch(e){
          errors.push({name:"LocalStorage", message:"Cannot Store Anymore"});
        }
        $scope.blog.push(item);
        $scope.$apply();
      });
    }).error(function(data, status, headers, config) {
      if(status === 403){
        add403();
      }else{
        errors.push({name:"Bad issues list request: "+status, message: data.message});
      }
    });
  });
});
