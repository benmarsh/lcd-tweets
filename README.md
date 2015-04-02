# lcd-tweets

Show your Twitter timeline on an LCD screen connected to a Raspberry Pi using a cheap i2c connected 20x4 LCD screen. Works with LCD i2c interfaces with the PCF8574P I/O expander chip.

![LCD](http://ecx.images-amazon.com/images/I/51oyuj2JGcL._SX342_.jpg)

##### Install node.js

- Install node.js (currently v0.12.0) from http://node-arm.herokuapp.com
- Download the latest version
```sh
$ wget http://node-arm.herokuapp.com/node_latest_armhf.deb
```
- Install it
```sh
$ sudo dpkg -i node_latest_armhf.deb
```
- Check it has installed
```sh
$ node -v
v0.12.0
```

##### Enable i2c on the Raspberry Pi

- https://learn.adafruit.com/adafruits-raspberry-pi-lesson-4-gpio-setup/configuring-i2c

##### Grab some Twitter access tokens

- https://apps.twitter.com/app/new

##### Setup

- Clone lcd-tweets
```sh
$ git clone https://github.com/benmarsh/lcd-tweets.git
$ cd lcd-tweets
```
- Install dependencies
```sh
$ npm install
```
- Add your Twitter access tokens to *app.js*
```javascript
var twitter = new _twitter({
	consumer_key: '##########',
	consumer_secret: '##########',
	access_token_key: '##########',
	access_token_secret: '##########'
});
```
- Run the script
```sh
$ node app.js
```