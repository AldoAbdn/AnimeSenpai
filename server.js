//Server.js
//Main Node Server File

//Classes
class Anime {
    constructor(id,title,genres,img,summary,rating,views) {
        this.id = id;
        this.title = title;
        this.genres = genres;
        this.img = img;
        this.summary = summary;
        this.rating = rating;
        this.views = views;
        this.size = this.calcSize();
        this.streamingSites = [];
        this.threads = [];
        this.reviews = [];
    }

    calcSize(rating,views){
        return "";
    }
}

//Setup
const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const session = require('express-session');
const https = require('https');
const url = "mongodb://localhost:27017/anime_senpai";
const becauseMoeUrl = "https://bcmoe.blob.core.windows.net/assets/uk.json";
const bodyParser = require('body-parser');
const xml2js = require('xml2js');
const xmlParser = new xml2js.Parser();
const path = require('path');
const app = express();
const animeNewsNetworkApi = {
    animeNewsNetworkReportUrl:"https://www.animenewsnetwork.com/encyclopedia/reports.xml?id=155",
    animeNewNetworkApiUrl:"https://cdn.animenewsnetwork.com/encyclopedia/api.xml?",
    getByTitle:function(search, callback){
        //Searches a form from The Anime Network for anime by name, this is used later to get array of ID's
        https.get(this.animeNewsNetworkReportUrl + "&type=anime&search=" + search, res => {
            let result = "";
            res.on("data", data => {
                result += data;
            });
            res.on("end", () => {
                xmlParser.parseString(result, (err,result)=>{
                    if (err) throw err;
                    callback(result.report.item);
                })
            });
        });
    },
    getById:function(ids, callback){
        //Main function of object, returns an array of class Anime containing from an array of id's
        let id = ids.join("/");
        https.get(this.animeNewNetworkApiUrl + "anime=" + id, res => {
            let result = "";
            res.on("data", data => {
                result += data;
            });
            res.on("end", () => {
                xmlParser.parseString(result, (err,result)=>{
                    if (err) throw err;
                    let animeArray = [];
                    if (result.ann.anime){
                        result.ann.anime.forEach(anime=>{
                            if (anime.$ == undefined) return;
                            //Creates an object of class Anime for each item in api callback 
                            let genres = [];
                            let img,summary,rating;
                            //Loops through info object, to try and pull data into smaller objects
                            //Have to do this because of silly XML structure of api callback
                            anime.info.forEach(info=>{
                                if (info.$.type=="Picture"){
                                    if (info.img.length > 0){
                                        img = info.img[info.img.length-1].$.src;
                                    }
                                } else if (info.$.type=="Plot Summary"){
                                    summary = info._;
                                } else if (info.$.type=="Genres") {
                                    genres.push(info._);
                                }
                            });
                            if (summary == "") return;
                            if(anime.ratings){
                                rating = anime.ratings[0].$.weighted_score;
                            }
                            animeArray.push(new Anime(anime.$.id,anime.$.name,genres,img,summary,rating,0));
                        });
                    }
                    callback(animeArray);
                });
            });
        });
    }
}

async function comments(id){
    let commentTest = await getComments(id);
    console.log(commentTest);
    let comments = [{comment:"I AM A COMMENT",author:"Aldo",date:Date(),replies:[{comment:"I AM A COMMENT",author:"Aldo",date:Date(),replies:[]}]}];
    res.send(JSON.stringify(comments));
}

app.use(session({secret:'Need to Secure This Later',resave:true,saveUninitialized:true}));
app.use(express.static('public'));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

//Declarations
var db;
var streamingSiteData;

//Gets Anime Streaming Site Data
https.get(becauseMoeUrl, res => {
    let result = "";
    res.on("data", data => {
        result += data;
    });
    res.on("end", () => {
        streamingSiteData = JSON.parse(result).shows;
    });
});

//Mongodb
MongoClient.connect(url, function(err,database){
    if(err) throw err;
    db = database;
    app.listen(8080);
});

//Home
app.get("/", function(req,res){
    res.sendFile(path.join(__dirname + "/index.html"));
});
app.get("/home/get",async function(req,res){
    let home = {anime:{specialBlend:[],classics:[],bestAmerican:[],bestIndie:[],searchResults:[]},search:""};
    let specialBlend = [];
    let classics = await db.collection("classics").find().toArray();
    let bestAmerican = await db.collection("bestAmerican").find().toArray();
    let bestIndie = await db.collection("bestIndie").find().toArray();
    let ids = specialBlend.concat(classics.concat(bestAmerican.concat(bestIndie)));
    animeNewsNetworkApi.getById(ids,anime=>{
        home.anime.specialBlend = anime.filter(anime=>{specialBlend.indexOf(anime.id)});
        home.anime.classics = anime.filter(anime=>{classics.indexOf(anime.id)});
        home.anime.bestAmerican = anime.filter(anime=>{bestAmerican.indexOf(anime.id)});
        home.anime.bestIndie = anime.filter(anime=>{bestIndie.indexOf(anime.id)});
        res.send(JSON.stringify(home));
    });
});
app.get("/home/search", function(req,res){
    let search = req.query.search.toLowerCase();
    animeNewsNetworkApi.getByTitle(search,result=>{
       let ids = [];
       if (result){
        result.forEach(anime => {
            ids.push(anime.id);
        });
        animeNewsNetworkApi.getById(ids,result=>{
            res.send(JSON.stringify(result));
        })
       }
    });
});
//Profile
app.get("/profile/profile",function(req,res){
    //Get reviews, threads, comments
    let profile = {email:req.session.user.email,reviews:[],threads:[],comments:[]};
    res.send(profile);
});
//Profile Edit
app.get("/profileedit/profile",function(req,res){
    let profileEdit = {email:req.session.user.email,password1:req.session.user.password,password2:""}
    res.send(JSON.stringify(profileEdit));
});
//Thread Edit
app.get("/threadedit/anime", function(req,res){
    animeNewsNetworkApi.getById([req.session.threadEdit.animeid],result=>{
        res.send(JSON.stringify(result[0]));
    });
});
app.get("/threadedit/get", function(req,res){
    //gets thread by id
    if(req.session.theadEdit && req.session.threadEdit.hasOwnProperty('id')){
        db.collection('threads').findOne({_id:req.session.threadEdit.id}, function(err, result){
            if (err) throw error
            res.send(JSON.stringify(result));
        });
    } else {
        res.send(JSON.stringify({title:"", thread:"", authorid:"", author:"", date: null}));
    }
});
app.post("/threadedit/save", function(req,res){
    //saves thread
    if (req.session.threadEdit.id){
        req.body.params.thread._id = req.session.threadEdit.id;
    }
    if (req.session.threadEdit.animeid){
        req.body.params.thread.id = req.session.threadEdit.animeid;
    }
    req.session.user = {_id:0,email:"John@Smith.co.uk", password:"P@ssw0rd", date: new Date()};
    req.body.params.thread.authorid = req.session.user._id;
    req.body.params.thread.author = req.session.user.email;
    req.body.params.thread.date = new Date();
    console.log(req.body.params.thread);
    db.collection('threads').save(req.body.params.thread);
    res.send(200);
});
//Review Edit
app.get("/reviewedit/anime", function(req,res){
    animeNewsNetworkApi.getById([req.session.reviewEdit.animeid],result=>{
        res.send(JSON.stringify(result[0]));
    });
});
app.get("/reviewedit/get", function(req,res){
    //gets review by id
    if(req.session.reviewEdit && req.session.reviewEdit.hasOwnProperty('id')){
        db.collection('threads').findOne({_id:req.session.reviewEdit.id}, function(err, result){
            if (err) throw error
            res.send(JSON.stringify(result));
        });
    } else {
        res.send(JSON.stringify({rating:0, title:"", review:"", authorid:"", author:"", date: null}));
    }
});
app.post("/reviewedit/save", function(req,res){
    //saves review
    if (req.session.reviewEdit.id){
        req.body.params.review.id = req.session.reviewEdit.id;
    }
    if (req.session.reviewEdit.animeid){
        req.body.params.thread.id = req.session.reviewEdit.animeid;
    }
    req.body.params.review.authorid = req.session.user._id;
    req.body.params.review.author = req.session.user.email;
    req.body.params.date = new Date();
    db.collection('reviews').save(req.body.params.review);
    res.send(200);
 });
//General
app.get("/comments", async function(req,res){
    //Returns comments related to a parent by id
    //Need to write a recursive function that returns an array of comments that is appended to replies 
    let commentTest = await getComments(req.query.id);
    console.log(commentTest);
    let comments = [{comment:"I AM A COMMENT",author:"Aldo",date:Date(),replies:[{comment:"I AM A COMMENT",author:"Aldo",date:Date(),replies:[]}]}];
    res.send(JSON.stringify(comments));
});

async function getComments(id,callback){
    let result = await db.collection("comments").find({id:id}).toArray();
    for (let comment of result){
        let replies = await getComments(comment.id);
        comment.replies = replies;
    }
    return result;
}

app.post('/signup',function(req,res){
    //sign up goes here
    req.body.email;req.body.password;
    res.send(400);
});
app.post("/login", function(req,res){
    //Login goes here
    //Connor this is how you get values in post
    req.body.email;req.body.password;
    //Fetch and check if exists
    //db.collection('profiles').fetchOne({email:r,password:})
    res.send(400);
});
app.post("/contactus", function(req,res){
    //Contact Us goes here
});
//Popups
//Anime
app.get("/popup/anime", async function(req,res){
    //Returns details about an anime from AnimeNetwork api
    //and whatever we have stored
    console.log(req.query);
    let anime = {};
    anime.threads = await db.collection("threads").find({id:req.query.id}).toArray();
    for (let thread in anime.threads){
        thread.comments = await comments(thread.id);
    }
    anime.reviews = await db.collection("reviews").find({id:req.query.id}).toArray();
    for (let review in anime.reviews){
        review.comments = await comments(review.id);
    }
    anime.streaming =  streamingSiteData.filter(function(item){return req.query.title.toLowerCase().indexOf(item.name.toLowerCase()) != -1});
    res.send(JSON.stringify(anime));
});
app.post("/popup/anime/addReview", function(req,res){
    req.session.reviewEdit = {id:null,animeid:req.body.params.id};
    res.send(200);
});
app.post("/popup/anime/addThread", function(req,res){
    req.session.threadEdit = {id:null,animeid:req.body.params.id};
    res.send(200);
})
app.post("/popup/anime/addComment", function(req,res){
    db.collection("comments").insert({id:req.body.id,comment:req.body.params.comment,authorid:req.sesssion.user._id,author:req.session.user.email,date:new Date()});
    res.send(200);
});

//Admin
app.get("/admin", function(req,res){
    //Temp to be deleted later
    db.collection('admin').remove();
    db.collection('admin').save({page:"adminHome", usersOnline:0, accountsCreated:0, contactedUs:0, reviewsPosted:0, threadsStarted:0, commentsPosted:0});
    db.collection('profiles').insert([
        {_id:0,email:"John@Smith.co.uk", password:"P@ssw0rd", date: new Date()},
        {_id:1,email:"John@Smith.co.uk", password:"P@ssw0rd", date: new Date()},
        {_id:2,email:"John@Smith.co.uk", password:"P@ssw0rd", date: new Date()}
    ]);
    db.collection('reviews').insert([
        {score:100, title:"Title", review:"", authorid:"", author:"Author", date: new Date()},
        {score:100, title:"Title", review:"", authorid:"", author:"Author", date: new Date()},
        {score:100, title:"Title", review:"", authorid:"", author:"Author", date: new Date()}
    ]);
    db.collection('threads').insert([
        {title:"Title", thread:"", authorid:"", author:"Author", date: new Date()},
        {title:"Title", thread:"", authorid:"", author:"Author", date: new Date()},
        {title:"Title", thread:"", authorid:"", author:"Author", date: new Date()}
    ]);
    db.collection('comments').insert([
        {id:"",comment:"", authorid:"",author:"Author", date: new Date()},
        {id:"", comment:"", authorid:"",author:"Author" ,date: new Date()},
        {id:"", comment:"", authorid:"",author:"Author", date: new Date()}
    ]);
    //Will add check to see if user is Admin later
    res.sendFile(path.join(__dirname + "/admin.html"));
});
//Admin Home Data
app.get("/admin/home", async function(req,res){
    //Add check for if admin
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
app.get("/admin/lists", function(req,res){

});
app.post("/admin/lists/add", function(req,res){

});
app.post("/admin/lists/remove", function(req,res){

});
app.post("/admin/lists/search", function(req,res){

});

//Admin Popups
//Profile
app.post("/admin/popup/profile/delete",function(req,res){
    db.collection('profiles').deleteOne(req.body, function(err, result){
        if (err) throw err;
    });
});
app.post("/admin/popup/profile/save",function(req,res){
    let profile = req.body.profile;

    db.collection('profiles').updateOne({_id:profile._id},profile,function(err,result){
        if (err) throw err;
    });
});
app.post("/admin/popup/profile/suspend",function(req,res){
    let profile = req.body.profile;
    profile.suspend = !profile.suspend;

    db.collection('profiles').updateOne({_id:profile._id},profile,function(err,result){
        if (err) throw err;
    });
});
//Review
app.post("/admin/popup/review/delete",function(req,res){
    db.collection('reviews').deleteOne(req.body, function(err, result){
        if (err) throw err;
    });
});
app.post("/admin/popup/review/save",function(req,res){
    var review = req.body.review;

    db.collection('profiles').updateOne({_id:review._id},review,function(err,result){
        if (err) throw err;
    });
});
//Thread
app.post("/admin/popup/thread/delete",function(req,res){
    db.collection('threads').deleteOne(req.body, function(err, result){
        if (err) throw err;
    });
});
app.post("/admin/popup/thread/save",function(req,res){
    var thread = req.body.thread;

    db.collection('threads').updateOne({_id:thread._id},thread,function(err,result){
        if (err) throw err;
    });
});
//Comment
app.post("/admin/popup/comment/delete",function(req,res){
    db.collection('comments').deleteOne(req.body, function(err, result){
        if (err) throw err;
    });
});
app.post("/admin/popup/comment/save",function(req,res){
    var comment = req.body.comment;

    db.collection('comment').updateOne({_id:comment._id},comment,function(err,result){
        if (err) throw err;
    });
});
