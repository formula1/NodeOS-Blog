var hash = document.location.toString().split("#")[1];
NodeOsBlog.controller('BlogSingleCtrl', function ($scope, $http) {
  $scope.uriPath = "/NodeOS/NodeOS/issues/"+hash;
  $scope.blog = [];

  var markdown = require("markdown").markdown;
  $scope.parseMarkdown = function(item,next){
    try{
      item.bodyHTML = markdown.toHTML(item.body);
    }catch(e){
      item.bodyHTML = "<pre>"+item.body+"</pre>";
    }
    next(item);
  };
  $http.get('https://api.github.com/repos'+$scope.uriPath)
  .success(function(data,status,headers) {
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
      $scope.blog.push(item);
    });
  }).error(function(data, status, headers, config) {
    if(status === 403){
      add403();
    }else{
      errors.push({name:"Bad issues list request: "+status, message: data.message});
    }
  });
});
