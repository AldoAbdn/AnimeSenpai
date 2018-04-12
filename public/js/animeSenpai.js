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
    $scope.dropdowntoggle = $("#btnDropdown").hasClass("collapsed");
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
            $scope.getComments(thread._id,(comments,html)=>{
              thread.comments = comments;
              thread.commentsHtml = $sce.trustAsHtml(html);
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
            $scope.getComments(review._id,(comments,html)=>{
              review.comments = comments;
              review.commentsHtml = $sce.trustAsHtml(html);
            });
          });
        });
        $http.get("/popup/anime/streaming",{params: {title:$scope.clickedItem.title}})
        .then(function(response){
          $scope.clickedItem.streaming = response.data;
          console.log(response.data);
          console.log(response.data[0].sites);
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
      let test = [{comment:"Base Comment",replies:[{comment:"Reply 1",replies:[]}]
                  }];
      let commentsHtml = createCommentHtml(test);
      //callback(response.data,commentsHtml);
      callback(test,commentsHtml);
    });
  };
  function createCommentHtml(comments){
    //Creates html for each comment and its replies, whole html as a string
    let html = ``;
    comments.forEach(comment=>{
      let repliesHtml = createCommentHtml(comment.replies);
      let commentHtml = commentTemplate(comment, repliesHtml);
      html += commentHtml;
    });
    return html;
  }
  function commentTemplate(comment, replies){
    //Inserts comment attributes into a html templte, returns template
    let head = `                      
    <div class='comment'>
      <div class='comment-head'>
        <span>${comment.author} </span><span>${comment.date}</span>
      </div>
      <div class='comment-body'>
        <p>${comment.comment}</p>
      </div>
      <div class='comment-footer'>
        <a href='#' ng-click=''>reply</a>
        <div class="form-group">
        <label for="comment">Reply:</label>
        <textarea class="form-control" rows="5" id="threadcomment${comment._id}"></textarea>
        <button class="btn btn-primary" ng-click="addComment('thread',thread,${comment.id},'threadcomment$')"/>
      </div>
      </div>
      <div class='container'>
        <div class='row'>
            <div class='col-md-offset-1 col-md-11'>
              <div class='comment-replies'>`
    
    
    let body = replies;

    let foot = `
              </div>
            </div>
          </div>
        </div>
      </div>`;

    return head + body + foot;
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
      console.log(response);
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
  $scope.addComment = function(type,post,id,commentSelector){
    $http.post("popup/anime/addComment",{params: {id: post._id,type: type,comment:$('#'+commentSelector).val()}})
    .then(function(response){
      //Need to reload comments here 
      getComments(post._id,(comments,html)=>{
        post.comments = comments;
        post.commentsHtml = html;
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
    scope: {
      comments: '=comments'
    },
    templateUrl: 'template/comment.html'
  }
});
animeSenpai.directive("reply", function($compile){
  return {
    restrict: "E",
    replace: true,
    scope: {
      reply: "="
    },
    template:"",
    link: function (scope, element, attrs){
      console.log(scope.reply);
      if(angular.isArray(scope.reply.length > 0)){
        element.append("<div comments='reply.replies'></div>");
        $compile(element.contents())(scope);
      }
    }
  }
});
