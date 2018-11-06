//dependencies
const config = require('./config/data.json');
const Twit = require('twit');
const WebSocket = require('ws');
const TwitchBot = require('twitch-bot');
const firebase = require("firebase");
const EventEmitter = require('events');

//initialize
firebase.initializeApp(config.fbConfig)
const T = new Twit(config.twitterConfig)
const Bot = new TwitchBot({
  username: config.botUserName,
  oauth: 'oauth:' + config.botChatOAuth,
  channels: ['#' + config.twitchUserName]
})

//event system
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
myEmitter.on('event', (twitterName) => {
  rewardMessage()
  awardPoints()
  rewardTimestamp(twitterName)
});

// Twitch Bot
Bot.on('error', err => {
  console.log(err)
})
Bot.on('join', () => {
  Bot.on('message', chatter => { 
    var someString = chatter.message;
    var index = someString.indexOf(` `);  
    var command = someString.substr(0, index);
    var params = someString.substr(index + 1);       
    if(command == '!link') {
      writeUserData(chatter.username, params)
      Bot.say(chatter.username + " has been added to the database!  You can now earn " + config.deepBotCurrency + " for spreading the good news!")
    }
    if(params == '!flex' && chatter.username == "djtangent") {
      Bot.say("DJ TANGENT IS THE GREATEST")
    }
    if(params == '!MLregister' && chatter.username == config.twitchUserName){
      Bot.say("Welcome to Missing Link!  To register for rewards in this channel, type '!link' followed by a space and then your Twitter handle.")
    }
    if(params == '!MLinfo' && chatter.username == config.twitchUserName){
      Bot.say("Retweet me to earn " + config.pointsToAward + " " + config.deepBotCurrency + "! " + "www.twitter.com/LushIsDrunk/statuses/" + config.retweetID)
    }
  })
})

function rewardMessage(){
    Bot.say(config.twitchName + " has been awarded " + config.pointsToAward + " " + config.deepBotCurrency)
}

//DeepBot websocket
function awardPoints(){
  const ws = new WebSocket('ws://127.0.0.1:3337/')
  ws.on('open', function open() {
    ws.send("api|register|" + config.deepBotSecret)
    ws.send("api|add_points|" + config.twitchName + "|" + config.pointsToAward) 
  });
}

//Twitter bot
function checkForRetweets(){
  var params = {
    id: config.retweetID,
    count: 10,
    trim_user: false,
    stringify_ids: true,
  }
  var endpoints = ['statuses/retweets', 'statuses/retweeters/ids', 'users/show']
  var toggle = function(x){
    if(x==0)
      return 1
    else 
      return 0
  }
  T.get(endpoints[config.rateLimitFlag], params, function(err, data, response){
    if(err){
      console.log(err)
    }
    if(data.length != 0){
      if(config.rateLimitFlag == 0){
        if(config.previousResults == data[0].user.id){
          return;
        } else {
          for(i=0; i < data.length; ++i){
            searchForMatch(data[i].user.screen_name)
          }
        }
        config.previousResults = data[0].user.id_str
      } else {
        if(config.previousResults == data.ids[0]){
          return;
        } else {
          for(i=0; i < data.ids.length; ++i){
            T.get(endpoints[2], {"user_id" : data.ids[i]}, function(err, data, response){
              if(err){
                console.log(err)
              } else {
                searchForMatch(data.screen_name)
              }
            })
          }
        }
        config.previousResults = data.ids[0]
      }
      config.rateLimitFlag = toggle(config.rateLimitFlag)
    }
  })
}

//Firebase functions
function writeUserData(twitch, twitter){ 
  var recordName = twitter.toString().toLowerCase();
  firebase.database().ref('users/'+ recordName).set({
      twitchID: twitch,
      twitterID: twitter.toLowerCase(),
      lastReward: config.lastReward,
  });
}

function rewardTimestamp(twitterName){
  firebase.database().ref('users/'+ twitterName.toLowerCase()).set({
    twitchID: config.twitchName,
    twitterID: config.twitterName, 
    lastReward: Date.now(),
  });
}

function searchForMatch(twitter) {
  twitterName = twitter.toLowerCase()
  var db = firebase.database()
  var ref = db.ref("users")
  ref.once("value", function (snap) {
    snap.forEach(function (childSnap) {
      var results = childSnap.val()
      if(results.twitterID == twitterName){
        if(results.lastReward < config.sessionStart){
            config.twitchName = results.twitchID
            config.twitterName = results.twitterID
            myEmitter.emit('event', twitterName)
        }
      }
    })
  },function (errorObject) {
    console.log("The read failed: " + errorObject.code)
  });
}

setInterval(()=>{checkForRetweets()}, 5000);