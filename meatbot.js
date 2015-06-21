var restclient = require('node-restclient');
var Twit = require('twit');
var express = require('express')
  , http = require('http');
var app = express(); 
var server = http.createServer(app);

// I deployed to Nodejitsu, which requires an application to respond to HTTP requests
// If you're running locally you don't need this, or express at all.
app.get('/', function(req, res){
    res.send('Hello world.');
});
app.listen(3000);

// insert your twitter app info here
var T = new Twit({
  consumer_key:         '', 
  consumer_secret:      '',
  access_token:         '',
  access_token_secret:  ''
});

var statement =   "";

function meatTweet() {
  T.get('search/tweets', { q: 'meat since:2011-11-11', count: 1 }, function(err, data, response) {
    var screen_name = data["statuses"][0]["user"]["screen_name"]
    var target = data["statuses"][0]["user"]["id"]
    console.log("USER-ScreenName: " + screen_name)
    statement = "@" + screen_name + " you are made of meat."
    T.post('friendships/create', { id: target }, function(err, reply) {
      T.post('statuses/update', { status: statement}, function(err, reply) {
        console.log("error: " + err);
        console.log("reply: " + reply);

      });
    }); 
  })
}

function favRTs () {
  T.get('statuses/retweets_of_me', {}, function (e,r) {
    for(var i=0;i<r.length;i++) {
      T.post('favorites/create/'+r[i].id_str,{},function(){});
    }
    console.log('harvested some RTs'); 
  });
}

// every 2 minutes, search for the latest tweet that mentions meat. 
// follow that user, then tweet at them, "you are made of meat"
// wrapped in a try/catch in case Twitter is unresponsive, don't really care about error
// handling. it just won't tweet.

//120000
setInterval(function() {
  try {
    console.log('meat tweeting')
    meatTweet();
  }
 catch (e) {
    console.log(e);
  }
},120000);

// every 5 hours, check for people who have RTed a metaphor, and favorite that metaphor
setInterval(function() {
  try {
    favRTs();
  }
 catch (e) {
    console.log(e);
  }
},60000*60*5);
