## Introduction

**JsonTransform** is a JSON flow (REST, ...) with strong focus on preserving original flow schema/structure/semantic.
It is heavily inspired with  and [XPath](http://www.w3.org/standards/techs/xpath#w3c_all), and its JSON/JS equivalent [JSONPath](http://goessner.net/articles/JsonPath/), but rather acting rather as an interceptor of JSON flow communication with on-the-fly support for filtering and semantic restructuring of underlying JSON dataset
Surely it can be used on vanilla JSON objects, but that is not of our main interest.



## WHY
Here are some reasons for creationg JsonTransform

* Support for **on-the-fly** interception and modification of a JSON flow
	* filtering
	* schema/semantic/structure modification
	* on-the-fly REST API addaptation
	* itercepting and observing dataflow
	* triggering side actions on dataflow triggers

### Scenarios
Let observe some examples on the following JSON-object:

    {
    "data":{
    		"SimpleStats":{
    			"paragraphLengthInWords":{
    				"MIDDLE":{
    					"RESULT_ITEMS_COUNT":0,
    					"RESULT_HITS_COUNT":0
    				},
    				"ALL":{
    					"RESULT_ITEMS_COUNT":2700,
    					"RESULT_HITS_COUNT":272456
    				}
    			},
    			"sentenceLength":{
    				"MIDDLE":{
    					"RESULT_ITEMS_COUNT":4241,
    					"RESULT_HITS_COUNT":87332
    				},
    				"ALL":{
    					"RESULT_ITEMS_COUNT":13039,
    					"RESULT_HITS_COUNT":272456
    				}
    			},
    			"paragraphLengthInSentences":{
    				"MIDDLE":{
    					"RESULT_ITEMS_COUNT":0,
    					"RESULT_HITS_COUNT":0
    				},
    				"ALL":{
    					"RESULT_ITEMS_COUNT":2700,
    					"RESULT_HITS_COUNT":13039
    				}
    			}
    		}
    	},
    	"params":{
    		"fileOut.type":"html",
    		"fileOut.name": "uppsala/lolita-en - stats results.html"
    	}
    }

#### Preserving structure
We want to have a way of querying that will let us preserve structure, and information origin. 

**HINT**: few great tool for online experimenting with JSONPath are:

* [ashphy.com/JSONPathOnlineEvaluator] (http://ashphy.com/JSONPathOnlineEvaluator/)
* [jsonpath.curiousconcept.com] (http://jsonpath.curiousconcept.com/)

For example:

executing `$.[data.SimpleStats]..ALL` with 


    {
    "data":{
    		"SimpleStats":{
    			"paragraphLengthInWords":{
    				"ALL":{
    					"RESULT_ITEMS_COUNT":2700,
    					"RESULT_HITS_COUNT":272456
    				}
    			},
    			"sentenceLength":{
    				"ALL":{
    					"RESULT_ITEMS_COUNT":13039,
    					"RESULT_HITS_COUNT":272456
    				}
    			},
    			"paragraphLengthInSentences":{
    				"ALL":{
    					"RESULT_ITEMS_COUNT":2700,
    					"RESULT_HITS_COUNT":13039
    				}
    			}
    		}
    }

JSONPath results with:

    [
    	{
    		"RESULT_ITEMS_COUNT":2700,
    		"RESULT_HITS_COUNT":272456
    	},
    	{
    		"RESULT_ITEMS_COUNT":13039,
    		"RESULT_HITS_COUNT":272456
    	},
    	{
    		"RESULT_ITEMS_COUNT":2700,
    		"RESULT_HITS_COUNT":13039
    	}
    ]

which is clearly far away from our needs.

As we can see the result is not providing any knowledge **where from results are coming from** ("paragraphLengthInWords", "sentenceLength", "paragraphLengthInSentences"), and it is clear destroying the original schema.

What we want to have is to have a declarative power to say ***which part of data structure we would like to preserve*** and which to ***remove*** or simply **fitler****.

### References to XPath and JSONPath and problems with their approach

JSONPath library is basically a way of selecting a set/list of JSON sub-objects (chunks) that fulfil particular requirement.

In essence, the result of the JSON querying against the JSONPath library would be an regular JS array containing set of JSON chunks fulfiling provided query.

There are two fundamental issues with this approach:
* JSON original schema is destroyed and we cannot just simply filter, or reduce some part of original JSON flow/object without ending up with plain JS array.
* There is also another inconsistency: JSONPath is not equally treating JS arrays and JS associative arrays (basically object with properties serving as associative keys).
	* For example if we try to execute `$.store.book[3,4,7]` we would get an array of 3 books (book 3,4, & 7). However if we try similar thing with associative array:  `$.data.SimpleStats['paragraphLengthInWords', 'paragraphLengthInSentences'].ALL` and to get something like:


    {
        "paragraphLengthInWords":{
    		"ALL":{
    			"RESULT_ITEMS_COUNT":2700,
    			"RESULT_HITS_COUNT":272456
    		}
    	  },
    	  "paragraphLengthInSentences":{
    		"ALL":{
    			"RESULT_ITEMS_COUNT":2700,
    			"RESULT_HITS_COUNT":13039
    		}
    	  }
    }

Examples:

* ${.phoneNumbers=>'number'}[?(@.type == 'iPhone')]
* 

### Nice to have features?

## Examples

---


#### COPYRIGHT AND LICENSE
