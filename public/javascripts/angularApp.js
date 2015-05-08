var app = angular.module('meanNews', ['ui.router']);


/////////////////////////////////////////////ROUTES
app.config(['$stateProvider', '$urlRouterProvider',

  function($stateProvider, $urlRouteProvider){

    $stateProvider
      .state('home',{
          url:         '/home',
          templateUrl: '/home.html',
          controller: 'MainCtrl',

      })
      .state('posts',{
          url:         '/posts/{id}',
          templateUrl: '/posts.html',
          controller:  'PostsCtrl'
      });
      $urlRouteProvider.otherwise('home');
    }

]);

/////////////////////////////////////////////SERVICES
app.factory('posts', [ '$http', '$q',

  function($http,$q){

    var o = {};
    o.getAll = function()
    {
        var deferred = $q.defer();
        $http.get('/posts')
            .success(function(response) {
                deferred.resolve(response);
                console.log(response);

            })
            .error(function(error){
                console.error('The async call has fail');
            });
        return deferred.promise;
    }
    return o;
  }

]);



/////////////////////////////////////////////CONTROLLERS
app.controller('MainCtrl', ['$scope', '$stateParams', 'posts',

  function($scope, $stateParams, posts){

    posts.getAll()
      .then(function(result){
        console.log('Resultado Then:',result);
        $scope.posts = result;
      })
      .catch (function(err){
        console.log('The async call has fail');
      })




    $scope.addPost = function(){
      if (!$scope.title || $scope.title === '') {    //Not empty field is permitted
        return;
      }
      $scope.posts.push({
        title: $scope.title,
        link: $scope.link,
        upvotes: 0,
        comments: [
          {author: 'Joe', body: 'Cool post!', upvotes: 0},
          {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
        ]
      });
      $scope.title = '';
      $scope.link = '';
    };

    $scope.incrementUpvotes = function(post){
      post.upvotes += 1;
    };
  }

]);

app.controller('PostsCtrl', ['$scope', '$stateParams', 'posts',

  function($scope, $stateParams, posts){

      $scope.post = posts.posts[$stateParams.id];
      console.log($scope.post);

      $scope.addComment = function(){
        if ($scope.body === '') {
          return;
        }
        $scope.post.comments.push({
          body: $scope.body,
          author: 'user',
          upvotes: 0
        });
        $scope.body = '';
      };
  }

]);
