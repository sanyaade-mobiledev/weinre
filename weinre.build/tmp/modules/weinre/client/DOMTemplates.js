var Ex, addToElement_Node, addToElement_Object, addToElement_String, elementName, elementNames, getElementFunction, _i, _len;
Ex = require('../common/Ex');
getElementFunction = function(elementName) {
  return function() {
    var args, argument, element, _i, _len;
    element = document.createElement(elementName);
    args = [].slice.call(arguments);
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      argument = args[_i];
      if (argument.nodeType) {
        addToElement_Node(element, argument);
      } else if (typeof argument === "string") {
        addToElement_String(element, argument);
      } else if (typeof argument === "object") {
        addToElement_Object(element, argument);
      } else {
        throw new Ex(arguments, ("invalid value passed to DOMTemplates." + elementName + "(): ") + argument);
      }
    }
    return element;
  };
};
addToElement_String = function(element, aString) {
  return addToElement_Node(element, document.createTextNode(aString));
};
addToElement_Node = function(element, anElement) {
  return element.appendChild(anElement);
};
addToElement_Object = function(element, anObject) {
  var actualKey, key, val, _results;
  _results = [];
  for (key in anObject) {
    if (!anObject.hasOwnProperty(key)) {
      continue;
    }
    val = anObject[key];
    _results.push(key.substr(0, 1) === "$" ? (actualKey = key.substr(1), element[actualKey] = val) : element.setAttribute(key, val));
  }
  return _results;
};
elementNames = 'H1 H2 H3 H4 H5 H6 UL OL DL LI DT DD SPAN DIV A B I TT P HR BR PRE IMG CANVAS TABLE TR TD FORM INPUT BUTTON SELECT OPTGROUP OPTION TEXTAREA';
elementNames = elementNames.split(' ');
for (_i = 0, _len = elementNames.length; _i < _len; _i++) {
  elementName = elementNames[_i];
  exports[elementName] = getElementFunction(elementName);
  exports[elementName].name = "" + elementName;
  exports[elementName].displayName = "" + elementName;
  exports[elementName].signature = "DOMTemplates." + elementName;
}