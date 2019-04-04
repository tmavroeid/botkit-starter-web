var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var querystring = require('querystring');
var debug = require('debug')('botkit:webserver');
var http = require('http');
var hbs = require('express-hbs');

module.exports = function(controller_slack) {

    var webserver_slack = express();
    webserver_slack.use(function(req, res, next) {
        req.rawBody = '';

        req.on('data', function(chunk) {
            req.rawBody += chunk;
        });

        next();
    });
    webserver_slack.use(cookieParser());
    webserver_slack.use(bodyParser.json());
    webserver_slack.use(bodyParser.urlencoded({ extended: true }));

    // set up handlebars ready for tabs
    webserver_slack.engine('hbs', hbs.express4({partialsDir: __dirname + '/../views/partials'}));
    webserver_slack.set('view engine', 'hbs');
    webserver_slack.set('views', __dirname + '/../views/');

    webserver_slack.use(express.static('public'));

    var server = http.createServer(webserver_slack);

    server.listen(3001, null, function() {

        console.log('Express webserver for slack configured and listening at http://localhost:' + 3001);

    });
    // import all the pre-defined routes that are present in /components/routes
    var normalizedPath = require("path").join(__dirname, "routes");
    require("fs").readdirSync(normalizedPath).forEach(function(file) {
      require("./routes/" + file)(webserver_slack, controller_slack);
    });

    controller_slack.webserver = webserver_slack;
    controller_slack.httpserver = server;

    return webserver_slack;

}
