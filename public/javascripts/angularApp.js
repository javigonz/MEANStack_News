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
      })
      .state('login', {
          url: '/login',
          templateUrl: '/login.html',
          controller: 'AuthCtrl',
          onEnter: ['$state', 'auth', function($state, auth){
            if(auth.isLoggedIn()){
              $state.go('home');
            }
          }]
      })
        .state('register', {
          url: '/register',
          templateUrl: '/register.html',
          controller: 'AuthCtrl',
          onEnter: ['$state', 'auth', function($state, auth){
            if(auth.isLoggedIn()){
              $state.go('home');
            }
          }]
      });
      $urlRouteProvider.otherwise('home');
    }

]);

/////////////////////////////////////////////SERVICES

app.factory('auth', [ '$http', '$window',

  function($http, $window){
    var auth = {};

    auth.saveToken = function (token){
      $window.localStorage['mean-news-token']= token;
    };

    auth.getToken = function(){
      return $window.localStorage['mean-news-token'];
    };

    auth.isLoggedIn = function(){
      var token = auth.getToken();

      if(token){
        var payload = JSON.parse($window.atob(token.split('.')[1]));

        return payload.exp > Date.now() / 1000;
      } else {
        return false;
      }
    };

    auth.currentUser = function(){
      if(auth.isLoggedIn()){
        var token = auth.getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));

        return payload.username;
      }
    };

    auth.register = function(user){
      return $http.post('/register', user)
        .success(function(data){
            auth.saveToken(data.token);
        });
    };

    auth.logIn = function(user){
      return $http.post('/login', user)
        .success(function(data){
            auth.saveToken(data.token);
        });
    };

    auth.logOut = function(){
      $window.localStorage.removeItem('mean-news-token');
    };

    return auth;
  }

]);


app.factory('posts', [ '$http', '$q', 'auth',

  function($http, $q, auth){

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
      //Authorization: Bearer TOKEN.GOES.HERE
      $http.post('/posts', post, { headers: {Authorization: 'Bearer '+auth.getToken()}})
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
      $http.put('/posts/' + post._id + '/upvote', null,  { headers: {Authorization: 'Bearer '+auth.getToken()}})
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

app.controller('AuthCtrl', ['$scope','$state','auth',
  function($scope, $state, auth){

    $scope.user = {};

    $scope.register = function(){
      auth.register($scope.user).error(function(error){
        $scope.error = error;
      }).then(function(){
        $state.go('home');
      });
    };

    $scope.logIn = function(){
      auth.logIn($scope.user).error(function(error){
        $scope.error = error;
      }).then(function(){
        $state.go('home');
      });
    };
  }
]);

app.controller('NavCtrl', ['$scope','auth',
  function($scope, auth){

    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.logOut = auth.logOut;
  }
]);
