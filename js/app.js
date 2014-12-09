	'use strict';

/* App Module */

var demoApp = angular.module('JsonTransformDemoApp',[
	  'ngRoute'
	, 'ngSanitize' // necessary for outputing HTML in angular directive
	, 'ngStorage' // local storage support for Angular
	, 'mobile-angular-ui' // mobile angular
	
	, 'JsonTransformDemoServices'
	, 'demoDirectives'
]);

demoApp.config(['$routeProvider', function($routeProvider) {
	$routeProvider
	.when('/introduction', {
		name: 'introduction',
		templateUrl: 'modules/demo/partials/introduction.html'
	})
	.when('/accessing', {
		name: 'accessing',
		templateUrl: 'modules/demo/partials/accessing.html'
	})

	.when('/indices', {
		name: 'indices',
		templateUrl: 'modules/demo/partials/indices.html'
	})
	.when('/multi-expressions', {
		name: 'multi-expressions',
		templateUrl: 'modules/demo/partials/multi-expressions.html'
	})
	.when('/preserving-structure', {
		name: 'preserving-structure',
		templateUrl: 'modules/demo/partials/preserving-structure.html'
	})
	.otherwise({
		redirectTo: '/introduction'
	});
}]);