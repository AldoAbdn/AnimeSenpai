//Server.js
//Main Node Server File

//Setup
const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const session = require('express-session'); 
const https = require('https');
const url = "mongodb://localhost:27017/anime_senpai";
const becauseMoeUrl = "https://bcmoe.blob.core.windows.net/assets/uk.json";
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

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
});
app.post('/signup',function(req,res){
    //sign up goes here
});
app.post("/login", function(req,res){
    //Login goes here
});
app.post("/contactus", function(req,res){
    //Contact Us goes here
});
//Popups
//Anime 
app.get("/popup/anime", function(req,res){
    //Returns details about an anime from AnimeNetwork api
    //and whatever we have stored 
});
app.get("/popup/anime/threads", function(req,res){
    //Gets threads related to an anime
});
app.get("/popup/anime/reviews", function(req,res){
    //Gets reviews related to an anime
});
app.get("/popup/anime/streaming", function(req,res){
    console.log(streamingSiteData);
    let sites = streamingSiteData.filter(anime => anime.name.toLowerCase().valueOf() == req.query.anime.toLowerCase().valueOf());
    res.send(JSON.stringify(sites));
});

//Admin
app.get("/admin", function(req,res){
    //Temp to be deleted later 
    db.collection('admin').remove();
    db.collection('admin').save({page:"adminHome", usersOnline:0, accountsCreated:0, contactedUs:0, reviewsPosted:0, threadsStarted:0, commentsPosted:0});
    db.collection('profiles').insert([
        {username:"John Smith", email:"John@Smith.co.uk", password:"P@ssw0rd", date: new Date()},
        {username:"John Smith", email:"John@Smith.co.uk", password:"P@ssw0rd", date: new Date()},
        {username:"John Smith", email:"John@Smith.co.uk", password:"P@ssw0rd", date: new Date()}
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

//Post Requests
/*Examples
app.post('/quotes', function(req,res){
    db.collection('quotes').save(req.body,function(err, result){
        if (err) throw err;
        console.log('saved to database');
        res.redirect('/');
    });
});

app.post('/quotes', function(req,res){
    db.collection('quotes').save(req.body,function(err, result){
        if (err) throw err;
        console.log('saved to database');
        res.redirect('/');
    });
});

app.post('/search', function(req,res){
    db.collection('quotes').find(req.body).toArray(function(err,result){
        if (err) throw err;

        var output = "<h1>All the quotes</h1>";

        for (var i = 0; i < result.length; i++){
            output += "<div>";
            output += "<h3>" + result[i].name + "</h3>";
            output += "<p>" + result[i].quote + "</p>";
            output += "</div>";
        }
        res.send(output);
    });
});

app.post('/delete',function(req,res){
    db.collection('quotes').deleteOne(req.body, function(err, result){
        if (err) throw err;
        res.redirect('/');
    });
});

app.post('/update',function(req,res){
    var query = {quote:req.body.quote};
    var newvalues = {$set: {name:req.body.newname, quote:req.body.newquote}};
    
    db.collection('quotes').updateOne(query,newvalues,function(err,result){
        if (err) throw err;
        res.redirect('/');
    });
});
*/


