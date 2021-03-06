//AnimeSenpaiAdmin
//Authors: Alistair Quinn, Robbie Munroe, Chris Foulkes, Connor O'Donnell, Sunny Shek, Ajraf
//JS file for admin part of site
//Angular 1.6 (We will use EJS also for index.html customisation)

/*
  Angular Routing Setup
  Handles single page site routing
  example.com/#!/routeName
*/
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
animeSenpaiAdmin.controller("mainAdminController", function($scope,$timeout,$location,$route,$window,$http) {
  //Setup
  //JS Navigation
  $scope.navigate = function(path){
    if ($location.path == path) return;
    //For some reason need a timeout or nothing happens
    $timeout(function(){
      $location.path(path);
    },);
  };
  //Gets current profile
  $scope.getProfile = function(){
    $http.get("/profile/profile")
    .then(function(response){
      //Sets profile
      $scope.setProfile(response.data);
    },function(response){
      //reload
      $scope.navigate("/");
    });
  }
  //Sets profile, uses in other controllers 
  $scope.setProfile = function(profile){
    $scope.profile = profile;
  }
  //Call to get profile
  $scope.getProfile();
  //Toggle login dropdown
  $scope.btnLoginClick = function(){
    $scope.dropdowntoggle = !$scope.dropdowntoggle;
  };
  //Signs out user
  $scope.signOut = function(){
    $http.post("/logout")
    .then(function(response){
      //Navigate back to home
      $window.location.href="/";
    },function(response){
      //reload
      $scope.navigate("/");
    });
  };
  //Open profile
  $scope.openProfile = function(){
    $location.url('/profile');
  };
  //Popups
  $scope.commentEditPopup = {title:"Comment Edit",content:"/popup/admin/comment-edit.html"};
  $scope.postEditPopup = {title:"Post Edit",content:"/popup/admin/post-edit.html"};
  $scope.profileEditPopup = {title:"Profile Edit",content:"/popup/admin/profile-edit.html"};
  //Holders for current popu and clicked item
  $scope.popup = $scope.commentEditPopup;
  $scope.clickedItem = null;
  //Opens popup
  $scope.openPopup = function(popup,item){
    $scope.clickedItem = item;
    $scope.popup = popup;
    $('#popup').modal('show');
  }
  //Closes popup
  $scope.closePopup = function(){
    $('#popup').modal('hide');
    $route.reload();
  }
})
//Admin Home Controller 
animeSenpaiAdmin.controller("adminHomeController", function($scope,$http){
  //Retrieve Current Admin Home Data
  $http.get("/admin/home")
  .then(function(response){
    $scope.adminHome = response.data;
  },function(response){
    $scope.navigate("/");
  });
});
//Account Management Controller 
animeSenpaiAdmin.controller("accountManagementController", function($scope,$http){
  $scope.loading = false;
  //Model
  $scope.accountManagement = {
    latestAccounts: [],
    sessions: [],
    suspended: [], 
    searchResults: [],
    search:""
  };
  //Gets account management data
  $http.get("/admin/accountmanagement")
  .then(function(response){
    $scope.accountManagement = response.data;
    $scope.accountManagement.searchResults = [];
    $scope.accountManagement.search = "";
  },function(response){
    $scope.navigate("/");
  });
  //Functions handle text input
  $scope.inputChanged = function(){
    //Starts loading
    $scope.loading = true;
    //Gets accounts by username
    $http.post("/admin/accountmanagement/search",{params:{search:$scope.accountManagement.search}})
    .then(function(response){
      //Checks if current input text matches original query 
      if ($scope.accountManagement.search == response.data.search){
        //If so set results
        $scope.accountManagement.searchResults = response.data.accounts.accounts;
        $scope.loading = false;
      }
    },function(response){
      $scope.navigate("/");
    });
  };
});
//Post Management Controller 
animeSenpaiAdmin.controller("postManagementController", function($scope,$http){
  $scope.loading = false;
  //Model
  $scope.postManagement = {
    latestPosts:[],
    recentlyCreatedReview:[],
    recentlyCreatedThread:[],
    recentlyCreatedComment:[],
    searchResults: [],
    search:""
  };
  //Gets postmanagement data(none right now)
  $http.get("/admin/postmanagement")
  .then(function(response){
    //Sets data
    $scope.postManagement = response.data;
    $scope.postManagement.searchResults = [];
    $scope.postManagement.search = "";
  },function(response){
    $scope.navigate("/");
  });
  //Handles text input
  $scope.inputChanged = function(){
    $scope.loading = true;
    //Gets search results
    $http.post("/admin/postmanagement/search",{params:{search:$scope.postManagement.search}})
    .then(function(response){
      //If returned query matches original, set results
      if ($scope.postManagement.search == response.data.search){
        $scope.postManagement.searchResults = response.data.posts;
        $scope.loading = false;
      }
    },function(response){
      $scope.navigate("/");
    });
  };
});
//Lists Controller 
animeSenpaiAdmin.controller("listsController", function($scope,$http){
  $scope.loading = false;
  $scope.selected = "classics";
  $scope.selectedRow = -1;
  $scope.anime = {};
  $scope.lists = {
    search:"",
    searchResults:[],
    classics:[],
    bestAmerican:[],
    bestIndie:[]
  }
  //Get current front page lists 
  $scope.getLists = function(){
    $http.get("admin/lists")
    .then(function(response){
      $scope.lists.classics = response.data.classics;
      $scope.lists.bestAmerican = response.data.bestAmerican;
      $scope.lists.bestIndie = response.data.bestIndie;
    },function(response){
      $scope.navigate("/");
    });
  }
  //Call to get lists
  $scope.getLists();
  //Function that sets selected anime, when an anime in search results is clicked
  $scope.select = function(index, anime){
    $scope.selectedRow = index;
    $scope.anime = anime;
  }
  //Add an anime to a list
  $scope.add = function(){
    if ($scope.anime != null){
      $http.post("/admin/lists/add",{params:{anime:$scope.anime,list:$scope.selected}})
      .then(function(response){
        //Refresh lists
        $scope.getLists();
      },function(response){
        $scope.navigate("/");
      });
    }
  }
  //Delets an anime from a list
  $scope.delete = function(anime,list){
    $http.delete("/admin/lists/delete",{params:{id:anime.id,list:list}})
    .then(function(response){
      //refreshes results
      $scope.getLists();
    },function(response){
      $scope.navigate("/");
    });
  }
  //Handles search input
  $scope.inputChange = function(){
    $scope.loading = true;
    //clear anime
    $scope.anime = null;
    $http.get("/home/search",{params: {search: $scope.lists.search}})
    .then(function(response){
      //Checks if current input text matches original query, if so set results
      if ($scope.lists.search == response.data.search){
        $scope.lists.searchResults = response.data.anime;
      }
      $scope.loading = false;
    },function(response){
      $scope.navigate("/");
    });
  }
});
/*Popup Controllers*/
//Comment Edit Popup Controller
animeSenpaiAdmin.controller("commentEditPopupController", function($scope,$http){
  //Deletes a comment
  $scope.delete = function(){
    $http.delete("/admin/popup/comment/delete",{params:{id:$scope.clickedItem._id}})
    .then(function(response){
      $scope.closePopup();
    },function(response){

    });
  }
  //Saves an edited comment
  $scope.save = function(){
    $http.post("/admin/popup/comment/save",{params:{comment:$scope.clickedItem}})
    .then(function(response){
      $scope.closePopup();
    },function(response){

    });
  }
});
//Post Edit Popup Controller 
animeSenpaiAdmin.controller("postEditPopupController", function ($scope,$http){
  //Deletes a post
  $scope.delete = function(){
    if ($scope.clickedItem.rating!=undefined){
      $http.delete("/admin/popup/review/delete",{params:{id:$scope.clickedItem._id}})
      .then(function(response){
        //Refresh
        $scope.closePopup();
      },function(response){
  
      });
    } else {
      $http.delete("/admin/popup/thread/delete",{params:{id:$scope.clickedItem._id}})
      .then(function(response){
        //Refresh
        $scope.closePopup();
      },function(response){
  
      });
    }
  }
  //Saves an edited post
  $scope.save = function(type,post){
    if ($scope.clickedItem.rating != undefined){
      $http.post("/admin/popup/review/save",{params:{review:$scope.clickedItem}})
      .then(function(response){
        //Refresh
        $scope.closePopup();
      },function(response){
  
      });
    } else {
      $http.post("/admin/popup/thread/save",{params:{thread:$scope.clickedItem}})
      .then(function(response){
        //Refresh
        $scope.closePopup();
      },function(response){
  
      });
    }
  }
});
//Profile Edit Popup Controller 
animeSenpaiAdmin.controller("profileEditPopupController", function($scope,$http,$route){
  //Model
  $scope.profileEdit = $scope.clickedItem;
  //Deletes a profile
  $scope.delete = function(){
    $http.delete("/admin/popup/profile/delete",{params:{id:$scope.clickedItem._id}})
    .then(function(response){
      //Refresh
      $scope.closePopup();
    },function(response){

    });
  }
  //Saves a profile
  $scope.save = function(){
    $http.post("/admin/popup/profile/save",{params:{profile:$scope.clickedItem}})
    .then(function(response){
      //Refresh
      $scope.closePopup();
    },function(response){

    });
  }
  //Suspends a profile(not fully implemented)
  $scope.suspend = function(){
    $http.post("/admin/popup/profile/suspend",{params:{profile:$scope.clickedItem}})
    .then(function(response){
      //Refresh
      $scope.closePopup();
    },function(response){

    });
  };
});

