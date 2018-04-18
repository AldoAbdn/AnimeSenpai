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
  .otherwise({redirectTo:'/'});
});

/*Angular Controllers*/
//Main Controller. Handles Popups and Dropdown
animeSenpaiAdmin.controller("mainAdminController", function($scope,$http) {
  //Setup
  $scope.getProfile = function(){
    $http.get("/profile/profile")
    .then(function(response){
      $scope.setProfile(response.data);
    });
  }
  $scope.setProfile = function(profile){
    $scope.profile = profile;
  }
  $scope.getProfile();
  //Dropdown
  $scope.dropdowntoggle = false;
  $scope.dropdown = "dropdown/logged-in.html";
  $scope.setDropdown = function(dropdown){
    $scope.dropdown = dropdown;
  };
  $scope.btnLoginClick = function(){
    $scope.dropdowntoggle = !$scope.dropdowntoggle;
  };
  //Popup
  $scope.commentEditPopup = {title:"Comment Edit",content:"/popup/admin/comment-edit.html"};
  $scope.postEditPopup = {title:"Post Edit",content:"/popup/admin/post-edit.html"};
  $scope.profileEditPopup = {title:"Profile Edit",content:"/popup/admin/profile-edit.html"};
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
animeSenpaiAdmin.controller("listsController", function($scope,$http){
  //Temp object that represents what might be returned from the server 
  $scope.selected = "classics";
  $scope.selectedRow = 0;
  $scope.anime = {};
  $scope.lists = {
    search:"",
    searchResults:[],
    classics:[],
    bestAmerican:[],
    bestIndie:[]
  }
  $scope.getLists = function(){
    $http.get("admin/lists")
    .then(function(response){
      $scope.lists.classics = response.data.classics;
      $scope.lists.bestAmerican = response.data.bestAmerican;
      $scope.lists.bestIndie = response.data.bestIndie;
    },function(response){
  
    });
  }
  $scope.getLists();
  $scope.select = function(index, anime){
    $scope.selectedRow = index;
    $scope.anime = anime;
  }
  $scope.add = function(){
    $http.post("/admin/lists/add",{params:{anime:$scope.anime,list:$scope.selected}})
    .then(function(response){
      $scope.getLists();
    });
  }
  $scope.delete = function(anime,list){
    $http.delete("/admin/lists/delete",{params:{id:anime.id,list:list}})
    .then(function(response){
      console.log(response.data + " delete");
      $scope.getLists();
    });
  }
  $scope.inputChange = function(){
    $http.get("/home/search",{params: {search: $scope.lists.search}})
    .then(function(response){
      if ($scope.lists.search == response.data.search)
      $scope.lists.searchResults = response.data.anime;
      console.log(response.data);
    },function(response){
  
    });
  }
});
/*Popup Controllers*/
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
animeSenpaiAdmin.controller("loggedInDropdown", function($scope,$window){
  //Test functions to simulate functionality 
  $scope.signOut = function(){
    $http.post("/logout")
    .then(function(response){
      $window.location.href="/";
      console.log(response);
    },function(response){
      console.log(response);
    })
  };
  $scope.openProfile = function(){
    $location.url('/profile');
  };
});
