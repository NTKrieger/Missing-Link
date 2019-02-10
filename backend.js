//dependencies
const Twit = require('twit');
const WebSocket = require('ws');
const TwitchBot = require('twitch-bot');
const EventEmitter = require('events');
const sqlite3 = require('sqlite3').verbose();

let globals = {
  "twitchName": "",
  "twitterName": "",
  "lastReward": "",
  "previousResults": "",
  "rateLimitFlag": 0,
  "config" : {},
}

//connect to database
let db = new sqlite3.Database('./data/users.db', (err) => {
  if (err) {
      return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
})

//load settings, initialize twitter connection, chatbot, database
db.serialize(()=>{
  let sql = "SELECT * FROM settings WHERE profile = 0"
  db.get(sql ,(err, row)=>{
    if(err){
      return console.error(err)
    }else{
      //before anything can happen, we must get the settings from the database.
      globals.config = JSON.parse(row.data)

      //event system
      class MyEmitter extends EventEmitter{}
      const myEmitter = new MyEmitter()
      myEmitter.on('reward', (twitchID) => {
        rewardMessage()
        awardPoints()
        updateTimestamp(twitchID)
      });

      //configure & instatiate Twitter Bot
      const twitterConfig = {
        consumer_key: globals.config.consumer_key,
        consumer_secret: globals.config.consumer_secret,
        access_token: globals.config.access_token,
        access_token_secret: globals.config.access_token_secret,
      }
      const T = new Twit(twitterConfig)

      // Configure and Launch Twitch Chat Bot
      Bot = new TwitchBot({
        username: globals.config.botUserName,
        oauth: 'oauth:' + globals.config.botChatOAuth,
        channels: ['#' + globals.config.twitchUserName]
      })
      Bot.on('error', err => {
        console.log(err)
      })
      Bot.on('join', () => {
        Bot.on('message', chatter => { 
          var someString = chatter.message;
          var index = someString.indexOf(` `);  
          var command = someString.substr(0, index);
          var params = someString.substr(index + 1);       
          if(command == '!MLink'){
            writeNewUser(chatter.username, params)
            Bot.say(chatter.username + " has been added to the database!  You can now earn " + globals.config.deepBotCurrency + " for spreading the good news!")
          } 
          if(command == '!MLtest'){
            awardPointsCommand(params)
            Bot.say(params + " has been awarded" + globals.config.pointsToAward + " " + globals.config.deepBotCurrency)
          }
          if(params == '!MLflex' && chatter.username == "djtangent"){
            Bot.say("DJ TANGENT IS THE GREATEST")
          }
          if(params == '!MLuser'){
            if(chatter.username != globals.twitchName){
              Bot.say(chatter.username + " is not registered for Missing Link.  Type !MLregister to learn how to register.")
            }else{
              Bot.say(globals.twitchName + " is currently linked to @" + globals.twitterName)
            }
          }
          if(params == '!MLregister' && chatter.username == globals.config.twitchUserName){
            Bot.say("Welcome to Missing Link!  To register for rewards in this channel, type '!link' followed by a space and then your Twitter handle.")
          }
          if(params == '!MLinfo' && chatter.username == globals.config.twitchUserName){
            Bot.say("Retweet me to earn " + globals.config.pointsToAward + " " + globals.config.deepBotCurrency + "! " + "www.twitter.com/LushIsDrunk/statuses/" + globals.config.retweetID)
          }
        })
      })

      //Twitter bot functions
      function checkForRetweets(){
        const params = {
          id: globals.config.retweetID,
          count: 10,
          trim_user: false,
          stringify_ids: true,
        }
        const endpoints = ['statuses/retweets', 'statuses/retweeters/ids', 'users/show']
        var toggle = function(x){
          if(x==0)
            return 1
          else 
            return 0
        }
        T.get(endpoints[globals.rateLimitFlag], params, function(err, data, response){
        if(err){
          console.log(err)
        }
        if(data.length != 0){
          if(globals.rateLimitFlag == 0){
            if(globals.previousResults == data[0].user.id){
              return;
            } else {
              for(i=0; i < data.length; ++i){
                searchForMatch(data[i].user.screen_name)
              }
            }
            globals.previousResults = data[0].user.id_str
          } else {
            if(globals.previousResults == data.ids[0]){
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
            globals.previousResults = data.ids[0]
          }
          globals.rateLimitFlag = toggle(globals.rateLimitFlag)
          }
        })
      }
      
      //Twitch bot Functions
      function rewardMessage(){
        Bot.say(globals.twitchName + " has been awarded " + globals.config.pointsToAward + " " + globals.config.deepBotCurrency)
      }

      //DeepBot websocket functions
      function awardPoints(){
        const ws = new WebSocket('ws://127.0.0.1:3337/')
        ws.on('open', function open() {
          ws.send("api|register|" + globals.config.deepBotSecret)
          ws.send("api|add_points|" + globals.twitchName + "|" + globals.config.pointsToAward) 
        });
      }

      function awardPointsCommand(twitchName){
        const ws = new WebSocket('ws://127.0.0.1:3337/')
        ws.on('open', function open() {
          ws.send("api|register|" + globals.config.deepBotSecret)
          ws.send("api|add_points|" + twitchName + "|" + globals.config.pointsToAward) 
        });
      }

      //database functions
      function searchForMatch(twitterID){
        db.serialize(()=>{
            let sql = "SELECT * FROM users WHERE twitterID = '" + twitterID.toLowerCase() + "'"
            db.get(sql ,(err, row) => {
                if (err){
                  return console.error(err)
                }
                let results = row
                if(typeof results === "undefined"){
                  return console.error("no matches")
                }else{
                  if(results.reward_Timestamp < globals.config.sessionStart){
                    globals.twitchName = results.twitchID
                    globals.twitterName = results.twitterID
                    myEmitter.emit('reward', results.twitchID)
                  }
                }                   
            })
          })
      }
      function writeNewUser(twitchID, twitterID){  
        db.serialize(()=>{
            let sql = "INSERT INTO users(twitchID, twitterID) VALUES(" + "'" + twitchID.toLowerCase() + "'" + ", '"  + twitterID.toLowerCase() + "')"
            db.run(sql, (err)=>{
                if (err){
                  updateTwitterID(twitchID, twitterID)
                  Bot.say(twitchID + " your information has been updated.")
                }
            })
        })
      }
      function updateTimestamp(twitchID){
        db.serialize(()=>{
          let sql = "UPDATE users SET reward_Timestamp = '" + Date.now() + "' WHERE twitchID = '" + twitchID + "'"
          db.run(sql, (err) =>{
            return console.error(err)
          })
        })
      }
      function updateTwitterID(twitchID, newTwitterID){
        db.serialize(()=>{
          let sql = "UPDATE users SET twitterID = '" + newTwitterID.toLowerCase() + "' WHERE twitchID = '" + twitchID.toLowerCase() + "'"
          db.run(sql, (err) =>{
            return console.error(err)
          })
        })
      }
      function getUserData(twitchID){
        db.serialize(()=>{
          let sql = "SELECT * FROM users WHERE twitchID = '" + twitchID.toLowerCase() + "'"
          db.get(sql ,(err, row)=>{
            if (err){
              return console.error(err)
            }
            let results = row
            if(typeof results === "undefined"){
              return console.error("no matches")
            }else{
              globals.twitchName = results.twitchID
              globals.twitterName = results.twitterID
              globals.lastReward = results.reward_Timestamp
            }
          })                 
        })
      }
   
      //execution loop
      setInterval(()=>{checkForRetweets()}, 6100);
    }                   
  })
})











