var debug = require('debug')('botkit:user_registration');

module.exports = function(controller_slack) {

    /* Handle event caused by a user logging in with oauth */
    controller_slack.on('oauth:success', function(payload) {

        debug('Got a successful login!', payload);
        if (!payload.identity.team_id) {
            debug('Error: received an oauth response without a team id', payload);
        }
        controller_slack.storage.teams.get(payload.identity.team_id, function(err, team) {
            if (err) {
                debug('Error: could not load team from storage system:', payload.identity.team_id, err);
            }

            var new_team = false;
            if (!team) {
                team = {
                    id: payload.identity.team_id,
                    createdBy: payload.identity.user_id,
                    url: payload.identity.url,
                    name: payload.identity.team,
                };
                var new_team= true;
            }

            team.bot = {
                token: payload.bot.bot_access_token,
                user_id: payload.bot.bot_user_id,
                createdBy: payload.identity.user_id,
                app_token: payload.access_token,
            };

            var testbot = controller_slack.spawn(team.bot);

            testbot.api.auth.test({}, function(err, bot_auth) {
                if (err) {
                    debug('Error: could not authenticate bot user', err);
                } else {
                    team.bot.name = bot_auth.user;

                    // add in info that is expected by Botkit
                    testbot.identity = bot_auth;

                    testbot.identity.id = bot_auth.user_id;
                    testbot.identity.name = bot_auth.user;

                    testbot.team_info = team;
 
		   // Replace this with your own database!

                    controller_slack.storage.teams.save(team, function(err, id) {
                        if (err) {
                            debug('Error: could not save team record:', err);
                        } else {
                            if (new_team) {
                                controller_slack.trigger('create_team', [testbot, team]);
                            } else {
                                controller_slack.trigger('update_team', [testbot, team]);
                            }
                        }
                    });
                }
            });
        });
    });


    controller_slack.on('create_team', function(bot, team) {

        debug('Team created:', team);

        // Trigger an event that will establish an RTM connection for this bot
	controller_slack.trigger('rtm:start', [bot.config]);

        // Trigger an event that will cause this team to receive onboarding messages
        controller_slack.trigger('onboard', [bot, team]);

    });


    controller_slack.on('update_team', function(bot, team) {

        debug('Team updated:', team);
        // Trigger an event that will establish an RTM connection for this bot
        controller_slack.trigger('rtm:start', [bot]);

    });

}

