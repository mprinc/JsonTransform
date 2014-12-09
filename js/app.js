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
		templateUrl: 'modules/demo/partials/introduction.html'
	})
	.when('/accessing', {
		templateUrl: 'modules/demo/partials/accessing.html'
	})

	.when('/history', {
		templateUrl: 'modules/history/partials/index.html'
	})
	.when('/history/id/:id', {
		templateUrl: 'modules/history/partials/history-show.html'
	})
	.otherwise({
		redirectTo: '/introduction'
	});
}]);