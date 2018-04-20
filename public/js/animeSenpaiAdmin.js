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
animeSenpaiAdmin.controller("mainAdminController", function($scope,$timeout,$location,$route,$window,$http) {
  //Setup
  //JS Navigation
  $scope.navigate = function(path){
    if ($location.path == path) return;
    $timeout(function(){
      $location.path(path);
    },);
  };
  $scope.getProfile = function(){
    $http.get("/profile/profile")
    .then(function(response){
      $scope.setProfile(response.data);
    },function(response){
      $scope.navigate("/");
    });
  }
  $scope.setProfile = function(profile){
    $scope.profile = profile;
  }
  $scope.getProfile();
  $scope.btnLoginClick = function(){
    $scope.dropdowntoggle = !$scope.dropdowntoggle;
  };
  $scope.signOut = function(){
    $http.post("/logout")
    .then(function(response){
      $window.location.href="/";
    },function(response){
      $scope.navigate("/");
    });
  };
  $scope.openProfile = function(){
    $location.url('/profile');
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
  //Temp ojbect to represent what server might return 
  $scope.accountManagement = {
    latestAccounts: [],
    sessions: [],
    suspended: [], 
    searchResults: [],
    search:""
  };
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
    $scope.loading = true;
    $http.post("/admin/accountmanagement/search",{params:{search:$scope.accountManagement.search}})
    .then(function(response){
      if ($scope.accountManagement.search == response.search){
        $scope.accountManagement.searchResults = response.data.accounts;
        $scope.loading = false;
      }
    },function(response){
      $scope.navigate("/");
    });
  };
});
//Post Management Controller 
animeSenpaiAdmin.controller("postManagementController", function($scope,$http){
  //Temp object tha represents what might be returned from the server 
  $scope.loading = false;
  $scope.postManagement = {
    latestPosts:[],
    recentlyCreatedReview:[],
    recentlyCreatedThread:[],
    recentlyCreatedComment:[],
    searchResults: [],
    search:""
  };
  $http.get("/admin/postmanagement")
  .then(function(response){
    $scope.postManagement = response.data;
    $scope.postManagement.searchResults = [];
    $scope.postManagement.search = "";
  },function(response){
    $scope.navigate("/");
  });
  $scope.inputChanged = function(){
    $scope.inputChanged = function(){
      $scope.loading = true;
      $http.post("/admin/postmanagement/search",{params:{search:$scope.postManagement.search}})
      .then(function(response){
        console.log(response.data);
        if ($scope.postManagement.search == response.data.search){
          $scope.postManagement.searchResults = response.data.posts;
          $scope.loading = false;
        }
      },function(response){
        $scope.navigate("/");
      });
    };
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
  $scope.getLists();
  $scope.select = function(index, anime){
    $scope.selectedRow = index;
    $scope.anime = anime;
  }
  $scope.add = function(){
    if ($scope.anime != null){
      $http.post("/admin/lists/add",{params:{anime:$scope.anime,list:$scope.selected}})
      .then(function(response){
        $scope.getLists();
      },function(response){
        $scope.navigate("/");
      });
    }
  }
  $scope.delete = function(anime,list){
    $http.delete("/admin/lists/delete",{params:{id:anime.id,list:list}})
    .then(function(response){
      $scope.getLists();
    },function(response){
      $scope.navigate("/");
    });
  }
  $scope.inputChange = function(){
    $scope.loading = true;
    $scope.anime = null;
    $http.get("/home/search",{params: {search: $scope.lists.search}})
    .then(function(response){
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
  //Test functions 
  $scope.delete = function(){
    $http.delete("/admin/popup/comment/delete",{params:{id:$scope.clickedItem._id}})
    .then(function(response){
      //Page refresh
      $scope.closePopup();
    },function(response){

    });
  }
  $scope.save = function(){
    $http.post("/admin/popup/comment/save",{params:{id:$scope.clickedItem}})
    .then(function(response){
      //Page refresh
      $scope.closePopup();
    },function(response){

    });
  }
});
//Post Edit Popup Controller 
animeSenpaiAdmin.controller("postEditPopupController", function ($scope,$http){
  //Test Functions 
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
  $scope.save = function(type,post){
    if ($scope.clickedItem.rating != undefined){
      $http.delete("/admin/popup/review/save",{params:{review:$scope.clickedItem}})
      .then(function(response){
        //Refresh
        $scope.closePopup();
      },function(response){
  
      });
    } else {
      $http.delete("/admin/popup/thread/save",{params:{thread:$scope.clickedItem}})
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
  //Temp object that represents what might be returned from the server 
  $scope.profileEdit = $scope.clickedItem;
  //Test Functions
  $scope.delete = function(){
    $http.delete("/admin/popup/profile/delete",{params:{id:$scope.clickedItem._id}})
    .then(function(response){
      //Refresh
      $scope.closePopup();
    },function(response){

    });
  }
  $scope.save = function(){
    $http.post("/admin/popup/profile/save",{params:{profile:$scope.clickedItem}})
    .then(function(response){
      //Refresh
      $scope.closePopup();
    },function(response){

    });
  }
  $scope.suspend = function(){
    $http.post("/admin/popup/profile/suspend",{params:{profile:$scope.clickedItem}})
    .then(function(response){
      //Refresh
      $scope.closePopup();
    },function(response){

    });
  };
});

