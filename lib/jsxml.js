// # JsonML
//
// Various functions for handling
// jsonml in array form.
// For more info on jsonml,
// see [jsonml.org](http://jsonml.org/)
// or [wikipedia](http://en.wikipedia.org/wiki/JsonML)
//
// Implemented to be as portable as possible. 
// Not depending on any libraries, and also
// avoid regular expressions to be possible to 
// run on javascript-subsets on j2me devices.
//
// ## XML parser
//
// Parse an XML-string. 
// Actually this is not a full implementation, but just
// the basic parts to get it up running. 
// Nonetheless it is Good Enough(tm) for most uses.
// 
// Known deficiencies: CDATA is not supported, will accept even 
// non-well-formed documents, <?... > <!... > are not really handled, ...
exports.fromXml = function(xml) {
    if(typeof(xml) !== "string") {
        JsonML_Error( 
            "Error: jsonml.parseXML didn't receive a string as parameter");
    }

    // white space definition
    var whitespace = " \n\r\t";
    // the current char in the string that is being parsed
    var c = xml[0];
    // the position in the string
    var pos = 0;
    // stack for handling nested tags
    var stack = [];
    // current tag being parsed
    var tag = [];
    // read the next char from the string
    function next_char() { c = ++pos < xml.length ? xml[pos] : undefined; }
    // check if the current char is one of those in the string parameter 
    function is_a(str) { return str.indexOf(c) !== -1; }
    // return the string from the current position to right before the first 
    // occurence of any of symb. Translate escaped xml entities to their value 
    // on the fly.
    function read_until(symb) {
        var buffer = [];
        while(c && !is_a(symb)) {
            if(c === '&') {
                next_char();
                var entity = read_until(';');
                if(entity[0] === '#') {
                    if(entity[1] === 'x') {
                        c = String.fromCharCode(parseInt(entity.slice(2), 16));
                    } else {
                        c = String.fromCharCode(parseInt(entity.slice(1), 10));
                    }
                } else {
                    c = entities[entity];
                    if(!c) {
                        JsonML_Error("error: unrecognisable xml entity: " + entity);
                    }
                }
            } 
            buffer.push(c);
            next_char();
        }
        return buffer.join("");
    }

    // The actual parsing
    while(is_a(whitespace)) { next_char(); }
    while(c) {
        if(is_a("<")) {
            next_char();

            // `<?xml ... >`, `<!-- -->` or similar - skip these
            if(is_a("?!")) {
                if(xml.slice(pos, pos+3) === "!--") {
                    pos += 3;
                    while(xml.slice(pos, pos+2) !== "--") {
                        ++pos;
                    }
                } 
                read_until('>');
                next_char();

            // `<sometag ...>` - handle begin tag
            } else if(!is_a("/")) {
                // read tag name
                var newtag = [read_until(whitespace+">/")];

                // read attributes
                var attributes = {};
                var has_attributes = 0;
                while(c && is_a(whitespace)) { next_char(); }
                while(c && !is_a(">/")) {
                    has_attributes = 1;
                    var attr = read_until(whitespace + "=>");
                    if(c === "=") {
                        next_char();
                        var value_terminator = whitespace+">/";
                        if(is_a('"\'')) { value_terminator = c; next_char(); }
                        attributes[attr] = read_until(value_terminator);
                        if(is_a('"\'')) { next_char(); }
                    } else {
                        JsonML_Error("something not attribute in tag");
                    }
                    while(c && is_a(whitespace)) { next_char(); }
                }
                if(has_attributes) { newtag.push(attributes); }

                // end of tag, is it `<.../>` or  `<...>`
                if(is_a("/")) {
                    next_char();
                    if(!is_a(">")) { 
                        JsonML_Error('expected ">" after "/" within tag'); 
                    }
                    tag.push(newtag);
                } else {
                    stack.push(tag);
                    tag = newtag;
                }
                next_char();

            // `</something>` - handle end tag
            } else {
                next_char();
                if(read_until(">") !== tag[0]) {
                    JsonML_Error("end tag not matching: " + tag[0]);
                }
                next_char();
                var parent_tag = stack.pop();
                if(tag.length <= 2 && !isArray(tag[1]) && typeof(tag[1]) !== "string") {
                    tag.push("");
                }
                parent_tag.push(tag);
                tag = parent_tag;

            }

        // actual content / data between tags
        } else {
            tag.push(read_until("<"));
        }
    }
    return tag;
};



// ## XML generation

// Convert jsonml in array form to xml.
exports.toXml = function(jsonml) {
    var acc = [];
    toXmlAcc(jsonml, acc);
    return acc.join('');
};

// The actual implementation. As the XML-string is built by appending to the 
// `acc`umulator.
function toXmlAcc(jsonml, acc) {
    if(isArray(jsonml)) {
        acc.push("<");
        acc.push(jsonml[0]);
        var pos = 1;
        var attributes = jsonml[1];
        if(attributes && !isArray(attributes) && typeof(attributes) !== "string") {
            for(var key in attributes) { if(attributes.hasOwnProperty(key)) {
                acc.push(' ');
                acc.push(key);
                acc.push('="');
                xmlEscape(attributes[key], acc);
                acc.push('"');
            } }
            ++pos;
        }
        if(pos < jsonml.length) {
            acc.push(">");
            do {
                toXmlAcc(jsonml[pos], acc);
                ++pos;
            } while(pos < jsonml.length); 
            acc.push("</");
            acc.push(jsonml[0]);
            acc.push(">");
        } else {
            acc.push(" />");
        }
    } else {
        //jsonml represents the text within a text tag 
        xmlEscape(jsonml, acc, reventitiesTextNodes);
    }
}

// XML escaped entity table for non-text nodes
var entities = {
    "quot": '"',
    "amp": '&',
    "apos": "'",
    "lt": '<',
    "gt": '>'
};

// XML escaped entity table for text nodes
var entitiesTextNodes = {
    "amp": '&',
    "lt": '<'
};

// Generate a reverse xml entity table.
var reventities = (function () {
    var result = {};
    for(var key in entities) { if(entities.hasOwnProperty(key)) {
        result[entities[key]] = key;
    } }
    return result;
})();

var reventitiesTextNodes = (function () {
    var result = {};
    for(var key in entitiesTextNodes) { if(entitiesTextNodes.hasOwnProperty(key)) {
        result[entitiesTextNodes[key]] = key;
    } }
    return result;
})();


// Append the characters of `str`, or the xml-entity they map to, to the `acc`umulator array.
// 'reventities' is optional. Defaults to entities.
function xmlEscape(str, acc, table) {
    //determine which table is to be used for encoding
    if (!table) {
        var table = reventities;
    }
    for(var i = 0; i < str.length; ++i) {
        var c = str[i];
        var code = c.charCodeAt(0);
        var s = table[c];
        if(s) {
            acc.push("&" + s + ";");
        } else if(/*code < 32 ||*/ code >= 128) {
            acc.push("&#" + code + ";");
        } else {
            acc.push(c);
        }
    }
}

// ## Utility functions

// Apply a function to all the child elements of a given jsonml array.
var childReduce = exports.childReduce = function(jsonml, fn, acc) {
    var first = jsonml[1];
    if(typeof(first) !== "object" || isArray(first)) {
        acc = fn(acc, first);
    }
    for(var pos = 2; pos < jsonml.length; ++pos) {
        acc = fn(acc, jsonml[pos]);
    }
    return acc;
};

// - `jsonml.ensureAttributeObject(jsonml_array)` changes an jsonml array such that it has a (possibly empty) attribute object at position 1
exports.ensureAttributeObject = function(jsonml) {
    if(typeof jsonml[1] !== "object" || jsonml[1].constructor === Array) {
        jsonml.unshift(jsonml[0]);
        jsonml[1] = {};
    }
};

exports.getAttr = function(jsonml, attribute) {
    if(typeof jsonml[1] !== "object" || jsonml[1].constructor === Array) {
        return undefined;
    } else {
        return jsonml[1][attribute];
    }
};
// Convert jsonml into an easier subscriptable json structure, not preserving 
// the order of the elements
exports.toObject = function(jsonml) {
    var result = {};
    result[jsonml[0]] = toObjectInner(jsonml);
    return result; 
};

// Internal function called by toObject. Return an object corresponding to 
// the child nodes of the `jsonml`-parameter
function toObjectInner(jsonml) {
    var result = {};
    var attr = jsonml[1];
    var pos;
    if(typeof(attr) === "object" && !isArray(attr)) {
        for(var key in attr) { if(attr.hasOwnProperty(key)) {
            result["@" + key] = attr[key];
        } }
        pos = 2;
    } else {
        pos = 1;
        if(jsonml.length === 2 && !isArray(attr)) {
            return attr;
        }
    }
    while(pos < jsonml.length) {
        var current = jsonml[pos];
        if(isArray(current)) {
            addprop(result, current[0], toObjectInner(current));
        } else {
            addprop(result, "_", current);
        }
        ++pos;
    }
    return result;
}

// Add a property to the object. If the property is already there, append 
// the `val`ue to an array at the key instead, possibly putting existing 
// object in front of such array, if that is not an array yet.
function addprop(obj, key, val) {
    if(obj[key]) {
        if(isArray(obj[key])) {
            obj[key].push(val);
        } else {
            obj[key] = [obj[key], val];
        }
    } else {
        obj[key] = val;
    }
}
// Error handler
function JsonML_Error(desc) {
    throw desc;
}

// Array check, implemented here to avoid depending on any library
function isArray(a) {
    return a !== null && typeof(a) === "object"  && a.constructor === Array;
}
