'use strict';

/* Configuration */
var envs = {
	"server": {
		"server": {
			"frontend": "http://localhost:8005/app",
			"backend": "http://localhost:8085",
			"parseResponse": true,
			"jsonPrefixed": ")]}',\n"
		},
	},
	"json": {		
		"server": {
			"frontend": "http://localhost:8001/app",
			"backend": "data",
			"parseResponse": false
		}
	}
};
//var env = envs['json']; 
var env = envs['server']; 

var config = angular.module('Config', [])
	.constant("ENV", env);