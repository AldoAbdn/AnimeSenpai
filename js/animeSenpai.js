//AnimeSenpai
//Authors: Alistair Quinn, Robbie Munroe, Chris Foulkes, Connor O'Donnell, Sunny Shek, Ajraf
//Main JS File for site

//Angular Routing Setup
var animeSenpai = angular.module("animeSenpai", ["ngRoute"]);
animeSenpai.config(function($routeProvider){
  $routeProvider
  .when("/", {
    templateUrl:"page/home.html",
    controller:"homeController"
  })
  .when("/about", {
    templateUrl:"page/about.html",
    controller:"aboutController"
  })
  .when("/contact-us", {
    templateUrl:"page/contact-us.html",
    controller:"contactUsController"
  })
  .when("/profile", {
    templateUrl:"page/profile.html",
    controller:"profileController"
  })
  .when("/profile-edit", {
    templateUrl:"page/profile-edit.html",
    controller:"profileEditController"
  })
  .when("/review-edit", {
    templateUrl:"page/review-edit.html",
    controller:"reviewEditController"
  })
  .when("/thread-edit", {
    templateUrl:"page/thread-edit.html",
    controller:"threadEditController"
  })
});

//Angular Controllers
animeSenpai.controller("mainController", function($scope) {
  $scope.dropdown = "dropdown/login.html";
  $scope.btnLoginClick = function(){
    alert("Login Click");
  }
})
animeSenpai.controller("homeController", function(){

});
animeSenpai.controller("aboutController", function(){

});
animeSenpai.controller("contactUsController", function(){

});
animeSenpai.controller("profileController", function(){

});
animeSenpai.controller("profileEditController", function(){

});
animeSenpai.controller("reviewEditController", function(){

});
animeSenpai.controller("threadEditController", function(){

});
