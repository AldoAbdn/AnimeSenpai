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
                     result.ann.anime.forEach(anime => {
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
                        if(anime.ratings){
                            rating = anime.ratings[0].$.weighted_score;
                        }
                        animeArray.push(new Anime(anime.$.id,anime.$.name,genres,img,summary,rating,0));
                     });
                    callback(animeArray);
                })
            });
        });
    }
}


app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

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
app.get("/home/special", function(req,res){

});
app.get("/home/classics", function(req,res){

});
app.get("/home/bestamerican", function(req,res){

});
app.get("/home/bestindie", function(req,res){

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
//Thread Edit
app.get("/threadedit/get", function(req,res){
    //gets thread by id
});
app.post("/threadedit/save", function(req,res){
    //saves thread
});
//Review Edit
app.get("/reviewedit/get", function(req,res){
    //gets review by id
});
app.post("/reviewedit/save", function(req,res){
    //saves review
 });
//General
app.get("/comments", function(req,res){
    //Returns comments related to a parent by id
    //Need to write a recursive function that returns an array of comments that is appended to replies 
    getComments(id,comments=>{
        res.send(JSON.stringify(comments));
    });
    let comments = [{comment:"I AM A COMMENT",author:"Aldo",date:Date(),replies:[{comment:"I AM A COMMENT",author:"Aldo",date:Date(),replies:[]}]}];
    res.send(JSON.stringify(comments));
});

function getComments(id,callback){
    db.collection("comments").find({id:req.param.id},function(err,result){
        if (err) throw err;
        results.forEach(comment => {
            let replies = getComments(comment.id);
            comment.replies = replies 
        });
        if (callback){
            callback(results);
        } else {
            return results;
        }
    });
}

app.post('/signup',function(req,res){
    //sign up goes here
});
app.post("/login", function(req,res){
    //Login goes here
    //Connor this is how you get values in post
    //req.body.email;req.body.password;
    req.query.email;
    req.query.password;
    //Fetch and check if exists
    //db.collection('profiles').fetchOne({email:r,password:})
    res.send();
});
app.post("/contactus", function(req,res){
    //Contact Us goes here
});
//Popups
//Anime
app.get("/popup/anime", function(req,res){
    //Returns details about an anime from AnimeNetwork api
    //and whatever we have stored
    animeNewsNetworkApi.getById(req.query.id,result=>{
        res.send(JSON.stringify(result));
    });
});
app.get("/popup/anime/threads", function(req,res){
    //Gets threads related to an anime
    //req.query.id
    let threads = [];
    res.send(JSON.stringify(threads));
});
app.get("/popup/anime/reviews", function(req,res){
    //Gets reviews related to an anime
    let reviews = [];
    res.send(JSON.stringify(reviews));
});
app.get("/popup/anime/streaming", function(req,res){
    //Might have to do this client side instead
    var title = req.query.title.toLowerCase();
    let sites = streamingSiteData.filter(function(item){return title.indexOf(item.name.toLowerCase()) != -1});
    res.send(JSON.stringify(sites));
});
app.post("/popup/anime/addReview", function(req,res){
    req.session.addReview = {type:"review",id:req.body.id};
    res.send(200);
});
app.post("/popup/anime/addThread", function(req,res){
    req.session.addThread = {type:"thread",id:req.body.id};
    res.send(200);
})

//Admin
app.get("/admin", function(req,res){
    //Temp to be deleted later
    db.collection('admin').remove();
    db.collection('admin').save({page:"adminHome", usersOnline:0, accountsCreated:0, contactedUs:0, reviewsPosted:0, threadsStarted:0, commentsPosted:0});
    db.collection('profiles').insert([
        {email:"John@Smith.co.uk", password:"P@ssw0rd", date: new Date()},
        {email:"John@Smith.co.uk", password:"P@ssw0rd", date: new Date()},
        {email:"John@Smith.co.uk", password:"P@ssw0rd", date: new Date()}
    ]);
    db.collection('reviews').insert([
        {score:100, title:"Title", review:"", author:"Author", date: new Date()},
        {score:100, title:"Title", review:"", author:"Author", date: new Date()},
        {score:100, title:"Title", review:"", author:"Author", date: new Date()}
    ]);
    db.collection('threads').insert([
        {title:"Title", thread:"", author:"Author", date: new Date()},
        {title:"Title", thread:"", author:"Author", date: new Date()},
        {title:"Title", thread:"", author:"Author", date: new Date()}
    ]);
    db.collection('comments').insert([
        {title:"Title", comment:"", author:"Author", date: new Date()},
        {title:"Title", comment:"", author:"Author", date: new Date()},
        {title:"Title", comment:"", author:"Author", date: new Date()}
    ]);
    //Will add check to see if user is Admin later
    res.sendFile(path.join(__dirname + "/admin.html"));
});
//Admin Home Data
app.get("/admin/home", function(req,res){
    //Add check for if admin
    var adminHome;
    db.collection('admin').findOne({page:"adminHome"}, function(err, result){
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});
app.get("/admin/home/reviews", function(req,res){
    db.collection('reviews').find().sort({date: -1}).limit(5).toArray(function(err,result){
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});
app.get("/admin/home/threads", function(req,res){
    db.collection('threads').find().sort({date: -1}).limit(5).toArray(function(err,result){
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});
app.get("/admin/home/comments", function(req,res){
    db.collection('comments').find().sort({date: -1}).limit(5).toArray(function(err,result){
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});
//Account Management
app.get("/admin/accountmanagement/latest", function(req,res){

});
app.get("/admin/accountmanagement/review", function(req,res){

});
app.get("/admin/accountmanagement/loggedin", function(req,res){

});
app.get("/admin/accountmanagement/thread", function(req,res){

});
app.get("/admin/accountmanagement/suspended", function(req,res){

});
app.get("/admin/accountmanagement/comment", function(req,res){

});
app.post("/admin/accountmanagement/search", function(req,res){

});
//Post Management
app.get("/admin/postmanagement/latest", function(req,res){

});
app.get("/admin/postmanagement/review", function(req,res){

});
app.get("/admin/postmanagement/thread", function(req,res){

});
app.get("/admin/postmanagement/comment", function(req,res){

});
app.post("/admin/postmanagement/search", function(req,res){

});
//Lists
app.get("/admin/lists/classics", function(req,res){

});
app.get("/admin/lists/american", function(req,res){

});
app.get("/admin/lists/indie", function(req,res){

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
    var profile = req.body.profile;

    db.collection('profiles').updateOne({_id:profile._id},profile,function(err,result){
        if (err) throw err;
    });
});
app.post("/admin/popup/profile/suspend",function(req,res){
    var profile = req.body.profile;
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
