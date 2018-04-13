//AnimeSenpai
//Authors: Alistair Quinn, Robbie Munroe, Chris Foulkes, Connor O'Donnell, Sunny Shek, Ajraf
//Main JS File for site
//Angular 1.6 (We will use EJS also for index.html customisation)

/*Angular Routing Setup*/
var animeSenpai = angular.module("animeSenpai", ["ngRoute","ngSanitize"]);
animeSenpai.config(function($rootScopeProvider,$routeProvider){
  $rootScopeProvider.digestTtl(100);
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
animeSenpai.controller("mainController", function($scope,$location,$timeout,$http,$sce) {
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
    $scope.dropdowntoggle = true;
    alert($scope.dropdowntoggle);
    alert($scope.dropdown);
  }

  $scope.setProfile = function(profile){
    $scope.profile = profile;
  }

  //Popup
  $scope.clickedItem = null;
  $scope.animePopup = {title:"Anime", content:"/popup/anime.html"};
  $scope.contactUsPopup = {title:"Contact Us", content:"/popup/contactUs.html"};
  $scope.loadingPopup = {title:"Loading...", content:"/popup/loading.html"};
  $scope.popup = null;
  $scope.openPopup = function(popup,item){
    $scope.popup = $scope.loadingPopup;
    if(item){
      $scope.clickedItem = item;
      if(popup == $scope.animePopup){
        $http.get("/popup/anime/threads",{params: {id:$scope.clickedItem.id}})
        .then(function(response){
          //$scope.clickedItem.threads = response.data;
          //Dummy entries replace with response from server
          $scope.clickedItem.threads = [
            {title:"Title", thread:"", author:"Author", date: new Date()},
            {title:"Title", thread:"", author:"Author", date: new Date()},
            {title:"Title", thread:"", author:"Author", date: new Date()}
          ];
          $scope.clickedItem.threads.forEach(thread =>{
            $scope.getComments(thread._id,(comments)=>{
              thread.comments = comments;
            });
          });
        });
        $http.get("/popup/anime/reviews",{params: {id:$scope.clickedItem.id}})
        .then(function(response){
          //$scope.clickedItem.reviews = response.data;
          //Dummy entries replace with response from server
          $scope.clickedItem.reviews = [
            {score:100, title:"Title", review:"", author:"Author", date: new Date()},
            {score:100, title:"Title", review:"", author:"Author", date: new Date()},
            {score:100, title:"Title", review:"", author:"Author", date: new Date()}
          ];
          $scope.clickedItem.reviews.forEach(review =>{
            $scope.getComments(review._id,(comments)=>{
              review.comments = comments;
            });
          });
        });
        $http.get("/popup/anime/streaming",{params: {title:$scope.clickedItem.title}})
        .then(function(response){
          $scope.clickedItem.streaming = response.data;
        });
      }

    }
    if (!$('#popup').is(":visible")){
      $('#popup').modal('show');
    }
    $scope.popup = popup;
  }
  $scope.closePopup = function(){
    $('#popup').modal('hide');
  }
  $scope.getComments = function(id,callback){
    //Gets comments 
    $http.get("/comments",{params:{id:$scope.clickedItem.id}})
    .then(function(response){
      //let commentsHtml = createCommentHtml(response.data);
      let test = [{comment:"Base Comment",replies:[{comment:"Reply 1",replies:[{comment:"Reply to Reply 1",replies:[]}]}]
                  }];
      //callback(response.data);
      callback(test);
    });
  };
})
//Controller for home page
animeSenpai.controller("homeController", function($scope,$http){
  //This is used to display brand only on contact us and about
  //Brand acts as link back to home page
  $('#brand').css('visibility','hidden');
  //Example of what might be returned from server
  $scope.home = {
    anime: {specialBlend:[{id:1,summary:"summary Goes here",size:"anime-5",img:"/images/about_img.jpg"},
                          {id:1,summary:"summary Goes here",size:"anime-1",img:"/images/about_img.jpg"},
                          {id:1,summary:"summary Goes here",size:"anime-3",img:"/images/about_img.jpg"},
                          {id:1,summary:"summary Goes here",size:"anime-2",img:"/images/about_img.jpg"},
                          {id:1,summary:"summary Goes here",size:"anime-4",img:"/images/about_img.jpg"},
                          {id:1,summary:"summary Goes here",size:"anime-5",img:"/images/about_img.jpg"}],
            searchResults: []
          },
    search:""
  };
  //Search Bar Input
  $scope.inputChange = function(){
    $http.get("/home/search",{params: {search: $scope.home.search}})
    .then(function(response){
      $scope.home.anime.searchResults = response.data;
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
  $http.get("/profileedit/profile")
  .then(function(response){
    $scope.profile = response.data;
  });
});
//Profile Edit Controller
animeSenpai.controller("profileEditController", function($scope,$http){
  $http.get("/profileedit/profile")
  .then(function(response){
    $scope.profileEdit = response.data;
  });
});
//Review Edit Controller
animeSenpai.controller("reviewEditController", function($scope,$http){
  $http.get("/reviewedit/get")
  .then(function(response){
    $scope.thread = response.data;
  });
  $http.get("/reviewedit/anime")
  .then(function(){
    $scope.anime = response.data;
  })
  $scope.save = function(){
    //Start loading
    $http.post("/reviewedit/save",{params:{review:$scope.review}})
    .then(function(){
      //Finish loading and show dialog 
    });
  }
});
//Thread Edit Controller
animeSenpai.controller("threadEditController", function(){
  $http.get("/threadedit/get")
  .then(function(response){
    $scope.thread = response.data;
  });
  $http.get("/threadedit/anime")
  .then(function(){
    $scope.anime = response.data;
  })
  $scope.save = function(){
    //Start loading
    $http.post("/threadedit/save",{params:{thread:$scope.thread}})
    .then(function(){
      //Finish loading and show dialog 
    });
  }
});
/*Popup Controllers*/
//Main Popup Controller
animeSenpai.controller("popupController", function($scope){

});
//Anime Popup Controller
animeSenpai.controller("animePopupController", function($scope,$http){
  $scope.addReview = function(){
    $http.get("popup/anime/addReview",{params: {id: $scope.clickedItem.id}})
    .then(function(response){
      $scope.navigate("/review-edit");
    });
  }
  $scope.addThread = function(){
    $http.get("popup/anime/addThread",{params: {id: $scope.clickedItem.id}})
    .then(function(response){
      $scope.navigate("/thread-edit");
    });
  }
  $scope.addComment = function(post){
    $http.post("popup/anime/addComment",{params: {id: post._id,comment:$('#newComment'+post._id).val()}})
    .then(function(response){
      //Need to reload comments here 
      getComments(post._id,(comments)=>{
        post.comments = comments;
      });
    });
  }
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
animeSenpai.controller("loginDropdown", function($scope, $http){
  //Test functions to simulate final functionality
  $scope.login = function(){
     $http.get("/login",{params:{email:$scope.email,password:$scope.password}})
     .then(function success(response){
       $scope.setProfile(response);
       }, function failure(response){
        
      });

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

//Directives 
animeSenpai.directive("comments", function(){
  return {
    replace: true,
    scope: {
      comments: '=comments'
    },
    template: "<comment ng-repeat='comment in comments' comment='comment'/>" 
  }
});
animeSenpai.directive("comment", function($compile){
  return {
    restrict: "E",
    replace: true,
    scope: {
      comment: "="
    },
    templateUrl:"template/comment.html",
    link: function (scope, element, attrs){
      if(angular.isArray(scope.comment.replies)){
        $compile()(scope);
      }
    }
  }
});
