var debug = require('debug')('botkit:incoming_webhooks_slack');

module.exports = function(webserver_slack, controller_slack) {

    debug('Configured /slack/receive url');
    webserver_slack.post('/slack/receive', function(req, res) {


        // respond to Slack that the webhook has been received.
        res.status(200);

        // Now, pass the webhook into be processed
        controller_slack.handleWebhookPayload(req, res);


    });
}
