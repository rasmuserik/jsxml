# JsonML
Utilities for parsing and working with jsonml in array form.

More info on JsonML at [jsonml.org](http://jsonml.org/) and [wikipedia](http://en.wikipedia.org/wiki/JsonML)

This module implements the following functions:

- `jsonml.fromXML(xml_string)` converts a string containing xml to jsonml in array form
- `jsonml.toXML(jsonml_array)` converts jsonml in array form to xml
- `jsonml.toObject(jsonml_array)` converts jsonml in array form to an easier subscriptable object
- `jsonml.childReduce(jsonml_array, callback_function(accumulator, child_element), initial_value)` applies the callback function to each child element of the jsonml array


