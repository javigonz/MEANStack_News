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
          controller:  'PostsCtrl',
          resolve: {
             post: ['$stateParams', 'posts', function($stateParams, posts) {
               return posts.get($stateParams.id);
             }]
           }
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


    o.get = function(id) {
      return $http.get('/posts/' + id).then(function(res){
        return res.data;
      });
    };


    o.addComment = function(id, comment) {
      return $http.post('/posts/' + id + '/comments', comment);
    };


    o.upvoteComment = function(post, comment) {
      console.log(comment);
      return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote')
        .success(function(data){
          comment.upvotes += 1;
        });
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

app.controller('PostsCtrl', ['$scope', 'posts', 'post',
  function($scope, posts, post){

      $scope.post = post;
      console.log($scope.post);

      $scope.addComment = function(){
        if($scope.body === '') { return; }
        posts.addComment(post._id, {
          body: $scope.body,
          author: 'user',
        }).success(function(comment) {
          $scope.post.comments.push(comment);
        });
        $scope.body = '';
      };

      $scope.incrementUpvotes = function(comment){
        posts.upvoteComment(post, comment);
      };

  }

]);
