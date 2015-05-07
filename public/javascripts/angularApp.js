var app = angular.module('meanNews', ['ui.router']);


/////////////////////////////////////////////ROUTES
app.config(['$stateProvider', '$urlRouterProvider',

  function($stateProvider, $urlRouteProvider){

    $stateProvider
      .state('home',{
          url:         '/home',
          templateUrl: '/home.html',
          controller: 'MainCtrl'
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
app.factory('posts', [

  function(){

    var o = {
      posts: [
        {id: 0, title: 'post 1', link: 'htp://www.google.com', upvotes: 5,
        comments: [
          {author: 'Joe', body: 'Cool post!', upvotes: 0},
          {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
        ]},
        {id: 1, title: 'post 2', link: 'htp://www.google.com', upvotes: 2,
        comments: [
          {author: 'Joe', body: 'Cool post!', upvotes: 0},
          {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
        ]},
        {id: 2, title: 'post 3', link: 'htp://www.google.com', upvotes: 15,
        comments: [
          {author: 'Joe', body: 'Cool post!', upvotes: 0},
          {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
        ]},
        {id: 3, title: 'post 4', link: 'htp://www.google.com', upvotes: 9,
        comments: [
          {author: 'Joe', body: 'Cool post!', upvotes: 0},
          {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
        ]},
        {id: 4, title: 'post 5', link: 'htp://www.google.com', upvotes: 4,
        comments: [
          {author: 'Joe', body: 'Cool post!', upvotes: 0},
          {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
        ]}
      ]
    };

    return o;
  }

]);


/////////////////////////////////////////////CONTROLLERS
app.controller('MainCtrl', ['$scope', '$stateParams', 'posts',

  function($scope, $stateParams, posts){

    $scope.posts = posts.posts;

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
