/**
 * Тестирование модуля go.Lang
 *
 * @package    go.js
 * @subpackage Lang
 * @author     Григорьев Олег aka vasa_c (http://blgo.ru/)
 */
/*jslint node: true, nomen: true */
/*global window, document, go, tests, ok, equal, deepEqual */
"use strict";

tests.module("Lang");

tests.test("bind() context", function () {

	var
		obj1 = {
			'x': 1,
			'f': function () {
				return this.x;
			}
		},
		obj2 = {
			'x': 2
		};

	obj2.f_norm = obj1.f;
	obj2.f_bind = go.Lang.bind(obj1.f, obj1);

	equal(obj2.f_norm(), 2);
	equal(obj2.f_bind(), 1);
});

tests.test("bind() arguments", function () {

	var obj = {'x': "x"}, f, f1, f2;

	f = function (a, b, c, d) {
		return [this.x, a, b, c, d].join(", ");
	};

	f1 = go.Lang.bind(f, obj);
	f2 = go.Lang.bind(f, obj, ["a", "b"]);

	equal(f1(1, 2, 3, 4), "x, 1, 2, 3, 4");
	equal(f2(1, 2, 3, 4), "x, a, b, 1, 2");
});

tests.test("bind(global)", function () {

	var f, obj;

	f = function (a, b) {
		var g = (this === window) ? "g" : "-";
		return [g, a, b].join(", ");
	};

	obj = {
		'f_g'  : go.Lang.bind(f),
		'f_ga' : go.Lang.bind(f, null, ['a']),
		'f_n'  : f
	};

	equal(obj.f_g(1, 2), "g, 1, 2");
	equal(obj.f_ga(1, 2), "g, a, 1");
	equal(obj.f_n(1, 2), "-, 1, 2");
});

tests.test("bind() user defined", function () {

	function f() {
		return "f";
	}
	f.bind = function () {
		return function () {
			return "bind";
		};
	};

	var f2 = go.Lang.bind(f);
	equal(f2(), "bind");
});

tests.test("getType", function () {

	var undef, div, spans, fgotype;

	equal(go.Lang.getType(undef), "undefined");
	equal(go.Lang.getType(null), "null");
	equal(go.Lang.getType(true), "boolean");
	equal(go.Lang.getType(3), "number");
	equal(go.Lang.getType(-3.3), "number");
	equal(go.Lang.getType("str"), "string");
	equal(go.Lang.getType({'x': 5}), "object");
	equal(go.Lang.getType([1, 2, 3]), "array");
	equal(go.Lang.getType(arguments), "arguments");

	div = document.createElement("div");
	div.innerHTML = "<span>1</span> <span>2</span>";
	spans = div.getElementsByTagName("span");

	equal(go.Lang.getType(div), "element");
	equal(go.Lang.getType(spans.item(0).firstChild), "textnode");
	equal(go.Lang.getType(spans), "collection");

	equal(go.Lang.getType({'go$type': 'user'}), "user");
	fgotype = function () {};
	equal(go.Lang.getType(fgotype), "function");
	fgotype.go$type = "fuser";
	equal(go.Lang.getType(fgotype), "fuser");
});

tests.test("isArray", function () {

	var astrict   = [1, 2, 3],
		asimilar1 = arguments,
		asimilar2 = document.body.childNodes,
		anone1    = {'x': 1},
		anone2    = 5;

	ok(go.Lang.isArray(astrict));
	ok(go.Lang.isArray(asimilar1));
	ok(go.Lang.isArray(asimilar2));
	ok(!go.Lang.isArray(anone1));
	ok(!go.Lang.isArray(anone2));

	ok(go.Lang.isArray(astrict, true));
	ok(!go.Lang.isArray(asimilar1, true));
	ok(!go.Lang.isArray(asimilar2, true));
	ok(!go.Lang.isArray(anone1, true));
	ok(!go.Lang.isArray(anone2, true));
});

tests.test("isHash", function () {

    ok(go.Lang.isHash({'a': 1, 'b': 2}));
    ok(!go.Lang.isHash([1, 2]));
    ok(!go.Lang.isHash(document.createElement("div")));
    ok(!go.Lang.isHash(function () {}));
});

tests.test("each array", function () {

	var iter, fn, expected, div;

	iter = [1, 2, 3];
	fn = function (value, key, iter) {
		return value + ":" + key + ":" + iter.length;
	};
	expected = ["1:0:3", "2:1:3", "3:2:3"];
	deepEqual(go.Lang.each(iter, fn), expected, "iterate array");

	div = document.createElement("div");
	div.innerHTML = "<span>one</span> <span>two</span>";
	iter = div.getElementsByTagName("span");
	fn = function (value) {
		return value.firstChild.nodeValue;
	};
	expected = ["one", "two"];
	deepEqual(go.Lang.each(iter, fn), expected, "iterate collection");

	iter = (function () {return arguments; }(5, 4, 3));
	fn = function (value) {
		return value + 1;
	};
	expected = [6, 5, 4];
	deepEqual(go.Lang.each(iter, fn), expected, "iterate arguments object");
});

tests.test("each object", function () {

	var objPrototype = {'a' : 1, 'b' : 2},
		obj,
		expected,
		deepResult;
	function ObjConstructor(b, c) {
		this.b = b;
		this.c = c;
	}
	ObjConstructor.prototype = objPrototype;
	obj = new ObjConstructor(3, 4);

	function fn(value, key) {
		return key + "=>" + value;
	}
	expected = {
		'b' : "b=>3",
		'c' : "c=>4"
	};
	deepEqual(go.Lang.each(obj, fn), expected);

	deepResult = go.Lang.each(obj, fn, null, true);
	equal(deepResult.a, "a=>1");
	equal(deepResult.b, "b=>3");
	equal(deepResult.c, "c=>4");
});

tests.test("each bind", function () {
	var
		objV = {
			'a': "x",
			'b': "y",
			'c': "z"
		},
		objF = {
			'x': 5,
			'y': 7,
			'z': 9,
			'f': function (value) {
				return this[value];
			}
		},
		expected = {
			'a': 5,
			'b': 7,
			'c': 9
		};

	deepEqual(go.Lang.each(objV, objF.f, objF), expected);
});

tests.test("copy", function () {

    var srcArray  = [1, 2, 3, 4, 5],
        srcObject = {'x': 5, 'y': 6},
        copyArray,
        copyObject;

    copyArray = go.Lang.copy(srcArray);
    deepEqual(copyArray, srcArray);
    ok(copyArray !== srcArray);
    copyArray.push(6);
    equal(copyArray.length - srcArray.length, 1);

    copyObject = go.Lang.copy(srcObject);
    deepEqual(copyObject, srcObject);
    ok(copyObject !== srcObject);
    copyObject.y = 7;
    equal(srcObject.y, 6);

});

tests.test("extend", function () {
	var objDest, objSrc, objPSrc, ConstrSrc, expected;

	objDest = {
		'a': "dest a",
		'b': "dest b",
		'c': "dest c"
	};
	objPSrc = {
		'b': "proto b",
		'c': "proto c"
	};
	ConstrSrc = function () {};
	ConstrSrc.prototype = objPSrc;
	objSrc = new ConstrSrc();
	objSrc.c = "src c";
	objSrc.d = "src d";

	expected = {
		'a': "dest a",
		'b': "dest b",
		'c': "src c",
		'd': "src d"
	};
	deepEqual(go.Lang.extend(objDest, objSrc), expected, "extend() not deep");
	deepEqual(objDest, expected);

	objDest = {
		'a': "dest a",
		'b': "dest b",
		'c': "dest c"
	};
	expected = {
		'a': "dest a",
		'b': "proto b",
		'c': "src c",
		'd': "src d"
	};
	deepEqual(go.Lang.extend(objDest, objSrc, true), expected, "extend() deep");
	deepEqual(objDest, expected);
});

tests.test("merge", function () {
    var
        destination = {
            'a': "only in dest",
            'c': "c-dest",
            'd': {'x': 5},
            'e': 1,
            'f': {
                'g': 7,
                'j': {
                    'x': 1,
                    'y': 2
                }
            }
        },
        source = {
            'b': "only in source",
            'c': "c-source",
            'd': [1, 2],
            'e': {'x': 6},
            'f': {
                'h': 8,
                'j': {
                    'x': 3,
                    'z': 4
                }
            }
        },
        expected = {
            'a': "only in dest",
            'b': "only in source",
            'c': "c-source",
            'd': [1, 2],
            'e': {'x': 6},
            'f': {
                'g': 7,
                'h': 8,
                'j': {
                    'x': 3,
                    'y': 2,
                    'z': 4
                }
            }
        };

    equal(go.Lang.merge(destination, source), destination);
    deepEqual(destination, expected);
});

tests.test("curry", function () {

	var cur, cur2;

	function f(a, b, c, d) {
		return [a, b, c, d].join(", ");
	}

	cur = go.Lang.curry(f, 1, 2);
	equal(cur(3, 4), "1, 2, 3, 4");

	cur2 = go.Lang.curry(cur, 5);
	equal(cur2(6), "1, 2, 5, 6");
});

tests.test("inArray", function () {

	var
		obj1 = {'x': 5},
		obj2 = {'x': 5},
		haystack = [1, 3, "5", obj1];

	ok(go.Lang.inArray(1, haystack));
	ok(go.Lang.inArray(3, haystack));
	ok(go.Lang.inArray("5", haystack));
	ok(go.Lang.inArray(obj1, haystack));

	ok(!go.Lang.inArray(true, haystack));
	ok(!go.Lang.inArray("3", haystack));
	ok(!go.Lang.inArray(5, haystack));
	ok(!go.Lang.inArray(obj2, haystack));
});

tests.test("tryDo", function () {

	var one, two, undef, funcs;

	function err() {
		var x = 5;
		return x(6);
	}

	function fone() {
		if (one) {
			return "one";
		} else {
			throw new Error();
		}
	}

	function ftwo() {
		if (two) {
			return "two";
		} else {
			throw new Error();
		}
	}

	funcs = [err, fone, ftwo];

	one = true;
	two = true;
	equal(go.Lang.tryDo(funcs), "one");

	one = false;
	equal(go.Lang.tryDo(funcs), "two");

	two = false;
	equal(go.Lang.tryDo(funcs), undef);
});

tests.test("parseQuery", function () {
    deepEqual(go.Lang.parseQuery(""), {});
    deepEqual(go.Lang.parseQuery("x=1&y=2"), {'x': "1", 'y': "2"});
    deepEqual(go.Lang.parseQuery("x=one%3Atwo&y=2"), {'x': "one:two", 'y': "2"});
    deepEqual(go.Lang.parseQuery("12345&x=5"), {'': "12345", 'x': "5"});
    deepEqual(go.Lang.parseQuery({'x': "5"}), {'x': "5"});
});

tests.test("buildQuery", function () {
    var
        vars = {
            'one': 1,
            'two': "two:three",
            'A': {
                'x': 5,
                'y': [1, 2, 3]
            }
        },
        expected = "one=1&two=two%3Athree&A[x]=5&A[y][0]=1&A[y][1]=2&A[y][2]=3";
    equal(go.Lang.buildQuery(vars), expected);
    equal(go.Lang.buildQuery(expected), expected);
});

tests.test("go.Lang.f", function () {

	equal(go.Lang.f.empty());
	equal(go.Lang.f.ffalse(), false);

});

tests.test("go.Lang.Exception", function () {

    var
        OneError = go.Lang.Exception.create("One", go.Lang.Exception),
        TwoError = go.Lang.Exception.create("Two", OneError),
        ThreeError = go.Lang.Exception.create("Three", OneError);

    try {
        throw new TwoError("warning");
    } catch (e) {
        ok(e instanceof Error);
        ok(e instanceof go.Lang.Exception);
        ok(e instanceof go.Lang.Exception.Base);
        ok(e instanceof OneError);
        ok(e instanceof TwoError);
        ok(!(e instanceof ThreeError));

        equal(e.name, "Two");
        equal(e.message, "warning");
    }
});
