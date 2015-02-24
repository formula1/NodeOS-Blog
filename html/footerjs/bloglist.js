NodeOsBlog.controller('BlogListCtrl', function ($scope, $http) {
  $scope.uriPath = "/NodeOS/NodeOS/issues";
  $scope.blog = [];
  $scope.last = void(0);
  $scope.loadMore = function(page){
    if($scope.last && $scope.last < page) return;
    var i=0;
    var l=-1;
    uriAsAuthority(
      'https://api.github.com/repos'+$scope.uriPath+'?labels=blog&sort=updated&page='+page,
      function(uri){
console.log("uri");
      $http.get(uri).success(function(data,status,headers) {
        console.log(headers);
        console.log(headers.link);
        if(!$scope.last) $scope.last =  headers.link?headers.link.split("=").pop():1;
        l = data.length;
        if(i === l) return; //No more
        var iterator = function(item){
          console.log(item);
          $scope.blog.push(item);
          i++;
          if(i === l) return;
          parseMarkdown(data[i],iterator);
        };
        parseMarkdown(data[0],iterator);
      }).error(function(data, status, headers, config) {
        if(status === 403){
          add403();
        }else{
          errors.push({name:"Bad issues list request: "+status, message: data.message});
        }
      });
    });
  };
  $scope.loadMore(1);
});
