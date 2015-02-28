NodeOsBlog.controller('CommentListCtrl', function ($scope, $http) {
  if(!num) return;
  $scope.uriPath = "/NodeOS/NodeOS/issues/"+num+"/comments";
  $scope.user = user;
  $scope.blog = [];
  $scope.last = void(0);
  $scope.parseMarkdown = parseMarkdown;

  $scope.loadMore = function(since){
    var i=0;
    var l=-1;
    $scope.user.asAuthority(
      'https://api.github.com/repos'+$scope.uriPath+(since?'?since='+since:""),
      function(uri){
      $http.get(uri).success(function(data,status,headers) {
        if(!$scope.last) $scope.last =  headers.link?headers.link.split("=").pop():1;
        l = data.length;
        if(i === l) return; //No more
        var iterator = function(item){
          $scope.blog.push(item);
          $scope.$apply();
          i++;
          if(i === l){
            try{
              localStorage.setItem("issue-comments-"+num, JSON.stringify($scope.blog));
            }catch(e){
              errors.push({name:"LocalStorage", message:"Cannot Store Anymore"});
            }
            return;
          }
          $scope.parseMarkdown(data[i],iterator);
        };
        $scope.parseMarkdown(data[0],iterator);
      }).error(function(data, status, headers, config) {
        if(status === 403){
          add403();
        }else{
          errors.push({name:"Bad issues list request: "+status, message: data.message});
        }
      });
    });
  };
  var lastdate;
  var cached = localStorage.getItem("issue-comments-"+num);
  if(cached){
    console.log("cached");
    cached = JSON.parse(cached);
    var i = 0;
    var l = cached.length;
    var iterator = function(item){
      $scope.blog.push(item);
      i++;
      if(i === l){
        var d = new Date(cached[i-1].created_at);
        d.setSeconds(d.getSeconds() + 1);
        d = d.toISOString();
        return $scope.loadMore(d);
      }
      setTimeout(iterator.bind(void(0),cached[i]),1);
    };
    iterator(cached[0]);
  }else{
    $scope.loadMore();
  }
});
