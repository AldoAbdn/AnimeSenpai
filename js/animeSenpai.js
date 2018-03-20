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
animeSenpai.controller("homeController", function($scope){
  //Init
  $('#brand').css('visibility','hidden');
  //Example of how this might be done
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
  $scope.inputChange = function(){

  };
});
animeSenpai.controller("aboutController", function(){
  //Init
  $('#brand').css('visibility','visible');
});
animeSenpai.controller("contactUsController", function($scope,$timeout){
  //Init
  $('#brand').css('visibility','visible');
  $scope.contactUs = {
    name:"",
    email:"",
    message:""
  };
  $scope.formSubmit = function(){
    alert($scope.contactUs.name + " " + $scope.contactUs.email + " " + $scope.contactUs.message);
    $scope.openPopup($scope.loadingPopup);
    $timeout(function(){
      $scope.openPopup($scope.contactUsPopup,{message:"You're message was successfully sent!"});
    },2000);
  };
});
animeSenpai.controller("profileController", function(){

});
animeSenpai.controller("profileEditController", function(){

});
animeSenpai.controller("reviewEditController", function(){

});
animeSenpai.controller("threadEditController", function(){

});
//Popup Controllers
//Placeholder object
animeSenpai.controller("popupController", function($scope){

});
animeSenpai.controller("animePopupController", function($scope){

});
animeSenpai.controller("contactUsPopupController", function($scope){

});
//Dropdown Controllers
animeSenpai.controller("loggedInDropdown", function($scope,$location){
  $scope.signOut = function(){
    $scope.setDropdown("dropdown/login.html");
  };
  $scope.openProfile = function(){
    $location.url('/profile');
  };
});
animeSenpai.controller("loginDropdown", function($scope){
  $scope.login = function(){
    $scope.setDropdown("dropdown/logged-in.html");
  };
  $scope.openSignUp = function(){
    $scope.setDropdown("dropdown/sign-up.html");
  };
});
animeSenpai.controller("signUpDropdown", function($scope){
  $scope.signUp = function(){
    $scope.setDropdown("dropdown/logged-in.html");
  };
  $scope.openLogin = function(){
    $scope.setDropdown("dropdown/login.html");
  };
});