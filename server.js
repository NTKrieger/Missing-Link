var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");
var config = require("./config/data.json");
var opn = require('opn');
var server = express();

server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json())
server.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

server.get("/data", (req, res, next) => {
    res.json(config)
})

server.post("/data", (req, res, next) => {  
    let newDataObject = {
        "pointsToAward": req.body.pointsToAward,
        "retweetID" : req.body.retweetID,
        "twitchUserName": req.body.twitchUserName,
        "botUserName": req.body.botUserName,
        "botChatOAuth": req.body.botChatOAuth,
        "deepBotSecret": req.body.deepBotSecret,
        "deepBotCurrency": req.body.deepBotCurrency,                                       
        "consumer_key": req.body.consumer_key,
        "consumer_secret": req.body.consumer_secret,
        "access_token": req.body.access_token,
        "access_token_secret": req.body.access_token_secret,
        "fbConfig": {
            "apiKey": "AIzaSyAgpIqtUQyTRbgRDiE6vaB94j3YalAUyO0",
            "authDomain": "lushbotcsr.firebaseapp.com",
            "databaseURL": "https://lushbotcsr.firebaseio.com",
            "projectId": "lushbotcsr",
            "storageBucket": "lushbotcsr.appspot.com",
            "messagingSenderId": "742128681937"
        },
        "twitchName": "",
        "twitterName": "",
        "lastReward": "",
        "previousResults": "",
        "sessionStart": "",
        "rateLimitFlag": "",
    }
    fs.writeFile("./config/data.json", JSON.stringify(newDataObject), (err)=>{
        if (err) throw err
        console.log("Saved!")
    })
    res.send({"status": 200, "data" : "wooooo"} )
    res.end("yes")
})

server.listen(3000, () => {
    console.log("Server running on port 3000")
    opn('./settings.html')
})