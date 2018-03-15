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
    templateUrl:"page/admin/account-management/account-management.html",
    controller:"accountManagementController"
  })
  .when("/post-management", {
    templateUrl:"page/admin/post-management/post-management.html",
    controller:"postManagementController"
  })
  .when("/lists", {
    templateUrl:"page/admin/lists/lists.html",
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
animeSenpaiAdmin.controller("mainAdminController", function($scope) {
  //Dropdown
  $scope.dropdowntoggle = false;
  $scope.dropdown = "dropdown/login.html";
  $scope.btnLoginClick = function(){
    $scope.dropdowntoggle = !$scope.dropdowntoggle;
  }
  //Popup
  $scope.commentEditPopup = {title:"Title",content:"/popup/admin/comment-edit.html"};
  $scope.postEditPopup = {title:"Title",content:"/popup/admin/post-edit.html"};
  $scope.profileEditPopup = {title:"Title",content:"/popup/admin/profile-edit.html"};
  $scope.popup = $scope.commentEditPopup;
  $scope.clickedItem = null;

  $scope.openPopup = function(popup,item){
    $scope.clickedItem = item;
    $scope.popup = popup;
    $('#popup').modal('show');
  }
  $scope.closePopup = function(){
    $('#popup').modal('hide');
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
animeSenpaiAdmin.controller("accountManagementController", function($scope){
  $scope.accountManagement = {
    latestAccounts: [{username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
                     {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
                     {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"}],
    recentlyCreatedReview: [{username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
                            {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
                            {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"}],
    loggedIn: [{username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
               {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
               {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"}],
    recentlyCreatedThread: [{username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
                            {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
                            {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"}],
    suspended: [{username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
                {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
                {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"}], 
    recentlyCreatedComment: [{username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
                             {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
                             {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"}],
    searchResults: [],
    content:"page/admin/account-management/main.html",
    search:""};
  $scope.inputChanged = function(){
    if($scope.accountManagement.search == ""){
      $scope.accountManagement.content = "page/admin/account-management/main.html";
    } else {
      $scope.accountManagement.content = "page/admin/account-management/search.html";
    }
  }
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
animeSenpaiAdmin.controller("adminPopupController", function($scope){

});
animeSenpaiAdmin.controller("commentEditPopupController", function($scope){
  $scope.delete = function(){
    alert("Comment Delete button pressed");
  }
  $scope.save = function(){
    alert("Comment Edit Save Button Pressed");
  }
});
animeSenpaiAdmin.controller("postEditPopupController", function ($scope){
  $scope.postEdit = {comments:[{title:"Review Title",author:"Alistair",date:"01/01/01",time:"01:01"}]};
  $scope.delete = function(){
    alert("Post Edit Delete button pressed");
  }
  $scope.save = function(){
    alert("Post Edit Save Button Pressed");
  }
});
animeSenpaiAdmin.controller("profileEditPopupController", function($scope){
  $scope.profileEdit = {name:"Alistair",email:"example@rgu.ac.uk",password:"password",
                        reviews:[{score:100,title:"Review Title",author:"Alistair",date:"01/01/01",time:"01:01"}],
                        threads:[{title:"Review Title",author:"Alistair",date:"01/01/01",time:"01:01"}],
                        comments:[{title:"Review Title",author:"Alistair",date:"01/01/01",time:"01:01"}]};
  $scope.delete = function(){
    alert("Profile Edit Delete button pressed");
  }
  $scope.save = function(){
    alert("Profile Edit Save Button Pressed");
  }
  $scope.suspend = function(){
    alert("Profile Edit Suspend button pressed");
  };
});
