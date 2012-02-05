var jsxml = require('../lib/jsxml.js');
var fs = require('fs');
var musicstr = fs.readFileSync('test/music.xml').toString();
var musicjson = jsxml.fromXml(musicstr);

console.log(jsxml.toXml(musicjson), musicstr);

