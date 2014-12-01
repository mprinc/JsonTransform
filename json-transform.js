"use strict";

/* JSONPath 0.8.0 - XPath for JSON
 *
 * Copyright (c) 2014 Sasha Mile Rudan & Marko Vucinic
 * Licensed under the MIT (MIT-LICENSE.txt) licence.
 * inspired with: 2007 Stefan Goessner (goessner.net)
 */
function JSONTransform(objOriginal, expression, options) {
	options = options || {};
	var resultFull = {};
	var resultsPartial = [];
	
	if(!expression) return objOriginal;

	var expressions = expression.split(";");
	
	// check if any of keys is named in which case we create associative array (hash, object) instead of array
	var createArray = true;

	// if there is only one result we will return the result without wrapping it neither in array or hash
	// TODO: we need to review this decision
	var resultsNo = 0;
	console.log("[JSONTransform] expressions: %s", JSON.stringify(expressions));
	for(var id in expressions){
		var expr = expressions[id].trim();
		var exprList = expr.split(".");
		if(exprList.length > 0 && exprList[0] == "$") exprList.shift();
		var resultPartial = parseExpression(objOriginal, exprList);
		console.log("[JSONTransform] resultPartial: %s", JSON.stringify(resultPartial));
		resultsPartial.push(resultPartial);

		if(resultPartial && typeof resultPartial == 'object'){
			for(var key in resultPartial){
				if(typeof key == 'string') createArray = false;
				resultsNo++;
			}
		}else if(resultPartial){
			resultsNo++;
		}
	}

	console.log("[JSONTransform] createArray: %s, resultsNo:%s", createArray, resultsNo);
	resultFull = createArray ? [] : {};

	// populate results
	for(var id in resultsPartial){
		var resultPartial = resultsPartial[id];
		if(resultPartial && typeof resultPartial == 'object'){
			for(var key in resultPartial){
				if(resultsNo<=1) return resultPartial;
				if(createArray) resultFull.push(resultPartial[key]);
				else resultFull[key] = resultPartial[key];
			}
		}else if(resultPartial){
			// TODO: decide if we should set null into result
			if(resultsNo<=1) return resultPartial;
			if(createArray) resultFull.push(resultPartial);
			else{
				
			}
		}
	}

	console.log("[JSONTransform] resultFull: %s", JSON.stringify(resultFull));
	return resultFull;
};

function parseExpression(objOriginal, exprList, lastPropertyName, keepPath, depth){
	var obj = objOriginal;

	keepPath = keepPath || false;
	lastPropertyName = lastPropertyName || null;
	depth = depth || 0;
	var depthTabs = "";
	var depthTemp = 0;
	while(depthTemp <= depth){
		depthTabs += "\t";
		depthTemp ++;
	}

	var keepPathRemove = false;
	var result = {};
	var resultPath = result;

	if(exprList.length <= 0){
		result = objOriginal;
		console.log(depthTabs + "[JSONTransform:parseExpression] result: %s", JSON.stringify(result));
		return result;
	}
	while(exprList.length > 0){
		var expr = exprList.shift();
		expr = expr.trim();
		console.log(depthTabs + "[JSONTransform:parseExpression] exprList: %s", JSON.stringify(exprList));
		console.log(depthTabs + "[JSONTransform:parseExpression] obj: %s", JSON.stringify(obj));
		console.log(depthTabs + "[JSONTransform:parseExpression] lastPropertyName: %s, expr: %s", lastPropertyName, expr);
		if(expr.length<=0) continue;
		
		// $.a[0,1].d means that both a[0].d and a[1].d will be returned
		if(expr.indexOf("[") >= 0){
			var exprFull = expr;
			var start = exprFull.indexOf("["), end = exprFull.indexOf("]");
			expr = exprFull.substring(0, start).trim();
			var indices = exprFull.substring(start+1, end);
			console.log(depthTabs + "[JSONTransform:parseExpression] indices: %s, expr: %s", indices, expr);
			
			if(expr.length > 0){
				exprList.unshift("[" + indices + "]");
			}else{
				var indicesList = indices.split(",");

				var resultsPartial = [];
				// check if any of keys is named in which case we create associative array (hash, object) instead of array
				var createArray = true;

				// if there is only one result we will return the result without wrapping it neither in array or hash
				// TODO: we need to review this decision
				var resultsNo = 0;

				for(var id in indicesList){
					var indice = indicesList[id].trim();
					indice = indice.replace(/^[\"\']/, "");
					indice = indice.replace(/[\"\']$/, "");
					console.log(depthTabs + "[JSONTransform:parseExpression] indice: %s, obj: %s", indice, JSON.stringify(obj));
					var exprListCopy = exprList.slice(0);
					var resultPartial = parseExpression(obj[indice], exprListCopy, indice, keepPath, depthTabs+1);
					console.log(depthTabs + "[JSONTransform:parseExpression] indice: %s, resultPartial: %s, resultPath: %s", 
							indice, JSON.stringify(resultPartial), JSON.stringify(resultPath));
					resultPath[lastPropertyName][indice] = resultPartial[indice]; // this: resultPartial[indice] is dirty (should not be need to access with indice) 
				}
				break;
			}
		}

		// $.a{b.c}.d means that b.c part of path will be preserved in the destination object
		if(expr[0] == "{"){
			keepPath = true;
			expr = expr.substring(1);
			console.log(depthTabs + "[JSONTransform:parseExpression] keepPath: %s started. expr: %s", keepPath, expr);
		}
		if(expr[expr.length-1] == "}"){
			keepPathRemove = true; // we will remove at the end of the round
			expr = expr.substring(0, expr.length-1);
			console.log(depthTabs + "[JSONTransform:parseExpression] keepPath: %s stopped. expr: %s", keepPath, expr);
		}

		if(keepPath){
			lastPropertyName = expr;
			if(exprList.length <= 0){
				resultPath[expr] = obj[expr];
			}else if(!result.hasOwnProperty(expr)){
				resultPath[expr] = {};
			}
		}

		obj = obj[expr];

		if(keepPathRemove) // doing delayed removing path-keeping
		{
			keepPath = false;
			keepPathRemove = false;
		}else if(exprList.length <= 0){
			if(lastPropertyName){
				resultPath[lastPropertyName] = obj;
			}else{
				result = obj;
			}
		}

	}

	console.log(depthTabs + "[JSONTransform:parseExpression] result: %s", JSON.stringify(result));
	return result;
};

function parseExpressionPart(objOriginal, expression, resultForExpression){
};

module && module.exports && (module.exports.JSONTransform = JSONTransform);