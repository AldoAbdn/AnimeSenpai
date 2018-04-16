//AnimeSenpaiAdmin
//Authors: Alistair Quinn, Robbie Munroe, Chris Foulkes, Connor O'Donnell, Sunny Shek, Ajraf
//JS file for admin part of site
//Angular 1.6 (We will use EJS also for index.html customisation)

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
  .when("/post-management", {
    templateUrl:"page/admin/post-management.html",
    controller:"postManagementController"
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

/*Angular Controllers*/
//Main Controller. Handles Popups and Dropdown
animeSenpaiAdmin.controller("mainAdminController", function($scope) {
  //Dropdown
  $scope.dropdowntoggle = false;
  $scope.dropdown = "dropdown/login.html";
  $scope.setDropdown = function(dropdown){
    $scope.dropdown = dropdown;
  };
  $scope.btnLoginClick = function(){
    $scope.dropdowntoggle = !$scope.dropdowntoggle;
  };
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
//Admin Home Controller 
animeSenpaiAdmin.controller("adminHomeController", function($scope,$http){
  //Model
  $scope.adminHome = {usersOnline:0,
                      accountsCreated:0,
                      contactedUs:0,
                      reviewsPosted:0,
                      threadsStarted:0,
                      commentsPosted:0,
                      reviews:[],
                      threads:[],
                      comments:[]};
  //Retrieve Current Admin Home Data
  $http.get("/admin/home")
  .then(function(response){
    $scope.adminHome = response.data;
  });
});
//Account Management Controller 
animeSenpaiAdmin.controller("accountManagementController", function($scope){
  //Temp ojbect to represent what server might return 
  $scope.accountManagement = {
    latestAccounts: {users:[{username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
                    {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
                    {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"}],
                    username:"",
                    query:""},
    recentlyCreatedReview: {users:[{username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
                           {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
                           {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"}],
                           username:"",
                           query:""},
    loggedIn: {users:[{username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
              {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
              {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"}],
              username:"",
              query:""},
    recentlyCreatedThread: {users:[{username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
                           {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
                           {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"}],
                           username:"",
                           query:""},
    suspended: {users:[{username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
               {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
               {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"}],
               username:"",
               query:""}, 
    recentlyCreatedComment: {users:[{username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
                            {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"},
                            {username:"John Smith", email:"john@smith.co.uk", password:"P@ssw0rd", date:"01/01/01", time:"01:01"}],
                            username:"",
                            query:""},
    searchResults: [],
    search:""};
  //Functions handle text input
  $scope.inputChanged = function(){

  };
  $scope.usernameInputChanged = function(){

  };
  $scope.queryInputChanged = function(){
    
  }
});
//Post Management Controller 
animeSenpaiAdmin.controller("postManagementController", function($scope){
  //Temp object tha represents what might be returned from the server 
  $scope.postManagement = {
    latestPosts:{posts:[{score:100,title:"Title",author:"Author",date:"01/01/01",time:"00:00"},
                        {score:100,title:"Title",author:"Author",date:"01/01/01",time:"00:00"},
                        {score:100,title:"Title",author:"Author",date:"01/01/01",time:"00:00"}],
                        title:"",
                        query:""},
    recentlyCreatedReview:{posts:[{score:100,title:"Title",author:"Author",date:"01/01/01",time:"00:00"},
                          {score:100,title:"Title",author:"Author",date:"01/01/01",time:"00:00"},
                          {score:100,title:"Title",author:"Author",date:"01/01/01",time:"00:00"}],
                          title:"",
                          query:""},
    recentlyCreatedThread:{posts:[{score:100,title:"Title",author:"Author",date:"01/01/01",time:"00:00"},
                          {score:100,title:"Title",author:"Author",date:"01/01/01",time:"00:00"},
                          {score:100,title:"Title",author:"Author",date:"01/01/01",time:"00:00"}],
                          title:"",
                          query:""},
    recentlyCreatedComment:{posts:[{score:100,title:"Title",author:"Author",date:"01/01/01",time:"00:00"},
                          {score:100,title:"Title",author:"Author",date:"01/01/01",time:"00:00"},
                          {score:100,title:"Title",author:"Author",date:"01/01/01",time:"00:00"}],
                          title:"",
                          query:""},
    searchResults: [],
    search:""};
  $scope.inputChanged = function(){

  };
  $scope.titleInputChanged = function(){

  };
  $scope.queryInputChanged = function(){
    
  }
});
//Lists Controller 
animeSenpaiAdmin.controller("listsController", function($scope){
  //Temp object that represents what might be returned from the server 
  $scope.lists = {
    classics:{anime:[{title:"Title",author:"Author",rating:100,views:0}],searchResults:[],search:""},
    bestAmerican:{anime:[{title:"Title",author:"Author",rating:100,views:0}],searchResults:[],search:""},
    bestIndie:{anime:[{title:"Title",author:"Author",rating:100,views:0}],searchResults:[],search:""}
  }
  //Functions to handle text input
  $scope.classicsInputChanged = function(){
    alert("Classics Text Changed");
  };
  $scope.bestAmericanInputChanged = function(){
    alert("Best American Text Changed");
  };
  $scope.bestIndieInputChanged = function(){
    alert("Best Indie Text Changed");   
  };
});
//Profile Controller
animeSenpaiAdmin.controller("profileController", function(){

});
//Profile Edit Controller 
animeSenpaiAdmin.controller("profileEditController", function(){

});
/*Popup Controllers*/
//Admin Popup Controller 
animeSenpaiAdmin.controller("adminPopupController", function($scope){

});
//Comment Edit Popup Controller
animeSenpaiAdmin.controller("commentEditPopupController", function($scope){
  //Test functions 
  $scope.delete = function(){
    alert("Comment Delete button pressed");
  }
  $scope.save = function(){
    alert("Comment Edit Save Button Pressed");
  }
});
//Post Edit Popup Controller 
animeSenpaiAdmin.controller("postEditPopupController", function ($scope){
  //Temp object that represents what might be returned from the server 
  $scope.postEdit = {comments:[{title:"Review Title",author:"Alistair",date:"01/01/01",time:"01:01"}]};
  //Test Functions 
  $scope.delete = function(){
    alert("Post Edit Delete button pressed");
  }
  $scope.save = function(){
    alert("Post Edit Save Button Pressed");
  }
});
//Profile Edit Popup Controller 
animeSenpaiAdmin.controller("profileEditPopupController", function($scope){
  //Temp object that represents what might be returned from the server 
  $scope.profileEdit = {name:"Alistair",email:"example@rgu.ac.uk",password:"password",
                        reviews:[{score:100,title:"Review Title",author:"Alistair",date:"01/01/01",time:"01:01"}],
                        threads:[{title:"Review Title",author:"Alistair",date:"01/01/01",time:"01:01"}],
                        comments:[{title:"Review Title",author:"Alistair",date:"01/01/01",time:"01:01"}]};
  //Test Functions
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
/*Dropdown Controllers*/
//Logged In Dropdown Controller 
animeSenpaiAdmin.controller("loggedInDropdown", function($scope,$location){
  //Test functions to simulate functionality 
  $scope.signOut = function(){
    $scope.setDropdown("dropdown/login.html");
  };
  $scope.openProfile = function(){
    $location.url('/profile');
  };
});
//Login Dropdown 
//Login Dropdown Controller
animeSenpaiAdmin.controller("loginDropdown", function($scope){
  //Test Functions to simulate functionality 
  $scope.login = function(){
    $scope.setDropdown("dropdown/logged-in.html");
  };
  $scope.openSignUp = function(){
    $scope.setDropdown("dropdown/sign-up.html");
  };
});
//Sign Up Dropdown Controller 
animeSenpaiAdmin.controller("signUpDropdown", function($scope){
  //Test Functions to simulate functionality 
  $scope.signUp = function(){
    $scope.setDropdown("dropdown/logged-in.html");
  };
  $scope.openLogin = function(){
    $scope.setDropdown("dropdown/login.html");
  };
});