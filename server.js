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
    //Temp to be deleted later 
    db.collection('admin').save({page:"adminHome", usersOnline:0, accountsCreated:0, contactedUsToday:0, reviewsPosted:0, threadsStarted:0, commentsPosted:0});
    db.collection('profiles').insert([
        {username:"John Smith", email:"John@Smith.co.uk", password:"P@ssw0rd", date: new Date()},
        {username:"John Smith", email:"John@Smith.co.uk", password:"P@ssw0rd", date: new Date()},
        {username:"John Smith", email:"John@Smith.co.uk", password:"P@ssw0rd", date: new Date()}
    ]);
    db.collection('reviews').insert([
        {title:"Title", review:"", author:"Author", date: new Date()},
        {title:"Title", review:"", author:"Author", date: new Date()},
        {title:"Title", review:"", author:"Author", date: new Date()}
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


