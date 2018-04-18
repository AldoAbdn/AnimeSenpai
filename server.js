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

//Middleware
//Used to store session data
app.use(session({secret:'Need to Secure This Later',resave:true,saveUninitialized:true}));
//Makes server serve static files stored in public folder
app.use(express.static('public'));
//Both needed to parse body of post requests 
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

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
    this.text=`<h1>${contactUs.name}</h1><h2>${contactUs.email}</h2><p>${contactUs.message}</p>`;
}

//Mongodb
MongoClient.connect(url, function(err,database){
    if(err) throw err;
    db = database;
    db.collection('admin').save({_id:Mongo.ObjectID(0),page:"adminHome", usersOnline:0, accountsCreated:0, contactedUs:0, reviewsCreated:0, threadsCreated:0, commentsCreated:0});
    db.collection('profiles').save({_id:Mongo.ObjectID(0),email:"admin@animesenpai.moe",password:"P@ssw0rd",admin:true});
    app.listen(8080);
});

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
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.email) == 'undefined'){res.sendStatus(401);return;};
    //Get profile from monogo
    let profile = await db.collection("profiles").findOne({_id:req.session.user._id});
    if (profile == null){res.sendStatus(400);return;};
    //Dont want to return password to null it
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
    let profileEdit = {email:req.session.user.email,password1:req.session.user.password,password2:""}
    res.send(JSON.stringify(profileEdit));
});
app.post("/profileedit/profile/edit",async function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    //Updates logged in profile with new results 
    await db.collection("profiles").updateOne({_id:new Mongo.ObjectID(req.session.user._id)},{email:req.body.params.profile.email,password:req.body.params.profile.password1},{upsert:true})
    req.session.user = await db.collection("profiles").findOne({_id:new Mongo.ObjectID(req.session.user._id)});
    res.send(201);
});
//Thread Edit
app.get("/threadedit/anime",async function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    let result = await animeNewsNetworkApi.getById([req.session.threadEdit.animeid]);
    res.send(JSON.stringify(result[0]));
});
app.get("/threadedit/get", function(req,res){
    //gets thread by id
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    if(req.session.threadEdit.id != null){
        db.collection('threads').findOne({_id:new Mongo.ObjectID(req.session.threadEdit.id)}, function(err, result){
            if (err) throw error
            res.send(JSON.stringify(result));
        });
    } else {
        res.send(JSON.stringify({title:"", thread:"", authorid:"", author:"", date: null}));
    }
});
app.post("/threadedit/save", function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    //saves thread
    if (req.session.threadEdit.id){
        req.body.params.thread._id = req.session.threadEdit.id;
    }
    if (req.session.threadEdit.animeid){
        req.body.params.thread.id = req.session.threadEdit.animeid;
    }
    updateAdmin({threadsCreated:1});
    req.body.params.thread.authorid = req.session.user._id;
    req.body.params.thread.author = req.session.user.email;
    req.body.params.thread.date = new Date();
    db.collection('threads').save(req.body.params.thread);
    res.sendStatus(201);
});
//Review Edit
app.get("/reviewedit/anime",async function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    let result = await animeNewsNetworkApi.getById([req.session.reviewEdit.animeid])
    res.send(JSON.stringify(result[0]));
});
app.get("/reviewedit/get", function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    //gets review by id
    if(req.session.reviewEdit.id != null){
        db.collection('reviews').findOne({_id:new Mongo.ObjectID(req.session.reviewEdit.id)}, function(err, result){
            if (err) throw error
            res.send(JSON.stringify(result));
        });
    } else {
        res.send(JSON.stringify({rating:0, title:"", review:"", authorid:"", author:"", date: null}));
    }
});
app.post("/reviewedit/save",function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401)};
    //saves review
    if (req.session.reviewEdit.id){
        req.body.params.review.id = req.session.reviewEdit.id;
    }
    if (req.session.reviewEdit.animeid){
        req.body.params.review.id = req.session.reviewEdit.animeid;
    }
    updateAdmin({reviewsCreated:1});
    req.body.params.review.authorid = req.session.user._id;
    req.body.params.review.author = req.session.user.email;
    req.body.params.date = new Date();
    db.collection('reviews').save(req.body.params.review);
    res.sendStatus(201);
 });
//General
app.get("/comments", async function(req,res){
    //Returns comments related to a parent by id
    //Need to write a recursive function that returns an array of comments that is appended to replies
    let comments = await getComments(req.query.id);
    res.send(JSON.stringify(await comments));
});

app.post('/signup',async function(req,res){
    //sign up goes here
    let exists = await db.collection("profiles").findOne({email:req.body.params.email});
    if (exists){
        res.sendStatus(401);
    } else {
        let result = await db.collection("profiles").insert({email:req.body.params.email,password:req.body.params.password});
        let profile;
        if (result){
            profile = await db.collection("profiles").findOne({email:req.body.params.email});
        }
        updateAdmin({accountsCreated:1});
        //Regenerates session after login
        if (req.session == undefined){
            app.use(session({secret:'Need to Secure This Later',resave:true,saveUninitialized:true}));
            req.session.user = profile;
            res.send({email:req.body.params.email});
            updateAdmin({usersOnline:1});
        } else {
            req.session.regenerate(function(err){
                req.session.user = profile
                res.send({email:req.body.params.email});
                updateAdmin({usersOnline:1});
            });
        }
    }
});
app.post("/login", async function(req,res){
    //Login goes here
    //Connor this is how you get values in post
    //req.body.email;req.body.password;
    var email = req.body.params.email;
    var password = req.body.params.password;
    let profile = await db.collection("profiles").findOne({email:email,password:password});
    if(profile == null){res.sendStatus(401);return;};
    if(profile.password!=undefined && profile.password == password){
        //Regenerates session after login
        if (req.session == undefined){
            app.use(session({secret:'Need to Secure This Later',resave:true,saveUninitialized:true}));
            req.session.user = profile;
            res.sendStatus(200);
        } else {
            req.session.regenerate(function(err){
                req.session.user = profile;
                res.sendStatus(200);
            });
        }
    } else {
      res.sendStatus(401);
    }
});
app.post("/logout", function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    updateAdmin({usersOnline:-1});
    req.session.destroy();
    res.sendStatus(200);
});
app.post("/contactus", function(req,res){
    //Contact Us goes here
    transporter.sendMail(new contactUsOptions(req.body.params.contactUs), function(error,info){
        if (error) throw res.sendStatus(401);
        res.send(202);
    });
    updateAdmin({contactedUs:1});
});
//Popups
//Anime
app.get("/popup/anime", async function(req,res){
    //Returns details about an anime from AnimeNetwork api
    //and whatever we have stored
    let anime = req.query.anime;
    console.log(req.query.anime);
    anime = new Anime(anime.id,anime.title,anime.genres,anime.img,anime.summary,anime.rating,anime.views);
    console.log(anime);
    anime.threads = await db.collection("threads").find({id:anime.id}).toArray();
    for (let thread of anime.threads){
        thread.comments = await getComments(thread._id);
    }
    anime.reviews = await db.collection("reviews").find({id:anime.id}).toArray();
    for (let review of anime.reviews){
        review.comments = await getComments(review._id);
    }
    anime.streaming =  streamingSiteData.filter(function(item){return anime.title.toLowerCase().indexOf(item.name.toLowerCase()) != -1});
    let rating = anime.calculateRatingAndSize();
    res.send(JSON.stringify(await anime));
});
app.post("/popup/anime/addReview", function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    req.session.reviewEdit = {id:null,animeid:req.body.params.id};
    res.send(201);
});
app.post("/popup/anime/addThread", function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    req.session.threadEdit = {id:null,animeid:req.body.params.id};
    res.send(201);
})
app.post("/popup/anime/addComment", function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.sendStatus(401);return;};
    db.collection("comments").insert({id:req.body.params.id,comment:req.body.params.comment,authorid:req.session.user._id,author:req.session.user.email,date:new Date()});
    updateAdmin({reviewsCreated:1});
    res.send(201);
});

//Admin
app.get("/admin", function(req,res){
    //Will add check to see if user is Admin later
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'){res.redirect("/");return;};
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin || req.session.user.admin == false){res.redirect("/")};
    res.sendFile(path.join(__dirname + "/admin.html"));
});
//Admin Home Data
app.get("/admin/home", async function(req,res){
    //Add check for if admin
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    let adminHome = await db.collection('admin').findOne({page:"adminHome"});
    adminHome.reviews = await db.collection('reviews').find().sort({date: -1}).limit(5).toArray();
    adminHome.threads = await db.collection('threads').find().sort({date: -1}).limit(5).toArray();
    adminHome.comments = await db.collection('comments').find().sort({date: -1}).limit(5).toArray();
    res.send(JSON.stringify(adminHome));
});

//Account Management
app.get("/admin/accountmanagement", function(req,res){

});

//Post Management
app.get("/admin/postmanagement", function(req,res){

});

//Lists
app.get("/admin/lists",async function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    let lists = {classics:[],bestAmerican:[],bestIndie:[]};
    lists.classics = await db.collection("classics").find().toArray();
    lists.bestAmerican = await db.collection("bestAmerican").find().toArray();
    lists.bestIndie = await db.collection("bestIndie").find().toArray();
    res.send(lists);
});
app.post("/admin/lists/add",async function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    let result = await db.collection(req.body.params.list).save(req.body.params.anime);
    res.send(201);
});
app.delete("/admin/lists/delete",async function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    let result = await db.collection(req.query.list).deleteOne({id:req.query.id});
    res.send(200);
});
//Admin Popups
//Profile
app.delete("/admin/popup/profile/delete",function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    db.collection('profiles').deleteOne(req.body, function(err, result){
        if (err) throw err;
    });
});
app.post("/admin/popup/profile/save",function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    let profile = req.body.profile;

    db.collection('profiles').updateOne({_id:new Mongo.ObjectID(profile._id)},profile,function(err,result){
        if (err) throw err;
    });
});
app.post("/admin/popup/profile/suspend",function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    let profile = req.body.profile;
    profile.suspend = !profile.suspend;

    db.collection('profiles').updateOne({_id:new Mongo.ObjectID(profile._id)},profile,function(err,result){
        if (err) throw err;
    });
});
//Review
app.delete("/admin/popup/review/delete",function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    db.collection('reviews').deleteOne(req.body, function(err, result){
        if (err) throw err;
    });
});
app.post("/admin/popup/review/save",function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    var review = req.body.review;
    db.collection('profiles').updateOne({_id:new MongoClinet.ObjectID(review._id)},review,function(err,result){
        if (err) throw err;
    });
});
//Thread
app.delete("/admin/popup/thread/delete",function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    db.collection('threads').deleteOne(req.body, function(err, result){
        if (err) throw err;
    });
});
app.post("/admin/popup/thread/save",function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    var thread = req.body.thread;

    db.collection('threads').updateOne({_id:new Mongo.ObjectID(thread._id)},thread,function(err,result){
        if (err) throw err;
    });
});
//Comment
app.delete("/admin/popup/comment/delete",function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    db.collection('comments').deleteOne(req.body, function(err, result){
        if (err) throw err;
    });
});
app.post("/admin/popup/comment/save",function(req,res){
    if (typeof(req.session)=='undefined'||typeof(req.session.user)=='undefined'||typeof(req.session.user.admin)=='undefined'||!req.session.user.admin){res.sendStatus(401);return;};
    var comment = req.body.comment;

    db.collection('comment').updateOne({_id:new Mongo.ObjectID(comment._id)},comment,function(err,result){
        if (err) throw err;
    });
});
