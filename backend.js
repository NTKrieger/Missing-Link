//dependencies
const config = require('./config/data.json');
const Twit = require('twit');
const WebSocket = require('ws');
const TwitchBot = require('twitch-bot');
const EventEmitter = require('events');
const sqlite3 = require('sqlite3').verbose();

//initialize twitter connection, chatbot, database
const twitterConfig = {
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token: config.access_token,
  access_token_secret: config. access_token_secret,
}
const T = new Twit(twitterConfig)
const Bot = new TwitchBot({
  username: config.botUserName,
  oauth: 'oauth:' + config.botChatOAuth,
  channels: ['#' + config.twitchUserName]
})
let db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
      return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});
db.serialize(()=>{
  let sql = "CREATE TABLE IF NOT EXISTS users(twitchID TEXT PRIMARY KEY NOT NULL UNIQUE, twitterID TEXT NOT NULL UNIQUE, reward_Timestamp INTEGER)"
  db.run(sql)
})

//event system
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
myEmitter.on('event', (twitchID) => {
  rewardMessage()
  awardPoints()
  updateTimestamp(twitchID)
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
      writeNewUser(chatter.username, params) //TODO:  WRITE IN CALLBACK TO CHECK FOR EXISTING RECORD THEN UPDATE IF NEEDED
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

//search for match
/* function searchForMatch(twitterID){
  let results = readUserRecord(twitterID.toLowerCase());
  if(typeof results === "undefined"){
    return console.error("no matches")
  }else{
    if(results.reward_Timestamp < config.sessionStart){
      config.twitchName = results.twitchID
      config.twitterName = results.twitterID
      myEmitter.emit('event', results.twitchID)
    }
  }
}
 */
//get user record from twitterID
function searchForMatch(twitterID){
  db.serialize(()=>{
      let sql = "SELECT * FROM users WHERE twitterID = '" + twitterID.toLowerCase() + "'";
      db.get(sql ,(err, row) => {
          if (err){
            return console.error(err)
          }
          let results = row
          if(typeof results === "undefined"){
            return console.error("no matches")
          }else{
            if(results.reward_Timestamp < config.sessionStart){
              config.twitchName = results.twitchID
              config.twitterName = results.twitterID
              myEmitter.emit('event', results.twitchID)
            }
          }                   
      })
  })
}

function readUserRecord(twitterID){
  db.serialize(()=>{
      let sql = "SELECT * FROM users WHERE twitterID = '" + twitterID + "'";
      db.get(sql ,(err, row) => {
          if (err){
              return console.error(err)
          }
          console.log(row)
          return row            
      })
  })
}

//write a new user to the database
function writeNewUser(twitchID, twitterID){  
  db.serialize(()=>{
      let sql = "INSERT INTO users(twitchID, twitterID) VALUES(" + "'" + twitchID + "'" + ", '"  + twitterID + "')"
      db.run(sql, (err)=>{
          if (err){
            console.error(err)
          }
      })
   })
}

//update reward timestamp
function updateTimestamp(twitchID){
  db.serialize(()=>{
      let sql = "UPDATE users SET reward_Timestamp = '" + Date.now() + "' WHERE twitchID = '" + twitchID + "'"
      db.run(sql, (err) =>{
          return console.error(err)
      })
   })
}

//update user record
function updateTwitterID(twitchID, newTwitterID){
  db.serialize(()=>{
      let sql = "UPDATE users SET twitterID = '" + newTwitterID + "' WHERE twitchID = '" + twitchID + "'"
      db.run(sql, (err) =>{
          return console.error(err)
      })
   })
}


setInterval(()=>{checkForRetweets()}, 5000);