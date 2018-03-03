//AnimeSenpaiAdmin
//Authors: Alistair Quinn, Robbie Munroe, Chris Foulkes, Connor O'Donnell, Sunny Shek, Ajraf
//JS file for admin part of site

//Angular Routing Setup
var animeSenpaiAdmin = angular.module("animeSenpaiAdmin", ["ngRoute"]);
animeSenpaiAdmin.config(function($routeProvider){
  $routeProvider
  .when("/", {
    templateUrl:"page/admin/adminHome.html",
    controller:"adminHomeController"
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
//Main Controller. Handles Popups
animeSenpai.controller("mainAdminController", function($scope) {
  $scope.dropdown = "dropdown/login.html";
  $scope.popup = "popup/admin/post-edit.html"
  $scope.btnLoginClick = function(){
    alert("Login Click");
  }
})
animeSenpaiAdmin.controller("adminHomeController", function($scope){
  //This is a temp placholder, adminHome variable will be populated form server later
  $scope.adminHome = {usersOnline:10,
                      accountsCreated:10,
                      contactedUs:10,
                      reviewsPosted:10,
                      threadsStarted:10,
                      commentsPosted:10,
                      reviews:[{score:100,title:"Review Title",author:"Alistair",date:"01/01/01",time:"01:01"}],
                      threads:[{title:"Review Title",author:"Alistair",date:"01/01/01",time:"01:01"}],
                      comments:[{title:"Review Title",author:"Alistair",date:"01/01/01",time:"01:01"}]};
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
//Popup Controllers
animeSenpaiAdmin.controller("postEditController", function($scope){
  //Placeholder object will be populated by server later
  $scope.postEdit = {comments:[{title:"Review Title",author:"Alistair",date:"01/01/01",time:"01:01"}]};
  $scope.delete = function(){
    alert("Delete button pressed");
  }
  $scope.save = function(){
    alert("Save Button Pressed");
  }
});
animeSenpaiAdmin.controller("profileEditController", function($scope){
  //Placeholder object
  $scope.profileEdit = {name:"Alistair",email:"example@rgu.ac.uk",password:"password",
                        reviews:[{score:100,title:"Review Title",author:"Alistair",date:"01/01/01",time:"01:01"}],
                        threads:[{title:"Review Title",author:"Alistair",date:"01/01/01",time:"01:01"}],
                        comments:[{title:"Review Title",author:"Alistair",date:"01/01/01",time:"01:01"}]};
  $scope.delete = function(){
    alert("Delete button pressed");
  };
  $scope.suspend = function(){
    alert("Suspend button pressed");
  };
  $scope.save = function(){
    alert("Save button pressed");
  }
});
