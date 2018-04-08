//AnimeSenpai
//Authors: Alistair Quinn, Robbie Munroe, Chris Foulkes, Connor O'Donnell, Sunny Shek, Ajraf
//Main JS File for site 
//Angular 1.6 (We will use EJS also for index.html customisation)

/*Angular Routing Setup*/
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

/*Angular Controllers*/
//Main Controller, controls Popups and Dropdowns
animeSenpai.controller("mainController", function($scope,$location,$timeout) {
  //JS Navigation 
  $scope.navigate = function(path){
    if ($location.path == path) return;
    $timeout(function(){
      $location.path(path);
    },1);
  };
  //Dropdown
  $scope.dropdowntoggle = false;
  $scope.dropdown = "dropdown/login.html";
  $scope.setDropdown = function(dropdown){
    $scope.dropdown = dropdown;
  }
  $scope.btnLoginClick = function(){
    $scope.dropdowntoggle = !$scope.dropdowntoggle;
  }
  $scope.btnDropdownToggle = function(){
    $scope.dropdowntoggle = $("#btnDropdown").hasClass("collapsed");
  }
  //Popup
  $scope.clickedItem = null;
  $scope.animePopup = {title:"Anime", content:"/popup/anime.html"};
  $scope.contactUsPopup = {title:"Contact Us", content:"/popup/contactUs.html"};
  $scope.loadingPopup = {title:"Loading...", content:"/popup/loading.html"};
  $scope.popup = $scope.animePopup;
  $scope.openPopup = function(popup,item){
    $scope.popup = popup;
    if(item){
      $scope.clickedItem = item;
    }
    if (!$('#popup').is(":visible")){
      $('#popup').modal('show');
    }
  }
  $scope.closePopup = function(){
    $('#popup').modal('hide');
  }
})
//Controller for home page
animeSenpai.controller("homeController", function($scope){
  //This is used to display brand only on contact us and about
  //Brand acts as link back to home page 
  $('#brand').css('visibility','hidden');
  //Example of what might be returned from server
  $scope.home = {
    anime: {specialBlend:[{id:1,description:"Description Goes here",size:"anime-5",image:{"background-image":"url(/images/about_img.jpg)"}},
                          {id:1,description:"Description Goes here",size:"anime-1",image:{"background-image":"url(/images/about_img.jpg)"}},
                          {id:1,description:"Description Goes here",size:"anime-3",image:{"background-image":"url(/images/about_img.jpg)"}},
                          {id:1,description:"Description Goes here",size:"anime-2",image:{"background-image":"url(/images/about_img.jpg)"}},
                          {id:1,description:"Description Goes here",size:"anime-4",image:{"background-image":"url(/images/about_img.jpg)"}},
                          {id:1,description:"Description Goes here",size:"anime-5",image:{"background-image":"url(/images/about_img.jpg)"}}]},
    searchResults: [],
    search:""
  };
  //Search Bar Input
  $scope.inputChange = function(){
    $http.get("/home/search",{params: {search: $scope.home.search}})
    .then(function(response){
      $scope.home.searchResult = response;
    });
  };
});
animeSenpai.controller("aboutController", function(){
  //Shows brand, link back to home
  $('#brand').css('visibility','visible');
});
//Contact Us Controller 
animeSenpai.controller("contactUsController", function($scope,$timeout){
  //Shows brand, links back to home
  $('#brand').css('visibility','visible');
  //Binding model to retrive form details later
  $scope.contactUs = {
    name:"",
    email:"",
    message:""
  };
  //Test Form Submit Function 
  $scope.formSubmit = function(){
    alert($scope.contactUs.name + " " + $scope.contactUs.email + " " + $scope.contactUs.message);
    $scope.openPopup($scope.loadingPopup);
    //Simulates what popup might look like after ajax call
    $timeout(function(){
      $scope.openPopup($scope.contactUsPopup,{message:"You're message was successfully sent!"});
    },2000);
  };
});
//Profile Controller
animeSenpai.controller("profileController", function(){
  //Shows brand, links back to home
  $('#brand').css('visibility','visible');
});
//Profile Edit Controller
animeSenpai.controller("profileEditController", function(){

});
//Review Edit Controller 
animeSenpai.controller("reviewEditController", function(){

});
//Thread Edit Controller 
animeSenpai.controller("threadEditController", function(){

});
/*Popup Controllers*/
//Main Popup Controller
animeSenpai.controller("popupController", function($scope){

});
//Anime Popup Controller
animeSenpai.controller("animePopupController", function($scope){

});
//Contact Us Popup Controller 
animeSenpai.controller("contactUsPopupController", function($scope){

});
/*Dropdown Controllers*/
//Logged In Dropdown Controller
animeSenpai.controller("loggedInDropdown", function($scope,$location){
  //Test functions to simulate final functionality 
  $scope.signOut = function(){
    $scope.setDropdown("dropdown/login.html");
  };
  $scope.openProfile = function(){
    $scope.navigate("/profile");
  };
});
//Login Dropdown Controller 
animeSenpai.controller("loginDropdown", function($scope){
  //Test functions to simulate final functionality 
  $scope.login = function(){
    $scope.setDropdown("dropdown/logged-in.html");
  };
  $scope.openSignUp = function(){
    $scope.setDropdown("dropdown/sign-up.html");
  };
});
//Sign Up Dropdown Controller
animeSenpai.controller("signUpDropdown", function($scope){
  //Test function to simulate final functionality
  $scope.signUp = function(){
    $scope.setDropdown("dropdown/logged-in.html");
  };
  $scope.openLogin = function(){
    $scope.setDropdown("dropdown/login.html");
  };
});