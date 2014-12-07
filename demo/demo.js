'use strict';

function transform(){
	console.log("\n\n\n[transform] started");
	var expression = $("#expression").val();
	var datasetStr = $("#dataset").val();
	var dataset = JSON.parse(datasetStr);
	

	console.log("expression: %s", expression);
	//console.log("datasetStr: %s", datasetStr);	
	console.log("dataset: %s", JSON.stringify(dataset));
	// var datasetTransformed = dataset;
	var datasetTransformed = JSONTransform(dataset, expression);
	$("#datasetTransformed").val(JSON.stringify(datasetTransformed));
	var node = JsonHuman.format(datasetTransformed);
	$('#datasetTransformedHtml').html(node);
};

$(document).ready(function(){
	$("#btnTransform").click(transform);
	transform();
});