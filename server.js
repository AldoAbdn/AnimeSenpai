//Server.js
//Main Node Server File

//Setup
const MongoClient = require('mongodb').MongoClient;
const express = require('express');
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

//Get Requests
/*Example
app.get('/all',function(req,res){
    db.collection('quotes').find().toArray(function(err,result){
        if (err) throw err;

        var output = "<h1>All the quotes</h1>";

        for (var i = 0; i < result.length; i++){
            output += "<div>";
            output += "<h3>" + result[i].name + "</h3>";
            output += "<p>" + result[i].quote + "</p>";
        }
        res.send(output);
    });
});
*/
app.get("/", function(req,res){
    res.sendFile(path.join(__dirname + "/index.html"));
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


