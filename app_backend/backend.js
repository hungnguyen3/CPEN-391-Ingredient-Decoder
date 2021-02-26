var express = require("express");
var bodyparser = require("body-parser");
var app = express();

app.use(bodyparser.json({limit: '50mb'}));

const port1 = process.env.PORT || 3000;

var MongoClient = require("mongodb").MongoClient;
const ID = require("mongodb").ObjectId

MongoClient.connect("mongodb://localhost:27017",
    { useUnifiedTopology: true },
    (err, client) =>{
        const db = client.db("list");
        const db_logic = client.db("logic");
        app.post('/compareplist', function(req,res){
            db.collection("account").find({"username": req.body.username}).toArray(function(err,data){
                if(data.length == 1){
                    var re = "";
                    data[0].itemlist.forEach(element => {
                        if(req.body.text_d.toLowerCase().includes(element.p.toLowerCase())){
                            re = re + element.p +", ";
                        }
                    });
                    if(re.length != 0) re = re.substring(0,re.length -2);
                    res.status(200).json({ message: re});
                }
                else{
                    res.status(200).json({ message: "err plist"});
                }
            });
        });
        app.post("/signup", function(req,res){
            db.collection("account").find({"username": req.body.username}).toArray(function(err, data){
                if(data.length == 0){
                    db.collection("account").insertOne({
                        username: req.body.username,
                        password: req.body.password,
                        type: req.body.type,
                        itemlist: req.body.itemlist
                    }, (err, request) =>{});
                    res.status(200).json({ message: "sign up successfully"});
                }
                else {
                    res.status(200).json({ message: "username existed" });
                }
                
            });
            
        });
        app.post("/login", function(req,res){
            db.collection("account").find({"username": req.body.username, "password": req.body.password}).toArray(function(err, data){
                if(data.length == 1){
                    if(data[0].type == "c")
                        res.status(200).json({ message: "clogin"});
                    else if(data[0].type == "s")
                        res.status(200).json({ message: "slogin"});
                }
                else{
                    res.status(200).json({ message: "wrong"});
                }
            });
        });
        app.post("/plist",function(req,res){
            db.collection("account").find({"username": req.body.username}).toArray(function(err,data){
                console.log(data);
                if(data.length == 1){
                    res.status(200).json({ message: data[0].itemlist});
                }
                else{
                    res.status(200).json({ message: "err plist"});
                }
            });
        })
        app.post("/plist_add",function(req,res){
            db.collection("account").updateOne({"username": req.body.username}, {$push:{"itemlist":req.body.plist_add}});
            res.status(200).json({ message: "plist_add"});
        })
        app.post("/plist_clear",function(req,res){
            db.collection("account").updateOne({"username": req.body.username}, {$set:{"itemlist":[]}});
            res.status(200).json({ message: "plist_clear"});
        })
        app.post("/ilist",function(req,res){
            db.collection("account").find({"username": req.body.username}).toArray(function(err,data){
                console.log(data);
                if(data.length == 1){
                    res.status(200).json({ message: data[0].itemlist});
                }
                else{
                    res.status(200).json({ message: "err ilist"});
                }
            });
        })
        app.post("/ilist_clear",function(req,res){
            db.collection("account").updateOne({"username": req.body.username}, {$set:{"itemlist":[]}});
            db.collection("store").deleteMany({"owner": req.body.username});
            res.status(200).json({ message: "ilist_clear"});
        })
        app.post("/ilist_add",function(req,res){
            
            var addone = {
                item_name: req.body.item_name,
                item_list: req.body.item_list,
                item_image: req.body.item_image,
                owner: req.body.owner
            }
            console.log(typeof(addone));
            db.collection("account").updateOne({"username": req.body.owner}, {$push:{"itemlist": addone}});

            db.collection("store").insertOne(addone, (err, request) =>{});
            

            res.status(200).json({ message: "ilist_add"});
        })
        app.post("/search_byname",function(req,res){
            db.collection("store").find({$or:[{"owner": req.body.to_search},{"item_name":req.body.to_search}]}).toArray(function(err,data){
                res.status(200).json({ message: data});
            })
        })
        app.post("/image_get",function(req,res){
            var ObjectId = require('mongodb').ObjectId; 
            var id = req.body.search_id;  
            var o_id = new ObjectId(id);
            db.collection("store").find({_id: o_id}).toArray(function(err,data){
                console.log(req.body.search_id);
                res.status(200).json({ message: data[0]});
            })
        })
        
    }
);



module.exports = {app};