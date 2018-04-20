//Server.js
//Main Node Server File

//Classes
class Anime {
    //Model to hold data from The Anime News Network
    constructor(id,title,genres,img,summary,rating,views) {
        this.id = id;
        this.title = title;
        this.genres = genres;
        this.img = img;
        this.summary = summary;
        this.rating = rating;
        this.views = views;
        this.size = "anime--1";
        this.streamingSites = [];
        this.threads = [];
        this.reviews = [];
    }

    //Functions

    /*
    Takes an array of type anime
    Calculates an animes rating based on reviews
    Calculates appropriate size class based on rating
    returns modified array
    */
    async calculateRatingAndSize(){
        //Get rating
        let rating = await this.calculateRating();
        //Set size based on new rating
        let size = await this.calculateSize();
        //Set values
        if (rating!= null){
            this.rating = rating;
        }
        this.size = size;
        //return 
        return {rating: rating, size: size};
    }

    async calculateRating(){
        //Get reviews
        let reviews = await db.collection("reviews").find({id:this.id}).toArray();
        //Averages reviews, if there are any
        if (reviews.length > 0){
            let sum = 0;
            for (let review of reviews){
                sum += review.rating;
            }
            this.rating = sum/reviews.length;
            return this.rating
        } else {
            return null
        }
    }
    //Helper function that calcuates anime size based on rating 
    calculateSize(){
        //Largest size to smallest. Returns a css class
        if (this.rating > 8.0){
            return "anime--5";
        } else if (this.rating > 6.0){
            return "anime--4";
        } else if (this.rating > 4.0){
            return "anime--3";
        } else if (this.rating > 2.0){
            return "anime--2";
        } else {
            return "anime--1";
        }
    }
}

//Helper Functions 
//Gets comments by ID
async function getComments(id){
    let result = await db.collection("comments").find({id:id}).toArray();
    //Attempts to get comments of comments, doesn't really work yet
    for (let comment of result){
        comment.comments = await getComments(comment._id);
    }
    return result;
}

//Updates admin data, increments
async function updateAdmin(attr){
    await db.collection("admin").update({page:"adminHome"},{$inc:attr});
}

//Setup
const Mongo = require('mongodb');
const MongoClient = Mongo.MongoClient;
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongo')(session);
const nodemailer = require('nodemailer');
const https = require('https');
const url = "mongodb://localhost:27017/anime_senpai";
const becauseMoeUrl = "https://bcmoe.blob.core.windows.net/assets/uk.json";
const bodyParser = require('body-parser');
const xml2js = require('xml2js');
const xmlParser = new xml2js.Parser();
const path = require('path');
const app = express();
//const data = require("data.json");
//Helper object to retrieve data from The Anime News Network
const animeNewsNetworkApi = {
    //Attributes
    animeNewsNetworkReportUrl:"https://www.animenewsnetwork.com/encyclopedia/reports.xml?id=155",
    animeNewNetworkApiUrl:"https://cdn.animenewsnetwork.com/encyclopedia/api.xml?",
    //Functions
    getByTitle:async function(search){
        /*
           Searches a form from The Anime Network for anime by name, this is used later to get array of ID's
           Restricted to anime only by 'type' query param
           Returns a promise of an array
        */
        return new Promise((resolve, reject)=>{
            //Using https service
            https.get(this.animeNewsNetworkReportUrl + "&type=anime&search=" + search, res => {
                //Adds xml strings to result
                let result = "";
                res.on("data", data => {
                    result += data;
                });
                //On end, parse xml and return resultant object 
                res.on("end", () => {
                    xmlParser.parseString(result, (err,result)=>{
                        if (err) throw err;
                        resolve(result.report.item);
                    })
                });
                //If an error, promise rejection thrown 
                res.on('error', (err) => reject(err));
            });
        });
    },
    getById:async function(ids){
        /*
          Main function
          Returns main anime data from API 
          Takes an array of anime ids
          retrns a promise of an array
        */
        return new Promise((resolve, reject)=>{
            //Joins ID's into a string thats added to url
            let id = ids.join("/");
            //using https service 
            https.get(this.animeNewNetworkApiUrl + "anime=" + id, res => {
                //On data, add text to result
                let result = "";
                res.on("data", data => {
                    result += data;
                });
                /*
                  On end parse xml, and then filter useful data from object
                  Returned XML from api is a bit rubbish
                  Post processing needed
                */
                res.on("end", () => {
                    xmlParser.parseString(result, (err,result)=>{
                        if (err) throw err;
                        let animeArray = [];
                        //For each anime in return 
                        if (result.ann.anime){
                            result.ann.anime.forEach(anime=>{
                                //No anime probably a warning message or missing data, skip this
                                if (anime.$ == undefined) return;
                                //Setup for getting anime details
                                let genres = [];
                                let img,summary,rating;
                                /*
                                  Loops through info object, to try and pull data into smaller objects
                                  Have to do this because of silly XML structure of api callback
                                */
                                anime.info.forEach(info=>{
                                    //Gets largest image, not interested in smaller ones 
                                    if (info.$.type=="Picture"){
                                        if (info.img.length > 0){
                                            img = info.img[info.img.length-1].$.src;
                                            if (img===""){
                                                return;
                                            }
                                        }
                                    } else if (info.$.type=="Plot Summary"){
                                        //Gets plot
                                        summary = info._;
                                    } else if (info.$.type=="Genres") {
                                        //Gets an array of genres 
                                        genres.push(info._);
                                    }
                                });
                                //If empty summary after loop, we don't want result so start processing next anime
                                if (summary == "") return;
                                //If ratings object, parse to a float. Value between 1 and 10
                                if(anime.ratings){
                                    rating = parseFloat(anime.ratings[0].$.weighted_score);
                                }
                                //Checks if all attributes we collected are valid before creating new anime obj
                                if (genres.length> 0 && img!=null && summary!= null && rating != null){
                                    animeArray.push(new Anime(anime.$.id,anime.$.name,genres,img,summary,rating,0));
                                }
                            });
                        }
                        //For some reason, most accurate result is last in array so flipping order 
                        animeArray = animeArray.reverse();
                        //Returns finished array
                        resolve(animeArray);
                    });
                });
                //On error reject promise 
                res.on("error", (err)=>reject(err));
            });
        });
    }
}

//Declarations
var db;
var streamingSiteData;

/*
  Gets Anime Streaming Site Data
  From Because.moe
*/
https.get(becauseMoeUrl, res => {
    let result = "";
    res.on("data", data => {
        result += data;
    });
    //Parses data, store shows 
    res.on("end", () => {
        streamingSiteData = JSON.parse(result).shows;
    });
});

/*
  Nodemailer
  Used for contact us page
  Needs proper auth object to be set first
*/
const transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
        user: 'animesenpairgu@gmail.com',
        pass: null
    }
});
//Function to return data needed by transporter 
var contactUsOptions = function(contactUs){
    this.from='animesenpairgu@gmail.com';
    this.to='animesenpairgu@gmail.com';
    this.subject='Contact Us';
    //this data is passed from client to server, then inserted here. See contact us route
    this.html=`<h1>${contactUs.name}</h1><h2>${contactUs.email}</h2><p>${contactUs.message}</p>`;
}

//Mongodb
MongoClient.connect(url,function(err,database){
    if(err) throw err;
    db = database;
    db.collection('admin').remove({},function(err,result){
        db.collection('admin').save({_id: new Mongo.ObjectID(0),page:"adminHome", usersOnline:0, accountsCreated:0, contactedUs:0, reviewsCreated:0, threadsCreated:0, commentsCreated:0});
    });
    db.collection('profiles').remove({username:"admin@animesenpai.moe",password:"P@ssw0rd"},function(err,result){
        db.collection('profiles').save({_id: new Mongo.ObjectID(0),username:"admin@animesenpai.moe",password:"P@ssw0rd",admin:true,date: new Date()});
    });
    app.listen(8080);
});


//Connect Mongodb Session 
var store = new MongoDBStore({
    url:url
});

//Middleware
//Used to store session data
app.use(session({secret:'Need to Secure This Later',store:store,resave:true,saveUninitialized:true}));
//Makes server serve static files stored in public folder
app.use(express.static('public'));
//Both needed to parse body of post requests 
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//Home
app.get("/", function(req,res){
    //Returns static page
    res.sendFile(path.join(__dirname + "/index.html"));
});
app.get("/home/get",async function(req,res){
    //Gets home anime from mongo
    let home = {anime:{},search:""};
    //Gets data from mongo
    home.anime.specialBlend = [];
    home.anime.classics = await db.collection("classics").find().toArray();
    home.anime.bestAmerican = await db.collection("bestAmerican").find().toArray();
    home.anime.bestIndie = await db.collection("bestIndie").find().toArray();
    let ids = [];
    /*
      Puts all ids into one array
      We do this due to api limits
      we can batch call 50 anime at once
      only one request per second
    */
    for (let category in home.anime){
        for (let entry of home.anime[category]){
            ids.push(entry.id);
        }
    }
    //Get all the anime
    let anime = await animeNewsNetworkApi.getById(ids);
    //Calculate ratings and sizes
    for (item of anime){
        let result = await item.calculateRatingAndSize();
    }
    //Put anime back into correct array 
    for (let category in home.anime){
        let ids = []
        for (let entry of home.anime[category]){
            ids.push(entry.id);
        }
        home.anime[category] = anime.filter(test=>{return ids.indexOf(test.id)>=0});
    }
    //Return data
    res.send(JSON.stringify(home));
});
app.get("/home/search",async function(req,res){
    //Used by search bar on home page
    let search = req.query.search.toLowerCase();
    //Get titles based on query
    let result = await animeNewsNetworkApi.getByTitle(search);
    let ids = [];
    //Create array of ids from result
    if (result){
        result.forEach(anime => {
            ids.push(anime.id);
        });
    };
    //Get anime by array of ids
    let anime = await animeNewsNetworkApi.getById(ids);
    //Calculate ratings and size 
    for (item of anime){
        let val = await item.calculateRatingAndSize();
    }
    /*
      Return anime and original query that can be checked client side
      This is because some queries take longer and where overwritting the results on home page
    */
    res.send(JSON.stringify({anime:anime,search:req.query.search}));
});
//Profile
app.get("/profile/profile",async function(req,res){
    //Get reviews, threads, comments of logged in user
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.username) == 'undefined'){res.sendStatus(401);return;};
    //Get profile from monogo
    let profile = await db.collection("profiles").findOne({username:req.session.user.username,password:req.session.user.password});
    let profiles = await db.collection("profiles").find().toArray();
    if (profile == null){res.sendStatus(400);return;};
    //Dont want to return password so null it
    profile.password = null;
    profile.reviews = await db.collection("reviews").find({authorid:req.session.user._id}).toArray();
    profile.threads = await db.collection("threads").find({authorid:req.session.user._id}).toArray();
    profile.comments = await db.collection("comments").find({authorid:req.session.user._id}).toArray();
    profile.password = null;
    res.send(JSON.stringify(profile));
});
app.delete("/profile/delete/review",async function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    //Deletes a users review by ID
    let result = await db.collection("reviews").deleteOne({_id:new Mongo.ObjectID(req.query.id)});
    res.sendStatus(200);
});
app.delete("/profile/delete/thread", async function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    //Deletes a users thread by ID
    let result = await db.collection("threads").deleteOne({_id:new Mongo.ObjectID(req.query.id)});
    res.sendStatus(200);
});
app.delete("/profile/delete/comment", async function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    //Deletes a users comment by ID
    let result = await db.collection("comments").deleteOne({_id:new Mongo.ObjectID(req.query.id)});
    res.sendStatus(200);
});
//Profile Edit
app.get("/profileedit/profile",function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    //Returns a original username and password 
    let profileEdit = {username:req.session.user.username,password1:req.session.user.password,password2:""}
    res.send(JSON.stringify(profileEdit));
});
app.post("/profileedit/profile/edit",async function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    //Updates logged in profile with new results 
    await db.collection("profiles").updateOne({_id:new Mongo.ObjectID(req.session.user._id)},{username:req.body.params.profile.username,password:req.body.params.profile.password1},{upsert:true})
    req.session.user = await db.collection("profiles").findOne({_id:new Mongo.ObjectID(req.session.user._id)});
    res.sendStatus(201);
});
//Thread Edit
app.get("/threadedit/anime",async function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    //Gets the anime related to new thread and returns it
    let result = await animeNewsNetworkApi.getById([req.session.threadEdit.animeid]);
    res.send(JSON.stringify(result[0]));
});
app.get("/threadedit/get", function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    //Check if thread exists
    if(req.session.threadEdit.id != null){
        //If thread exists return it 
        db.collection('threads').findOne({_id:new Mongo.ObjectID(req.session.threadEdit.id)}, function(err, result){
            if (err) throw error
            res.send(JSON.stringify(result));
        });
    } else {
        //If not return a new blank one
        res.send(JSON.stringify({title:"", thread:"", authorid:"", author:"", date: null}));
    }
});
app.post("/threadedit/save", function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    //saves thread
    let thread = req.body.params.thread;
    //Checks if it is an existing thread
    if (req.session.threadEdit.id!=null){
        thread._id = req.session.threadEdit.id;
    }
    //Turn ID into proper mongo object id, makes save  work properly
    thread._id = new Mongo.ObjectID(thread._id);
    //Gets accociated anime id 
    if (req.session.threadEdit.animeid){
        thread.id = req.session.threadEdit.animeid;
    }
    //Update admin home, increments new threads
    updateAdmin({threadsCreated:1});
    //Set details
    thread.authorid = req.session.user._id;
    thread.author = req.session.user.username;
    thread.date = new Date();
    //Save
    db.collection('threads').save(thread);
    res.sendStatus(201);
});
//Review Edit
app.get("/reviewedit/anime",async function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    //Returns anime related to review being created 
    let result = await animeNewsNetworkApi.getById([req.session.reviewEdit.animeid])
    res.send(JSON.stringify(result[0]));
});
app.get("/reviewedit/get", function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    //Checks if review already exists
    if(req.session.reviewEdit.id != null){
        //Returns existing review
        db.collection('reviews').findOne({_id:new Mongo.ObjectID(req.session.reviewEdit.id)}, function(err, result){
            if (err) throw error
            res.send(JSON.stringify(result));
        });
    } else {
        //If not found return blank new review
        res.send(JSON.stringify({rating:0, title:"", review:"", authorid:"", author:"", date: null}));
    }
});
app.post("/reviewedit/save",function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401)};
    //saves review
    let review = req.body.params.review;
    //Checks if existing review or not
    if (req.session.reviewEdit.id!=null){
        review._id = req.session.reviewEdit.id;
    }
    //Sets id to be proper Mongo Object ID, makes save work properly 
    review._id = new Mongo.ObjectID(review._id);
    //Sets parent ID to be related anime 
    if (req.session.reviewEdit.animeid){
        review.id = req.session.reviewEdit.animeid;
    }
    //Increments created reviews for admim home
    updateAdmin({reviewsCreated:1});
    //Set details
    review.authorid = req.session.user._id;
    review.author = req.session.user.username;
    review.date = new Date();
    //Save review 
    db.collection('reviews').save(review);
    res.sendStatus(201);
 });
//General
app.get("/comments", async function(req,res){
    /*Returns comments related to a parent by id
      Need to write a recursive function that returns an array of comments that is appended to replies
      Doesn't work as intented yet, but does return base comment just not replies of base comments
    */
    let comments = await getComments(req.query.id);
    res.send(JSON.stringify(await comments));
});
app.post('/signup',async function(req,res){
    //Sign up for user account 
    //Checks if existing 
    let exists = await db.collection("profiles").findOne({username:req.body.params.username});
    if (exists){
        //Returns 401 if username already in use
        res.sendStatus(401);
    } else {
        //Inserts new entry
        let result = await db.collection("profiles").insert({username:req.body.params.username,password:req.body.params.password,date:new Date()});
        //If successful, retrive new profile 
        let profile;
        if (result){
            profile = await db.collection("profiles").findOne({username:req.body.params.username});
        }
        //Update admin to say an account was created
        updateAdmin({accountsCreated:1});
        //Regenerates session after login
        if (req.session == undefined){
            //If no session, create one
            app.use(session({secret:'Need to Secure This Later',resave:true,saveUninitialized:true}));
            //Set session user to new profile
            req.session.user = profile;
            //Return username, used to display it on profile edit
            res.send(JSON.stringify({username:req.body.params.username}));
            //Update admin to say user online
            updateAdmin({usersOnline:1});
        } else {
            //If there is already a session, regenerate it 
            req.session.regenerate(function(err){
                //Set session user as new profile 
                req.session.user = profile
                //Return username and increment online users 
                res.send(JSON.stringify({username:req.body.params.username}));
                updateAdmin({usersOnline:1});
            });
        }
    }
});
app.post("/login", async function(req,res){
    //Login 
    //Get username and password
    var username = req.body.params.username;
    var password = req.body.params.password;
    //Find profile
    let profile = await db.collection("profiles").findOne({username:username,password:password});
    //If no profile return error
    if(profile == null){res.sendStatus(401);return;};
    //Double check passwords do match
    if(profile.password!=undefined && profile.password == password){
        //Regenerates session after login
        if (req.session == undefined){
            //If not session create new one
            app.use(session({secret:'Need to Secure This Later',resave:true,saveUninitialized:true}));
            //Set session user as profile
            req.session.user = profile;
            //Send success
            res.sendStatus(200);
            //Increment online users
            updateAdmin({usersOnline:1});
        } else {
            //If session exists regenerate
            req.session.regenerate(function(err){
                //Sets session user, return OK and increments online users
                req.session.user = profile;
                res.sendStatus(200);
                updateAdmin({usersOnline:1});
            });
        }
    } else {
        //Return error
        res.sendStatus(401);
    }
});
app.post("/logout", function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    //Decrement online users, destroy session on logout 
    updateAdmin({usersOnline:-1});
    req.session.destroy();
    res.sendStatus(200);
});
app.post("/contactus", function(req,res){
    //Contact Us 
    //Creates new contact us options object using posted data, 
    transporter.sendMail(new contactUsOptions(req.body.params.contactUs), function(error,info){
        if (error){res.sendStatus(401);} 
        res.sendStatus(202);
    });
    //Increment contacted us today
    updateAdmin({contactedUs:1});
});
//Popups
//Anime Popup
app.get("/popup/anime", async function(req,res){
    /*
      Returns details about an anime from AnimeNetwork api
      and whatever we have stored
    */
    //Parse passed data
    let anime = JSON.parse(req.query.anime);
    //Convert to class anime so we can call calculateRatingAndSize()
    anime = new Anime(anime.id,anime.title,anime.genres,anime.img,anime.summary,anime.rating,anime.views);
    //Get threads and thread comments
    anime.threads = await db.collection("threads").find({id:anime.id}).toArray();
    for (let thread of anime.threads){
        thread.comments = await getComments(thread._id);
    }
    //Get reviews and review comments
    anime.reviews = await db.collection("reviews").find({id:anime.id}).toArray();
    for (let review of anime.reviews){
        review.comments = await getComments(review._id);
    }
    //Get streaming services, needs tweaking
    anime.streaming =  streamingSiteData.filter(function(item){return anime.title.toLowerCase().indexOf(item.name.toLowerCase()) != -1});
    //Calculates anime's current rating and size based on reviews 
    let rating = anime.calculateRatingAndSize();
    res.send(JSON.stringify(await anime));
});
app.post("/popup/anime/addReview", function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    //Sets session reviewEdit, stores anime new review is related to
    req.session.reviewEdit = {id:null,animeid:req.body.params.id};
    res.sendStatus(201);
});
app.post("/popup/anime/addThread", function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    //Sets session threadEdit, stores anime new thread is related to
    req.session.threadEdit = {id:null,animeid:req.body.params.id};
    res.sendStatus(201);
})
app.post("/popup/anime/addComment", function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    //Inserst new comment into mongo
    db.collection("comments").insert({id:req.body.params.id,comment:req.body.params.comment,authorid:req.session.user._id,author:req.session.user.username,date:new Date()});
    //Increment comments
    updateAdmin({reviewsCreated:1});
    res.sendStatus(201);
});

//Admin
app.get("/admin", function(req,res){
    /*
      Check if session exists, that it has a user attribute, and if that user is an admin
      If not, redirect to home page
    */
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin || req.session.user.admin == false){res.redirect("/")};
    //If admin return admin home page
    res.sendFile(path.join(__dirname + "/admin.html"));
});
//Admin Home Data
app.get("/admin/home", async function(req,res){
    //Checks if admin
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    //Gets admin home data from mongo
    let adminHome = await db.collection('admin').findOne({page:"adminHome"});
    adminHome.reviews = await db.collection('reviews').find().sort({date: -1}).limit(5).toArray();
    adminHome.threads = await db.collection('threads').find().sort({date: -1}).limit(5).toArray();
    adminHome.comments = await db.collection('comments').find().sort({date: -1}).limit(5).toArray();
    //Return data
    res.send(JSON.stringify(adminHome));
});
//Account Management
app.get("/admin/accountmanagement", async function(req,res){
    //Checks if admin
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    //Return account management data from mongo
    let accountmanagement = {};
    accountmanagement.latestAccounts = await db.collection('profiles').find().sort({date: -1}).limit(5).toArray();
    accountmanagement.sessions = await db.collection('sessions').find().limit(5).toArray();
    accountmanagement.suspended = await db.collection('profiles').find({suspended:true}).limit(5).toArray();
    //Return data
    res.send(JSON.stringify(accountmanagement));
});
app.post("/admin/accountmanagement/search", async function(req,res){
    //Check if admin 
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    //Get accounts by username query
    let accounts = await db.collection("profiles").find({username:new RegExp(req.body.params.search)}).toArray();
    //Return results, and original search query
    res.send(JSON.stringify({accounts:{accounts},search:req.body.params.search}));
});
//Post Management
app.get("/admin/postmanagement", function(req,res){
    //Check if admin
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    /*
      Returns dummy object
      Search still works though
    */
    let postmanagement = {};
    res.send(JSON.stringify(postmanagement));
});
app.post("/admin/postmanagement/search",async function(req,res){
    //Check if admin
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    //Gets reviews and threads by title query 
    let reviews = await db.collection("reviews").find({title:new RegExp(req.body.params.search)}).toArray();
    let threads = await db.collection("threads").find({title:new RegExp(req.body.params.search)}).toArray();
    //Returns results and original query
    res.send(JSON.stringify({posts:{reviews:reviews,threads:threads},search:req.body.params.search}));
});
//Lists
app.get("/admin/lists",async function(req,res){
    //Check if admin
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    //Blank Model
    let lists = {classics:[],bestAmerican:[],bestIndie:[]};
    //Gets current homepage lists 
    lists.classics = await db.collection("classics").find().toArray();
    lists.bestAmerican = await db.collection("bestAmerican").find().toArray();
    lists.bestIndie = await db.collection("bestIndie").find().toArray();
    //Returns Homepage lists
    res.send(lists);
});
app.post("/admin/lists/add",async function(req,res){
    //Check if admin
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    //Saves anime to passed list 
    let result = await db.collection(req.body.params.list).save(req.body.params.anime);
    res.sendStatus(201);
});
app.delete("/admin/lists/delete",async function(req,res){
    //Check if admin
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    //Removes anime from passed list
    let result = await db.collection(req.query.list).deleteOne({id:req.query.id});
    res.sendStatus(200);
});

//Admin Popups
//Profile
app.delete("/admin/popup/profile/delete",async function(req,res){
    //Check if admin
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    //Deletes a profile by _id
    let result = await db.collection('profiles').deleteOne({_id:new Mongo.ObjectID(req.query.id)});
    res.sendStatus(200);
});
app.post("/admin/popup/profile/save",async function(req,res){
    //Check if admin
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    //Get passed profile, bodyParser parses JSON for us
    let profile = req.body.params.profile;
    //Update profile by _id, with new details
    let result = await db.collection('profiles').updateOne({_id:new Mongo.ObjectID(profile._id)},{username:profile.username,password:profile.password});
    res.sendStatus(200);
});
app.post("/admin/popup/profile/suspend",async function(req,res){
    //Check if admin
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    //Get passed profile, bodyParses parses JSON for us
    let profile = req.body.profile;
    //check if profile already has a suspend attribute
    if (typeof(profile.suspend)=="undefined"){
        //If not, add one
        profile.suspend = true;
    } else {
        //If it does invert it
        profile.suspend = !profile.suspend;
    }
    //Update profile 
    let result = await db.collection('profiles').updateOne({_id:new Mongo.ObjectID(profile._id)},{username:profile.username,password:profile.password,suspend:profile.suspend});
    res.sendStatus(200);
});
//Review
app.delete("/admin/popup/review/delete",async function(req,res){
    //Check if admin
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    //Delete entry by _id
    let result = await db.collection('reviews').deleteOne({_id:Mongo.ObjectID(req.query.id)});
    res.sendStatus(200);
});
app.post("/admin/popup/review/save",async function(req,res){
    //Check if admin
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    //Get posted review, bodyParses parses JSON for us
    let review = req.body.params.review;
    //Create mongo id from _id
    review._id = new Mongo.ObjectID(review._id);
    let result = await db.collection('profiles').updateOne({_id:review._id},review);
    res.sendStatus(200);
});
//Thread
app.delete("/admin/popup/thread/delete",async function(req,res){
    //Check if admin
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    //deletes thread by _id
    let result = await db.collection('threads').deleteOne({_id:Mongo.ObjectID(req.query.id)});
    res.sendStatus(200);
});
app.post("/admin/popup/thread/save",async function(req,res){
    //Check if admin
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    //Get posted thread, bodyParses parses JSON for us
    let thread = req.body.params.thread;
    //Set _id to proper mongo id
    thread._id = new Mongo.ObjectID(thread._id);
    //Update thread
    let result = await db.collection('threads').updateOne({_id:thread._id},thread);
    res.sendStatus(200);
});
//Comment
app.delete("/admin/popup/comment/delete",async function(req,res){
    //Check if admin
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    //Delete comment by _id
    let result = await db.collection('comments').deleteOne({_id:Mongo.ObjectID(req.query.id)});
    res.sendStatus(200);
});
app.post("/admin/popup/comment/save",async function(req,res){
    //Check if admin
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    //Get posted comment
    let comment = req.body.params.comment;
    //Change id to proper mongo id
    comment._id = Mongo.ObjectID(comment._id); 
    //Update comment
    let result = await db.collection('comments').updateOne({_id:comment._id},comment);
    res.sendStatus(200);
});
