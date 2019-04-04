module.exports = function(controller) {


  controller.hears('test','message_received', function(bot, message) {

    bot.reply(message,'I heard a test');

  });
  controller.hears('hello bot','message_received', function(bot,message){
    bot.reply(message, 'Hello friend! Nice to meet you!')
  });
  controller.hears('typing','message_received', function(bot, message) {

    bot.reply(message,{
      text: 'This message used the automatic typing delay',
      typing: true,
    }, function() {

      bot.reply(message,{
        text: 'This message specified a 5000ms typing delay',
        typingDelay: 5000,
      });

    });

  });

}
