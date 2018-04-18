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
  .otherwise({redirectTo:'/'});
});

/*Angular Controllers*/
//Main Controller, controls Popups and Dropdowns
animeSenpai.controller("mainController", function($scope,$window,$location,$timeout,$http,$sce) {
  //Check for login
  //Loading
  $scope.loading = function(isLoading){
    if(isLoading){
      $('html').addClass('loading');
      $('#loader').css("display","flex");
    } else {
      $('html').removeClass('loading');
      $('#loader').css("display","none");
    }
  }
  $scope.loading(true);
  $scope.getProfile = function(){
    $scope.loading(true);
    $http.get("/profile/profile")
    .then(function(response){
      console.log(response.data);
        if (response.data.admin){
          $window.location.href="/admin";
        }
        $scope.setProfile(response.data);
        $scope.dropdown = "dropdown/logged-in.html";
        $scope.loading(false);
    },function(response){
      $scope.navigate("/");
    });
  }
  $scope.getProfile();
  
  //JS Navigation
  $scope.navigate = function(path){
    if ($location.path == path) return;
    $timeout(function(){
      $location.path(path);
    },);
  };

  //Dropdown
  $scope.dropdown = "dropdown/login.html";
  $scope.setDropdown = function(dropdown){
    $scope.dropdown = dropdown;
  }
  $scope.setProfile = function(profile){
    $scope.profile = profile;
  }
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
        $http.get("/popup/anime",{params: {anime:$scope.clickedItem}})
        .then(function(response){
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
          if (response.data.rating != null){
            $scope.clickedItem.rating = response.data.rating;
          }
        },function(response){
          $scope.navigate("/");
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
    $http.get("/comments",{params:{id:post._id}})
    .then(function(response){
      post.comments = response.data;
    },function(response){
      $scope.navigate("/");
    });
  }
})
//Controller for home page
animeSenpai.controller("homeController", function($scope,$http){
  $scope.loading(true);
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
    $scope.loading(false);
  },function(response){
    $scope.navigate("/");
  });
  //Search Bar Input
  $scope.inputChange = function(){
    $scope.searchLoading = true;
    $http.get("/home/search",{params: {search: $scope.home.search}})
    .then(function(response){
      if ($scope.home.search == response.data.search){
        $scope.home.anime.searchResults = response.data.anime;
        $scope.searchLoading = false;
      }
    },function(response){
      $scope.navigate("/");
    });
  };
});
animeSenpai.controller("aboutController", function(){
  //Shows brand, link back to home
  $scope.loading(true);
  $('#brand').css('visibility','visible');
  $scope.loading(false);
});
//Contact Us Controller
animeSenpai.controller("contactUsController", function($scope,$http,$timeout){
  //Shows brand, links back to home
  $scope.loading(true);
  $('#brand').css('visibility','visible');
  //Binding model to retrive form details later
  $scope.contactUs = {
    name:"",
    email:"",
    message:""
  };
  $scope.loading(false);
  //Test Form Submit Function
  $scope.formSubmit = function(){
    alert($scope.contactUs.name + " " + $scope.contactUs.email + " " + $scope.contactUs.message);
    $scope.openPopup($scope.loadingPopup);
    $http.post("/contactus",{params:{contactUs:$scope.contactUs}})
    .then(function(response){
      $scope.openPopup($scope.messagePopup,{message:"You're message was successfully sent!"});
    },function(response){
      $scope.openPopup($scope.messagePopup,{message:"Message Failed Try Again Later"});
    })
    //Simulates what popup might look like after ajax call
    $timeout(function(){
     
    },2000);
  };
});
//Profile Controller
animeSenpai.controller("profileController", function($scope,$http){
  //Shows brand, links back to home
  $('#brand').css('visibility','visible');
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
    },function(response){
      $scope.navigate("/");
    });
  };
  $scope.deleteThread = function(thread){
    $scope.loading(true);
    $http.delete("/profile/delete/thread",{params:{id:thread._id}})
    .then(function(response){
      $scope.getProfile();
    },function(response){
      $scope.navigate("/");
    });
  };
  $scope.deleteComment = function(comment){
    $scope.loading(true);
    $http.delete("/profile/delete/comment",{params:{id:comment._id}})
    .then(function(response){
      $scope.getProfile();
    },function(response){
      $scope.navigate("/");
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
  },function(response){
    $scope.navigate("/");
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
  },function(response){
    $scope.navigate("/");
    $scope.loading(false);
  });
  $http.get("/reviewedit/anime")
  .then(function(response){
    $scope.anime = response.data;
  },function(response){
    $scope.navigate("/");
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
    },function(response){
      $scope.navigate("/");
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
  },function(response){
    $scope.navigate("/");
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
    },function(response){
      $scope.navigate("/");
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
      console.log(response);
      $scope.closePopup();
      $scope.loading(false);
      $scope.navigate("/review-edit");
    },function(response){
      $scope.navigate("/");
    });
  }
  $scope.newThread = function(){
    $scope.loading(true);
    $http.post("/popup/anime/addThread",{params: {id: $scope.clickedItem.id}})
    .then(function(response){
      $scope.closePopup();
      $scope.loading(false);
      $scope.navigate("/thread-edit");
    },function(response){
      $scope.navigate("/");
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
    },function(response){
      $scope.navigate("/");
    });
  }
  $scope.toggleComments = function(comment){
    $("#commentContainer"+comment._id).toggle();
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
animeSenpai.controller("loggedInDropdown", function($scope,$location,$http){
  //Test functions to simulate final functionality
  $scope.signOut = function(){
    $http.post("/logout")
    .then(function(response){
      $scope.setDropdown("dropdown/login.html");
    },function(response){
      $scope.navigate("/");
    })
  };
  $scope.openProfile = function(){
    $scope.navigate("/profile");
  };
});
//Login Dropdown Controller
animeSenpai.controller("loginDropdown", function($scope, $window, $http){
  //Test functions to simulate final functionality
  $scope.warningMessage = "";
  $scope.email = "";
  $scope.password = "";
  $scope.login = function(){
    $scope.warningMessage = "";
    $http.post("/login",{params:{email:$scope.email,password:$scope.password}})
    .then(function success(response){
      $scope.getProfile();
     }, function failure(response){
      $scope.warningMessage = "Incorrect login details";
    },function(response){
      $scope.navigate("/");
    });
  };
  $scope.openSignUp = function(){
    $scope.setDropdown("dropdown/sign-up.html");
  };
});
//Sign Up Dropdown Controller
animeSenpai.controller("signUpDropdown", function($scope,$http){
  //Test function to simulate final functionality
  $scope.email = "";
  $scope.warningMessage = "";
  $scope.password = "";
  $scope.password2 = "";
  $scope.signUp = function(){
    $scope.warningMessage = "";
    $http.post("/signup",{params:{email:$scope.email,password:$scope.password}})
    .then(function success(response){
      $scope.setProfile(response.data);
      $scope.setDropdown("dropdown/logged-in.html");
     }, function failure(response){
      $scope.warningMessage = "User Already Exists";
    });
  };
  $scope.openLogin = function(){
    $scope.setDropdown("dropdown/login.html");
  };
  $scope.checkPassword = function(){
    if ($scope.password == undefined || $scope.password2 == undefined){
      $scope.warningMessage="";
    }else if (!angular.equals($scope.password,$scope.password2)){
      $scope.warningMessage = "Password Do Not Match";
    } else {
      $scope.warningMessage = "";
    }
  }
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
