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
    },);
  };
  //Loading
  $scope.loading = function(isLoading){
    if(isLoading){
      $('html').addClass('loading');
      $('#loader').show();
    } else {
      $('html').removeClass('loading');
      $('#loader').hide();
    }
  }
  //Dropdown
  $scope.dropdown = "dropdown/login.html";
  $scope.setDropdown = function(dropdown){
    $scope.dropdown = dropdown;
  }
  $scope.setProfile = function(profile){
    $scope.profile = profile;
  }
  //Test Value
  $scope.setProfile({_id:0,email:"John@Smith.co.uk", password:"P@ssw0rd", date: new Date()});
  //Popup
  $scope.clickedItem = null;
  $scope.animePopup = {title:"Anime", content:"/popup/anime.html"};
  $scope.messagePopup = {title:"Contact Us", content:"/popup/message.html"};
  $scope.loadingPopup = {title:"Loading...", content:"/popup/loading.html"};
  $scope.popup = null;
  $scope.openPopup = function(popup,item){
    $scope.popup = $scope.loadingPopup;
    if(item){
      $scope.clickedItem = item;
      if(popup == $scope.animePopup){
        $http.get("/popup/anime",{params: {id:$scope.clickedItem.id,title:$scope.clickedItem.title}})
        .then(function(response){
          console.log(response.data);
          //$scope.clickedItem.threads = response.data;
          //Dummy entries replace with response from server
          $scope.clickedItem.threads = response.data.threads;
          for (let thread of $scope.clickedItem.threads){
            $scope.getComments(thread);
          }
          $scope.clickedItem.reviews = response.data.reviews;
          for (let review of $scope.clickedItem.reviews){
            $scope.getComments(review);
          }
          $scope.clickedItem.streaming = response.data.streaming;
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
  $scope.getComments= function(post){
    console.log(post);
    $http.get("/comments",{params:{id:post._id}})
    .then(function(response){
      post.comments = response.data;
      console.log(response.data);
    });
  }
})
//Controller for home page
animeSenpai.controller("homeController", function($scope,$http){
  //This is used to display brand only on contact us and about
  //Brand acts as link back to home page
  $('#brand').css('visibility','hidden');
  //Example of what might be returned from server
  $scope.home = {
    anime: {specialBlend: [],
            searchResults: [],
            classics: [],
            bestAmerican: [],
            bestIndie: []
          },
    search:""
  };
  $http.get("/home/get")
  .then(function(response){
    $scope.home = response.data;
    console.log(response.data);
    //for testing
    $scope.home.anime.specialBlend = [{id:1,summary:"summary Goes here",size:"anime-5",img:"/images/about_img.jpg"},
    {id:1,summary:"summary Goes here",size:"anime-1",img:"/images/about_img.jpg"},
    {id:1,summary:"summary Goes here",size:"anime-3",img:"/images/about_img.jpg"},
    {id:1,summary:"summary Goes here",size:"anime-2",img:"/images/about_img.jpg"},
    {id:1,summary:"summary Goes here",size:"anime-4",img:"/images/about_img.jpg"},
    {id:1,summary:"summary Goes here",size:"anime-5",img:"/images/about_img.jpg"}];
    
  });
  //Search Bar Input
  $scope.inputChange = function(){
    $http.get("/home/search",{params: {search: $scope.home.search}})
    .then(function(response){
      $scope.home.anime.searchResults = response.data;
    },function(response){

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
      $scope.openPopup($scope.messagePopup,{message:"You're message was successfully sent!"});
    },2000);
  };
});
//Profile Controller
animeSenpai.controller("profileController", function($scope,$http){
  //Shows brand, links back to home
  $('#brand').css('visibility','visible');
  $scope.getProfile = function(){
    $scope.loading(true);
    $http.get("/profile/profile")
    .then(function(response){
      $scope.setProfile(response.data);
      $scope.loading(false);
    });
  }
  $scope.getProfile();
  $scope.editProfile = function(){
    $scope.navigate("/profile-edit");
  }
  $scope.togglePost = function(id){
    $(id).toggle();
  }
  $scope.deleteReview = function(review){
    $scope.loading(true);
    $http.delete("/profile/delete/review",{params:{id:review._id}})
    .then(function(response){
      $scope.getProfile();
    });
  };
  $scope.deleteThread = function(thread){
    $scope.loading(true);
    $http.delete("/profile/delete/thread",{params:{id:thread._id}})
    .then(function(response){
      $scope.getProfile();
    });
  };
  $scope.deleteComment = function(comment){
    $scope.loading(true);
    $http.delete("/profile/delete/comment",{params:{id:comment._id}})
    .then(function(response){
      $scope.getProfile();
    });
  };
});
//Profile Edit Controller
animeSenpai.controller("profileEditController", function($scope,$http){
  $scope.loading(true);
  $http.get("/profileedit/profile")
  .then(function(response){
    $scope.profileEdit = response.data;
    $scope.loading(false);
  });
  $scope.save = function(profile){
    $scope.loading(true);
    $http.post("/profileedit/profile/edit",{params:{profile:profile}})
    .then(function(response){
      $scope.navigate("/profile");
    });
  }
});
//Review Edit Controller
animeSenpai.controller("reviewEditController", function($scope,$http){
  $scope.anime = {title:"",rating:"",summary:""};
  $scope.review = {title:"",review:"",rating:""};
  $scope.loading(true);
  $http.get("/reviewedit/get")
  .then(function(response){
    $scope.review = response.data;
    $scope.loading(false);
    console.log(response.data);
  },function(response){
    $scope.navigate("/");
    $scope.loading(false);
  });
  $http.get("/reviewedit/anime")
  .then(function(response){
    $scope.anime = response.data;
  })
  $scope.save = function(){
    //Start loading
    $scope.loading(true);
    $http.post("/reviewedit/save",{params:{review:$scope.review}})
    .then(function(response){
      //Finish loading and show dialog 
      $scope.navigate("/");
      $scope.loading(false);
      $scope.openPopup($scope.animePopup,$scope.clickedItem);
    });
  }
});
//Thread Edit Controller
animeSenpai.controller("threadEditController", function($scope,$http){
  $scope.anime = {title:"",rating:"",summary:""};
  $scope.thread = {title:"",thread:"",rating:""};
  $scope.loading(true);
  $http.get("/threadedit/get")
  .then(function(response){
    $scope.thread = response.data;
    $scope.loading(false);
  },function(response){
    $scope.navigate("/");
    $scope.loading(false);
  });
  $http.get("/threadedit/anime")
  .then(function(response){
    $scope.anime = response.data;
  })
  $scope.save = function(){
    //Start loading
    $scope.loading(true);
    $http.post("/threadedit/save",{params:{thread:$scope.thread}})
    .then(function(response){
      //Finish loading and show dialog 
      $scope.navigate("/");
      $scope.loading(false);
      $scope.openPopup($scope.animePopup,$scope.clickedItem);
    });
  }
});
/*Popup Controllers*/
//Main Popup Controller
animeSenpai.controller("popupController", function($scope){

});
//Anime Popup Controller
animeSenpai.controller("animePopupController", function($scope,$http){
  $scope.newReview = function(){
    $scope.loading(true);
    $http.post("/popup/anime/addReview",{params: {id: $scope.clickedItem.id}})
    .then(function(response){
      $scope.closePopup();
      $scope.loading(false);
      $scope.navigate("/review-edit");
    });
  }
  $scope.newThread = function(){
    $scope.loading(true);
    $http.post("/popup/anime/addThread",{params: {id: $scope.clickedItem.id}})
    .then(function(response){
      $scope.closePopup();
      $scope.loading(false);
      $scope.navigate("/thread-edit");
    });
  }
  $scope.addComment = function(comment){
    //Start loading here 
    $scope.loading(true);
    $http.post("/popup/anime/addComment",{params: {id: comment._id,comment:$('#newComment'+comment._id).val()}})
    .then(function(response){
      //Need to reload comments here 
      $('#newComment'+comment._id).val(''); 
      $scope.getComments(comment);
      //Stop Loading here
      $scope.loading(false);
    });
  }
  $scope.toggleComments = function(comment){
    $("#commentContainer"+comment._id).toggle();
    console.log(comment._id);
  };
  $scope.toggleReply = function(comment){
    $("#reply"+comment._id).toggle();
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
  $scope.warningMessage = "";
  $scope.login = function(){
    $scope.warningMessage = "";
    $http.post("/login",{params:{email:$scope.email,password:$scope.password}})
    .then(function success(response){
      $scope.setProfile(response);
      $scope.setDropdown("dropdown/profile.html");
     }, function failure(response){
      $scope.warningMessage = "Incorrect login details";
    });
  };
  $scope.openSignUp = function(){
    $scope.setDropdown("dropdown/sign-up.html");
  };
});
//Sign Up Dropdown Controller
animeSenpai.controller("signUpDropdown", function($scope,$http){
  //Test function to simulate final functionality
  $scope.warningMessage = "";
  $scope.signUp = function(){
    $scope.warningMessage = "";
    $http.post("/signup",{params:{email:$scope.email,password:$scope.password}})
    .then(function success(response){
      $scope.setProfile(response);
      $scope.setDropdown("dropdown/profile.html");
     }, function failure(response){
      $scope.warningMessage = "Incorrect login details";
    });
  };
  $scope.openLogin = function(){
    $scope.setDropdown("dropdown/login.html");
  };
});

//Directives 
animeSenpai.directive("comments", function($compile,$http){
  return {
    replace: true,
    template: "<comment ng-repeat='comment in comments track by comment._id' comment='comment'/>",
    scope:{
          comments:"=",
          addComment:"&",
          getComments:"&",
          toggleComments:"&",
          toggleReply:"&"
    },
  }
});
animeSenpai.directive("comment", function($compile,$http){
  return {
    restrict: "E",
    replace: true,
    templateUrl:"template/comment.html",
    link: function (scope, element, attrs){
      scope.getComments(scope.comment);
      $compile()(scope);
    }
  }
});
