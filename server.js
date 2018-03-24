//Server.js
//Main Node Server File

//Setup
const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const url = "mongodb://localhost:27017/anime_senpai";
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

var db;

MongoClient.connect(url, function(err,database){
    if(err) throw err;
    db = database;
    app.listen(8080);
});

//Home
app.get("/", function(req,res){
    res.sendFile(path.join(__dirname + "/index.html"));
});

//Admin
app.get("/admin", function(req,res){
    //Will add check to see if user is Admin later
    res.sendFile(path.join(__dirname + "/admin.html"));
});
//Admin Home Data
app.get("/admin/home", function(req,res){

});
//Admin Popups
app.post("/admin/popup/delete",function(req,res){

});
app.post("/admin/popup/save",function(req,res){

});
app.post("/admin/popup/suspend",function(req,res){

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


