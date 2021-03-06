/**
 * Testing the module go.LangExt
 *
 * @package    go.js
 * @subpackage Lang
 * @author     Grigoriev Oleg aka vasa_c <go.vasac@gmail.com>
 */
"use strict";

tests.module("LangExt");

tests.test("parseQuery", function () {
    deepEqual(go.Lang.parseQuery(""), {}, "empty string");
    deepEqual(go.Lang.parseQuery("x=1&y=2"), {'x': "1", 'y': "2"}, "parse string");
    deepEqual(go.Lang.parseQuery("x=one%3Atwo&y=2"), {'x': "one:two", 'y': "2"}, "encoded URI component");
    deepEqual(go.Lang.parseQuery("12345&x=5"), {'12345': undefined, 'x': "5"}, "empty value");
    deepEqual(go.Lang.parseQuery({'x': "5"}), {'x': "5"}, "dictionary = dictionary");
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
    equal(go.Lang.buildQuery(vars), expected, "build from dictionary");
    equal(go.Lang.buildQuery(expected), expected, "string = string");
});

tests.test("getByPath", function () {
    var context = {
        'one': 1,
        'two': {
            'three': 3,
            'four': {
                'five': "five"
            },
            'six': null
        }
    };
    equal(go.Lang.getByPath(context, "one"), 1, "first level scalar");
    deepEqual(go.Lang.getByPath(context, "two"), context.two, "first level object");
    equal(typeof go.Lang.getByPath(context, "three"), "undefined", "not found - undefined");
    equal(go.Lang.getByPath(context, "three", 11), 11, "by default", "not found - by default");
    equal(go.Lang.getByPath(context, "two.four.five"), "five", "third level");
    equal(go.Lang.getByPath(context, ["two", "four", "five"]), "five", "path as list");
    equal(typeof go.Lang.getByPath(context, "two.six.seven"), "undefined", "search in NULL");
    equal(typeof go.Lang.getByPath(context, "two.eight.seven"), "undefined", "search in undefined");
    equal(typeof go.Lang.getByPath(context, "two.four.five.toString"), "undefined", "prototype");
});

tests.test("setByPath", function () {
    var context = {
        'one': 1,
        'two': {
            'three': 3,
            'four': {
                'five': "five"
            },
            'six': null
        }
    };
    go.Lang.setByPath(context, "one", 2);
    equal(context.one, 2, "existing value on first level");
    go.Lang.setByPath(context, "two.three", 4);
    equal(context.two.three, 4, "existing value on second level");
    go.Lang.setByPath(context, ["two", "four"], 5);
    equal(context.two.four, 5, "path as array");
    go.Lang.setByPath(context, "two.x.y.z", "xyz");
    equal(typeof context.two.x, "object", "not existing path");
    equal(typeof context.two.x.y, "object", "not existing path");
    equal(context.two.x.y.z, "xyz", "not existing path");

});

tests.test("curry", function () {
    var cur, cur2;

    function f(a, b, c, d) {
        return [a, b, c, d].join(", ");
    }

    cur = go.Lang.curry(f, 1, 2);
    equal(cur(3, 4), "1, 2, 3, 4", "curry");

    cur2 = go.Lang.curry(cur, 5);
    equal(cur2(6), "1, 2, 5, 6", "curry of curried");
});

tests.test("tryDo", function () {
    var one, two, undef, funcs;

    function err() {
        var x = 5;
        return x(6);
    }

    function fone() {
        if (!one) {
            throw new Error();
        }
        return "one";
    }

    function ftwo() {
        if (!two) {
            throw new Error();
        }
        return "two";
    }

    funcs = [err, fone, ftwo];

    one = true;
    two = true;
    equal(go.Lang.tryDo(funcs), "one");

    one = false;
    equal(go.Lang.tryDo(funcs), "two");

    two = false;
    equal(go.Lang.tryDo(funcs), undef, "undefiend");
});

tests.test("is*-functions", function () {
    var L = go.Lang,
        value,
        name;

    value = undefined;
    name = "undefined";
    ok(L.isUndefined(value), "isUndefined(" + name + ")");
    ok(!L.isNull(value), "isNull(" + name + ")");
    ok(!L.isBoolean(value), "isBoolean(" + name + ")");
    ok(!L.isNumber(value), "isNumber(" + name + ")");
    ok(!L.isString(value), "isString(" + name + ")");
    ok(!L.isFunction(value), "isFunction(" + name + ")");
    ok(!L.isError(value), "isError(" + name + ")");
    ok(!L.isDate(value), "isDate(" + name + ")");
    ok(!L.isElement(value), "isElement(" + name + ")");
    ok(!L.isTextnode(value), "isTextnode(" + name + ")");
    ok(!L.isCollection(value), "isCollection(" + name + ")");
    ok(!L.isArguments(value), "isArguments(" + name + ")");

    value = null;
    name = "null";
    ok(!L.isUndefined(value), "isUndefined(" + name + ")");
    ok(L.isNull(value), "isNull(" + name + ")");
    ok(!L.isBoolean(value), "isBoolean(" + name + ")");
    ok(!L.isNumber(value), "isNumber(" + name + ")");
    ok(!L.isString(value), "isString(" + name + ")");
    ok(!L.isFunction(value), "isFunction(" + name + ")");
    ok(!L.isError(value), "isError(" + name + ")");
    ok(!L.isDate(value), "isDate(" + name + ")");
    ok(!L.isElement(value), "isElement(" + name + ")");
    ok(!L.isTextnode(value), "isTextnode(" + name + ")");
    ok(!L.isCollection(value), "isCollection(" + name + ")");
    ok(!L.isArguments(value), "isArguments(" + name + ")");

    value = false;
    name = "Boolean";
    ok(!L.isUndefined(value), "isUndefined(" + name + ")");
    ok(!L.isNull(value), "isNull(" + name + ")");
    ok(L.isBoolean(value), "isBoolean(" + name + ")");
    ok(!L.isNumber(value), "isNumber(" + name + ")");
    ok(!L.isString(value), "isString(" + name + ")");
    ok(!L.isFunction(value), "isFunction(" + name + ")");
    ok(!L.isError(value), "isError(" + name + ")");
    ok(!L.isDate(value), "isDate(" + name + ")");
    ok(!L.isElement(value), "isElement(" + name + ")");
    ok(!L.isTextnode(value), "isTextnode(" + name + ")");
    ok(!L.isCollection(value), "isCollection(" + name + ")");
    ok(!L.isArguments(value), "isArguments(" + name + ")");

    value = 0;
    name = "Number";
    ok(!L.isUndefined(value), "isUndefined(" + name + ")");
    ok(!L.isNull(value), "isNull(" + name + ")");
    ok(!L.isBoolean(value), "isBoolean(" + name + ")");
    ok(L.isNumber(value), "isNumber(" + name + ")");
    ok(!L.isString(value), "isString(" + name + ")");
    ok(!L.isFunction(value), "isFunction(" + name + ")");
    ok(!L.isError(value), "isError(" + name + ")");
    ok(!L.isDate(value), "isDate(" + name + ")");
    ok(!L.isElement(value), "isElement(" + name + ")");
    ok(!L.isTextnode(value), "isTextnode(" + name + ")");
    ok(!L.isCollection(value), "isCollection(" + name + ")");
    ok(!L.isArguments(value), "isArguments(" + name + ")");

    value = "";
    name = "String";
    ok(!L.isUndefined(value), "isUndefined(" + name + ")");
    ok(!L.isNull(value), "isNull(" + name + ")");
    ok(!L.isBoolean(value), "isBoolean(" + name + ")");
    ok(!L.isNumber(value), "isNumber(" + name + ")");
    ok(L.isString(value), "isString(" + name + ")");
    ok(!L.isFunction(value), "isFunction(" + name + ")");
    ok(!L.isError(value), "isError(" + name + ")");
    ok(!L.isDate(value), "isDate(" + name + ")");
    ok(!L.isElement(value), "isElement(" + name + ")");
    ok(!L.isTextnode(value), "isTextnode(" + name + ")");
    ok(!L.isCollection(value), "isCollection(" + name + ")");
    ok(!L.isArguments(value), "isArguments(" + name + ")");

    value = function () {};
    name = "user function";
    ok(!L.isUndefined(value), "isUndefined(" + name + ")");
    ok(!L.isNull(value), "isNull(" + name + ")");
    ok(!L.isBoolean(value), "isBoolean(" + name + ")");
    ok(!L.isNumber(value), "isNumber(" + name + ")");
    ok(!L.isString(value), "isString(" + name + ")");
    ok(L.isFunction(value), "isFunction(" + name + ")");
    ok(!L.isError(value), "isError(" + name + ")");
    ok(!L.isDate(value), "isDate(" + name + ")");
    ok(!L.isElement(value), "isElement(" + name + ")");
    ok(!L.isTextnode(value), "isTextnode(" + name + ")");
    ok(!L.isCollection(value), "isCollection(" + name + ")");
    ok(!L.isArguments(value), "isArguments(" + name + ")");

    value = Math.floor;
    name = "native function";
    ok(!L.isUndefined(value), "isUndefined(" + name + ")");
    ok(!L.isNull(value), "isNull(" + name + ")");
    ok(!L.isBoolean(value), "isBoolean(" + name + ")");
    ok(!L.isNumber(value), "isNumber(" + name + ")");
    ok(!L.isString(value), "isString(" + name + ")");
    ok(L.isFunction(value), "isFunction(" + name + ")");
    ok(!L.isError(value), "isError(" + name + ")");
    ok(!L.isDate(value), "isDate(" + name + ")");
    ok(!L.isElement(value), "isElement(" + name + ")");
    ok(!L.isTextnode(value), "isTextnode(" + name + ")");
    ok(!L.isCollection(value), "isCollection(" + name + ")");
    ok(!L.isArguments(value), "isArguments(" + name + ")");

    value = window.alert;
    name = "host function";
    ok(!L.isUndefined(value), "isUndefined(" + name + ")");
    ok(!L.isNull(value), "isNull(" + name + ")");
    ok(!L.isBoolean(value), "isBoolean(" + name + ")");
    ok(!L.isNumber(value), "isNumber(" + name + ")");
    ok(!L.isString(value), "isString(" + name + ")");
    ok(L.isFunction(value), "isFunction(" + name + ")");
    ok(!L.isError(value), "isError(" + name + ")");
    ok(!L.isDate(value), "isDate(" + name + ")");
    ok(!L.isElement(value), "isElement(" + name + ")");
    ok(!L.isTextnode(value), "isTextnode(" + name + ")");
    ok(!L.isCollection(value), "isCollection(" + name + ")");
    ok(!L.isArguments(value), "isArguments(" + name + ")");

    value = new TypeError();
    name = "TypeError";
    ok(!L.isUndefined(value), "isUndefined(" + name + ")");
    ok(!L.isNull(value), "isNull(" + name + ")");
    ok(!L.isBoolean(value), "isBoolean(" + name + ")");
    ok(!L.isNumber(value), "isNumber(" + name + ")");
    ok(!L.isString(value), "isString(" + name + ")");
    ok(!L.isFunction(value), "isFunction(" + name + ")");
    ok(L.isError(value), "isError(" + name + ")");
    ok(!L.isDate(value), "isDate(" + name + ")");
    ok(!L.isElement(value), "isElement(" + name + ")");
    ok(!L.isTextnode(value), "isTextnode(" + name + ")");
    ok(!L.isCollection(value), "isCollection(" + name + ")");
    ok(!L.isArguments(value), "isArguments(" + name + ")");

    value = go.Lang.Exception.create("test", go.Lang.Exception);
    /* jshint newcap: false */
    value = new value();

    name = "go.Lang.Exception";
    ok(!L.isUndefined(value), "isUndefined(" + name + ")");
    ok(!L.isNull(value), "isNull(" + name + ")");
    ok(!L.isBoolean(value), "isBoolean(" + name + ")");
    ok(!L.isNumber(value), "isNumber(" + name + ")");
    ok(!L.isString(value), "isString(" + name + ")");
    ok(!L.isFunction(value), "isFunction(" + name + ")");
    ok(L.isError(value), "isError(" + name + ")");
    ok(!L.isDate(value), "isDate(" + name + ")");
    ok(!L.isElement(value), "isElement(" + name + ")");
    ok(!L.isTextnode(value), "isTextnode(" + name + ")");
    ok(!L.isCollection(value), "isCollection(" + name + ")");
    ok(!L.isArguments(value), "isArguments(" + name + ")");

    value = new Date();
    name = "Date";
    ok(!L.isUndefined(value), "isUndefined(" + name + ")");
    ok(!L.isNull(value), "isNull(" + name + ")");
    ok(!L.isBoolean(value), "isBoolean(" + name + ")");
    ok(!L.isNumber(value), "isNumber(" + name + ")");
    ok(!L.isString(value), "isString(" + name + ")");
    ok(!L.isFunction(value), "isFunction(" + name + ")");
    ok(!L.isError(value), "isError(" + name + ")");
    ok(L.isDate(value), "isDate(" + name + ")");
    ok(!L.isElement(value), "isElement(" + name + ")");
    ok(!L.isTextnode(value), "isTextnode(" + name + ")");
    ok(!L.isCollection(value), "isCollection(" + name + ")");
    ok(!L.isArguments(value), "isArguments(" + name + ")");

    value = document.createElement("div");
    name = "Element";
    ok(!L.isUndefined(value), "isUndefined(" + name + ")");
    ok(!L.isNull(value), "isNull(" + name + ")");
    ok(!L.isBoolean(value), "isBoolean(" + name + ")");
    ok(!L.isNumber(value), "isNumber(" + name + ")");
    ok(!L.isString(value), "isString(" + name + ")");
    ok(!L.isFunction(value), "isFunction(" + name + ")");
    ok(!L.isError(value), "isError(" + name + ")");
    ok(!L.isDate(value), "isDate(" + name + ")");
    ok(L.isElement(value), "isElement(" + name + ")");
    ok(!L.isTextnode(value), "isTextnode(" + name + ")");
    ok(!L.isCollection(value), "isCollection(" + name + ")");
    ok(!L.isArguments(value), "isArguments(" + name + ")");

    value = document.createTextNode("text");
    name = "Textnode";
    ok(!L.isUndefined(value), "isUndefined(" + name + ")");
    ok(!L.isNull(value), "isNull(" + name + ")");
    ok(!L.isBoolean(value), "isBoolean(" + name + ")");
    ok(!L.isNumber(value), "isNumber(" + name + ")");
    ok(!L.isString(value), "isString(" + name + ")");
    ok(!L.isFunction(value), "isFunction(" + name + ")");
    ok(!L.isError(value), "isError(" + name + ")");
    ok(!L.isDate(value), "isDate(" + name + ")");
    ok(!L.isElement(value), "isElement(" + name + ")");
    ok(L.isTextnode(value), "isTextnode(" + name + ")");
    ok(!L.isCollection(value), "isCollection(" + name + ")");
    ok(!L.isArguments(value), "isArguments(" + name + ")");

    value = document.getElementsByTagName("div");
    name = "Collection";
    ok(!L.isUndefined(value), "isUndefined(" + name + ")");
    ok(!L.isNull(value), "isNull(" + name + ")");
    ok(!L.isBoolean(value), "isBoolean(" + name + ")");
    ok(!L.isNumber(value), "isNumber(" + name + ")");
    ok(!L.isString(value), "isString(" + name + ")");
    ok(!L.isFunction(value), "isFunction(" + name + ")");
    ok(!L.isError(value), "isError(" + name + ")");
    ok(!L.isDate(value), "isDate(" + name + ")");
    ok(!L.isElement(value), "isElement(" + name + ")");
    ok(!L.isTextnode(value), "isTextnode(" + name + ")");
    ok(L.isCollection(value), "isCollection(" + name + ")");
    ok(!L.isArguments(value), "isArguments(" + name + ")");

    value = arguments;
    name = "Arguments";
    ok(!L.isUndefined(value), "isUndefined(" + name + ")");
    ok(!L.isNull(value), "isNull(" + name + ")");
    ok(!L.isBoolean(value), "isBoolean(" + name + ")");
    ok(!L.isNumber(value), "isNumber(" + name + ")");
    ok(!L.isString(value), "isString(" + name + ")");
    ok(!L.isFunction(value), "isFunction(" + name + ")");
    ok(!L.isError(value), "isError(" + name + ")");
    ok(!L.isDate(value), "isDate(" + name + ")");
    ok(!L.isElement(value), "isElement(" + name + ")");
    ok(!L.isTextnode(value), "isTextnode(" + name + ")");
    ok(!L.isCollection(value), "isCollection(" + name + ")");
    ok(L.isArguments(value), "isArguments(" + name + ")");

    value = [1, 2, 3];
    name = "Array";
    ok(!L.isUndefined(value), "isUndefined(" + name + ")");
    ok(!L.isNull(value), "isNull(" + name + ")");
    ok(!L.isBoolean(value), "isBoolean(" + name + ")");
    ok(!L.isNumber(value), "isNumber(" + name + ")");
    ok(!L.isString(value), "isString(" + name + ")");
    ok(!L.isFunction(value), "isFunction(" + name + ")");
    ok(!L.isError(value), "isError(" + name + ")");
    ok(!L.isDate(value), "isDate(" + name + ")");
    ok(!L.isElement(value), "isElement(" + name + ")");
    ok(!L.isTextnode(value), "isTextnode(" + name + ")");
    ok(!L.isCollection(value), "isCollection(" + name + ")");
    ok(!L.isArguments(value), "isArguments(" + name + ")");
});

tests.test("invoke", function () {
    var MyClass, list, dict;

    MyClass = function (x) {
        this.x = x;
    };
    MyClass.prototype.plus = function plus(y) {
        return this.x + (y || 0);
    };

    dict = {
        'one'   : new MyClass(1),
        'three' : new MyClass(3),
        'five'  : new MyClass(5)
    };
    deepEqual(go.Lang.invoke(dict, "plus", [2]), {
        'one'   : 3,
        'three' : 5,
        'five'  : 7
    }, "invoke for dict (and args)");

    list = [dict.one, dict.three, dict.five];
    deepEqual(go.Lang.invoke(list, "plus"), [1, 3, 5], "invoke for list (no args)");
});

tests.test("field", function () {
    var MyClass, list, dict;

    MyClass = function (x) {
        this.x = x;
    };

    dict = {
        'one'   : {'x': 1},
        'three' : {'x': 3},
        'five'  : {'x': 5},
        'und'   : {}
    };
    deepEqual(go.Lang.field(dict, "x"), {
        'one'   : 1,
        'three' : 3,
        'five'  : 5,
        'und'   : undefined
    }, "dict");

    list = [dict.one, dict.three, dict.und, dict.five];
    deepEqual(go.Lang.field(list, "x"), [1, 3, undefined, 5], "list");
});

tests.test("fieldByPath", function () {
    var dict, list;

    dict = {
        'norm': {
            'one': {
                'two': {
                    'three': 3
                }
            }
        },
        'none': {
            'one': {
                'three': 3
            }
        }
    };
    deepEqual(go.Lang.fieldByPath(dict, "one.two.three"), {
        'norm': 3,
        'none': undefined
    }, "dict");

    list = [dict.none, dict.norm];
    deepEqual(go.Lang.fieldByPath(list, "one.two.three"), [undefined, 3]);
    deepEqual(go.Lang.fieldByPath(list, "one.three"), [3, undefined]);
});

tests.test("filter", function () {
    var dict, list, context;

    context = {
        'crit': function (item) {
            return (item.x > this.inf);
        }
    };

    dict = {
        'none':  {'x': 0},
        'three': {'x': 3},
        'five':  {'x': 5}
    };
    deepEqual(go.Lang.filter(dict, 'x'), {
        'three': dict.three,
        'five': dict.five
    }, "dict filter by field");

    context.inf = 3;
    deepEqual(go.Lang.filter(dict, context.crit, context), {
        'five': dict.five
    }, "dict filter by iter");

    context.inf = 1;
    deepEqual(go.Lang.filter(dict, context.crit, context), {
        'three': dict.three,
        'five': dict.five
    }, "dict and context test");

    list = [dict.three, dict.none, dict.five];
    deepEqual(go.Lang.filter(list, 'x'), [dict.three, dict.five], "list filter by field");

    context.inf = 3;
    deepEqual(go.Lang.filter(list, context.crit, context), [dict.five], "list filter by iter");

    context.inf = -1;
    deepEqual(go.Lang.filter(list, context.crit, context), [dict.three, dict.none, dict.five], "list and context test");
});

tests.test("sortBy", function () {
    var obj1 = {'x': 1, 'y': 5},
        obj2 = {'x': 2, 'y': 2},
        obj3 = {'x': 3, 'y': 2},
        list,
        result;

    list = [obj2, obj3, obj1];
    result = go.Lang.sortBy(list, "x");
    deepEqual(result, [obj1, obj2, obj3], "sort by field");

    result = go.Lang.sortBy(list, "x", null, true);
    deepEqual(result, [obj3, obj2, obj1], "reverse sort by field");

    result = go.Lang.sortBy(list, function (item) {return item.x * item.y; });
    deepEqual(result, [obj2, obj1, obj3], "sort by func");

    result = go.Lang.sortBy(list, function (item) {return item.x * item.y; }, null, true);
    deepEqual(result, [obj3, obj1, obj2], "reverse sort by func");

    result = go.Lang.sortBy(list, function (item) {
        return Math.abs(this.x - item.x) + Math.abs(this.y - item.y); // точка, ближайшая к context
    }, {'x': 2, 'y': 2});
    deepEqual(result, [obj2, obj3, obj1], "context");

    result = go.Lang.sortBy(list, function (item) {
        return Math.abs(this.x - item.x) + Math.abs(this.y - item.y);
    }, {'x': 2, 'y': 2}, true);
    deepEqual(result, [obj1, obj3, obj2], "context and reverse");
});

tests.test("groupBy", function () {
    var obj12 = {'x': 1, 'y': 2},
        obj21 = {'x': 2, 'y': 1},
        obj23 = {'x': 2, 'y': 3},
        obj32 = {'x': 3, 'y': 2},
        items,
        result,
        expected;

    items = {
        '12': obj12,
        '21': obj21,
        '23': obj23,
        '32': obj32
    };
    result = go.Lang.groupBy(items, "x");
    expected = {
        '1': {
            '12': obj12
        },
        '2': {
            '21': obj21,
            '23': obj23
        },
        '3': {
            '32': obj32
        }
    };
    deepEqual(result, expected, "dict group by field");

    result = go.Lang.groupBy(items, "y");
    expected = {
        '1': {
            '21': obj21
        },
        '2': {
            '12': obj12,
            '32': obj32
        },
        '3': {
            '23': obj23
        }
    };
    deepEqual(result, expected, "dict group by field (other)");

    result = go.Lang.groupBy(items, function (item) {return this.d + item.x - item.y; }, {'d': 5});
    expected = {
        '4': {
            '12': obj12,
            '23': obj23
        },
        '6': {
            '21': obj21,
            '32': obj32
        }
    };
    deepEqual(result, expected, "dict group by callback");

    items = [obj12, obj21, obj23, obj32];
    result = go.Lang.groupBy(items, "x");
    expected = {
        '1': [obj12],
        '2': [obj21, obj23],
        '3': [obj32]
    };
    deepEqual(result, expected, "list group by field");

    result = go.Lang.groupBy(items, function (item) {return this.d + item.x - item.y; }, {'d': 4});
    expected = {
        '3': [obj12, obj23],
        '5': [obj21, obj32]
    };
    deepEqual(result, expected, "list group by callback");
});

tests.test("flip", function () {
    var list = [1, 2, 3, 4, 5, 2, 3],
        dict = {
            '1': "one",
            '2': "two",
            '3': "three"
        };

    deepEqual(go.Lang.flip(list), {
        '1': 0,
        '2': 5,
        '3': 6,
        '4': 3,
        '5': 4
    }, "flip list");

    deepEqual(go.Lang.flip(list, true), {
        '1': true,
        '2': true,
        '3': true,
        '4': true,
        '5': true
    }, "flip list and default value");

    deepEqual(go.Lang.flip(dict), {
        'one': "1",
        'two': "2",
        'three': "3"
    }, "flip dict");

    deepEqual(go.Lang.flip(dict, 1), {
        'one': 1,
        'two': 1,
        'three': 1
    }, "flip dict and default value");
});

tests.test("every", function () {
    var every = go.Lang.every,
        list = [11, 3, 15, 4, 7, 11],
        dict = {
            'a': {'x': 5},
            'b': {'x': 11},
            'c': {'x': 0},
            'd': {'x': 3}
        };

    ok(every(list), "no criterion - scalar");
    ok(every(dict), "no criterion - objects");
    ok(every(list, function (item) {return item > 0; }), "list and callback (true)");
    ok(!every(list, function (item) {return item > 10; }), "list and callback (false)");

    list = [{'x': 1}, {'x': 2}, {'x': 3}];
    ok(every(list, "x"), "list and field (true)");

    list[1].x = 0;
    ok(!every(list, "x"), "list and field (false)");

    ok(!every(dict, "x"), "dict and field");
    ok(!every(dict, function (item) {return item.x !== this.d; }, {'d': 3}), "dict and callback and context (false)");
    ok(every(dict, function (item) {return item.x !== this.d; }, {'d': 33}), "dict and callback and context (true)");
});

tests.test("some", function () {
    var list,
        dict,
        callback,
        context;

    list = [0, false, null, undefined];
    ok(!go.Lang.some(list), "list, scalar, emtpy");

    list = [0, false, null, 1, undefined];
    ok(go.Lang.some(list), "list, scalar, not emtpy");

    list = [{}, {}];
    ok(go.Lang.some(list), "object is not empty");

    dict = {
        'a': 0,
        'b': 0,
        'c': 0
    };
    ok(!go.Lang.some(dict), "dict, scalar, empty");

    dict.b = 1;
    ok(go.Lang.some(dict), "dict, scalar, not empty");

    list = [{'x': 0}, {'x': false}, {'x': null}];
    ok(!go.Lang.some(list, "x"), "list, field, empty");

    list.push({'x': 1});
    ok(go.Lang.some(list, "x"), "list, field, not empty");

    dict = {
        'a': {'x': 0},
        'b': {'x': false},
        'c': {'x': null}
    };
    ok(!go.Lang.some(dict, "x"), "dict, field, empty");

    dict.b.x = true;
    ok(go.Lang.some(dict, "x"), "dict, field, not empty");

    context = {
        'd': 5
    };
    callback = function (item) {
        return (item > this.d);
    };

    list = [1, 2, 3, 4];
    ok(!go.Lang.some(list, callback, context), "list, callback + context, empty");

    list[2] = 10;
    ok(go.Lang.some(list, callback, context), "list, callback + context, not empty");

    dict = {'a': 1, 'b': 2, 'c': 3};
    ok(!go.Lang.some(dict, callback, context), "dict, callback + context, empty");

    dict.d = 10;
    ok(go.Lang.some(dict, callback, context), "dict, callback + context, not empty");

    callback = function (item, key, items) {
        /* jshint unused: false */
        context[key] = item;
    };

    list = [1, 2, 3];
    context = {};
    go.Lang.some(list, callback);
    deepEqual(context, {'0': 1, '1': 2, '2': 3}, "list, key in callback");

    dict = {'a': 1, 'b': 2, 'c': 3};
    context = {};
    go.Lang.some(dict, callback);
    deepEqual(context, dict, "dict, key in callback");
    callback = function (item, key, items) {
        /* jshint unused: false */
        return (items !== context);
    };

    context = [1, 2, 3];
    ok(!go.Lang.some(context, callback), "list, items in callback");

    context = {'a': 1, 'b': 2, 'c': 3};
    ok(!go.Lang.some(context, callback), "dict, items in callback");
});

tests.test("find", function () {
    var list,
        dict,
        callback,
        context;

    list = [0, false, null, 7, undefined];
    equal(go.Lang.find(list), 7, "list, scalar");
    equal(go.Lang.find(list, null, null, true), 3, "list, scalar, key");
    list[3] = false;
    equal(go.Lang.find(list), undefined, "list, not found");
    equal(go.Lang.find(list, null, null, false, "def"), "def", "list, not found, by default");

    dict = {
        'a': 0,
        'b': 1,
        'c': false
    };
    equal(go.Lang.find(dict), 1, "dict, scalar");
    equal(go.Lang.find(dict, null, null, true, "def"), "b", "dict, scalar, key");
    dict.b = 0;
    equal(go.Lang.find(dict, null, null, true, "def"), "def", "dict, scalar, key, by default");

    list = [{'x': 0}, {'x': 0}, {'x': 0}];
    equal(go.Lang.find(list, "x"), undefined, "list, field, empty");
    list[1].x = 2;
    equal(go.Lang.find(list, "x", null, true), 1, "list, field, not empty");

    dict = {
        'a': {'x': 0},
        'b': {'x': 0},
        'c': {'x': 0}
    };
    equal(go.Lang.find(dict, "x"), undefined, "dict, field, empty");
    dict.b.x = 1;
    equal(go.Lang.find(dict, "x", null, true), "b", "dict, field, not empty");

    context = {
        'd': 5
    };
    callback = function (item, key, items) {
        /* jshint unused: false */
        return item > context.d;
    };

    list = [1, 2, 3, 4, 5];
    equal(go.Lang.find(list, callback, context), undefined, "list, callback + context, empty");
    list = [1, 2, 7, 4, 5];
    equal(go.Lang.find(list, callback, context), 7, "list, callback + context, not empty");
    equal(go.Lang.find(list, callback, context, true), 2, "list, callback + context, not empty, key");

    dict = {
        'a': 1,
        'b': 2,
        'c': 3
    };
    equal(go.Lang.find(dict, callback, context), undefined, "dict, callback + context, empty");
    dict.b = 7;
    equal(go.Lang.find(dict, callback, context), 7, "dict, callback + context, not empty");
    equal(go.Lang.find(dict, callback, context, true), "b", "dict, callback + context, not empty, key");
});

tests.test("reduce", function () {
    var list,
        dict,
        callback,
        context,
        expected;

    list = [2, 4, 6, 8];
    callback = function (previous, current, index, array) {
        array[index] = current + 1;
        return String(previous) + ";" + current + "," + index;
    };
    expected = "2;4,1;6,2;8,3";
    equal(go.Lang.reduce(list, callback), expected, "array");
    deepEqual(list, [2, 5, 7, 9], "array arg");
    expected = "7;2,0;5,1;7,2;9,3";
    equal(go.Lang.reduce(list, callback, 7), expected, "initial value");

    list = [2, 4, 6, 8];
    context = {
        'A': [0, 1, 2, 3]
    };
    callback = function (previous, current, index) {
        return previous + current * this.A[index];
    };
    expected = 42; // 2 + 4 * 1 + 6 * 2 + 8 * 3
    equal(go.Lang.reduce(list, [callback, context]), expected, "context");

    dict = {
        'x': 1,
        'y': 2,
        'z': 3
    };
    callback = function (previous, current) {
        return previous + current;
    };
    expected = 6;
    equal(go.Lang.reduce(dict, callback), expected, "dict");
    context = {
        'x': 2,
        'y': 3,
        'z': 4
    };
    callback = function (previous, current, key, items) {
        if (items !== dict) {
            return 0;
        }
        return previous + current * this[key];
    };
    expected = 21; // 1 + 1 * 2 + 2 * 3 + 3 * 4
    equal(go.Lang.reduce(dict, [callback, context], 1), expected, "dict and initial value + context");

    throws(function () {
        go.Lang.reduce([], function () {});
    }, TypeError, "TypeError for empty array");
});

tests.test("reduceRight", function () {
    var list,
        dict,
        callback,
        context,
        expected;

    list = [2, 4, 6, 8];
    callback = function (previous, current, index, array) {
        array[index] = current + 1;
        return String(previous) + ";" + current + "," + index;
    };
    expected = "8;6,2;4,1;2,0";
    equal(go.Lang.reduceRight(list, callback), expected, "array");
    deepEqual(list, [3, 5, 7, 8], "array arg");
    expected = "7;8,3;7,2;5,1;3,0";
    equal(go.Lang.reduceRight(list, callback, 7), expected, "initial value");

    list = [2, 4, 6, 8];
    context = {
        'A': [0, 1, 2, 3]
    };
    callback = function (previous, current, index) {
        return previous - current * this.A[index];
    };
    expected = -8; // 8 - 6 * 2 - 4 * 1 - 2 * 0
    equal(go.Lang.reduceRight(list, [callback, context]), expected, "context");

    dict = {
        'x': 1,
        'y': 2,
        'z': 3
    };
    callback = function (previous, current) {
        return previous + current;
    };
    expected = 6;
    equal(go.Lang.reduceRight(dict, callback), expected, "dict");
    context = {
        'x': 2,
        'y': 3,
        'z': 4
    };
    callback = function (previous, current, key, items) {
        if (items !== dict) {
            return 0;
        }
        return previous + current * this[key];
    };
    expected = 21; // 1 + 1 * 2 + 2 * 3 + 3 * 4
    equal(go.Lang.reduce(dict, [callback, context], 1), expected, "dict and initial value + context");

    throws(function () {
        go.Lang.reduceRight([], function () {});
    }, TypeError, "TypeError for empty array");
});