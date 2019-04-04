/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's conversation system.

In this example, Botkit hears a keyword, then asks a question. Different paths
through the conversation are chosen based on the user's response.

*/

module.exports = function(controller) {

    controller.hears(['γειά'], 'direct_message', function(bot, message) {

        bot.createConversation(message, function(err, convo) {

            // create a path for when a user says YES
            convo.addMessage({
                    text: 'Εντάξει.',
                    callback: function(response, convo) {
                        convo.gotoThread('bot_guidance');
                    },

            },'yes_thread');

            // create a path for when a user says NO
            // mark the conversation as unsuccessful at the end
            convo.addMessage({
                text: 'Αν χρειαστείς οτιδήποτε είμαι στη διάθεσή σου!',
                action: 'stop', // this marks the converation as unsuccessful
            },'no_thread');

            // create a path where neither option was matched
            // this message has an action field, which directs botkit to go back to the `default` thread after sending this message.
            convo.addMessage({
                text: 'Δε σε κατάλαβα. Πες μου `ναι` ή `όχι`',
                action: 'default',
            },'bad_response');
            convo.addQuestion({text: 'Μπορώ να σε καθοδηγήσω στο κοντινότερο ιατρείο ή κυλικείο. Τι θές?'}, [
                   {
                        pattern:  'ιατρείο',
                        callback: function(response, convo) {
                                convo.gotoThread('yes_thread');
                        },
                   },
                   {
                        pattern:  'κυλικείο',
                        callback: function(response, convo) {
				convo.gotoThread('no_thread');
                        },
                   },
                   {
                        default: true,
                        callback: function(response, convo) {
                                convo.gotoThread('bad_response');
                        },
                   }


                ],{},'bot_guidance')
            // Create a yes/no question in the default thread...
            convo.ask('Γειά!  Χρειάζεσαι βοήθεια?', [
                {
                    pattern:  'ναι',
                    callback: function(response, convo) {
                        convo.gotoThread('bot_guidance');
                    },
                },
                {
                    pattern:  'όχι',
                    callback: function(response, convo) {
                        convo.gotoThread('no_thread');
                    },
		},
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ]);

            convo.activate();

            // capture the results of the conversation and see what happened...
            convo.on('end', function(convo) {

                if (convo.successful()) {
                    // this still works to send individual replies...
                    bot.reply(message, 'Let us eat some!');

                    // and now deliver cheese via tcp/ip...
                }

            });
        });

    });

};
