$(()=>{
    $.get("http://localhost:3000/data", (data, status)=>{
        if(status == "success"){
            $("#pointsToAward").val(data.pointsToAward)
            $("#retweetID").val(data.retweetID)
            $("#twitchUserName").val(data.twitchUserName)
            $("#botUserName").val(data.botUserName)
            $("#botChatOAuth").val(data.botChatOAuth)
            $("#deepBotSecret").val(data.deepBotSecret)
            $("#deepBotCurrency").val(data.deepBotCurrency)
            $("#twitter_consumer_key").val(data.consumer_key)
            $("#twitter_consumer_secret").val(data.consumer_secret)
            $("#twitter_access_token").val(data.access_token)
            $("#twitter_access_token_secret").val(data.access_token_secret)

        } else {
            console.error("STATUS:" + status)
        }  
    }) 
    $("form").submit(()=>{
        if($(".form-textfield").val() == "" || $(".form-textfield").val() == null){
            alert("All fields are required.")
        }else{
            let updatedData = {
                "pointsToAward": $("#pointsToAward").val(),
                "retweetID" : $("#retweetID").val(),
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
            $.post("http://localhost:3000/data", updatedData , (data, status) => {
                alert(JSON.stringify(data))
            })
        }
    });
    function parseTweetID(url){
        for(i=0; i < url.length; ++i){

        }
    }
})