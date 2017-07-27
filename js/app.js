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
        window.location.href = "https://secure.meetup.com/oauth2/authorize?client_id=cqcli029e5mf174b32fqdetvs7&response_type=token&redirect_uri=http://127.0.0.1:8080/callback.html&scope=ageless"
    }

});

gathered.controller("HomeController", function($scope, meetupService, $firebaseObject, $state) {

    meetupService.loadUser().then(function(user) {
        window.localStorage.setItem('user', JSON.stringify(user.data));
        const rootRef = firebase.database().ref().child('users');
        const ref = rootRef.child(user.data.id+"_test");
        $scope.user = $firebaseObject(ref);

        $scope.user.$loaded().then(function() {
            //If user exists, type == undefined, if user does not exist, type == object. 
            //Making check to confirm user does not exist then redirect to new user page.
            if(typeof $scope.user.$value !== 'undefined')
            {
                 $state.go('new');
            }
        });

    })
});

gathered.controller("NewUserController", function($scope, $firebaseArray) {
    $scope.user = JSON.parse(window.localStorage.getItem("user"));
    const ref = firebase.database().ref().child('users');
    $scope.fb_user = $firebaseArray(ref);

    $scope.addProfile = function() {
        $scope.fb_user.$add($scope.user).then(function() {
            alert("Saved");
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