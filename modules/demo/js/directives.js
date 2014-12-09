'use strict';

angular.module('demoDirectives', [])
	.directive('demoShow', ['DemoService', function(DemoService){
		// http://docs.angularjs.org/guide/directive
		return {
			restrict: 'E',
			scope: {
				'exampleName': '='
				, 'expressions': '='
				,'dataset': '='
			},
			// ng-if directive: http://docs.angularjs.org/api/ng.directive:ngIf
			// expression: http://docs.angularjs.org/guide/expression
			templateUrl: 'modules/demo/partials/demo-show.html',
			controller: function ( $scope, $element ) {
				$scope.demosFull = DemoService.query();
				$scope.demosFull.$promise.then(function(result){
					console.log("[demoShow] result.examples.length = %d", result.examples.length);
					console.log("[demoShow] $scope.demosFull.examples.length = %d", $scope.demosFull.examples.length);
					if($scope.exampleName){
						$scope.example = $scope.demosFull.examples[$scope.exampleName];
						for(var i in $scope.demosFull.examples){
							var example = $scope.demosFull.examples[i];
							if(example['name-id'] == $scope.exampleName) $scope.example = example;
						}
					}
					if($scope.example){
						console.log("[demoShow] $scope.example (%s) = %s", $scope.exampleName, JSON.stringify($scope.example));
						angular.element(document.querySelector('#expression')).val($scope.example.expressions);
						angular.element(document.querySelector('#dataset')).val(JSON.stringify($scope.example.dataset, null, '\t'));
					}
				}, function(fail){
					alert("Error loading examples: %s", fail);
				});

				$scope.transform = function(){
					console.log("\n\n\n[transform] started");
					var expression = angular.element(document.querySelector('#expression')).val();
					var datasetStr = angular.element(document.querySelector('#dataset')).val();
					var dataset = JSON.parse(datasetStr);
					

					console.log("expression: %s", expression);
					//console.log("datasetStr: %s", datasetStr);	
					console.log("dataset: %s", JSON.stringify(dataset));
					// var datasetTransformed = dataset;
					var datasetTransformed = JSONTransform(dataset, expression);
					angular.element(document.querySelector('#datasetTransformed')).val(JSON.stringify(datasetTransformed, null, '\t'));
					var node = JsonHuman.format(datasetTransformed);
					angular.element(document.querySelector('#datasetTransformedHtml')).html(node);
				};
    		}
		};
	}])
;

