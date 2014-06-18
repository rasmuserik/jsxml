var jsxml = require('../lib/jsxml.js');
var fs = require('fs');
var musicstr = fs.readFileSync('test/music.xml').toString();
var musicjson = jsxml.fromXml(musicstr);

console.log(jsxml.toXml(musicjson), musicstr);


var samplestrJSONMLOrig = ["HTML",
["HEAD",["META", {
			"http-equiv": "X-UA-Co'mpatible",
			"content": "IE=edge"
		 }
],
["TITLE", "TESTING"],
],
["BODY", ["B", "BO'L<>&DED TEXT"]]
]
var sampleXML = jsxml.toXml(samplestrJSONMLOrig); 
console.log("\n\noriginal JSONML:\n\n" + samplestrJSONMLOrig);
console.log("\n\nConverted XML output for samplestrJSONMLOrig:\n\n" + sampleXML);
console.log("\n\nConverted XML output for samplestrJSONMLOrig back to JSONML:\n\n" + jsxml.fromXml(sampleXML));
