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
const Mongo = require('mongodb');
const MongoClient = Mongo.MongoClient;
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

async function getComments(id,callback){
    let result = await db.collection("comments").find({id:id}).toArray();
    for (let comment of result){
        comment.comments = await getComments(comment._id);
    }
    return await result;
}

function updateAdmin(attr){
    db.collection("admin").update({page:"adminHome"},{$inc:{attr}});
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
    //Fake test user;
    req.session.user = {_id:0,email:"John@Smith.co.uk", password:"P@ssw0rd", date: new Date()};
    res.sendFile(path.join(__dirname + "/index.html"));
});
app.get("/home/get",async function(req,res){
    let home = {anime:{},search:""};
    home.anime.specialBlend = [];
    home.anime.classics = await db.collection("classics").find().toArray();
    home.anime.bestAmerican = await db.collection("bestAmerican").find().toArray();
    home.anime.bestIndie = await db.collection("bestIndie").find().toArray();
    let ids = [];
    for (let category in home.anime){
        for (let entry of home.anime[category]){
            console.log(entry.id);
            ids.push(entry.id);
            console.log(ids);
        }
    }
    animeNewsNetworkApi.getById(ids,anime=>{
        console.log(anime);
        home.anime.specialBlend = anime.filter(anime=>{home.anime.specialBlend.forEach(item=>{if(anime.id==item.id)return true;});return false;});
        home.anime.classics = anime.filter(anime=>{console.log(anime.id);home.anime.classics.forEach(item=>{if(anime.id==item.id)return true;});return false;});
        home.anime.bestAmerican = anime.filter(anime=>{home.anime.bestAmerican.forEach(item=>{if(anime.id==item.id)return true;});return false;});
        home.anime.bestIndie = anime.filter(anime=>{home.anime.bestIndie.forEach(item=>{if(anime.id==item.id)return true;});return false;});
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
app.get("/profile/profile",async function(req,res){
    //Get reviews, threads, comments
    let profile = {email:req.session.user.email,reviews:[],threads:[],comments:[]};
    profile.reviews = await db.collection("reviews").find({authorid:req.session.user._id}).toArray();
    profile.threads = await db.collection("threads").find({authorid:req.session.user._id}).toArray();
    profile.comments = await db.collection("comments").find({authorid:req.session.user._id}).toArray();
    res.send(profile);
});
app.delete("/profile/delete/review",async function(req,res){
    let result = await db.collection("reviews").deleteOne({_id:new Mongo.ObjectID(req.query.id)});
    res.send(200);
});
app.delete("/profile/delete/thread", async function(req,res){
    let result = await db.collection("threads").deleteOne({_id:new Mongo.ObjectID(req.query.id)});
    res.send(200);
});
app.delete("/profile/delete/comment", async function(req,res){
    let result = await db.collection("comments").deleteOne({_id:new Mongo.ObjectID(req.query.id)});
    res.send(200);
});
//Profile Edit
app.get("/profileedit/profile",function(req,res){
    let profileEdit = {email:req.session.user.email,password1:req.session.user.password,password2:""}
    res.send(JSON.stringify(profileEdit));
});
app.post("/profileedit/profile/edit",async function(req,res){
   await db.collection("profiles").updateOne({_id:new Mongo.ObjectID(req.session.user._id)},{email:req.body.params.profile.email,password:req.body.params.profile.password1},{upsert:true})
    req.session.user = await db.collection("profiles").findOne({_id:new Mongo.ObjectID(req.session.user._id)});
    res.send(200);
});
//Thread Edit
app.get("/threadedit/anime", function(req,res){
    animeNewsNetworkApi.getById([req.session.threadEdit.animeid],result=>{
        res.send(JSON.stringify(result[0]));
    });
});
app.get("/threadedit/get", function(req,res){
    //gets thread by id
    if(req.session.threadEdit != null){
        db.collection('threads').findOne({_id:new Mongo.ObjectID(req.session.threadEdit.id)}, function(err, result){
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
    updateAdmin({threadsCreated:1});
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
    console.log(req.session.reviewEdit);
    //gets review by id
    if(req.session.reviewEdit.id != null){
        db.collection('reviews').findOne({_id:new Mongo.ObjectID(req.session.reviewEdit.id)}, function(err, result){
            if (err) throw error
            console.log(result);
            res.send(JSON.stringify(result));
        });
    } else {
        console.log("alt");
        res.send(JSON.stringify({rating:0, title:"", review:"", authorid:"", author:"", date: null}));
    }
});
app.post("/reviewedit/save",function(req,res){
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
    res.send(200);
 });
//General
app.get("/comments", async function(req,res){
    //Returns comments related to a parent by id
    //Need to write a recursive function that returns an array of comments that is appended to replies 
    let comments = await getComments(req.query.id);
    res.send(JSON.stringify(await comments));
});

app.post('/signup',function(req,res){
    //sign up goes here
    updateAdmin({accountsCreated:1});
    if(!rec.session.loggedin){res.redirect("/login");return}
    res.render("/signup")
});
app.post("/login", function(req,res){
    //Login goes here
    //Connor this is how you get values in post
    //req.body.email;req.body.password;
    var email = req.query.email;
    var password = req.query.password;

    db.collection("profiles").findOne({"login.email":email}, function(err, result){
      if (err) throw err;
      if(!result){res.redirect('/login');return}
      if(result.login.password == password){ req.session.loggedin = true; res.redirect('/')}
      else {
        updateAdmin({usersOnline:1});
        req.session.regenerate(function(err){
            if (err) throw err;
            req.session.user = result;
            res.redirect('/')
        });
      }
    })
    //Fetch and check if exists
    //db.collection('profiles').fetchOne({email:r,password:})
    res.send(400);
});
app.post("/logout", function(req,res){
    updateAdmin({usersOnline:-1});
    req.session.destroy();
});
app.post("/contactus", function(req,res){
    //Contact Us goes here
    updateAdmin({contactedUs:1});
});
//Popups
//Anime
app.get("/popup/anime", async function(req,res){
    //Returns details about an anime from AnimeNetwork api
    //and whatever we have stored
    let anime = {};
    anime.threads = await db.collection("threads").find({id:req.query.id}).toArray();
    for (let thread of anime.threads){
        thread.comments = await getComments(thread._id);
    }
    anime.reviews = await db.collection("reviews").find({id:req.query.id}).toArray();
    for (let review of anime.reviews){
        review.comments = await getComments(review._id);
    }
    anime.streaming =  streamingSiteData.filter(function(item){return req.query.title.toLowerCase().indexOf(item.name.toLowerCase()) != -1});
    res.send(JSON.stringify(await anime));
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
    db.collection("comments").insert({id:req.body.params.id,comment:req.body.params.comment,authorid:req.session.user._id,author:req.session.user.email,date:new Date()});
    updateAdmin({reviewsCreated:1});
    res.send(200);
});

//Admin
app.get("/admin", function(req,res){
    //Temp to be deleted later
    db.collection('admin').remove();
    db.collection('admin').save({_id:Mongo.ObjectID(0),page:"adminHome", usersOnline:0, accountsCreated:0, contactedUs:0, reviewsCreated:0, threadsCreated:0, commentsCreated:0});
    db.collection('profiles').insert([
        {_id:0,email:"John@Smith.co.uk", password:"P@ssw0rd", date: new Date()},
        {_id:1,email:"John@Smith.co.uk", password:"P@ssw0rd", date: new Date()},
        {_id:2,email:"John@Smith.co.uk", password:"P@ssw0rd", date: new Date()}
    ]);
    db.collection('reviews').insert([
        {rating:100, title:"Title", review:"", authorid:"", author:"Author", date: new Date()},
        {rating:100, title:"Title", review:"", authorid:"", author:"Author", date: new Date()},
        {rating:100, title:"Title", review:"", authorid:"", author:"Author", date: new Date()}
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
app.get("/admin/lists",async function(req,res){
    let lists = {classics:[],bestAmerican:[],bestIndie:[]};
    lists.classics = await db.collection("classics").find().toArray();
    lists.bestAmerican = await db.collection("bestAmerican").find().toArray();
    lists.bestIndie = await db.collection("bestIndie").find().toArray();
    res.send(lists);
});
app.post("/admin/lists/add",async function(req,res){
    let result = await db.collection(req.body.params.list).save(req.body.params.anime);
    res.send(200);
});
app.delete("/admin/lists/delete",async function(req,res){
    let result = await db.collection(req.query.list).deleteOne({id:req.query.id});
    res.send(200);
});
//Admin Popups
//Profile
app.delete("/admin/popup/profile/delete",function(req,res){
    db.collection('profiles').deleteOne(req.body, function(err, result){
        if (err) throw err;
    });
});
app.post("/admin/popup/profile/save",function(req,res){
    let profile = req.body.profile;

    db.collection('profiles').updateOne({_id:new Mongo.ObjectID(profile._id)},profile,function(err,result){
        if (err) throw err;
    });
});
app.post("/admin/popup/profile/suspend",function(req,res){
    let profile = req.body.profile;
    profile.suspend = !profile.suspend;

    db.collection('profiles').updateOne({_id:new Mongo.ObjectID(profile._id)},profile,function(err,result){
        if (err) throw err;
    });
});
//Review
app.delete("/admin/popup/review/delete",function(req,res){
    db.collection('reviews').deleteOne(req.body, function(err, result){
        if (err) throw err;
    });
});
app.post("/admin/popup/review/save",function(req,res){
    var review = req.body.review;

    db.collection('profiles').updateOne({_id:new MongoClinet.ObjectID(review._id)},review,function(err,result){
        if (err) throw err;
    });
});
//Thread
app.delete("/admin/popup/thread/delete",function(req,res){
    db.collection('threads').deleteOne(req.body, function(err, result){
        if (err) throw err;
    });
});
app.post("/admin/popup/thread/save",function(req,res){
    var thread = req.body.thread;

    db.collection('threads').updateOne({_id:new Mongo.ObjectID(thread._id)},thread,function(err,result){
        if (err) throw err;
    });
});
//Comment
app.delete("/admin/popup/comment/delete",function(req,res){
    db.collection('comments').deleteOne(req.body, function(err, result){
        if (err) throw err;
    });
});
app.post("/admin/popup/comment/save",function(req,res){
    var comment = req.body.comment;

    db.collection('comment').updateOne({_id:new Mongo.ObjectID(comment._id)},comment,function(err,result){
        if (err) throw err;
    });
});
