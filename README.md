# ![logo](https://ssl.solsort.com/_logo.png) Jsxml
JavaScript utilities for parsing and working xml, mainly in jsonml in array form.

More info on JsonML at [jsonml.org](http://jsonml.org/) and [wikipedia](http://en.wikipedia.org/wiki/JsonML)

This module implements the following functions:

- `jsxml.fromXml(xml_string)` converts a string containing xml to jsonml in array form
- `jsxml.toXml(jsxml_array)` converts jsonml in array form to xml
- `jsxml.toObject(jsxml_array)` converts jsonml in array form to an easier subscriptable object
- `jsxml.childReduce(jsxml_array, callback_function(accumulator, child_element), initial_value)` applies the callback function to each child element of the jsonml array
- `jsxml.getAttr(jsxml_array, attribute)` retrieves the value of a given attribute of the jsonml array or undefined if no attributes, or no attributes defined

Released under open source / MIT license
