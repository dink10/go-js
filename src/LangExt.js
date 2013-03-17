/**
 * go.LangExt: расширение go.Lang
 *
 * @package    go.js
 * @subpackage Lang
 * @author     Григорьев Олег aka vasa_c (http://blgo.ru/)
 */
/*jslint nomen: true, es5: true */
/*global go, window */

if (!window.go) {
    throw new Error("go.core is not found");
}

go("LangExt", [], function (go, global, undefined) {

    var Lang = go.Lang;

    /**
     * Разбор GET или POST запроса
     *
     * @name go.Lang.parseQuery
     * @public
     * @param {(String|Object)} [query]
     *        строка запроса (по умолчанию window.location) или сразу словарь переменных
     * @param {String} [sep]
     *        разделитель переменных (по умолчанию "&")
     * @return {Object}
     *         словарь переменных из запроса
     */
    Lang.parseQuery = function parseQuery(query, sep) {
        var result, i, len, v;
        if (query === undefined) {
            query = global.location.toString().split("#", 2)[0].split("?", 2)[1];
        } else if (typeof query !== "string") {
            return query;
        }
        if (!query) {
            return {};
        }
        result = {};
        query = query.split(sep || "&");
        for (i = 0, len = query.length; i < len; i += 1) {
            v = query[i].split("=", 2);
            if (v.length === 2) {
                result[decodeURIComponent(v[0])] = decodeURIComponent(v[1]);
            } else {
                result[''] = decodeURIComponent(v[0]);
            }
        }
        return result;
    };

    /**
     * Сформировать строку запроса на основе набора переменных
     *
     * @name go.Lang.buildQuery
     * @public
     * @param {(Object|String)} vars
     *        набор переменных (или сразу строка)
     * @param {String} [sep]
     *        разделитель (по умолчанию "&")
     * @return {String}
     *         строка запроса
     */
    Lang.buildQuery = function buildQuery(vars, sep) {
        var query, buildValue, buildArray, buildDict;
        if (typeof vars === "string") {
            return vars;
        }
        query = [];
        buildValue = function (name, value) {
            if (Lang.isDict(value)) {
                buildDict(value, name);
            } else if (Lang.isArray(value)) {
                buildArray(value, name);
            } else {
                query.push(name + "=" + encodeURIComponent(value));
            }
        };
        buildArray = function (vars, prefix) {
            var i, len, name;
            for (i = 0, len = vars.length; i < len; i += 1) {
                name = prefix ? prefix + "[" + i + "]" : i;
                buildValue(name, vars[i]);
            }
        };
        buildDict = function (vars, prefix) {
            var k, name;
            for (k in vars) {
                if (vars.hasOwnProperty(k)) {
                    name = prefix ? prefix + "[" + k + "]" : k;
                    buildValue(name, vars[k]);
                }
            }
        };
        buildDict(vars, "");
        return query.join(sep || "&");
    };

    /**
     * Получить значение по пути внутри объекта
     *
     * @name go.Lang.getByPath
     * @public
     * @param {Object} context
     *        объект, в котором производится поиск (не указан - глобальный)
     * @param {(String|Array.<String>)} path
     *        путь - массив компонентов или строка вида "one.two.three"
     * @param {*} [bydefault]
     *        значение по умолчанию, если путь не найден
     * @return {*}
     */
    Lang.getByPath = function getByPath(context, path, bydefault) {
        var len, i, p;
        context = context || global;
        if (typeof path !== "object") {
            path = path.split(".");
        }
        for (i = 0, len = path.length; i < len; i += 1) {
            p = path[i];
            if (!(context && context.hasOwnProperty(p))) {
                return bydefault;
            }
            context = context[p];
        }
        return context;
    };

    /**
     * Установить значение по пути внутри объекта
     *
     * @name go.Lang.setByPath
     * @public
     * @param {Object} context
     *        целевой объект
     * @param {(String|Array.<String>)} path
     *        путь - массив компонентов или строка вида "one.two.three"
     * @param {*} value
     *        значение
     */
    Lang.setByPath = function setByPath(context, path, value) {
        var len, i, p;
        context = context || global;
        if (typeof path !== "object") {
            path = path.split(".");
        }
        for (i = 0, len = path.length - 1; i < len; i += 1) {
            p = path[i];
            if (!context.hasOwnProperty(p)) {
                context[p] = {};
            }
            context = context[p];
        }
        context[path[path.length - 1]] = value;
    };

    /**
     * Каррирование функции
     *
     * @name go.Lang.curry
     * @public
     * @param {Function} fn
     *        исходная функция
     * @param {... *} [args]
     *        запоминаемые аргументы
     * @return {Function}
     *         каррированная функция
     */
    Lang.curry = function curry(fn) {
        var slice = Array.prototype.slice,
            cargs = slice.call(arguments, 1);
        return function () {
            var args = cargs.concat(slice.call(arguments));
            return fn.apply(global, args);
        };
    };

    /**
     * Выполнить первую корректную функцию
     *
     * @name go.Lang.tryDo
     * @public
     * @param {Array.<Function>} funcs
     *        список функций
     * @return {*}
     *         результат первой корректно завершившейся функции.
     *         ни одна не сработала - undefined.
     */
    Lang.tryDo = function tryDo(funcs) {
        var i, len, result;
        for (i = 0, len = funcs.length; i < len; i += 1) {
            try {
                return funcs[i]();
            } catch (e) {
            }
        }
        return result;
    };

    return true;
});