//AnimeSenpai
//Authors: Alistair Quinn, Robbie Munroe, Chris Foulkes, Connor O'Donnell, Sunny Shek, Ajraf
//Main JS File for site

//Angular Routing Setup
var animeSenpai = angular.module("animeSenpai", ["ngRoute"]);
animeSenpai.config(function($routeProvider){
  $routeProvider
  .when("/", {
    templateUrl:"page/home/home.html",
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
  $scope.popup = $scope.animePopup;
  $scope.openPopup = function(popup,item){
    $scope.popup = popup;
    if(item){
      $scope.clickedItem = item;
    }
    $('#popup').modal('show');
  }
  $scope.closePopup = function(){
    $('#popup').modal('hide');
  }
})
animeSenpai.controller("homeController", function($scope){
  $scope.home = {
    //Other categories go here
    searchResults: [],
    content:"page/home/main.html",
    search:""
  };
  $scope.inputChange = function(){
    if($scope.home.search == ""){
      $scope.home.content = "page/home/search.html";
    } else {
      $scope.home.content = "page/home/main.html";
    }
  }
});
animeSenpai.controller("aboutController", function(){

});
animeSenpai.controller("contactUsController", function($scope){
  $scope.contactUs = {
    name:"",
    email:"",
    message:"",
    spinner:true
  };
  $scope.formSubmit = function(){
    alert($scope.contactUs.name + " " + $scope.contactUs.email + " " + $scope.contactUs.message);
    $scope.openPopup($scope.contactUsPopup);
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
  $scope.contactUsPopup = {
    spinner:true
  }
});
