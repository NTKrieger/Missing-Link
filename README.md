# Missing Link
Missing Link is an open-source program which suppliments the functionality of DeepBot, a popular Twitch chatbot.  It allows the streamer to a select a Tweet which viewers can retweet and be rewarded automatically with chatroom currency, extending their social media visibilitiy and attracting new users to the channel.  

The program is designed to be run at the beginning of a streaming session and closed when the session is finished.  Each time you launch Missing Link you will be able to change the tweet you want retweeted, the amount of points earned, the name of your chat currency, and update any changes to your credentials.  Before viewers can recieve the benefits of this bot, they will have to complete a one-time registration to link their Twitter handle to their Twitch username.  This is done in the chatroom by using the '!link' command followed by their Twitter name.  For example:

twitch_user: !link <twitter_user>

CHAT_BOT: Congratulations, twitch_user, your Twitter handle has been added to the database! You can now earn points for spreading the good news!

## Getting Started
In order for this program to do anything for you at all, you will need to be a premium DeepBot subscriber and have DeepBot installed.  You will also need to install Node.js, a popular Javascript interpreter, and register a Twitter application to get your API credentials.  The instructions below will walk you step-by-step through the setup process.

The first thing you will need to do is install Node.js.  Navigate to https://nodejs.org/en/download/ and choose the correct build for your operating system.  The download and installation should be quick and easy.

Next, you will need to register a Twitter application for your account to give Missing Link permission to monitor your Twitter account.  If you already have Twitter developer account and are familiar with the process, great.  If not, see the Twitter App Setup Guide text file in the root directory for detailed and (I hope) easy-to-follow instructions.

Finally, please download a copy of Missing Link and extract it to C:\Missing-Link.  If you choose another location, you will need to take a moment to update the file path in shortcut.  You can do this by opening the run.bat file with a text editor and changing the file path to your preferred location.

Before launching Missing Link, make sure that DeepBot is running and connected to both the Streamer and Bot accounts.

Privacy Note:  Your Twitter credentials will not be used for any purpose other than to check for retweets of the tweet you specify in the settings.  Programmers are welcome to verify this for themselves by looking at my code, but the rest of you will have to accept a pinky swear.  I pinky swear that this application will never steal, borrow, show, leak, or transmit your credentials to myself or any other third-party.

##Settings
There are currently three settings which are available to the streamer.  These settings must be filled out in order to run Missing Link and cannot be changed while Missing Link is running.  

First is the amount of points to be rewarded when a registered user retweets your selected tweet.  
The second feature is to enter the name of your DeepBot currency, which is used to keep your bots messaging consistent.  
The third setting is the URL of the Tweet you would like retweeted.

## Entering your Credentials
When you launch the program, a web browser window will open up and you will be able to enter all the information Missing Link needs to work its magic.  The first time you launch the application, you will need to enter a number of API credentials in order for the bot to function.  I've provided some helpful information below which should help you locate everything.

The DeepBot API secret is available in the Master Settings menu of DeepBot, which is in the upper right-hand corner of the application window.

The Twitch Chat API is required for DeepBot as well, so you probably have some experience getting an OAuth key.  If you've forgotten, you can get one by clicking on the OAuth link in DeepBot in the Streamer Login box or by navigating to https://twitchapps.com/tmi/.

Lastly, you will need the Twitter API credentials which you went to such great lengths to apply for.  Go to https://apps.twitter.com/ and click on your application.  The information you need is under the "Keys and Access Tokens" tab.

Now that you've entered all your credentials and customized your settings, you can click the launch button to get started!

## Commands
!Link <twittername> - This command will link the Twitch account and the Twitter account together in the Missing Link database.  Each user will only need to complete this process once.  If the user makes a typo or would like to change their associated Twitter account, they can use the command again and it will overwrite the previous data.  Each Twitch user can link only one Twitter account and will only rewarded once per session to prevent abuse.

!MLregister - Your chatbot will instruct your explain to the chat how to link their Twitter handle to their Twitch account to be eligible for rewards.  This command is only available to the streamer.

!MLinfo - Your chatbot will invite your viewers to retweet your chosen Tweet and advertise the amount of points to be rewarded for doing so.  This command is only available to the streamer.

## Credits
Missing Link was initially developed for Lush.  Check him out @ twitch.tv/lush_.

The page header & banner graphic were provided by EK.  I'll link him in later if he wants.



