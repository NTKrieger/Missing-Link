//load settings
$(document).ready(function() {
    $.get("http://localhost:30000/data", function(data, status){
        if(status = "success"){
            $("#pointsToAward").val(data.pointsToAward)
            $("#retweetURL").val("https://twitter.com/"+ data.tweetOwner + "/status/" + data.retweetID)
            $("#twitchUserName").val(data.twitchUserName)
            $("#botUserName").val(data.botUserName)
            $("#botChatOAuth").val(data.botChatOAuth)
            $("#deepBotSecret").val(data.deepBotSecret)
            $("#deepBotCurrency").val(data.deepBotCurrency)
            $("#twitter_consumer_key").val(data.consumer_key)
            $("#twitter_consumer_secret").val(data.consumer_secret)
            $("#twitter_access_token").val(data.access_token)
            $("#twitter_access_token_secret").val(data.access_token_secret)
        }          
    })  
    //form handler
    $("#form").submit((e)=>{
        e.preventDefault()
        let updatedData = {
            "pointsToAward": $("#pointsToAward").val(),
            "retweetURL" : $("#retweetURL").val(),
            "twitchUserName": $("#twitchUserName").val(),
            "botUserName": $("#botUserName").val(),
            "botChatOAuth": $("#botChatOAuth").val(),
            "deepBotSecret": $("#deepBotSecret").val(),
            "deepBotCurrency":  $("#deepBotCurrency").val(),                                        
            "consumer_key":  $("#twitter_consumer_key").val(),
            "consumer_secret": $("#twitter_consumer_secret").val(),
            "access_token": $("#twitter_access_token").val(),
            "access_token_secret": $("#twitter_access_token_secret").val()
        }
        $.post("http://localhost:30000/data", updatedData , (data, status) => {
        })
        window.location.href = "./index.html"
    });
    //restart button handler
    $("#restart-button").click(()=>{
        $.get("http://localhost:30000/restart", function(data, status){
            console.log(data, status)
        })
    })
    //close button handler
    $("#close-button").click(()=>{
        alert("Thanks for using Missing Link!")
        $.get("http://localhost:30000/close", function(data, status){
            console.log(data, status)
        })
        window.close()
    })
    //donate button handler
    $("#donate-button").click(()=>{
        //do something
    })
});


