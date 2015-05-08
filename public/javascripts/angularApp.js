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

    o.getAll = function(){
        var deferred = $q.defer();
        $http.get('/posts')
            .success(function(response) {
                deferred.resolve(response);
            })
            .error(function(error){
                console.error('The async call has fail');
            });
        return deferred.promise;
    }


    o.createPost = function(post) {
      var deferred = $q.defer();
      $http.post('/posts', post)
          .success(function(response) {
              deferred.resolve(response);
          })
          .error(function(error){
              console.error('The async call has fail');
          });
      return deferred.promise;
    }


    o.upvote = function(post) {
      var deferred = $q.defer();
      $http.put('/posts/' + post._id + '/upvote')
        .success(function(response) {
            post.upvotes += 1;
            deferred.resolve(response);
        })
        .error(function(error){
            console.error('The async call has fail');
        });
    return deferred.promise;
    };

    return o;
  }

]);



/////////////////////////////////////////////CONTROLLERS
app.controller('MainCtrl', ['$scope', '$stateParams', 'posts',

  function($scope, $stateParams, posts){

    posts.getAll()
      .then(function(result){
        $scope.posts = result;
      })
      .catch (function(err){
        console.log('The async call has fail');
      })


    $scope.addPost = function(){
      if (!$scope.title || $scope.title === '') {    //Not empty field is permitted
        return;
      }
      posts.createPost({
        title: $scope.title,
        link: $scope.link,
      })
        .then(function(result){
          $scope.posts.push(result);
          $scope.title = '';
          $scope.link = '';
        })
        .catch (function(err){
          console.log('The async call has fail');
        })
    };

    $scope.incrementUpvotes = function(post){
      posts.upvote(post)
        .then(function(result){
          $scope.post = result;
        })
        .catch (function(err){
          console.log('The async call has fail');
        })
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
