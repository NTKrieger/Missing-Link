//dependencies
const config = require('./config/var.js')
const Twit = require('twit')
const WebSocketClient = require('websocket').client
const TwitchBot = require('twitch-bot');
const admin = require('firebase-admin');
const serviceAccount = require('./config/lushbotcsr-firebase-adminsdk-av3k3-bae2be72c9.json');
const firebase = require("firebase");

//initialize
firebase.initializeApp(config.fbConfig)
const client = new WebSocketClient()
const T = new Twit(config.twitterConfig)
const Bot = new TwitchBot({
  username: config.botUserName,
  oauth: 'oauth:' + config.botChatOAuth,
  channels: [config.twitchChannel]
})

// DeepBot
client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString())
})
client.on('connect', function(connection) {
    console.log('WebSocket Client Connected')
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString())
    })
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed')
    })
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'")
        }
    })
    function apiRegister() {
      if (connection.connected) {
        connection.sendUTF("api|register|" + config.deepBotSecret)
      }
    }
    function addPoints() {
      if (connection.connected) {
        connection.sendUTF("api|add_points|" + config.twitchName + config.pointsToAward)
      }
    }  
    apiRegister()
    addPoints()
    Bot.say(config.twitchName + " has been awarded " + config.pointsToAward + " beers!")
})

// Twitch Bot
Bot.on('error', err => {
  console.log(err)
})
Bot.on('join', () => {
  Bot.on('message', chatter => { 
    var someString = chatter.message;
    var index = someString.indexOf(` `);  // Gets the first index where a space occours
    var command = someString.substr(0, index); // Gets the first part
    var params = someString.substr(index + 1);  // Gets the text part       
    if(command == '!link') {
      writeUserData(chatter.username, params)
      Bot.say(chatter.username + " has been added to the database!  You can now earn " + config.deepBotCurrency + " for spreading the good news!")
    }
  })
})

//Twitter bot
function checkForRetweets(arg){
  var params = {
    id: config.retweetID,
    count: 10,
    trim_user: false,
  }

  if(config.rateLimitFlag == 0){
    T.get('statuses/retweets', params, function(err, data, response){
      config.rateLimitFlag = 1
      if(err){
        console.log(err)
      }
      if(config.previousResults.length == data.length) //if there are new reweets, don't iterate
        return;
      config.previousResults = data;
      for(i=0; i < data.length; ++i){
        searchForMatch(data[i].user.screen_name)
      }
    })
  }else{
    T.get('statuses/retweeters/ids', params, function(err, data, response){
      config.rateLimitFlag = 0
      if(err){
        console.log(err)
      }
      if(config.previousResults.length == data.length) //if there are new reweets, don't iterate
        return;
      config.previousResults = data;
      for(i=0; i < data.length; ++i){
        searchForMatch(data[i].user.screen_name)
      }
    })
  }

  T.get('application/rate_limit_status', function(err, data, response){
    if(err){
      console.log(err)
    } else {
      console.log(data.resources.statuses)
    }
  })
}

 //Firebase functions
function writeUserData(twitchName, twitterName) {
  firebase.database().ref('users/'+ twitterName).set({
      twitchID: twitchName,
      twitterID: twitterName,
      lastReward: config.lastReward,
  });
}

function rewardTimestamp(twitterName){
  firebase.database().ref('users/'+ twitterName).set({
    twitchID: config.twitchName,
    twitterID: config.twitterName, 
    lastReward: Date.now(),
  });
}

function searchForMatch(twitterName) {
  var db = firebase.database();
  var ref = db.ref("users");
  ref.once("value", function (snap) {
    snap.forEach(function (childSnap) {
      var results = childSnap.val();
      if (results.lastReward < config.sessionStart - config.dayInMs) {
        config.lastReward = results.lastReward;
        config.twitchName = results.twitchID;
        config.twitterName = results.twitterID;
        client.connect('ws://localhost:3337/');
        rewardTimestamp(results.twitterID);
      }
    })
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
}

//execution
setInterval(function(){checkForRetweets()}, 5000);
