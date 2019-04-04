module.exports = function(controller) {
    var wit = require('botkit-middleware-witai')({
        token: "LBH6NRA5H6FU6ERFVQQNWDTZUMVCDBIG"
    });
    const {Wit,log} = require('node-wit');
    const client = new Wit({accessToken: 'LBH6NRA5H6FU6ERFVQQNWDTZUMVCDBIG'})


    controller.middleware.receive.use(function(bot,message,next){
        wit.receive(bot,message,next)

    });
    controller.hears(['hello'], 'direct_message, app_mention', function(bot,message){
        client.message('hello',{}).then((data)=>{
                console.log(JSON.stringify(data));
                var confidence = data['entities']['intent'][0]['confidence'];
                var metadata = data['entities']['intent'][0]['metadata'];
                console.log(confidence);
                var userid = message.user;
                var user = "<@"+userid+">"
                bot.reply(message, metadata+' '+user);
        }).catch(console.error);
        //console.log("Wit.ai detected the entity", message.entities);
        //resp = message.entities;
        //console.log(resp)
        //responseConfidence = resp['intent'][0]['confidence'];
    });

    // controller.middleware.receive.use(function(bot, message, next) {
    //
    //     // do something...
    //     console.log('RCVD:', message);
    //     next();
    //
    // });
    //
    //
    controller.middleware.send.use(function(bot, message, next) {
    
         // do something...
         console.log('SEND:', message);
         next();
    
     });

}


