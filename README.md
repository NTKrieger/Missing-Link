# Missing Link
### Missing Link is a tiny bot that suppliments the functionality of other full-featured chat bots for Twitch.  It allows the streamer to a select a Tweet which viewers can retweet and be rewarded automatically with chat currency.

Before viewers can recieve the benefits of this bot, they will have to use the !link command followed by their Twitter name.  For example:

chat_dweller: !link @The_Hot_Twit
CHAT_BOT: Congratulations, chat_dweller, your Twitter handle has been added to the database! You can now earn beers for spreading the good news!

##Getting Started

First, a small secret.  This is a custom piece of software written for Twitch.tv/lush_.  If you are not Lush himself, I would be thrilled to work with you, but you'd have to BYOdB.  n.t.krieger@gmail.com if you are interested.

The first thing you will need to do is install Node.js.  
A tutorial for Windows can be found at https://nodesource.com/blog/installing-nodejs-tutorial-windows/

I've included all of the package dependencies, so you won't need to install any packages.  You will need a Twitter developer account and a Twitch developer account.  You will have to add a fair number of API keys to the var.js file in the config directory, along with a database configuration file.  If you're Lush, I'll be sending you the files all filled in.  Otherwise, I have included notes on where to find everything.  The application can be started by navigating to the Missing-Link directory on the command line and typing 
#####node index.js

##Configure

There are some options which the steamer can set, such as the name of their chat currency, the amount of points to be distributed for each retweet, and the TweetID of the tweet they are monitoring.  These are easily changed in the var.js file in the config folder.  You must change them before running the program for the changes to take effect.  Making changes to the var.js file while Missing Link is running will accomplish very little good.

##MORE SUPER EXTRA DOCUMENTATION FOR ALL NON-LUSH HUMANS AND CYBORGS COMING SOON