'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
	mongoose = require('mongoose'),
	chalk = require('chalk');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
var db = mongoose.connect(config.db, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
});

// Init the express application
var app = require('./config/express')(db);

// Bootstrap passport config
require('./config/passport')();

app.get('/contactlist', function(req, res) {
	console.log('I received a GET request');
	
	var contactlist = [
	{
        name: 'Tim',
        email: 'tim@email.com',
        number: '(111) 111-1111'
    },
    {
        name: 'Tim2',
        email: 'tim2@email.com',
        number: '(111) 111-1111'
    },
    {
        name: 'Tim3',
        email: 'tim3@email.com',
        number: '(111) 111-1111'
    }];
    
    res.json(contactlist);
});



// Start the app by listening on <port>
app.listen(config.port);

// Expose app
exports = module.exports = app;


// Logging initialization
console.log('MEAN.JS application started on port ' + config.port);