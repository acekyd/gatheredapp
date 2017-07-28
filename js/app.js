// Initialize Firebase
var config = {
    apiKey: "AIzaSyA8U9aAJXFPvhwY2bDxuo1e3CtClU0s6DA",
    authDomain: "gathered-f3c2a.firebaseapp.com",
    databaseURL: "https://gathered-f3c2a.firebaseio.com",
    projectId: "gathered-f3c2a",
    storageBucket: "gathered-f3c2a.appspot.com",
    messagingSenderId: "934798349553"
};
firebase.initializeApp(config);

var gathered = angular.module("gathered", ['ui.router', 'firebase']);

gathered.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'LoginController'
        })
        .state('home', {
            url: '/home',
            templateUrl: 'templates/home.html',
            controller: 'HomeController'
        })
        .state('new', {
            url: '/new',
            templateUrl: 'templates/new_user.html',
            controller: 'NewUserController'
        });
    $urlRouterProvider.otherwise('/login');
});

gathered.controller("LoginController", function($scope) {
    $scope.login = function() {
        window.location.href = "https://secure.meetup.com/oauth2/authorize?client_id=i11g0qhdo95ddaig8dg4chhah5&response_type=token&redirect_uri=http://gatheredapp.co/callback.html&scope=ageless"
    }

});

gathered.controller("HomeController", function($scope, meetupService, $firebaseObject, $state) {

    meetupService.loadUser().then(function(user) {

        const rootRef = firebase.database().ref().child('users');
        const ref = rootRef.child(user.data.id);
        $scope.user = $firebaseObject(ref);

        $scope.user.$loaded().then(function() {
            //If user exists, type == undefined, if user does not exist, type == object. 
            //Making check to confirm user does not exist then redirect to new user page.
            if(typeof $scope.user.$value !== 'undefined')
            {
                window.localStorage.setItem('user', JSON.stringify(user.data));
                $state.go('new');
            }
        });
    })

    meetupService.loadDashboard().then(function(dashboard) {
        $scope.dashboard = dashboard;
    })
});

gathered.controller("NewUserController", function($scope, $firebaseObject, $state) {
    $scope.user = JSON.parse(window.localStorage.getItem("user"));
    const ref = firebase.database().ref().child('users').child($scope.user.id+"_test");
    $scope.fb_user = $firebaseObject(ref);

    $scope.addProfile = function() {
        //$scope.fb_user.push($scope.user);
        $scope.fb_user.$ref().set($scope.user).then(function() {
            alert("Saved");
            //Show toast
            window.localStorage.setItem('user', JSON.stringify($scope.user));
            $state.go('home');

        }).catch(function(error) {
            alert('Error!');
          });

    }

});


gathered.factory('meetupService', function($http) {
        var access_token = window.localStorage.getItem("access_token");
        var auth_user;
        return {
            foo: function() {
                alert("I'm foo!");
            },
            loadUser: function() {
                  return $http.get('https://api.meetup.com/members/self?access_token='+ access_token);
            },
            loadDashboard: function() {
                  return $http.get('https://api.meetup.com/dashboard?is_simplehtml=true&fields=simple_html_description&access_token='+access_token);
            },
            loadEvent: function(urlname, id) {
                return $http.get('https://api.meetup.com/'+urlname+'/events/'+id+'?access_token='+access_token);
            },
            loadEvents: function() {
                  return $http.get('https://api.meetup.com/self/events?desc=false&fields=plain_text_description&access_token='+access_token);
            },
            loadGroups: function() {
                  return $http.get('https://api.meetup.com/self/groups?fields=plain_text_description&access_token='+access_token);
            }
        };
    });