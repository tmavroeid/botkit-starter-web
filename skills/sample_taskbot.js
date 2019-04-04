/*

    This is a sample bot that provides a simple todo list function
    and demonstrates the Botkit storage system.

    Botkit comes with a generic storage system that can be used to
    store arbitrary information about a user or channel. Storage
    can be backed by a built in JSON file system, or one of many
    popular database systems.

    See:

        botkit-storage-mongo
        botkit-storage-firebase
        botkit-storage-redis
        botkit-storage-dynamodb
        botkit-storage-mysql

*/

module.exports = function(controller) {

    // listen for someone saying 'tasks' to the bot
    // reply with a list of current tasks loaded from the storage system
    // based on this user's id
    controller.hears(['tasks','todo'], 'direct_message,ambient', function(bot, message) {

        // load user from storage...
        controller.storage.users.get(message.user, function(err, user) {

            // user object can contain arbitary keys. we will store tasks in .tasks
            if (!user || !user.tasks || user.tasks.length == 0) {
                bot.reply(message, 'Δεν υπάρχουν tasks ή todos στη λίστα. Γράψε `add _task_` για να προσθέσεις ένα.');
            } else {

                var text = 'Αυτά είναι τα tasks: \n' +
                    generateTaskList(user) +
                    'Απάντησε με `done _number_` για να το αφαιρέσεις από τη λίστα.';

                bot.reply(message, text);

            }

        });

    });

    // listen for a user saying "add <something>", and then add it to the user's list
    // store the new list in the storage system
	controller.hears(['add (.*)'],'direct_message,direct_mention', function(bot, message) {

        var newtask = message.match[1];
        controller.storage.users.get(message.user, function(err, user) {

            if (!user) {
                user = {};
                user.id = message.user;
                user.tasks = [];
            }

            user.tasks.push(newtask);

            controller.storage.users.save(user, function(err,saved) {

                if (err) {
                    bot.reply(message, 'I experienced an error adding your task: ' + err);
                } else {
                    bot.api.reactions.add({
                        name: 'thumbsup',
                        channel: message.channel,
                        timestamp: message.ts
                    });
                }

		});
        });

    });

    // listen for a user saying "done <number>" and mark that item as done.
    controller.hears(['done (.*)'],'direct_message,direct_mention', function(bot, message) {

        var number = message.match[1];

        if (isNaN(number)) {
            bot.reply(message, 'Please specify a number.');
        } else {

            // adjust for 0-based array index
            number = parseInt(number) - 1;

            controller.storage.users.get(message.user, function(err, user) {

                if (!user) {
                    user = {};
                    user.id = message.user;
                    user.tasks = [];
                }
		if (number < 0 || number >= user.tasks.length) {
                    bot.reply(message, 'Sorry, your input is out of range. Right now there are ' + user.tasks.length + ' items on your list.');
                } else {

                    var item = user.tasks.splice(number,1);
                    console.log(item);
                    console.log(user.tasks)
                    // reply with a strikethrough message...
                    bot.reply(message, '~' + item + '~');

                    if (user.tasks.length > 0) {
                        bot.reply(message, 'Here are our remaining tasks:\n' + generateTaskList(user));
                    } else {
                        bot.reply(message, 'Your list is now empty!');
                    }
                }
            });
        }

    });

    // simple function to generate the text of the task list so that
    // it can be used in various places
    function generateTaskList(user) {

        var text = '';
        console.log(user.tasks)
        console.log(user.tasks.length)
        for (var t = 0; t < user.tasks.length; t++) {
            text = text + '> `' +  (t + 1) + '`) ' +  user.tasks[t] + '\n';
        }

        return text;

    }
}

