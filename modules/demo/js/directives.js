'use strict';

angular.module('demoDirectives', [])
	.directive('demoExpression', ['$rootScope', 'DemoService', function($rootScope, $route, DemoService){
		// http://docs.angularjs.org/guide/directive
		return {
			restrict: 'E',
			scope: {
			},
			// ng-if directive: http://docs.angularjs.org/api/ng.directive:ngIf
			// expression: http://docs.angularjs.org/guide/expression
			templateUrl: 'modules/demo/partials/demo-expression.html',
			controller: function ( $scope, $element, $attrs ) {
				//alert($attrs.expression);
				$scope.expressionVal = String($attrs.expression);
				$scope.populate = function(){
					// $scope.$parent.$emit
					$rootScope.$broadcast('newExpression', $scope.expressionVal);
					//alert("sending: "+$scope.expression);
				};
    		}
		};
	}])
	.directive('demoNavbar', ['$route', 'DemoService', function($route, DemoService){
		// http://docs.angularjs.org/guide/directive
		return {
			restrict: 'E',
			scope: {
			},
			// ng-if directive: http://docs.angularjs.org/api/ng.directive:ngIf
			// expression: http://docs.angularjs.org/guide/expression
			templateUrl: 'modules/demo/partials/demo-navbar.html',
			controller: function ( $scope, $element ) {
				$scope.navInfo = {
					prevNameId: null,
					nextNameId: null
				};
				function updateNavbar(route){
					//alert("updateNavbar: "+route.name);
					$scope.navInfo.prevNameId = null;
					$scope.navInfo.nextNameId = null;
					for(var i=0; i<$scope.demosFull.examples.length; i++){
						if($scope.demosFull.examples[i]['name-id'] == route.name){
							if(i>0) $scope.navInfo.prevNameId = $scope.demosFull.examples[i-1]['name-id'];
							if(i<($scope.demosFull.examples.length-1)) $scope.navInfo.nextNameId = $scope.demosFull.examples[i+1]['name-id'];
						}
					}
					console.log("[demoNavbar] $scope.navInfo = %s", JSON.stringify($scope.navInfo));
				};

				$scope.demosFull = DemoService.query();
				$scope.experimentNames = [];
				$scope.demosFull.$promise.then(function(result){
					console.log("[demoNavbar] result.examples.length = %d", result.examples.length);
					console.log("[demoNavbar] $scope.demosFull.examples.length = %d", $scope.demosFull.examples.length);
					updateNavbar($route.current);

					$scope.$on('$routeChangeSuccess', function(next, current) {
						updateNavbar(current);
					});
				}, function(fail){
					alert("Error loading examples: %s", fail);
				});
    		}
		};
	}])
	.directive('demoMenu', ['DemoService', function(DemoService){
		// http://docs.angularjs.org/guide/directive
		return {
			restrict: 'E',
			scope: {
			},
			// ng-if directive: http://docs.angularjs.org/api/ng.directive:ngIf
			// expression: http://docs.angularjs.org/guide/expression
			templateUrl: 'modules/demo/partials/demo-menu.html',
			controller: function ( $scope, $element ) {
				$scope.demosFull = DemoService.query();
				$scope.experimentNames = [];
				$scope.demosFull.$promise.then(function(result){
					console.log("[demoMenu] result.examples.length = %d", result.examples.length);
					console.log("[demoMenu] $scope.demosFull.examples.length = %d", $scope.demosFull.examples.length);
					for(var i in $scope.demosFull.examples){
						$scope.experimentNames.push({
							'name-id': $scope.demosFull.examples[i]['name-id'],
							name:$scope.demosFull.examples[i].name
						});
					}
					console.log("[demoMenu] $scope.experimentNames = %s", JSON.stringify($scope.experimentNames));
				}, function(fail){
					alert("Error loading examples: %s", fail);
				});
    		}
		};
	}])
	.directive('demoShow', ['$rootScope', '$route', 'DemoService', function($rootScope, $route, DemoService){
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
					console.log("[demoShow] $scope.exampleName = %s", $scope.exampleName);
					if($scope.exampleName){
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
					$scope.experimentNameId = $route.current.name;
				};
				// http://stackoverflow.com/questions/11252780/whats-the-correct-way-to-communicate-between-controllers-in-angularjs/19498009#19498009
				$rootScope.$on('newExpression', function(event, expression) {
					// alert("received: "+expression);
					angular.element(document.querySelector('#expression')).val(String(expression));
					$scope.transform();
				});
    		}
		};
	}])
;

