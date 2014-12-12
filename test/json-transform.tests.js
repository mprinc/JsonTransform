var JSONTransform = require('../json-transform');

var expect = require('chai').expect;
var assert = require('chai').assert;

// testing:
// cd ~/Documents/data/development/Bukvik/project/src/frontend/app/lib/jsonpath/
// node node_modules/mocha/bin/mocha test/json-transform.tests.js
// cp /Users/sasha/Documents/data/development/Bukvik/project/src/frontend/app/lib/jsonpath/json-transform.js /Users/sasha/Documents/data/development/JsonTransform-web/
// cp /Users/sasha/Documents/data/development/Bukvik/project/src/frontend/app/lib/jsonpath/test/json-transform.tests.js /Users/sasha/Documents/data/development/JsonTransform/test/
// cd /Users/sasha/Documents/data/development/JsonTransform-web/
describe('JSONTransform', function() {

	describe('when doing empty access', function() {

		var transform = JSONTransform.JSONTransform;
		var obj = {
			'test': 1	
		};

		it('should get same object when not providing path: (none)', function() {
			var result = transform(obj);
			expect(result).to.be.deep.equal(obj);
		});

		it('should get same object for blanco path: ""', function() {
			var result = transform(obj, "");
			expect(result).to.be.deep.equal(obj);
		});

		it('should get same object for "$" path: "$"', function() {
			var result = transform(obj, "$");
			expect(result).to.be.deep.equal(obj);
		});
	});

	describe('when doing basic access', function() {

		var transform = JSONTransform.JSONTransform;
		var obj = {
			'a': {
				'aa': {
					'aaa': 2,
					'aab': 'hello'
				},
				'ab': {
					'aba': 'world',
					'abb': 2.05
				}
			},
			'b': {
				'ba': 'not',
				'bb': 'that',
				'bc': 'deep'
			}
		};

		it('should get sub-object when provided property name: "$.a", "a"', function() {
			var result = transform(obj, "$.a");
			//expect(result).to.be.equal(obj.a); // it is reconstructed, cannot be same by the reference any more
			expect(result).to.be.deep.equal(obj.a);

			var result = transform(obj, "a");
			//expect(result).to.be.equal(obj.a); // it is reconstructed, cannot be same by the reference any more
			expect(result).to.be.deep.equal(obj.a);
		});

		it('should get sub-object when provided chain of property names: "$.a.aa.aab", "$.a.ab.aba"', function() {
			var result = transform(obj, "$.a.aa.aab");
			//expect(result).to.be.equal(obj.a.aa.aab); // it is reconstructed, cannot be same by the reference any more
			expect(result).to.be.equal("hello");

			var result = transform(obj, "$.a.ab.aba");
			//expect(result).to.be.equal(obj.a.ab.aba); // it is reconstructed, cannot be same by the reference any more
			expect(result).to.be.equal("world");
		});
	});

	describe('when keeping object structure', function() {

		var transform = JSONTransform.JSONTransform;
		var obj = {
			'a': {
				'aa': {
					'aaa': 2,
					'aab': 'hello'
				},
				'ab': {
					'aba': 'world',
					'abb': 2.05
				}
			},
			'b': {
				'ba': 'not',
				'bb': 'that',
				'bc': 'deep'
			}
		};

		it('should get sub-object when provided property name: "$.{a}"', function() {
			var result = transform(obj, "$.{a}");
			//console.log("[test] result: %s", JSON.stringify(result));
			expect(result).to.have.property('a');
			expect(result).to.not.have.property('b');
			expect(result.a).to.be.deep.equal(obj.a);
		});

		it('should get sub-object when provided property name: "$.{a}.ab"', function() {
			var result = transform(obj, "$.{a}.ab");
			console.log("[test] result: %s", JSON.stringify(result));
			expect(result).to.have.property('a');
			expect(result).to.not.have.property('b');
			expect(result.a).to.not.have.property('aa');
			expect(result.a).to.not.have.property('ab');
			expect(result.a).to.be.deep.equal(obj.a.ab);
		});

		it('should get sub-object when provided property name: "$.{a}{.ab}"', function() {
			var result = transform(obj, "$.{a}{.ab}");
			console.log("[test] result: %s", JSON.stringify(result));
			expect(result).to.have.property('a');
			expect(result).to.not.have.property('ab');
			expect(result.a).to.have.property('ab');
			expect(result.a).to.not.have.property('aa');
			expect(result.a.ab).to.be.deep.equal(obj.a.ab);
		});

		it('should get sub-object when provided property name: "$.{a}.{ab}"', function() {
			var result = transform(obj, "$.{a}.{ab}");
			console.log("[test] result: %s", JSON.stringify(result));
			expect(result).to.have.property('a');
			expect(result).to.not.have.property('ab');
			expect(result.a).to.have.property('ab');
			expect(result.a).to.not.have.property('aa');
			expect(result.a.ab).to.be.deep.equal(obj.a.ab);
		});
	});

	describe('when accessing all indices (*)', function() {

		var transform = JSONTransform.JSONTransform;
		var obj = {
		    "data": {
				"SimpleStats": {
					"paragraphLengthInWords": {
						"MIDDLE": {
							"RESULT_ITEMS_COUNT": 0,
							"RESULT_HITS_COUNT": 0
						},
						"ALL": {
							"RESULT_ITEMS_COUNT": 2700,
							"RESULT_HITS_COUNT": 272456
						}
					},
					"sentenceLength": {
						"MIDDLE": {
							"RESULT_ITEMS_COUNT": 4241,
							"RESULT_HITS_COUNT": 87332
						},
						"ALL": {
							"RESULT_ITEMS_COUNT": 13039,
							"RESULT_HITS_COUNT": 272456
						}
					},
					"paragraphLengthInSentences": {
						"MIDDLE": {
							"RESULT_ITEMS_COUNT": 0,
							"RESULT_HITS_COUNT": 0
						},
						"ALL": {
							"RESULT_ITEMS_COUNT": 2700,
							"RESULT_HITS_COUNT": 13039
						}
					}
				}
			},
			"params": {
				"fileOut.type": "html",
				"fileOut.name": "uppsala/lolita-en - stats results.html"
			}
		};

		it("should get all sub-object: \"$.{data}.SimpleStats[*].ALL\"", function() {
			var result = transform(obj, "$.{data}.SimpleStats[*].ALL");
			console.log("[test] result: %s", JSON.stringify(result));
			expect(result).to.have.property('data');
			expect(result).to.not.have.property('params');
			expect(result.data).to.not.have.property('SimpleStats');
			expect(result.data).to.not.have.property('paragraphLengthInWords');
			expect(result.data).to.not.have.property('paragraphLengthInSentences');
			expect(result.data).to.not.have.property('sentenceLength');
			expect(result.data).to.have.length(3);
			expect(result.data[0]).to.be.deep.equal(obj.data.SimpleStats.paragraphLengthInWords.ALL);
			expect(result.data[1]).to.be.deep.equal(obj.data.SimpleStats.sentenceLength.ALL);
			expect(result.data[2]).to.be.deep.equal(obj.data.SimpleStats.paragraphLengthInSentences.ALL);
		});
		it("should get all sub-object (with many *): \"$.{data}.SimpleStats[*][*]\"", function() {
			var result = transform(obj, "$.{data}.SimpleStats[*][*]");
			console.log("[test] result: %s", JSON.stringify(result));
			expect(result).to.have.property('data');
			expect(result).to.not.have.property('params');
			expect(result.data).to.not.have.property('SimpleStats');
			expect(result.data).to.not.have.property('paragraphLengthInWords');
			expect(result.data).to.not.have.property('paragraphLengthInSentences');
			expect(result.data).to.not.have.property('sentenceLength');
			expect(result.data).to.have.length(3);
			expect(result.data[0]).to.have.length(2);
			expect(result.data[0][0]).to.be.deep.equal(obj.data.SimpleStats.paragraphLengthInWords.MIDDLE);
			expect(result.data[0][1]).to.be.deep.equal(obj.data.SimpleStats.paragraphLengthInWords.ALL);
			expect(result.data[1][1]).to.be.deep.equal(obj.data.SimpleStats.sentenceLength.ALL);
			expect(result.data[2][1]).to.be.deep.equal(obj.data.SimpleStats.paragraphLengthInSentences.ALL);
		});
		it("should get all sub-object (with many *) preserved: \"$.{data}.SimpleStats{[*]}.ALL\"", function() {
			var result = transform(obj, "$.{data}.SimpleStats{[*]}.ALL");
			console.log("[test] result: %s", JSON.stringify(result));
			expect(result).to.have.property('data');
			expect(result).to.not.have.property('params');
			expect(result.data).to.not.have.property('SimpleStats');
			expect(result.data).to.have.property('paragraphLengthInWords');
			expect(result.data).to.have.property('paragraphLengthInSentences');
			expect(result.data).to.have.property('sentenceLength');
			expect(result.data.paragraphLengthInWords).to.be.deep.equal(obj.data.SimpleStats.paragraphLengthInWords.ALL);
			expect(result.data.paragraphLengthInSentences).to.be.deep.equal(obj.data.SimpleStats.paragraphLengthInSentences.ALL);
			expect(result.data.sentenceLength).to.be.deep.equal(obj.data.SimpleStats.sentenceLength.ALL);
		});
	});

	describe('when keeping object structure', function() {

		var transform = JSONTransform.JSONTransform;
		var obj = {
		    "data": {
				"SimpleStats": {
					"paragraphLengthInWords": {
						"MIDDLE": {
							"RESULT_ITEMS_COUNT": 0,
							"RESULT_HITS_COUNT": 0
						},
						"ALL": {
							"RESULT_ITEMS_COUNT": 2700,
							"RESULT_HITS_COUNT": 272456
						}
					},
					"sentenceLength": {
						"MIDDLE": {
							"RESULT_ITEMS_COUNT": 4241,
							"RESULT_HITS_COUNT": 87332
						},
						"ALL": {
							"RESULT_ITEMS_COUNT": 13039,
							"RESULT_HITS_COUNT": 272456
						}
					},
					"paragraphLengthInSentences": {
						"MIDDLE": {
							"RESULT_ITEMS_COUNT": 0,
							"RESULT_HITS_COUNT": 0
						},
						"ALL": {
							"RESULT_ITEMS_COUNT": 2700,
							"RESULT_HITS_COUNT": 13039
						}
					}
				}
			},
			"params": {
				"fileOut.type": "html",
				"fileOut.name": "uppsala/lolita-en - stats results.html"
			}
		};

		it('should get sub-object when provided property name: "$.{data}.SimpleStats[\'paragraphLengthInWords\', \'paragraphLengthInSentences\'].ALL"', function() {
			var result = transform(obj, "$.{data}.SimpleStats['paragraphLengthInWords', 'paragraphLengthInSentences'].ALL");
			console.log("[test] result: %s", JSON.stringify(result));
			expect(result).to.have.property('data');
			expect(result).to.not.have.property('params');
			expect(result.data).to.not.have.property('SimpleStats');
			expect(result.data).to.not.have.property('paragraphLengthInWords');
			expect(result.data).to.not.have.property('paragraphLengthInSentences');
			expect(result.data).to.not.have.property('sentenceLength');
			expect(result.data).to.have.length(2);
			expect(result.data[0]).to.be.deep.equal(obj.data.SimpleStats.paragraphLengthInWords.ALL);
			expect(result.data[1]).to.be.deep.equal(obj.data.SimpleStats.paragraphLengthInSentences.ALL);
		});
		it('should get sub-object when provided property name: "$.{data}.SimpleStats{[\'paragraphLengthInWords\', \'paragraphLengthInSentences\']}.ALL"', function() {
			var result = transform(obj, "$.{data}.SimpleStats{['paragraphLengthInWords', 'paragraphLengthInSentences']}.ALL");
			console.log("[test] result: %s", JSON.stringify(result));
			expect(result).to.have.property('data');
			expect(result).to.not.have.property('params');
			expect(result.data).to.not.have.property('SimpleStats');
			expect(result.data).to.have.property('paragraphLengthInWords');
			expect(result.data).to.have.property('paragraphLengthInSentences');
			expect(result.data).to.not.have.property('sentenceLength');
			expect(result.data.paragraphLengthInWords).to.be.deep.equal(obj.data.SimpleStats.paragraphLengthInWords.ALL);
		});
		it('should get sub-object when provided property name: "$.{data}.SimpleStats{[\'paragraphLengthInWords\', \'paragraphLengthInSentences\']}.ALL"', function() {
			var result = transform(obj, "$.{data}.SimpleStats{['paragraphLengthInWords', 'paragraphLengthInSentences'].ALL}");
			console.log("[test] result: %s", JSON.stringify(result));
			expect(result).to.have.property('data');
			expect(result).to.not.have.property('params');
			expect(result.data).to.not.have.property('SimpleStats');
			expect(result.data).to.have.property('paragraphLengthInWords');
			expect(result.data).to.have.property('paragraphLengthInSentences');
			expect(result.data).to.not.have.property('sentenceLength');
			expect(result.data.paragraphLengthInWords).to.have.property('ALL');
			expect(result.data.paragraphLengthInWords.ALL).to.be.deep.equal(obj.data.SimpleStats.paragraphLengthInWords.ALL);
		});
		it('should get sub-object when provided property name: "$.{data}.SimpleStats{[\'paragraphLengthInWords\', \'paragraphLengthInSentences\']}.ALL"', function() {
			var result = transform(obj, "$.{data}.SimpleStats['paragraphLengthInWords', 'paragraphLengthInSentences']{.ALL}");
			console.log("[test] result: %s", JSON.stringify(result));
			expect(result).to.have.property('data');
			expect(result).to.not.have.property('params');
			expect(result.data).to.not.have.property('SimpleStats');
			expect(result.data).to.not.have.property('paragraphLengthInWords');
			expect(result.data).to.not.have.property('paragraphLengthInSentences');
			expect(result.data).to.not.have.property('sentenceLength');
			expect(result.data).to.have.length(2);
			expect(result.data[0]).to.have.property('ALL');
			expect(result.data[1]).to.have.property('ALL');
			expect(result.data[1].ALL).to.be.deep.equal(obj.data.SimpleStats.paragraphLengthInSentences.ALL);
		});
		it("should get sub-object when provided property name: \"$.{data}.SimpleStats['paragraphLengthInWords', 'paragraphLengthInSentences']['ALL', 'MIDDLE']\"", function() {
			var result = transform(obj, "$.{data}.SimpleStats['paragraphLengthInWords', 'paragraphLengthInSentences']['ALL', 'MIDDLE']");
			console.log("[test] result: %s", JSON.stringify(result));
			expect(result).to.have.property('data');
			expect(result).to.not.have.property('params');
			expect(result).to.not.have.property('SimpleStats');
			expect(result).to.not.have.property('paragraphLengthInWords');
			expect(result).to.not.have.property('paragraphLengthInSentences');
			expect(result).to.not.have.property('sentenceLength');
			expect(result.data).to.have.length(2);
			expect(result.data[0]).to.have.length(2);
			expect(result.data[0][0]).to.have.property('RESULT_ITEMS_COUNT');
			expect(result.data[0][0]).to.have.property('RESULT_HITS_COUNT');
			expect(result.data[0][0]).to.be.deep.equal(obj.data.SimpleStats.paragraphLengthInWords.ALL);
			expect(result.data[0][1]).to.be.deep.equal(obj.data.SimpleStats.paragraphLengthInWords.MIDDLE);
			expect(result.data[1][0]).to.be.deep.equal(obj.data.SimpleStats.paragraphLengthInSentences.ALL);
			expect(result.data[1][1]).to.be.deep.equal(obj.data.SimpleStats.paragraphLengthInSentences.MIDDLE);
		});
		it("should get sub-object when provided property name: \"(f)$.{data}.SimpleStats['paragraphLengthInWords', 'paragraphLengthInSentences']['ALL', 'MIDDLE']\"", function() {
			var result = transform(obj, "(f)$.{data}.SimpleStats['paragraphLengthInWords', 'paragraphLengthInSentences']['ALL', 'MIDDLE']");
			console.log("[test] result: %s", JSON.stringify(result));
			expect(result).to.not.have.property('data');
			expect(result).to.not.have.property('params');
			expect(result).to.not.have.property('SimpleStats');
			expect(result).to.not.have.property('paragraphLengthInWords');
			expect(result).to.not.have.property('paragraphLengthInSentences');
			expect(result).to.not.have.property('sentenceLength');
			expect(result).to.have.length(4);
			expect(result[0]).to.not.have.property('ALL');
			expect(result[0]).to.not.have.property('MIDDLE');
			expect(result[0]).to.have.property('RESULT_ITEMS_COUNT');
			expect(result[0]).to.have.property('RESULT_HITS_COUNT');
			expect(result[0]).to.be.deep.equal(obj.data.SimpleStats.paragraphLengthInWords.ALL);
			expect(result[1]).to.be.deep.equal(obj.data.SimpleStats.paragraphLengthInWords.MIDDLE);
			expect(result[2]).to.be.deep.equal(obj.data.SimpleStats.paragraphLengthInSentences.ALL);
			expect(result[3]).to.not.have.property('ALL');
			expect(result[3]).to.not.have.property('MIDDLE');
			expect(result[3]).to.have.property('RESULT_ITEMS_COUNT');
			expect(result[3]).to.have.property('RESULT_HITS_COUNT');
			expect(result[3]).to.be.deep.equal(obj.data.SimpleStats.paragraphLengthInSentences.MIDDLE);
		});
	});

	describe('when keeping object structure (more complex dataset)', function() {

		var transform = JSONTransform.JSONTransform;
		var obj = {
		    "dataParams":{
		        "type":"bukvik.structure.word.Distribution",
		        "structure":"array",
		        "schema":{
		            "$schema":"http://json-schema.org/schema#",
		            "type":"object",
		            "properties":{
		                "content":{
		                    "type":"object",
		                    "properties":{
		                        "type":"array",
		                        "properties":{
		                            "type":"array",
		                            "properties":[
		                                {
		                                    "type":"string"
		                                },
		                                {
		                                    "type":"number"
		                                }
		                            ]
		                        }
		                    }
		                },
		                "iAmId":{
		                    "type":"number"
		                },
		                "name":{
		                    "type":"string"
		                }
		            }
		        }
		    },
		    "data":{
		        "stats.results":{
		            "WhiteDog-en":{
		                "SimpleStats":{
		                    "paragraphLengthInWords":{
		                        "MIDDLE":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":0,
		                            "RESULT_HITS_COUNT":0
		                        },
		                        "ALL":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":11,
		                            "RESULT_HITS_COUNT":94736
		                        },
		                        "END":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":0,
		                            "RESULT_HITS_COUNT":0
		                        },
		                        "BEGIN":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":0,
		                            "RESULT_HITS_COUNT":0
		                        }
		                    },
		                    "sentenceLength":{
		                        "MIDDLE":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":2200,
		                            "RESULT_HITS_COUNT":30781
		                        },
		                        "ALL":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":6595,
		                            "RESULT_HITS_COUNT":94736
		                        },
		                        "END":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":2202,
		                            "RESULT_HITS_COUNT":30633
		                        },
		                        "BEGIN":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":2193,
		                            "RESULT_HITS_COUNT":33322
		                        }
		                    },
		                    "paragraphLengthInSentences":{
		                        "MIDDLE":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":0,
		                            "RESULT_HITS_COUNT":0
		                        },
		                        "ALL":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":11,
		                            "RESULT_HITS_COUNT":6595
		                        },
		                        "END":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":0,
		                            "RESULT_HITS_COUNT":0
		                        },
		                        "BEGIN":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":0,
		                            "RESULT_HITS_COUNT":0
		                        }
		                    }
		                }
		            },
		            "Genghis-en":{
		                "SimpleStats":{
		                    "paragraphLengthInWords":{
		                        "MIDDLE":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":0,
		                            "RESULT_HITS_COUNT":0
		                        },
		                        "ALL":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":10,
		                            "RESULT_HITS_COUNT":79418
		                        },
		                        "END":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":0,
		                            "RESULT_HITS_COUNT":0
		                        },
		                        "BEGIN":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":0,
		                            "RESULT_HITS_COUNT":0
		                        }
		                    },
		                    "sentenceLength":{
		                        "MIDDLE":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":2220,
		                            "RESULT_HITS_COUNT":25269
		                        },
		                        "ALL":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":6658,
		                            "RESULT_HITS_COUNT":79418
		                        },
		                        "END":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":2222,
		                            "RESULT_HITS_COUNT":25148
		                        },
		                        "BEGIN":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":2216,
		                            "RESULT_HITS_COUNT":29001
		                        }
		                    },
		                    "paragraphLengthInSentences":{
		                        "MIDDLE":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":0,
		                            "RESULT_HITS_COUNT":0
		                        },
		                        "ALL":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":10,
		                            "RESULT_HITS_COUNT":6658
		                        },
		                        "END":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":0,
		                            "RESULT_HITS_COUNT":0
		                        },
		                        "BEGIN":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":0,
		                            "RESULT_HITS_COUNT":0
		                        }
		                    }
		                }
		            },
		            "corpus-en":{
		                "SimpleStats":{
		                    "paragraphLengthInWords":{
		                        "MIDDLE":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":0,
		                            "RESULT_HITS_COUNT":0
		                        },
		                        "ALL":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":1,
		                            "RESULT_HITS_COUNT":548664
		                        },
		                        "END":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":0,
		                            "RESULT_HITS_COUNT":0
		                        },
		                        "BEGIN":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":0,
		                            "RESULT_HITS_COUNT":0
		                        }
		                    },
		                    "sentenceLength":{
		                        "MIDDLE":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":10095,
		                            "RESULT_HITS_COUNT":151153
		                        },
		                        "ALL":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":30284,
		                            "RESULT_HITS_COUNT":548664
		                        },
		                        "END":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":10095,
		                            "RESULT_HITS_COUNT":162544
		                        },
		                        "BEGIN":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":10094,
		                            "RESULT_HITS_COUNT":234967
		                        }
		                    },
		                    "paragraphLengthInSentences":{
		                        "MIDDLE":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":0,
		                            "RESULT_HITS_COUNT":0
		                        },
		                        "ALL":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":1,
		                            "RESULT_HITS_COUNT":30284
		                        },
		                        "END":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":0,
		                            "RESULT_HITS_COUNT":0
		                        },
		                        "BEGIN":{
		                            "RESULT_EXAMPLES":[],
		                            "RESULT_ITEMS_COUNT":0,
		                            "RESULT_HITS_COUNT":0
		                        }
		                    }
		                }
		            }
		        },
		        "pos.distribution":{
		            "WhiteDog-en":{
		                "1":[
		                    [
		                        "noun",
		                        16683,
		                        0.17609989866576592
		                    ],
		                    [
		                        "prep",
		                        9210,
		                        0.0972175308224962
		                    ],
		                    [
		                        "det",
		                        8156,
		                        0.08609187637223442
		                    ],
		                    [
		                        "pun",
		                        7126,
		                        0.07521955750717785
		                    ],
		                    [
		                        "adj",
		                        6927,
		                        0.07311898327985138
		                    ],
		                    [
		                        "sent",
		                        6591,
		                        0.06957228508697855
		                    ],
		                    [
		                        "pron",
		                        6011,
		                        0.0634500084445195
		                    ],
		                    [
		                        "vbpres",
		                        4924,
		                        0.051976017564600574
		                    ],
		                    [
		                        "adv",
		                        4899,
		                        0.05171212633001182
		                    ],
		                    [
		                        "name",
		                        3757,
		                        0.039657574733997634
		                    ],
		                    [
		                        "vbinf",
		                        2816,
		                        0.029724708664077015
		                    ],
		                    [
		                        "conj",
		                        2753,
		                        0.02905970275291336
		                    ]
		                ],
		                "2":[
		                    [
		                        "det,noun",
		                        4511,
		                        0.04761703699794163
		                    ],
		                    [
		                        "noun,prep",
		                        3709,
		                        0.039151316831160604
		                    ],
		                    [
		                        "adj,noun",
		                        3701,
		                        0.03906687074470892
		                    ],
		                    [
		                        "noun,pun",
		                        3241,
		                        0.03421122077373727
		                    ],
		                    [
		                        "prep,det",
		                        3177,
		                        0.03353565208212382
		                    ],
		                    [
		                        "noun,sent",
		                        2666,
		                        0.028141658310022695
		                    ],
		                    [
		                        "det,adj",
		                        2305,
		                        0.02433102865889059
		                    ],
		                    [
		                        "pron,vbpres",
		                        2209,
		                        0.023317675621470416
		                    ]
		                 ]
		            },
		            "Genghis-en":{
		                "1":[
		                    [
		                        "noun",
		                        12124,
		                        0.15266060590798056
		                    ],
		                    [
		                        "prep",
		                        6780,
		                        0.0853710745674784
		                    ],
		                    [
		                        "sent",
		                        6648,
		                        0.08370898285023547
		                    ],
		                    [
		                        "pron",
		                        6086,
		                        0.07663250144803445
		                    ],
		                    [
		                        "det",
		                        5993,
		                        0.07546148228361328
		                    ],
		                    [
		                        "pun",
		                        5856,
		                        0.07373643254677781
		                    ],
		                    [
		                        "adj",
		                        5424,
		                        0.06829685965398273
		                    ],
		                    [
		                        "vbpres",
		                        4927,
		                        0.062038832506484676
		                    ],
		                    [
		                        "adv",
		                        4697,
		                        0.059142763605228035
		                    ],
		                    [
		                        "name",
		                        3693,
		                        0.046500793271046864
		                    ],
		                    [
		                        "vbinf",
		                        2725,
		                        0.034312120677931955
		                    ],
		                    [
		                        "conj",
		                        1829,
		                        0.023030043566949557
		                    ]
		                ],
		                "2":[
		                    [
		                        "det,noun",
		                        3222,
		                        0.04057065867509475
		                    ],
		                    [
		                        "adj,noun",
		                        2555,
		                        0.032171953108276564
		                    ],
		                    [
		                        "noun,sent",
		                        2508,
		                        0.0315801402722339
		                    ],
		                    [
		                        "noun,pun",
		                        2459,
		                        0.03096314391125326
		                    ],
		                    [
		                        "noun,prep",
		                        2374,
		                        0.02989284410138887
		                    ],
		                    [
		                        "pron,vbpres",
		                        2297,
		                        0.028923278391276428
		                    ],
		                    [
		                        "prep,det",
		                        2126,
		                        0.02677008700907866
		                    ]
		                ]
		            },
		            "corpus-en":{
		                "1":[
		                    [
		                        "noun",
		                        92183,
		                        0.16801357479258708
		                    ],
		                    [
		                        "prep",
		                        54152,
		                        0.09869792805797355
		                    ],
		                    [
		                        "det",
		                        48000,
		                        0.08748523686627882
		                    ],
		                    [
		                        "pun",
		                        36572,
		                        0.06665646005569893
		                    ],
		                    [
		                        "adj",
		                        34464,
		                        0.06281440006998819
		                    ],
		                    [
		                        "pron",
		                        30337,
		                        0.05529249230858959
		                    ],
		                    [
		                        "sent",
		                        30284,
		                        0.055195894026216406
		                    ],
		                    [
		                        "vbpast",
		                        29564,
		                        0.05388361547322223
		                    ]
		                ],
		                "2":[
		                    [
		                        "det,noun",
		                        28605,
		                        0.05213582836823332
		                    ],
		                    [
		                        "noun,prep",
		                        21939,
		                        0.039986293954576854
		                    ],
		                    [
		                        "prep,det",
		                        20756,
		                        0.03783014345782384
		                    ],
		                    [
		                        "adj,noun",
		                        19727,
		                        0.0359546752742576
		                    ],
		                    [
		                        "noun,pun",
		                        14503,
		                        0.026433347974986466
		                    ],
		                    [
		                        "noun,sent",
		                        12375,
		                        0.022554828738223644
		                    ],
		                    [
		                        "pron,vbpast",
		                        11787,
		                        0.021483132633328655
		                    ],
		                    [
		                        "det,adj",
		                        11714,
		                        0.021350081926428427
		                    ],
		                    [
		                        "prep,noun",
		                        8404,
		                        0.01531723480533588
		                    ],
		                    [
		                        "quotes,quotes",
		                        8392,
		                        0.015295363456256391
		                    ]
		                ]
		            }
		        }
		    }
		};

		it("should get array of two sub-objects when provided with successive index selections (2nd one is multiple): \"$.{data}['stats.results']['corpus-en', 'Genghis-en'].SimpleStats\"", function() {
			var result = transform(obj, "$.{data}['stats.results']['corpus-en', 'Genghis-en'].SimpleStats");
			console.log("[test] result: %s", JSON.stringify(result));
			expect(result).to.have.property('data');
			expect(result).to.not.have.property('params');
			expect(result.data).to.not.have.property('stats.results');
			expect(result.data).to.not.have.property('corpus-en');
			expect(result.data).to.not.have.property('Genghis-en');
			expect(result.data).to.not.have.property('WhiteDog-en');
			expect(result.data).to.not.have.property('SimpleStats');
			expect(result.data).to.have.length(2);
			expect(result.data[0]).to.have.property('paragraphLengthInWords');
			expect(result.data[0].paragraphLengthInSentences).to.have.property('ALL');
			expect(result.data[0].paragraphLengthInSentences.ALL).to.have.property('RESULT_HITS_COUNT');
			expect(result.data[0]).to.have.property('sentenceLength');
			expect(result.data[0]).to.have.property('paragraphLengthInWords');
			expect(result.data[0]).to.be.deep.equal(obj.data['stats.results']['corpus-en'].SimpleStats);
  			expect(result.data[1]).to.be.deep.equal(obj.data['stats.results']['Genghis-en'].SimpleStats);
		});
		it("should get array of two sub-objects when provided with successive index selections (2nd one is multiple and keeps path): \"$.{data}['stats.results']{['corpus-en', 'Genghis-en']}.SimpleStats\"", function() {
			var result = transform(obj, "$.{data}['stats.results']{['corpus-en', 'Genghis-en']}.SimpleStats");
			console.log("[test] result: %s", JSON.stringify(result));
			expect(result).to.have.property('data');
			expect(result).to.not.have.property('params');
			expect(result.data).to.not.have.property('stats.results');
			expect(result.data).to.have.property('corpus-en');
			expect(result.data).to.have.property('Genghis-en');
			expect(result.data).to.not.have.property('WhiteDog-en');
			expect(result.data['corpus-en']).to.not.have.property('SimpleStats');
			expect(result.data['corpus-en']).to.have.property('paragraphLengthInWords');
			expect(result.data['corpus-en']).to.have.property('paragraphLengthInSentences');
			expect(result.data['corpus-en']).to.have.property('sentenceLength');
			expect(result.data['corpus-en']['sentenceLength']).to.have.property('ALL');
			expect(result.data['corpus-en']['sentenceLength']['ALL']).to.have.property('RESULT_HITS_COUNT');
			expect(result.data['corpus-en']['paragraphLengthInWords']['ALL']).to.be.deep.equal(obj.data['stats.results']['corpus-en'].SimpleStats.paragraphLengthInWords.ALL);
		});
		it("should get array of two sub-objects when provided with successive index selections (more complex example): \"$.{data}['stats.results']{['corpus-en', 'Genghis-en']}.SimpleStats{['paragraphLengthInWords','paragraphLengthInSentences']}\"", function() {
			var result = transform(obj, "$.{data}['stats.results']{['corpus-en', 'Genghis-en']}.SimpleStats{['paragraphLengthInWords','paragraphLengthInSentences']}");
			console.log("[test] result: %s", JSON.stringify(result));
			expect(result).to.have.property('data');
			expect(result).to.not.have.property('params');
			expect(result.data).to.not.have.property('stats.results');
			expect(result.data).to.have.property('corpus-en');
			expect(result.data).to.have.property('Genghis-en');
			expect(result.data).to.not.have.property('WhiteDog-en');
			expect(result.data['corpus-en']).to.not.have.property('SimpleStats');
			expect(result.data['corpus-en']).to.have.property('paragraphLengthInWords');
			expect(result.data['corpus-en']).to.have.property('paragraphLengthInSentences');
			expect(result.data['corpus-en']).to.not.have.property('sentenceLength');
			expect(result.data['corpus-en']['paragraphLengthInWords']).to.have.property('ALL');
			expect(result.data['corpus-en']['paragraphLengthInWords']['ALL']).to.have.property('RESULT_HITS_COUNT');
			expect(result.data['corpus-en']['paragraphLengthInWords']['ALL']).to.be.deep.equal(obj.data['stats.results']['corpus-en'].SimpleStats.paragraphLengthInWords.ALL);
			expect(result.data['corpus-en']['paragraphLengthInSentences']['ALL']).to.be.deep.equal(obj.data['stats.results']['corpus-en'].SimpleStats.paragraphLengthInSentences.ALL);
		});
		it("should get array of two sub-objects when provided with successive index selections (more complex example): \"$.{data}['stats.results']{['corpus-en', 'Genghis-en']}.SimpleStats{['paragraphLengthInWords','paragraphLengthInSentences']}.ALL\"", function() {
			var result = transform(obj, "$.{data}['stats.results']{['corpus-en', 'Genghis-en']}.SimpleStats{['paragraphLengthInWords','paragraphLengthInSentences']}.ALL");
			console.log("[test] result: %s", JSON.stringify(result));
			expect(result).to.have.property('data');
			expect(result).to.not.have.property('params');
			expect(result.data).to.not.have.property('stats.results');
			expect(result.data).to.have.property('corpus-en');
			expect(result.data).to.have.property('Genghis-en');
			expect(result.data).to.not.have.property('WhiteDog-en');
			expect(result.data['corpus-en']).to.not.have.property('SimpleStats');
			expect(result.data['corpus-en']).to.have.property('paragraphLengthInWords');
			expect(result.data['corpus-en']).to.have.property('paragraphLengthInSentences');
			expect(result.data['corpus-en']).to.not.have.property('sentenceLength');
			expect(result.data['corpus-en']['paragraphLengthInWords']).to.have.property('RESULT_HITS_COUNT');
			expect(result.data['corpus-en']['paragraphLengthInWords']).to.be.deep.equal(obj.data['stats.results']['corpus-en'].SimpleStats.paragraphLengthInWords.ALL);
			expect(result.data['corpus-en']['paragraphLengthInSentences']).to.be.deep.equal(obj.data['stats.results']['corpus-en'].SimpleStats.paragraphLengthInSentences.ALL);
		});
		
	});

	// TODO: add support for logical filtering
	// TODO: add support for user defined logical filtering funcions
	// TODO: add support for more advanced array interval ranges
	// TODO: add support for logical filtering but not only by value of some parameter, 
	//	but also by name of a parameter

	// Semantic-modifications: plugin
	// TODO: add support for renaming part of data-structure
	// TODO: add support for moving parts of structure
	// TODO: add support for copying parts of structure
	// TODO: add support for adding parts of structure

	// Declarative plugin
	// TODO: add support for declarative modifications through JSON-Schema instead of imperative

	// Declarative cross-schema mapping plugin
	// TODO: add support for detecting transformations necessary between two JSON-Schemas
	// TODO: add support for detecting transformations necessary between two JSON object examples
});