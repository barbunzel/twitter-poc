var express = require('express');
var app = express();
var mongojs = require('mongojs');
var db = mongojs('tweetlist', ['tweetlist']);
var bodyParser = require('body-parser');
var twit = require('twitter');


app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get('/tweetlist', function(req, res) {

	
	db.collection('tweetlist').aggregate(
		[
			{ $group: { "_id": { user: "$user", date: "$date"}, "count": { $sum: 1 } } }, { $project: { _id: 0, user: "$_id.user", date: "$_id.date", count: "$count" } }, { $sort: { "user": 1, "date": 1 } }
		]).toArray(function(error, result) {
				res.json(result);
			});
	
});

app.post('/gettweets', function(req, res) {
	var handle = req.body.handle;
	var twitter = new twit({
		consumer_key: 'pg5tT5a3qcwv3gGbUd1WXgapO',
		consumer_secret: '0Pny18Ie89CGximkhwjfglHUwdWWwZR8YIEPKOPTsjo8gOb0oV',
		access_token_key: '26007481-Xwc18ZT51yXfehuaODgzZomUd9OQfIY5LbgJsAQuI',
		access_token_secret: 'qgWTyIVPvbz1GCYPPLW7QcXNuxkFA8uWrxaufS87xpAyZ'
	});
	var ins = [];
	var params;

	
	// for( var i = 0; i < 3; i++) {
		
		// request('https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=' + handle + '&&count=200',
		params = {screen_name: handle, count: 2000};
		
		
		twitter.get('statuses/user_timeline', params, function(error, tweets, response){ 
			if(!error){
				var tweetcount = tweets.length;
				var date_str = '';
				
				for(var i = 0; i < tweetcount; i++){
					var date = new Date(tweets[i].created_at);
					date_str = ( date.getMonth() + 1 ) + '/' + date.getDate() + '/' + ( date.getYear() + 1900 ); 
					
					ins.push({
						user: '@' + handle,
						id: tweets[i].id_str,
						date: new Date(date_str)
					});
				}
				
				
			}
			
			db.tweetlist.insert(ins, function(error, doc) {
				res.json(doc);
			});	
	});
	// }
	
	
});

app.delete('/deletetweets', function(req, res) {
	db.tweetlist.remove({}, function(error, doc) {
		res.json(doc);
	});
});

app.listen(8080);
console.log('Server running on port 8080');
