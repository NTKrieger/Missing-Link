const express = require("express");
const bodyParser = require("body-parser");
const exec = require('child_process').exec
const opn = require('opn');
const sqlite3 = require('sqlite3').verbose();
const URL = require('url').URL;
const server = express();
let globals = {
    settingsString: "none",
    settingsProfile: 0,
}

//initialize db and server, load settings, launch server, open UI
let db = new sqlite3.Database('./data/users.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});
db.serialize(()=>{
    let sql = "CREATE TABLE IF NOT EXISTS settings(profile INTEGER PRIMARY KEY NOT NULL UNIQUE, data TEXT)"
    db.run(sql)
})
db.serialize(()=>{
    let sql = "CREATE TABLE IF NOT EXISTS users(twitchID TEXT PRIMARY KEY NOT NULL UNIQUE, twitterID TEXT NOT NULL UNIQUE, reward_Timestamp INTEGER)"
    db.run(sql)
})

server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json())
server.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

server.listen(30000, () => {
    console.log("Server running on port 3000")
})

//execution
winston.info('server.js ran')
loadSettings()
opn('./settings.html')

//services
server.get("/data", (req, res) =>{
    if(globals.settingsString != "none")
        res.send(JSON.parse(globals.settingsString))
})

server.get("/restart", (req, res) => {
    exec("node server.js", ()=> {
        process.exit();
    })
})

server.get("/close", (req, res) => {
        process.exit();
})

server.post("/data", (req, res, next) => {  
    let newDataObject = {
        "pointsToAward": req.body.pointsToAward,
        "retweetID" : getSnowflakeFromURL(req.body.retweetURL),
        "tweetOwner" : getTwitterUserFromURL(req.body.retweetURL),
        "twitchUserName": req.body.twitchUserName,
        "botUserName": req.body.botUserName,
        "botChatOAuth": req.body.botChatOAuth,
        "deepBotSecret": req.body.deepBotSecret,
        "deepBotCurrency": req.body.deepBotCurrency,                                       
        "consumer_key": req.body.consumer_key,
        "consumer_secret": req.body.consumer_secret,
        "access_token": req.body.access_token,
        "access_token_secret": req.body.access_token_secret,
        "sessionStart": Date.now(),
    }
    saveSettings(globals.settingsProfile, newDataObject)
    opn('backend.js', {app: 'node'})
    winston.info('tried to open backend.js from server.js')
    res.send({"status": 200, "data" : "awwwYEAH!"})
    res.end("yes")
})
//db functions
function saveSettings(profile, data){  
    db.serialize(()=>{
        let sql = "INSERT OR REPLACE INTO settings(profile, data) VALUES(" + "'" + profile + "'" + ", '"  + JSON.stringify(data) + "')"
        db.run(sql, (err)=>{
            if (err){
              console.log(err)
            }
        })
    })
}
function loadSettings(){
    db.serialize(()=>{
        let sql = "SELECT * FROM settings"
        db.get(sql ,(err, row) => {
            if (err){
                return console.error(err)
            }
            if(typeof row === "undefined"){
                return console.log("no saved settings")
            }else{
                globals.settingsString = row.data
            }                   
        })
    })
}
//url parsers
function getSnowflakeFromURL(urlString){
    var myURL = new URL(urlString);
    var pathArray = myURL.pathname.split('/')
    var snowflake = pathArray[pathArray.length - 1]
    var user = pathArray[pathArray.length - 3]
    return snowflake
}
function getTwitterUserFromURL(urlString){
    var myURL = new URL(urlString);
    var pathArray = myURL.pathname.split('/')
    var user = pathArray[pathArray.length - 3]
    return user
}