//AnimeSenpai
//Authors: Alistair Quinn, Robbie Munroe, Chris Foulkes, Connor O'Donnell, Sunny Shek, Ajraf
//Main JS File for site
//Angular 1.6 

/*
  Angular Routing Setup
  Handles single page site routing
  example.com/#!/routeName
*/
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

/*
  Angular Controllers
  Handles functions and variables related to a specific page,
  dropdown, popup or directive 
*/
//Main Controller, controls Popups and Dropdowns
animeSenpai.controller("mainController", function($scope,$window,$location,$timeout,$http,$sce) {
  //Page loading function
  $scope.loading = function(isLoading){
    if(isLoading){
      //Gives page overflow none, sets loaders display
      $('html').addClass('loading');
      $('#loader').css("display","flex");
    } else {
      //Hides loader
      $('html').removeClass('loading');
      $('#loader').css("display","none");
    }
  }
  //Load while getting data
  $scope.loading(true);
  //Get users profile is there is one
  $scope.getProfile = function(){
    $scope.loading(true);
    //Http service to get profiloe
    $http.get("/profile/profile")
    .then(function(response){
      //If user is admin, redirect       
      if (response.data.admin){
        $window.location.href="/admin";
      }
      //Else set profile, let dropdown to logged in
      $scope.setProfile(response.data);
      $scope.dropdown = "dropdown/logged-in.html";
      //finished stop loading
      $scope.loading(false);
    },function(response){
      $scope.navigate("/");
    });
  }
  //Call get profile
  $scope.getProfile();
  //Sets profile, can be used in any scope(This scope is top most scope)
  $scope.setProfile = function(profile){
    $scope.profile = profile;
  }
  //JS Navigation
  $scope.navigate = function(path){
    if ($location.path == path) return;
    //This timeout is needed for some reason weird angular glitch
    $timeout(function(){
      //Sets path of passed path
      $location.path(path);
    },);
  };
  //Dropdown Setup
  $scope.dropdown = "dropdown/login.html";
  $scope.setDropdown = function(dropdown){
    $scope.dropdown = dropdown;
  }
  //Popup Setup
  //Variable to stop clicked items
  $scope.clickedItem = null;
  //Popups
  $scope.animePopup = {title:"Anime", content:"/popup/anime.html"};
  $scope.messagePopup = {title:"Contact Us", content:"/popup/message.html"};
  $scope.loadingPopup = {title:"Loading...", content:"/popup/loading.html"};
  //Container for current popup
  $scope.popup = null;
  //Opens popup, sets clicked item
  $scope.openPopup = function(popup,item){
    //Loads 
    $scope.popup = $scope.loadingPopup;
    if(item){
      $scope.clickedItem = item;
      //If anime popup, get extra details of clicked item
      if(popup == $scope.animePopup){
        //Http service to get anime data  
        $scope.getAnimeDetails();
      }
    }
    //Toggle visibility 
    if (!$('#popup').is(":visible")){
      $('#popup').modal('show');
    }
    //Sets passed popup
    $scope.popup = popup;
  }
  //Hides popup
  $scope.closePopup = function(){
    $('#popup').modal('hide');
  }
  //Gets anime details
  $scope.getAnimeDetails = function (){
    //Gets threads and thread comments
    $http.get("/popup/anime",{params: {anime:$scope.clickedItem}})
      .then(function(response){
      $scope.clickedItem.threads = response.data.threads;
      //Gets reviews and review comments
      $scope.clickedItem.reviews = response.data.reviews;
      //Refresh comments
      $scope.refreshComments();
      //Gets streaming data 
      $scope.clickedItem.streaming = response.data.streaming;
      if (response.data.rating != null){
        $scope.clickedItem.rating = response.data.rating;
      }
    },function(response){
      //If no response, load page again
      $scope.navigate("/");
    });
  }
  $scope.refreshComments = function(){
    for (let thread of $scope.clickedItem.threads){
      $scope.getComments(thread);
    }
    for (let review of $scope.clickedItem.reviews){
      $scope.getComments(review);
    }
  }
  //Gets comments by ID
  $scope.getComments= function(post){
    //Http service to get comments by id
    $http.get("/comments",{params:{id:post._id}})
    .then(function(response){
      //Sets comments attribute of passed object to returned commetns
      post.comments = response.data;
      for (let comment of post.comments){
        $scope.getComments(comment);
      }
    },function(response){
      //If error reload 
      $scope.navigate("/");
    });
  }
})
//Controller for home page
animeSenpai.controller("homeController", function($scope,$http){
  //Loading
  $scope.loading(true);
  /*
    This is used to display brand only on contact us and about
    Brand acts as link back to home page
  */
  $('#brand').css('visibility','hidden');
  //Model of what is returned from server 
  $scope.home = {
    anime: {specialBlend: [],
            searchResults: [],
            classics: [],
            bestAmerican: [],
            bestIndie: []
          },
    search:""
  };
  //Http service to get home page anime
  $http.get("/home/get")
  .then(function(response){
    //Sets response
    $scope.home = response.data;
    $scope.loading(false);
  },function(response){
    //If error attempt reload
    $scope.navigate("/");
  });
  //Search Bar Input
  $scope.inputChange = function(){
    //Makes a spinner show when typing
    $scope.searchLoading = true;
    //Http service to get home search by query
    $http.get("/home/search",{params: {search: $scope.home.search}})
    .then(function(response){
      /*
        Check if current input text is same as query that was
        originally passed, stops queries that took too long overwritting 
        correct data
      */
      if ($scope.home.search == response.data.search){
        //Sets search results
        $scope.home.anime.searchResults = response.data.anime;
        $scope.searchLoading = false;
      }
    },function(response){
      //If error attempt reload
      $scope.navigate("/");
    });
  };
});
animeSenpai.controller("aboutController", function($scope){
  //Start loading
  $scope.loading(true);
  //Shows brand, link back to home
  $('#brand').css('visibility','visible');
  //Stop loading
  $scope.loading(false);
});
//Contact Us Controller
animeSenpai.controller("contactUsController", function($scope,$http,$timeout){
  //Start loading
  $scope.loading(true);
  //Shows brand, links back to home
  $('#brand').css('visibility','visible');
  //Binding model to retrive form details later
  $scope.contactUs = {
    name:"",
    email:"",
    message:""
  };
  //Stop loading
  $scope.loading(false);
  //Submits form, this gets emailed back to us server side using nodemailer
  $scope.formSubmit = function(){
    //Open loading popup
    $scope.openPopup($scope.loadingPopup);
    //Posts data to server
    $http.post("/contactus",{params:{contactUs:$scope.contactUs}})
    .then(function(response){
      //Show success message
      $scope.openPopup($scope.messagePopup,{message:"You're message was successfully sent!"});
    },function(response){
      //Show failure message
      $scope.openPopup($scope.messagePopup,{message:"Message Failed Try Again Later"});
    })
  };
});
//Profile Controller
animeSenpai.controller("profileController", function($scope,$http){
  //Shows brand, links back to home
  $('#brand').css('visibility','visible');
  //Get current profile details
  $scope.getProfile();
  //If edit button clicked, navigate
  $scope.editProfile = function(){
    $scope.navigate("/profile-edit");
  }
  //Used to show and hide reviews and threads
  $scope.togglePost = function(id){
    $(id).toggle();
  }
  //Delets a review
  $scope.deleteReview = function(review){
    //Starts loading
    $scope.loading(true);
    //Deletes by ID
    $http.delete("/profile/delete/review",{params:{id:review._id}})
    .then(function(response){
      //Get new profile
      $scope.getProfile();
    },function(response){
      //Reload
      $scope.navigate("/");
    });
  };
  $scope.deleteThread = function(thread){
    //Start loading
    $scope.loading(true);
    //Deletes by ID
    $http.delete("/profile/delete/thread",{params:{id:thread._id}})
    .then(function(response){
      //Updates profile
      $scope.getProfile();
    },function(response){
      //Reload
      $scope.navigate("/");
    });
  };
  $scope.deleteComment = function(comment){
    //Start loading
    $scope.loading(true);
    //Deletes comment by id
    $http.delete("/profile/delete/comment",{params:{id:comment._id}})
    .then(function(response){
      //Update profile
      $scope.getProfile();
    },function(response){
      //reload
      $scope.navigate("/");
    });
  };
});
//Profile Edit Controller
animeSenpai.controller("profileEditController", function($scope,$http){
  //Start loading
  $scope.loading(true);
  //get profile data
  $http.get("/profileedit/profile")
  .then(function(response){
    //Store in a temp variable seperate from scope.profile
    $scope.profileEdit = response.data;
    //stop loading
    $scope.loading(false);
  },function(response){
    //reload
    $scope.navigate("/");
  });
  //Saves new profile details
  $scope.save = function(profile){
    //Start loading
    $scope.loading(true);
    //Posts new profile
    $http.post("/profileedit/profile/edit",{params:{profile:profile}})
    .then(function(response){
      //Navigate back to profile
      $scope.navigate("/profile");
    },function(response){
      //reload
      $scope.navigate("/");
    });
  }
});
//Review Edit Controller
animeSenpai.controller("reviewEditController", function($scope,$http){
  //Setup blank models
  $scope.anime = {title:"",rating:"",summary:""};
  $scope.review = {title:"",review:"",rating:""};
  //Start loading
  $scope.loading(true);
  //Get review
  $http.get("/reviewedit/get")
  .then(function(response){
    //Set review, stop loading
    $scope.review = response.data;
    $scope.loading(false);
  },function(response){
    //reload
    $scope.navigate("/");
    $scope.loading(false);
  });
  //Gets details about related anime
  $http.get("/reviewedit/anime")
  .then(function(response){
    //Sets anime
    $scope.anime = response.data;
  },function(response){
    //reload
    $scope.navigate("/");
  })
  $scope.save = function(){
    //Start loading
    $scope.loading(true);
    //Posts new review
    $http.post("/reviewedit/save",{params:{review:$scope.review}})
    .then(function(response){
      //Finish loading and show anime popup
      $scope.navigate("/");
      $scope.loading(false);
      $scope.openPopup($scope.animePopup,$scope.clickedItem);
    },function(response){
      //reload
      $scope.navigate("/");
    });
  }
});
//Thread Edit Controller
animeSenpai.controller("threadEditController", function($scope,$http){
  //Blank models
  $scope.anime = {title:"",rating:"",summary:""};
  $scope.thread = {title:"",thread:"",rating:""};
  //Start loading
  $scope.loading(true);
  //Get thread
  $http.get("/threadedit/get")
  .then(function(response){
    //set thread
    $scope.thread = response.data;
    $scope.loading(false);
  },function(response){
    //reload
    $scope.navigate("/");
    $scope.loading(false);
  });
  //Get details of related anime
  $http.get("/threadedit/anime")
  .then(function(response){
    //Set anime
    $scope.anime = response.data;
  },function(response){
    //reload
    $scope.navigate("/");
  })
  $scope.save = function(){
    //Start loading
    $scope.loading(true);
    $http.post("/threadedit/save",{params:{thread:$scope.thread}})
    .then(function(response){
      //Finish loading and show anime popup
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
  //Keeping in case of future expansion 
});
//Anime Popup Controller
animeSenpai.controller("animePopupController", function($scope,$http){
  //Sets up new review on server, passes ID
  $scope.newReview = function(){
    //Start loading
    $scope.loading(true);
    //Post anime ID
    $http.post("/popup/anime/addReview",{params: {id: $scope.clickedItem.id}})
    .then(function(response){
      //Navigates to review edit
      $scope.closePopup();
      $scope.loading(false);
      $scope.navigate("/review-edit");
    },function(response){
      //reload
      $scope.navigate("/");
    });
  }
  //Sets up new thread on server, passes anime id 
  $scope.newThread = function(){
    //start loading
    $scope.loading(true);
    //pass anime ID
    $http.post("/popup/anime/addThread",{params: {id: $scope.clickedItem.id}})
    .then(function(response){
      //close popup open thread edit
      $scope.closePopup();
      $scope.loading(false);
      $scope.navigate("/thread-edit");
    },function(response){
      //reload
      $scope.navigate("/");
    });
  }
  //Add comment 
  $scope.addComment = function(comment){
    //Start loading here
    $scope.loading(true);
    //Post new comment to server
    $http.post("/popup/anime/addComment",{params: {id: comment._id,comment:$('#newComment'+comment._id).val()}})
    .then(function(response){
      //clear text area 
      $('#newComment'+comment._id).val('');
      //Refresh
      $scope.refreshComments();
      //Stop Loading here
      $scope.loading(false);
    },function(response){
      //reload
      $scope.navigate("/");
    });
  }
  $scope.toggleComments = function(comment){
    //Toggle comment visiblity
    $("#commentContainer"+comment._id).toggle();
  };
  $scope.toggleReply = function(comment){
    //Toggles reply text area visibility
    $("#reply"+comment._id).toggle();
  }
});
//Loading Popup Controller
animeSenpai.controller("loadingController", function($scope){
  //Keeping for future expansion 
});

//Dropdown Controllers
//Logged In Dropdown Controller
animeSenpai.controller("loggedInDropdown", function($scope,$location,$http){
  //Signs user out
  $scope.signOut = function(){
    $http.post("/logout")
    .then(function(response){
      //Sets dropdown to login form 
      $scope.setDropdown("dropdown/login.html");
      //Navigate back to home 
      $scope.navigate("/");
    },function(response){
      //reload
      $scope.navigate("/");
    })
  };
  //Navigates to profile
  $scope.openProfile = function(){
    $scope.navigate("/profile");
  };
});
//Login Dropdown Controller
animeSenpai.controller("loginDropdown", function($scope, $window, $http){
  //Set up models
  $scope.warningMessage = "";
  $scope.username = "";
  $scope.password = "";
  //Posts form data to server
  $scope.login = function(){
    $scope.warningMessage = "";
    //posts data
    $http.post("/login",{params:{username:$scope.username,password:$scope.password}})
    .then(function success(response){
      //On success, get new profile
      $scope.getProfile();
     }, function failure(response){
       //If fail, show error message
      $scope.warningMessage = "Incorrect login details";
    });
  };
  //Changes dropdown to signup
  $scope.openSignUp = function(){
    $scope.setDropdown("dropdown/sign-up.html");
  };
});
//Sign Up Dropdown Controller
animeSenpai.controller("signUpDropdown", function($scope,$http){
  //setup models
  $scope.username = "";
  $scope.warningMessage = "";
  $scope.password = "";
  //For authentication
  $scope.password2 = "";
  //Posts form data to server
  $scope.signUp = function(){
    $scope.warningMessage = "";
    $http.post("/signup",{params:{username:$scope.username,password:$scope.password}})
    .then(function success(response){
      //Set new profile, set dropdown as logged in
      $scope.setProfile(response.data);
      $scope.setDropdown("dropdown/logged-in.html");
     }, function failure(response){
       //Sets warning message if error
       $scope.warningMessage = "User Already Exists";
    });
  };
  //Sets dropdown to login 
  $scope.openLogin = function(){
    $scope.setDropdown("dropdown/login.html");
  };
  //Checks both password inputs match 
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

/*
  Angular JS Directives
  Markers in DOM that tell AngularJS to attach special behaviour to element
*/
/*
  Used to show comments for a post
  Takes in comments, and creates a new 'comment' directive element for each comment
*/
animeSenpai.directive("comments", function($compile,$http){
  return {
    replace: true,
    template: "<comment ng-repeat='comment in comments track by comment._id' comment='comment'/>",
    //Binds needed values and functions to a local scope 
    scope:{
          comments:"=",
          addComment:"&",
          getComments:"&",
          toggleComments:"&",
          toggleReply:"&"
    },
  }
});
//Represents a single comment, uses a template
animeSenpai.directive("comment", function($compile,$http){
  return {
    //Can only be an element i.e <comment>
    restrict: "E",
    replace: true,
    //Template with binding markers
    templateUrl:"template/comment.html",
    //Gets replies for comment if there are, and recompiles 
    link: function (scope, element, attrs){
      scope.getComments(scope.comment);
      $compile()(scope);
    }
  }
});
