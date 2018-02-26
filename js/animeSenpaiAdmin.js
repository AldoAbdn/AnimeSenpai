//AnimeSenpaiAdmin
//Authors: Alistair Quinn, Robbie Munroe, Chris Foulkes, Connor O'Donnell, Sunny Shek, Ajraf
//JS file for admin part of site

//Angular Routing Setup
var animeSenpaiAdmin = angular.module("animeSenpaiAdmin", ["ngRoute"]);
animeSenpaiAdmin.config(function($routeProvider){
  $routeProvider
  .when("/", {
    templateUrl:"page/admin/home.html",
    controller:"homeController"
  })
  .when("/account-management", {
    templateUrl:"page/admin/account-management.html",
    controller:"accountManagementController"
  })
  .when("/profile-management", {
    templateUrl:"page/admin/profile-management.html",
    controller:"profileManagementController"
  })
  .when("/lists", {
    templateUrl:"page/admin/lists.html",
    controller:"listsController"
  })
  .when("/profile", {
    templateUrl:"page/profile.html",
    controller:"profileController"
  })
  .when("/profile-edit", {
    templateUrl:"page/profile-edit.html",
    controller:"profileEditController"
  })

});

//Angular Controllers
animeSenpai.controller("mainAdminController", function($scope) {
  $scope.dropdown = "dropdown/login.html";
  $scope.btnLoginClick = function(){
    alert("Login Click");
  }
})
animeSenpaiAdmin.controller("homeController", function(){

});
animeSenpaiAdmin.controller("accountManagementController", function(){

});
animeSenpaiAdmin.controller("profileManagementController", function(){

});
animeSenpaiAdmin.controller("listsController", function(){

});
animeSenpaiAdmin.controller("profileController", function(){

});
animeSenpaiAdmin.controller("profileEditController", function(){

});
