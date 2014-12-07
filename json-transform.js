"use strict";

/* JSONPath 0.8.0 - XPath for JSON
 *
 * Copyright (c) 2014 Sasha Mile Rudan & Marko Vucinic
 * Licensed under the MIT (MIT-LICENSE.txt) licence.
 * inspired with: 2007 Stefan Goessner (goessner.net)
 */
function JSONTransform(objOriginal, expressionsStr, options) {
	options = options || {};
	var resultFull = {};
	var resultsPartial = [];
	
	if(!expressionsStr) return objOriginal;

	var expressions = expressionsStr.split(";");
	
	// check if any of keys is named in which case we create associative array (hash, object) instead of array
	var createArray = true;

	// if there is only one result we will return the result without wrapping it neither in array or hash
	// TODO: we need to review this decision
	var resultsNo = 0;
	console.log("[JSONTransform] expressions: %s", JSON.stringify(expressions));
	for(var id in expressions){
		var expr = expressions[id].trim();
		
		var expressionTree = parseExpressions(expr);
		console.log("[JSONTransform] expr: %s", expr);
		var resultPartial = processExpressionTree(objOriginal, expressionTree);
		
//		var exprList = expr.split(".");
//		if(exprList.length > 0 && exprList[0] == "$") exprList.shift();
//		resultPartial = processExpression(objOriginal, exprList);
		console.log("[JSONTransform] resultPartial: %s", JSON.stringify(resultPartial));
		resultsPartial.push(resultPartial);

		// if there is no flag:f and it is complex object but not Array
		if(!expressionTree.$innerStates.flags.flat && (typeof resultPartial == 'object' && resultPartial.constructor != Array)){
			createArray = false;
		}
		resultsNo++;
	}

	// if(typeof key == 'string') createArray = false;
	console.log("[JSONTransform] createArray: %s, resultsNo:%s", createArray, resultsNo);
	if(resultsNo == null){
		resultFull = null;
	}else if(resultsNo == 1){
		resultFull = resultsPartial[0];
	}else{
		resultFull = createArray ? [] : {};

		// populate results
		for(var id in resultsPartial){
			var resultPartial = resultsPartial[id];
			if(resultPartial && typeof resultPartial == 'object'){
				for(var key in resultPartial){
					if(createArray) resultFull.push(resultPartial[key]);
					else resultFull[key] = resultPartial[key];
				}
			}else if(resultPartial){
				if(createArray) resultFull.push(resultPartial);
				else{
					// error, partial result is not possible to put in the result 
				}
			}
		}		
	}

	console.log("[JSONTransform] resultFull: %s", JSON.stringify(resultFull));
	return resultFull;
};

/**
 * @ngdoc object
 * @name parseExpressions
 * @function
 *
 * @description
 * Parses provided expressions (provided as string) into the array of trees.
 * Each element of the array is a tree that represents one expression from expressions (separated by ";") that are provided as input.
 * 
 * ## Example ((spaces are introduced just for clarity, without any syntatic need or semantic change)
 *   <pre>
        "$.data.a.name; $.data { ['a', 'b'] } ['name', 'surname']
     </pre>
 * 
 * would get translated into array of two trees:
 *   <pre>
        [
        	[{
        		type: 'property'
        		value: 'data'
        	},{
        		type: 'property'
        		value: 'a'
        	},{
        		type: 'property'
        		value: 'name'
        	}],

        	[{
        		type: 'property'
        		value: 'data'
        	},{
        		type: 'range'
        		value: ['a', 'b']
        	},{
        		type: 'range'
        		value: ['name', 'surname']
        	}]
        ]
     </pre>
 *
   * @param {string} expressions list in the form of plain string
 * @returns {Arraay.<Tree>} an list of trees, where each tree represents one expression given as input
 */
var CHAR_EXPRESSION_START = "$";
var CHAR_PROPERTY_NEXT = ".";
var CHAR_EXPRESSION_NEXT = ";";
var CHAR_INDEX_START = "[";
var CHAR_INDEX_END = "]";
var CHAR_INDEX_SEPARATOR = ",";
var CHAR_KEEP_PATH_START = "{";
var CHAR_KEEP_PATH_END = "}";
var CHAR_QUOTE = ["'", "\""];
var CHAR_FLAGS_START = "(";
var CHAR_FLAGS_END = ")";

var CHAR_SPACE = [" ", "\t", "\r", "\n"];

var TYPE_END = -2;
var TYPE_UNKNOWN = -1;
var TYPE_START = 0;
var TYPE_FLAGS = 1;
var TYPE_PROPERTY = 2;
var TYPE_INDEX = 3;
var TYPE_KEEP_PATH = 4;
// not necessary, TYPE_KEEP_PATH_LEAVING is only for parseInitNewState() to not put new state but come back to the existing one
// TODO: this is necessary to be fixed
var TYPE_KEEP_PATH_LEAVING = 5;

var STATE_STARTING = 0;
var STATE_STARTED = 1;

// type: index
var STATE_INDEX_EXPECTING_SELECTOR = 2;
var STATE_INDEX_EXPECTING_SELECTOR_SEPARATOR = 3;
var STATE_INDEX_SELECTOR_STRING = 4;

var STATE_KEEP_PATH_ENTERING = 2;
var STATE_KEEP_PATH_LEAVING = 3;

var INDEX_SELECTOR_TYPE_NAME = 0;
var INDEX_SELECTOR_TYPE_NUMBER = 1;
var specialChars = [CHAR_EXPRESSION_START, CHAR_PROPERTY_NEXT, CHAR_EXPRESSION_NEXT, CHAR_INDEX_START, CHAR_INDEX_END, CHAR_KEEP_PATH_START, 
                    CHAR_KEEP_PATH_END, CHAR_QUOTE[0], CHAR_QUOTE[1], CHAR_FLAGS_START, CHAR_FLAGS_END];
function parseExpressions(expressionsStr){
	var expressionsTree = [];
	var currentState = {
			type: TYPE_START,
			value: "",
			nextState: null,
			parentState: null,
			childState: null,
			$innerStates: {
				processingState: STATE_STARTING
			}
	};
	var expressionTree = {
		$innerStates: {
			starting: true,
			expressions: expressionsStr,
			index: 0,
			currentState: currentState,
			startState: currentState,
			flags: {
				flat: false
			}
		}
	};
	var c = null;
	var it = 1000;
	while(c = stepForward(expressionTree)){
		//console.log("[parseExpressions] c: %s, expressionTree: \n%s", c, parsePrintExpressionTree(expressionTree));
		if(!it--) break;
		var currentState = expressionTree.$innerStates.currentState;
		var currentType = currentState.type;
		switch(currentType){
		case TYPE_START:
			if(c == '$'){
				c = stepForward(expressionTree);
				if(!c) break;
				if(c != "."){
					parsingError("After the starting '$' next character has to be '.'", expressionTree);
				}
			}else{
				stepBackward(expressionTree);
				var newState = parseDetectNewStateType(expressionTree);
				parseInitNewState(expressionTree, newState);
				//c = stepForward(expressionTree);
			}
			break;
		case TYPE_FLAGS:
			if(currentState.$innerStates.processingState == STATE_STARTING){
				currentState.$innerStates.processingState = STATE_STARTED;
			}

			if(specialChars.indexOf(c) < 0){
				switch(c){
					case 'f':
						expressionTree.$innerStates.flags.flat = true;
						break;
				};
			}else{
				if(CHAR_FLAGS_END != c){
					parsingError("Flags should finish with ')'", expressionTree);					
				}
				var nextState = parseDetectNewStateType(expressionTree);
				parseInitNewState(expressionTree, nextState);
			}
			break;
		case TYPE_PROPERTY:
			if(currentState.$innerStates.processingState == STATE_STARTING){
				currentState.$innerStates.processingState = STATE_STARTED;
			}

			if(specialChars.indexOf(c) < 0){
				currentState.value += c;
			}else{
				stepBackward(expressionTree);
				var nextState = parseDetectNewStateType(expressionTree);
				parseInitNewState(expressionTree, nextState);
			}
			break;
		case TYPE_INDEX:
			if(currentState.$innerStates.processingState == STATE_STARTING){
				currentState.value = [];
				currentState.$innerStates.processingState = STATE_INDEX_EXPECTING_SELECTOR;
			}
			switch(currentState.$innerStates.processingState){
			case STATE_INDEX_EXPECTING_SELECTOR:
				if(CHAR_SPACE.indexOf(c) >= 0) break;
				else if(CHAR_INDEX_SEPARATOR == c && currentState.value.length <= 0){
					parsingError("Comma (index selector separator) cannot be placed before the first selector", expressionTree);
					break;
				}else if(CHAR_QUOTE.indexOf(c) >= 0){
					currentState.$innerStates.processingSelector = {
						type: INDEX_SELECTOR_TYPE_NAME,
						value: ""
					};
					currentState.$innerStates.processingState = STATE_INDEX_SELECTOR_STRING;
				}else if(CHAR_INDEX_END == c){
					var nextState = parseDetectNewStateType(expressionTree);
					parseInitNewState(expressionTree, nextState);
				}
				else if("0123456789".indexOf(c) >= 0){
					currentState.$innerStates.processingSelector = {
						type: INDEX_SELECTOR_TYPE_NUMBER,
						value: c
					};
					currentState.$innerStates.processingState = STATE_INDEX_SELECTOR_STRING;
				}else{
					parsingError("Unexpected character as index selector. It has to be property name (enclosed with quotes) or array index (number)", expressionTree);
				}
				// TODO: detect illegal characters
				break;
			case STATE_INDEX_EXPECTING_SELECTOR_SEPARATOR:
				if(CHAR_SPACE.indexOf(c) >= 0) break;
				else if(CHAR_INDEX_SEPARATOR == c){
					currentState.$innerStates.processingState = STATE_INDEX_EXPECTING_SELECTOR;
					break;
				}else if(CHAR_INDEX_END == c){
					var nextState = parseDetectNewStateType(expressionTree);
					parseInitNewState(expressionTree, nextState);
				}else{
					parsingError("Unexpected character after the last index selector. It has to be either spaces or selector separator (',') or end of selecting (']')", expressionTree);
				}
				break;
			case STATE_INDEX_SELECTOR_STRING:
				switch(currentState.$innerStates.processingSelector.type){
				case INDEX_SELECTOR_TYPE_NAME:
					if(CHAR_QUOTE.indexOf(c) >= 0){
						currentState.value.push(currentState.$innerStates.processingSelector);
						currentState.$innerStates.processingState = STATE_INDEX_EXPECTING_SELECTOR_SEPARATOR;
					}else{
						currentState.$innerStates.processingSelector.value += c;
					}
					break;
				case INDEX_SELECTOR_TYPE_NUMBER:
					if(CHAR_SPACE.indexOf(c) >= 0 || CHAR_INDEX_SEPARATOR == c || CHAR_INDEX_END == c){
						currentState.value.push(currentState.$innerStates.processingSelector);
						currentState.$innerStates.processingState = STATE_INDEX_EXPECTING_SELECTOR_SEPARATOR;
						stepBackward(expressionTree);
					}else if("0123456789".indexOf(c) >= 0){
						currentState.$innerStates.processingSelector.value += c;
					}else{
						parsingError("Unexpected character for a number index selector. It has to be digit", expressionTree);						
					}
					break;
				}
				break;
			}

			break;
		case TYPE_KEEP_PATH:
			if(currentState.$innerStates.processingState == STATE_STARTING){
				currentState.$innerStates.processingState = STATE_KEEP_PATH_ENTERING;
			}
			switch(currentState.$innerStates.processingState){
			case STATE_KEEP_PATH_ENTERING:
				currentState.$innerStates.processingState = STATE_KEEP_PATH_LEAVING;
				var nextState = parseDetectNewStateType(expressionTree);
				parseInitNewState(expressionTree, nextState, 2);

				break;
			case STATE_KEEP_PATH_LEAVING:
				var nextState = parseDetectNewStateType(expressionTree);
				parseInitNewState(expressionTree, nextState);
				// we want to skip the special character
				//c = stepForward(expressionTree);
				break;
			}
			break;
		// not necessary, TYPE_KEEP_PATH_LEAVING is only for parseInitNewState() to not put new state but come back to the existing one
		// TODO: this is necessary to be fixed
//		case TYPE_KEEP_PATH_LEAVING:
//			break;
		}
	}
	console.log("[parseExpressions]expressionTree: \n%s", parsePrintExpressionTree(expressionTree));
	return expressionTree;
	//return  expressionsTree;
}

/**
 * @ngdoc object
 * @name parsePrintExpressionTree
 * @function
 *
 * @description
 * produce string with simplified representation of the expression tree than JSON.stringify() would do it (avoiding some properties and not following some deep-links)
 * @param {Tree} expression tree
 * @returns new state
 */
function parsePrintExpressionTree(expressionTree){
	var treeStr = "";
	var options = {
			tabs: "\t"
		};

	var currentState = expressionTree.$innerStates.startState;
	currentState.visited = false;
	if(currentState.childState) currentState.childState.visited = false;
	if(currentState.nextState) currentState.nextState.visited = false;
	while(currentState){
		if(!currentState.visited){
			treeStr += options.tabs + "type: "+parseTypeToStr(currentState.type) + ", value: "+JSON.stringify(currentState.value) + "\n";
		}
		currentState.visited = true;
		
		currentState = nextStateInExpressionTree(expressionTree, currentState, options);
	}
	return treeStr;
}

/**
 * @ngdoc object
 * @name parseTypeToStr
 * @function
 *
 * @description
 * converts integral representation of type into string
 * @param {integer} type
 * @returns string representation of the type
 */
function parseTypeToStr(type){
	var typeStr = null;
	switch(type){
	case TYPE_UNKNOWN:
		typeStr = "KEEP_UNKNOWN";
		break;
	case TYPE_FLAGS:
		typeStr = "FLAGS";
		break;
	case TYPE_START:
		typeStr = "START";
		break;
	case TYPE_PROPERTY:
		typeStr = "PROPERTY";
		break;
	case TYPE_INDEX:
		typeStr = "INDEX";
		break;
	case TYPE_KEEP_PATH:
		typeStr = "KEEP_PATH_ENTERING";
		break;
	case TYPE_KEEP_PATH_LEAVING:
		typeStr = "KEEP_PATH_LEAVING";
		break;
	default:
		typeStr = "unknown";
		break;
	}
	return typeStr;
}

/**
 * @ngdoc object
 * @name parseDetectNewStateType
 * @function
 *
 * @description
 * detects the new state based on the current character and previous state 
 * @param {Tree} expression tree (it has inner property $innerStates that holds all relevant params
 * @returns new state
 */
function parseDetectNewStateType(expressionTree){
	var newStateType = TYPE_UNKNOWN;
	
	var c = expressionTree.$innerStates.expressions[expressionTree.$innerStates.index];
	if(c == undefined){
		newStateType = TYPE_END;
	}else if(expressionTree.$innerStates.index == 0 && c == "$"){
		newStateType = TYPE_START;
	}else if(CHAR_EXPRESSION_START == c){
		newStateType = TYPE_START;
	}else if(CHAR_INDEX_START == c){
		newStateType = TYPE_INDEX;		
	}else if(CHAR_PROPERTY_NEXT == c){
		newStateType = TYPE_PROPERTY;
		stepForward(expressionTree);
	}else if(CHAR_KEEP_PATH_START == c){
		newStateType = TYPE_KEEP_PATH;
	}else if(CHAR_KEEP_PATH_END == c){
		newStateType = TYPE_KEEP_PATH_LEAVING;
	}else if(CHAR_FLAGS_START == c){
		newStateType = TYPE_FLAGS;
		stepForward(expressionTree);
	}else{
		newStateType = TYPE_PROPERTY;
	}
	// console.log("[parseDetectNewStateType] c: %s, newStateType: %s", c, newStateType);
	return newStateType;
}

/**
 * @ngdoc object
 * @name parseInitNewState
 * @function
 *
 * @description
 * detects the new state based on the current character and previous state 
 * @param {Tree} expression tree (it has inner property $innerStates that holds all relevant params
 * @param {integer} 0: default to the type, 1: as next, 2: as child
 * @returns new state
 */
function parseInitNewState(expressionTree, newStateType, putAs){
	putAs = putAs || 0;
	if(TYPE_END == newStateType){
		return null;
	}
	var newState = {
		type: newStateType,
		value: "",
		parentState: null,
		childState: null,
		nextState: null,
		$innerStates: {
			processingState: STATE_STARTING
		}
	};
	switch(putAs){
	case 1: // as next
		expressionTree.$innerStates.currentState.nextState = newState;
		newState.parentState = expressionTree.$innerStates.currentState.parentState;
		break;
	case 2: // as child
		expressionTree.$innerStates.currentState.childState = newState;
		newState.parentState = expressionTree.$innerStates.currentState;
		break;
	case 0:
	default:
		switch(newStateType){
		case TYPE_KEEP_PATH_LEAVING:
			newState = expressionTree.$innerStates.currentState.parentState;
			break;
		default:
			expressionTree.$innerStates.currentState.nextState = newState;
			newState.parentState = expressionTree.$innerStates.currentState.parentState;
			break;		
		}
		break;
	}

	expressionTree.$innerStates.currentState = newState;

	return newState;
}

/**
 * @ngdoc object
 * @name stepBack
 * @function
 *
 * @description
 * goes step back in parsing the string of expressions and return the key at that PREVIOUS position 
 * @param {Tree} expression tree (it has inner property $innerStates that holds all relevant params
 * @returns character at the stepped back position
 */
function stepBackward(expressionTree){
	//console.log("[stepBackward] expressionTree.$innerStates.expressions: %s, expressionTree.$innerStates.index:%d",
	//		expressionTree.$innerStates.expressions, expressionTree.$innerStates.index);
	if (expressionTree.$innerStates.index > expressionTree.$innerStates.expressions.length || expressionTree.$innerStates.index<=0) return null;
	var c = expressionTree.$innerStates.expressions[--expressionTree.$innerStates.index];
	return c;
}
/**
 * @ngdoc object
 * @name stepBack
 * @function
 *
 * @description
 * goes step forward in parsing the string of expressions and return the character at that position BEFORE stepping forward
 * @param {Tree} expression tree (it has inner property $innerStates that holds all relevant params
 * @returns character at the position BEFORE stepping forward
 */
function stepForward(expressionTree){
	//console.log("[stepForward] expressionTree.$innerStates.expressions: %s, expressionTree.$innerStates.index:%d",
	//		expressionTree.$innerStates.expressions, expressionTree.$innerStates.index);
	if (expressionTree.$innerStates.index >= expressionTree.$innerStates.expressions.length || expressionTree.$innerStates.index<0) return null;
	var c = expressionTree.$innerStates.expressions[expressionTree.$innerStates.index++];
	return c;
}

/**
 * @ngdoc object
 * @name parseExpressions
 * @function
 *
 * @description
 * reports the parsing error 
 * @param {integer} position at which error occurred
 * @param {string} error message
 * @param {Tree} parsing tree at the moment of the error
 */
function parsingError(msg, tree){
	console.log("[JSONTransform:parsingError] at the position: %s, Parsing error: %s", tree.$innerStates.index, msg);
	console.log("[JSONTransform:parsingError] tree: %s", parsePrintExpressionTree(tree));
}

/**
 * @ngdoc object
 * @name parsePrintExpressionTree
 * @function
 *
 * @description
 * Checks if part of path that stands behind the state should be preserved in the output data structure
 * @param {Object} the state we are interested if it is under the keep-path clausula
 * @param {Boolean} returns true if the path corresponding to the state should be preserved
 * @returns processed object
 */
function isKeepPath(expressionTree, currentState){
	if(expressionTree.$innerStates.flags.flat) return false;
	while(currentState){
		if(currentState.type == TYPE_KEEP_PATH) return true;
		currentState = currentState.parentState;
	}
	return false;
}

/**
 * @ngdoc object
 * @name parsePrintExpressionTree
 * @function
 *
 * @description
 * Processes object according to the expression tree. Most of the time it navigates through the object structure and extracts particular part of object and gives it as a result,
 * but very often original path of the object structure is preserved
 * @param {Object} object to be processed
 * @param {Tree} expression tree
 * @returns processed object
 */
function nextStateInExpressionTree(expressionTree, currentState, options){
	if(currentState.childState && !currentState.childState.visited){
		currentState = currentState.childState;
		if(currentState.childState) currentState.childState.visited = false;
		if(currentState.nextState) currentState.nextState.visited = false;
		if(options){
			options.tabs += "\t";
		}
	}else if(currentState.nextState){
		currentState = currentState.nextState;
		if(currentState.childState) currentState.childState.visited = false;
		if(currentState.nextState) currentState.nextState.visited = false;
	}else if(currentState.parentState){
		// do not return on the parent state but the next one to the parent of grandparent (if the parent doesn't have next), etc, so bubbling-up
		do{
			currentState = currentState.parentState;
			if(options){
				options.tabs = options.tabs.substring(0, options.tabs.length-1);
			}
		}while(currentState && !currentState.nextState);

		if(currentState && currentState.nextState){
			currentState = currentState.nextState;		
			if(currentState.childState) currentState.childState.visited = false;
			if(currentState.nextState) currentState.nextState.visited = false;
		}
	}else{
		currentState = null;
	}
	return currentState;
}

/**
 * @ngdoc object
 * @name parsePrintExpressionTree
 * @function
 *
 * @description
 * Processes object according to the expression tree. Most of the time it navigates through the object structure and extracts particular part of object and gives it as a result,
 * but very often original path of the object structure is preserved
 * @param {Object} object to be processed
 * @param {Tree} expression tree
 * @returns processed object
 */
function processExpressionTree(objOriginal, expressionTree, currentState){
	console.log("[JSONTransform:processExpressionTree] expressionTree: \n%s, objOriginal: %s", parsePrintExpressionTree(expressionTree), JSON.stringify(objOriginal));

	var result = {};
	var resultPath = result;
	var obj = objOriginal;

	if(currentState === undefined){
		currentState = expressionTree.$innerStates.startState;
	}
	if(!currentState) return obj;
	if(!obj) return obj;

	currentState.visited = false;
	if(currentState.childState) currentState.childState.visited = false;
	if(currentState.nextState) currentState.nextState.visited = false;
	var lastPropertyName = null;
	var leaveTheLoop = false;
	while(currentState && !leaveTheLoop){
		if(!currentState.visited){
			currentState.visited = true;

			switch(currentState.type){
			case TYPE_KEEP_PATH:
				resultPath = result;
				break;
			case TYPE_PROPERTY:
				// skip empty properties, like "$.{a}.{ab}"
				// TODO: try avoiding creation, but later deletion is complicater because of references, referencin the state
				if(currentState.value == "") break;
				if(isKeepPath(expressionTree, currentState)){
					if(lastPropertyName) resultPath = resultPath[lastPropertyName];
					resultPath[lastPropertyName = currentState.value] = {};
				}else{
				}
				obj = obj[currentState.value];
				break;
			case TYPE_INDEX:
				var results = null;
				var resultsNamed = null;
				if(isKeepPath(expressionTree, currentState)){
					if(obj.constructor === Array){
						resultsNamed = [];
					}else{
						resultsNamed = {};
					}
				}else{
					results = [];
				}
				
				for(var i in currentState.value){
					var selector = currentState.value[i];
					var subState = nextStateInExpressionTree(expressionTree, currentState);
					var res = processExpressionTree(obj[selector.value], expressionTree, subState);
					if(results){
						if(expressionTree.$innerStates.flags.flat && res.constructor === Array){
							for(var i=0; i<res.length; i++){
								results.push(res[i]);
							}
						}else{
							results.push(res);							
						}
					}else{
						resultsNamed[selector.value] = res;
					}
				}
				if(results){
					if(results.length == 1){
						obj = results[0];
					}else if(results.length == 0){
						obj = null;
					}else{
						obj = results;
					}
				}
				if(resultsNamed){
					obj = resultsNamed;
				}
				leaveTheLoop = true;
				break;
			}
		}
		currentState = nextStateInExpressionTree(expressionTree, currentState);
	}
	if(lastPropertyName){
		resultPath[lastPropertyName] = obj;
	}else{
		result = obj;
	}
	return result;
}

typeof module !== 'undefined' && module.exports && (module.exports.JSONTransform = JSONTransform);