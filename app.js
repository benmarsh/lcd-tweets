var _LCD 		= require('./lib/LCD.js');
var _twitter 	= require('twitter');
	
var scroll_timer_id = 0;
var scroll_index = 0;
var queue = [];
var tweet_repeats = 0;

var lcd_width = 20;
var lcd_height = 4;

var lcd_blank_line = "";
for (var i = 0; i < lcd_width; i++) {
	lcd_blank_line += " ";
}

var default_tweet = {
	user : {
		screen_name: "benmarsh"
	},
	text: '\n\nYou should see your\nTwitter timeline\nappear here in\nrealtime!'
};
	
var lcd = new _LCD('/dev/i2c-1', 0x27);

lcd.createChar(0, [0x15,0x00,0x15,0x00,0x15,0x00,0x15,0x00]); // 25% shaded block
lcd.createChar(1, [0x00,0x00,0x00,0x00,0x00,0x00,0x15,0x00]); // …
lcd.createChar(2, [0x04,0x04,0x04,0x00,0x00,0x00,0x00,0x00]); // '
    
var twitter = new _twitter({
	consumer_key: '##########',
	consumer_secret: '##########',
	access_token_key: '##########',
	access_token_secret: '##########'
});

// User feed
//
twitter.stream(
	'user', 
	{},
	function(stream) {
		stream.on('data', function(tweet) {
			queueTweet(tweet);
		});
	}
);   

// Hashtag/search feed
//
//twitter.stream(
//    	'statuses/filter',
// 	{
// 		'track': 'lcdtweet'
// 	},
// 	function(stream) {
// 		stream.on('data', function(tweet) {
// 			queueTweet(tweet);
// 		});
// 	}
//);

queueTweet(default_tweet);
nextTweet();

function queueTweet(tweet) {
	if (tweet.text) {
		queue.push(tweet);
		console.log('Queue + '+queue.length);
	}
}

function nextTweet() {
	if (queue.length > 0) {
		displayTweet(queue.shift());
		console.log('Queue - '+queue.length);
		tweet_repeats = 0;
	}
	else {
		tweet_repeats++;
		//console.log(''+tweet_repeats+' repeats');
		if (tweet_repeats > 100) { // 2 minutes (ish) timeout
			queueTweet(default_tweet);
			tweet_repeats = 0;
		}
	}
}

function displayTweet(tweet) {
	clearInterval(scroll_timer_id);
	
	var screen_name = tweet.user ? tweet.user.screen_name : '';
	var text = tweet.text;
	
	var text_length = tweet.text.length;
	
	var padding = '';
	for (var i = 0; i < lcd_width; i++) {
		padding += ' ';
	}

	lcd.clear().cursor_off().blink_off();
	
	if (screen_name) {
		lcd.setCursor(0,0).print(String.fromCharCode(0));
		lcd.setCursor(2,0).print('@'+tweet.user.screen_name);
		lcd.setCursor(19,0).print(String.fromCharCode(0));
//		console.log('@'+screen_name+': '+tweet.text);
	}
	
	text = simplify(text);
	lines = wordwrap(text, lcd_width, '\n');
	
	console.log(lines);
	
	if (lines.length > 3) {

		var line_index = 0;
		
		scroll_timer_id = setInterval(function() {
			lcd.setCursor(0,1).print(formatLine(lines[line_index+0]));
			lcd.setCursor(0,2).print(formatLine(lines[line_index+1]));
			lcd.setCursor(0,3).print(formatLine(lines[line_index+2]));
			
			line_index++;
			
			if (line_index > lines.length) {
				displayTweetCompleted();
				line_index = 0;
			}
		}, 750);
		
	}
	else {
		lcd.setCursor(0,1).print(formatLine(lines[0]));
		lcd.setCursor(0,2).print(formatLine(lines[1]));
		lcd.setCursor(0,3).print(formatLine(lines[2]));
		
		scroll_timer_id = setInterval(displayTweetCompleted, 7500);
	}
	
//	lcd.setCursor(0,1).print(lines[0]);
//	lcd.setCursor(0,2).print(lines[1]);
//	lcd.setCursor(0,3).print(lines[2]);
}

function formatLine(line) {
	return ((line || '').trim()+lcd_blank_line).slice(0, lcd_width);
}

function displayTweetCompleted() {
	nextTweet();
}

function wordwrap(str, int_width, str_break, cut) {
  //  discuss at: http://phpjs.org/functions/wordwrap/
  // original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // improved by: Nick Callen
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Sakimori
  //  revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // bugfixed by: Michael Grier
  // bugfixed by: Feras ALHAEK
  //   example 1: wordwrap('Kevin van Zonneveld', 6, '|', true);
  //   returns 1: 'Kevin |van |Zonnev|eld'
  //   example 2: wordwrap('The quick brown fox jumped over the lazy dog.', 20, '<br />\n');
  //   returns 2: 'The quick brown fox <br />\njumped over the lazy<br />\n dog.'
  //   example 3: wordwrap('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.');
  //   returns 3: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod \ntempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \nveniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea \ncommodo consequat.'

  var m = ((arguments.length >= 2) ? arguments[1] : 75);
  var b = ((arguments.length >= 3) ? arguments[2] : '\n');
  var c = ((arguments.length >= 4) ? arguments[3] : false);

  var i, j, l, s, r;

  str += '';

  if (m < 1) {
    return str;
  }

  for (i = -1, l = (r = str.split(/\r\n|\n|\r/)).length; ++i < l; r[i] += s) {
    for (s = r[i], r[i] = ''; s.length > m; r[i] += s.slice(0, j) + ((s = s.slice(j)).length ? b : '')) {
      j = 
      		(c == 2 || (j = s.slice(0, m + 1).match(/\S*(\s)?$/))[1])
      		? m 
      		: j.input.length - j[0].length || c == 1 && m || j.input.length + (j = s.slice(m).match(/^\S*/))[0].length;
    }
    	
  }

  return r.join('\n').split('\n');
}

function simplify(text) {
	text = text.replace(/&gt;/g, '>');
	text = text.replace(/&lt;/g, '<');
	text = text.replace(/&amp;/g, '&');
	text = text.replace(/…/g, String.fromCharCode(1)); // Replace …
	text = text.replace(/'/g, String.fromCharCode(2)); // Replace '
	text = text.replace(/https?:\/\//g, '');
	return text;
}