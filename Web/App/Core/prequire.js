var _amd = define.amd;
define.amd = undefined;;
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require(['jquery']));
    } else {
        window.chitu = factory();
    }

})(function () {
;/** @license
 * crossroads <http://millermedeiros.github.com/crossroads.js/>
 * Author: Miller Medeiros | MIT License
 * v0.12.0 (2013/01/21 13:47)
 */

//(function () {
var factory = function (signals) {

    var crossroads,
        _hasOptionalGroupBug,
        UNDEF;

    // Helpers -----------
    //====================

    // IE 7-8 capture optional groups as empty strings while other browsers
    // capture as `undefined`
    _hasOptionalGroupBug = (/t(.+)?/).exec('t')[1] === '';

    function arrayIndexOf(arr, val) {
        if (arr.indexOf) {
            return arr.indexOf(val);
        } else {
            //Array.indexOf doesn't work on IE 6-7
            var n = arr.length;
            while (n--) {
                if (arr[n] === val) {
                    return n;
                }
            }
            return -1;
        }
    }

    function arrayRemove(arr, item) {
        var i = arrayIndexOf(arr, item);
        if (i !== -1) {
            arr.splice(i, 1);
        }
    }

    function isKind(val, kind) {
        return '[object ' + kind + ']' === Object.prototype.toString.call(val);
    }

    function isRegExp(val) {
        return isKind(val, 'RegExp');
    }

    function isArray(val) {
        return isKind(val, 'Array');
    }

    function isFunction(val) {
        return typeof val === 'function';
    }

    //borrowed from AMD-utils
    function typecastValue(val) {
        var r;
        if (val === null || val === 'null') {
            r = null;
        } else if (val === 'true') {
            r = true;
        } else if (val === 'false') {
            r = false;
        } else if (val === UNDEF || val === 'undefined') {
            r = UNDEF;
        } else if (val === '' || isNaN(val)) {
            //isNaN('') returns false
            r = val;
        } else {
            //parseFloat(null || '') returns NaN
            r = parseFloat(val);
        }
        return r;
    }

    function typecastArrayValues(values) {
        var n = values.length,
            result = [];
        while (n--) {
            result[n] = typecastValue(values[n]);
        }
        return result;
    }

    //borrowed from AMD-Utils
    function decodeQueryString(str, shouldTypecast) {
        var queryArr = (str || '').replace('?', '').split('&'),
            n = queryArr.length,
            obj = {},
            item, val;
        while (n--) {
            item = queryArr[n].split('=');
            val = shouldTypecast ? typecastValue(item[1]) : item[1];
            obj[item[0]] = (typeof val === 'string') ? decodeURIComponent(val) : val;
        }
        return obj;
    }


    // Crossroads --------
    //====================

    /**
     * @constructor
     */
    function Crossroads() {
        //===========================================
        //this.bypassed = new signals.Signal();
        //this.routed = new signals.Signal();
        //=============== My Code ===================
        this.bypassed = $.Callbacks();
        this.routed = $.Callbacks();
        //===========================================
        this._routes = [];
        this._prevRoutes = [];
        this._piped = [];
        this.resetState();
    }

    Crossroads.prototype = {

        greedy: false,

        greedyEnabled: true,

        ignoreCase: true,

        ignoreState: false,

        shouldTypecast: false,

        normalizeFn: null,

        resetState: function () {
            this._prevRoutes.length = 0;
            this._prevMatchedRequest = null;
            this._prevBypassedRequest = null;
        },

        create: function () {
            return new Crossroads();
        },

        addRoute: function (pattern, callback, priority) {
            var route = new Route(pattern, callback, priority, this);
            this._sortedInsert(route);
            return route;
        },

        removeRoute: function (route) {
            arrayRemove(this._routes, route);
            route._destroy();
        },

        removeAllRoutes: function () {
            var n = this.getNumRoutes();
            while (n--) {
                this._routes[n]._destroy();
            }
            this._routes.length = 0;
        },

        parse: function (request, defaultArgs) {
            request = request || '';
            defaultArgs = defaultArgs || [];

            // should only care about different requests if ignoreState isn't true
            if (!this.ignoreState &&
                (request === this._prevMatchedRequest ||
                 request === this._prevBypassedRequest)) {
                return;
            }

            var routes = this._getMatchedRoutes(request),
                i = 0,
                n = routes.length,
                cur;

            if (n) {
                this._prevMatchedRequest = request;

                this._notifyPrevRoutes(routes, request);
                this._prevRoutes = routes;
                //should be incremental loop, execute routes in order
                while (i < n) {
                    cur = routes[i];
                    //======================================================================================
                    //cur.route.matched.dispatch.apply(cur.route.matched, defaultArgs.concat(cur.params));
                    //====================== My Code =======================================================
                    cur.route.matched.fire.apply(cur.route.matched, defaultArgs.concat(cur.params));
                    //======================================================================================

                    cur.isFirst = !i;

                    //======================================================================================
                    //this.routed.dispatch.apply(this.routed, defaultArgs.concat([request, cur]));
                    //====================== My Code =======================================================
                    this.routed.fire.apply(this.routed, defaultArgs.concat([request, cur]));
                    //======================================================================================
                    i += 1;
                }
            } else {
                this._prevBypassedRequest = request;
                //==========================================================================
                //this.bypassed.dispatch.apply(this.bypassed, defaultArgs.concat([request]));
                //==========================================================================
                this.bypassed.fire.apply(this.bypassed, defaultArgs.concat([request]));
                //==========================================================================
            }

            this._pipeParse(request, defaultArgs);
        },

        _notifyPrevRoutes: function (matchedRoutes, request) {
            var i = 0, prev;
            while (prev = this._prevRoutes[i++]) {
                //check if switched exist since route may be disposed
                if (prev.route.switched && this._didSwitch(prev.route, matchedRoutes)) {
                    //==========================================
                    //prev.route.switched.dispatch(request);
                    //============= My Code ====================
                    prev.route.switched.fire(request);
                    //==========================================
                }
            }
        },

        _didSwitch: function (route, matchedRoutes) {
            var matched,
                i = 0;
            while (matched = matchedRoutes[i++]) {
                // only dispatch switched if it is going to a different route
                if (matched.route === route) {
                    return false;
                }
            }
            return true;
        },

        _pipeParse: function (request, defaultArgs) {
            var i = 0, route;
            while (route = this._piped[i++]) {
                route.parse(request, defaultArgs);
            }
        },

        getNumRoutes: function () {
            return this._routes.length;
        },

        _sortedInsert: function (route) {
            //simplified insertion sort
            var routes = this._routes,
                n = routes.length;
            do { --n; } while (routes[n] && route._priority <= routes[n]._priority);
            routes.splice(n + 1, 0, route);
        },

        _getMatchedRoutes: function (request) {
            var res = [],
                routes = this._routes,
                n = routes.length,
                route;
            //should be decrement loop since higher priorities are added at the end of array
            while (route = routes[--n]) {
                if ((!res.length || this.greedy || route.greedy) && route.match(request)) {
                    res.push({
                        route: route,
                        params: route._getParamsArray(request)
                    });
                }
                if (!this.greedyEnabled && res.length) {
                    break;
                }
            }
            return res;
        },

        pipe: function (otherRouter) {
            this._piped.push(otherRouter);
        },

        unpipe: function (otherRouter) {
            arrayRemove(this._piped, otherRouter);
        },

        toString: function () {
            return '[crossroads numRoutes:' + this.getNumRoutes() + ']';
        }
    };

    //"static" instance
    crossroads = new Crossroads();
    crossroads.VERSION = '0.12.0';

    crossroads.NORM_AS_ARRAY = function (req, vals) {
        return [vals.vals_];
    };

    crossroads.NORM_AS_OBJECT = function (req, vals) {
        return [vals];
    };


    // Route --------------
    //=====================

    /**
     * @constructor
     */
    function Route(pattern, callback, priority, router) {
        var isRegexPattern = isRegExp(pattern),
            patternLexer = router.patternLexer;
        this._router = router;
        this._pattern = pattern;
        this._paramsIds = isRegexPattern ? null : patternLexer.getParamIds(pattern);
        this._optionalParamsIds = isRegexPattern ? null : patternLexer.getOptionalParamsIds(pattern);
        this._matchRegexp = isRegexPattern ? pattern : patternLexer.compilePattern(pattern, router.ignoreCase);

        //===============================================
        //this.matched = new signals.Signal();
        //this.switched = new signals.Signal();
        //============== My Code ========================
        this.matched = $.Callbacks();
        this.switched = $.Callbacks();
        //===============================================


        if (callback) {
            this.matched.add(callback);
        }
        this._priority = priority || 0;
    }

    Route.prototype = {

        greedy: false,

        rules: void (0),

        match: function (request) {
            request = request || '';
            return this._matchRegexp.test(request) && this._validateParams(request); //validate params even if regexp because of `request_` rule.
        },

        _validateParams: function (request) {
            var rules = this.rules,
                values = this._getParamsObject(request),
                key;
            for (key in rules) {
                // normalize_ isn't a validation rule... (#39)
                if (key !== 'normalize_' && rules.hasOwnProperty(key) && !this._isValidParam(request, key, values)) {
                    return false;
                }
            }
            return true;
        },

        _isValidParam: function (request, prop, values) {
            var validationRule = this.rules[prop],
                val = values[prop],
                isValid = false,
                isQuery = (prop.indexOf('?') === 0);

            if (val == null && this._optionalParamsIds && arrayIndexOf(this._optionalParamsIds, prop) !== -1) {
                isValid = true;
            }
            else if (isRegExp(validationRule)) {
                if (isQuery) {
                    val = values[prop + '_']; //use raw string
                }
                isValid = validationRule.test(val);
            }
            else if (isArray(validationRule)) {
                if (isQuery) {
                    val = values[prop + '_']; //use raw string
                }
                isValid = this._isValidArrayRule(validationRule, val);
            }
            else if (isFunction(validationRule)) {
                isValid = validationRule(val, request, values);
            }

            return isValid; //fail silently if validationRule is from an unsupported type
        },

        _isValidArrayRule: function (arr, val) {
            if (!this._router.ignoreCase) {
                return arrayIndexOf(arr, val) !== -1;
            }

            if (typeof val === 'string') {
                val = val.toLowerCase();
            }

            var n = arr.length,
                item,
                compareVal;

            while (n--) {
                item = arr[n];
                compareVal = (typeof item === 'string') ? item.toLowerCase() : item;
                if (compareVal === val) {
                    return true;
                }
            }
            return false;
        },

        _getParamsObject: function (request) {
            var shouldTypecast = this._router.shouldTypecast,
                values = this._router.patternLexer.getParamValues(request, this._matchRegexp, shouldTypecast),
                o = {},
                n = values.length,
                param, val;
            while (n--) {
                val = values[n];
                if (this._paramsIds) {
                    param = this._paramsIds[n];
                    if (param.indexOf('?') === 0 && val) {
                        //make a copy of the original string so array and
                        //RegExp validation can be applied properly
                        o[param + '_'] = val;
                        //update vals_ array as well since it will be used
                        //during dispatch
                        val = decodeQueryString(val, shouldTypecast);
                        values[n] = val;
                    }
                    // IE will capture optional groups as empty strings while other
                    // browsers will capture `undefined` so normalize behavior.
                    // see: #gh-58, #gh-59, #gh-60
                    if (_hasOptionalGroupBug && val === '' && arrayIndexOf(this._optionalParamsIds, param) !== -1) {
                        val = void (0);
                        values[n] = val;
                    }
                    o[param] = val;
                }
                //alias to paths and for RegExp pattern
                o[n] = val;
            }
            o.request_ = shouldTypecast ? typecastValue(request) : request;
            o.vals_ = values;
            return o;
        },

        _getParamsArray: function (request) {
            var norm = this.rules ? this.rules.normalize_ : null,
                params;
            norm = norm || this._router.normalizeFn; // default normalize
            if (norm && isFunction(norm)) {
                params = norm(request, this._getParamsObject(request));
            } else {
                params = this._getParamsObject(request).vals_;
            }
            return params;
        },

        interpolate: function (replacements) {
            var str = this._router.patternLexer.interpolate(this._pattern, replacements);
            if (!this._validateParams(str)) {
                throw new Error('Generated string doesn\'t validate against `Route.rules`.');
            }
            return str;
        },

        dispose: function () {
            this._router.removeRoute(this);
        },

        _destroy: function () {
            //========================================
            //this.matched.dispose();
            //this.switched.dispose();
            //=============== My Code ================
            this.matched.empty();
            this.switched.empty();
            //========================================
            this.matched = this.switched = this._pattern = this._matchRegexp = null;
        },

        toString: function () {
            return '[Route pattern:"' + this._pattern + '", numListeners:' + this.matched.getNumListeners() + ']';
        }

    };



    // Pattern Lexer ------
    //=====================

    Crossroads.prototype.patternLexer = (function () {

        var
            //match chars that should be escaped on string regexp
            ESCAPE_CHARS_REGEXP = /[\\.+*?\^$\[\](){}\/'#]/g,

            //trailing slashes (begin/end of string)
            LOOSE_SLASHES_REGEXP = /^\/|\/$/g,
            LEGACY_SLASHES_REGEXP = /\/$/g,

            //params - everything between `{ }` or `: :`
            PARAMS_REGEXP = /(?:\{|:)([^}:]+)(?:\}|:)/g,

            //used to save params during compile (avoid escaping things that
            //shouldn't be escaped).
            TOKENS = {
                'OS': {
                    //optional slashes
                    //slash between `::` or `}:` or `\w:` or `:{?` or `}{?` or `\w{?`
                    rgx: /([:}]|\w(?=\/))\/?(:|(?:\{\?))/g,
                    save: '$1{{id}}$2',
                    res: '\\/?'
                },
                'RS': {
                    //required slashes
                    //used to insert slash between `:{` and `}{`
                    rgx: /([:}])\/?(\{)/g,
                    save: '$1{{id}}$2',
                    res: '\\/'
                },
                'RQ': {
                    //required query string - everything in between `{? }`
                    rgx: /\{\?([^}]+)\}/g,
                    //everything from `?` till `#` or end of string
                    res: '\\?([^#]+)'
                },
                'OQ': {
                    //optional query string - everything in between `:? :`
                    rgx: /:\?([^:]+):/g,
                    //everything from `?` till `#` or end of string
                    res: '(?:\\?([^#]*))?'
                },
                'OR': {
                    //optional rest - everything in between `: *:`
                    rgx: /:([^:]+)\*:/g,
                    res: '(.*)?' // optional group to avoid passing empty string as captured
                },
                'RR': {
                    //rest param - everything in between `{ *}`
                    rgx: /\{([^}]+)\*\}/g,
                    res: '(.+)'
                },
                // required/optional params should come after rest segments
                'RP': {
                    //required params - everything between `{ }`
                    rgx: /\{([^}]+)\}/g,
                    res: '([^\\/?]+)'
                },
                'OP': {
                    //optional params - everything between `: :`
                    rgx: /:([^:]+):/g,
                    res: '([^\\/?]+)?\/?'
                }
            },

            LOOSE_SLASH = 1,
            STRICT_SLASH = 2,
            LEGACY_SLASH = 3,

            _slashMode = LOOSE_SLASH;


        function precompileTokens() {
            var key, cur;
            for (key in TOKENS) {
                if (TOKENS.hasOwnProperty(key)) {
                    cur = TOKENS[key];
                    cur.id = '__CR_' + key + '__';
                    cur.save = ('save' in cur) ? cur.save.replace('{{id}}', cur.id) : cur.id;
                    cur.rRestore = new RegExp(cur.id, 'g');
                }
            }
        }
        precompileTokens();


        function captureVals(regex, pattern) {
            var vals = [], match;
            // very important to reset lastIndex since RegExp can have "g" flag
            // and multiple runs might affect the result, specially if matching
            // same string multiple times on IE 7-8
            regex.lastIndex = 0;
            while (match = regex.exec(pattern)) {
                vals.push(match[1]);
            }
            return vals;
        }

        function getParamIds(pattern) {
            return captureVals(PARAMS_REGEXP, pattern);
        }

        function getOptionalParamsIds(pattern) {
            return captureVals(TOKENS.OP.rgx, pattern);
        }

        function compilePattern(pattern, ignoreCase) {
            pattern = pattern || '';

            if (pattern) {
                if (_slashMode === LOOSE_SLASH) {
                    pattern = pattern.replace(LOOSE_SLASHES_REGEXP, '');
                }
                else if (_slashMode === LEGACY_SLASH) {
                    pattern = pattern.replace(LEGACY_SLASHES_REGEXP, '');
                }

                //save tokens
                pattern = replaceTokens(pattern, 'rgx', 'save');
                //regexp escape
                pattern = pattern.replace(ESCAPE_CHARS_REGEXP, '\\$&');
                //restore tokens
                pattern = replaceTokens(pattern, 'rRestore', 'res');

                if (_slashMode === LOOSE_SLASH) {
                    pattern = '\\/?' + pattern;
                }
            }

            if (_slashMode !== STRICT_SLASH) {
                //single slash is treated as empty and end slash is optional
                pattern += '\\/?';
            }
            return new RegExp('^' + pattern + '$', ignoreCase ? 'i' : '');
        }

        function replaceTokens(pattern, regexpName, replaceName) {
            var cur, key;
            for (key in TOKENS) {
                if (TOKENS.hasOwnProperty(key)) {
                    cur = TOKENS[key];
                    pattern = pattern.replace(cur[regexpName], cur[replaceName]);
                }
            }
            return pattern;
        }

        function getParamValues(request, regexp, shouldTypecast) {
            var vals = regexp.exec(request);
            if (vals) {
                vals.shift();
                if (shouldTypecast) {
                    vals = typecastArrayValues(vals);
                }
            }
            return vals;
        }

        function interpolate(pattern, replacements) {
            if (typeof pattern !== 'string') {
                throw new Error('Route pattern should be a string.');
            }

            var replaceFn = function (match, prop) {
                var val;
                prop = (prop.substr(0, 1) === '?') ? prop.substr(1) : prop;
                if (replacements[prop] != null) {
                    if (typeof replacements[prop] === 'object') {
                        var queryParts = [];
                        for (var key in replacements[prop]) {
                            queryParts.push(encodeURI(key + '=' + replacements[prop][key]));
                        }
                        val = '?' + queryParts.join('&');
                    } else {
                        // make sure value is a string see #gh-54
                        val = String(replacements[prop]);
                    }

                    if (match.indexOf('*') === -1 && val.indexOf('/') !== -1) {
                        throw new Error('Invalid value "' + val + '" for segment "' + match + '".');
                    }
                }
                else if (match.indexOf('{') !== -1) {
                    throw new Error('The segment ' + match + ' is required.');
                }
                else {
                    val = '';
                }
                return val;
            };

            if (!TOKENS.OS.trail) {
                TOKENS.OS.trail = new RegExp('(?:' + TOKENS.OS.id + ')+$');
            }

            return pattern
                        .replace(TOKENS.OS.rgx, TOKENS.OS.save)
                        .replace(PARAMS_REGEXP, replaceFn)
                        .replace(TOKENS.OS.trail, '') // remove trailing
                        .replace(TOKENS.OS.rRestore, '/'); // add slash between segments
        }

        //API
        return {
            strict: function () {
                _slashMode = STRICT_SLASH;
            },
            loose: function () {
                _slashMode = LOOSE_SLASH;
            },
            legacy: function () {
                _slashMode = LEGACY_SLASH;
            },
            getParamIds: getParamIds,
            getOptionalParamsIds: getOptionalParamsIds,
            getParamValues: getParamValues,
            compilePattern: compilePattern,
            interpolate: interpolate
        };

    }());

    window['crossroads'] = crossroads;
    return crossroads;
};

//if (typeof define === 'function' && define.amd) {
//    define(['jquery'], factory);
//} else if (typeof module !== 'undefined' && module.exports) { //Node
//    module.exports = factory(require('jquery'));
//} else {
/*jshint sub:true */
window['crossroads'] = factory(window['jQuery']);
//}

//}());

;/// <reference path="scripts/typings/jquery/jquery.d.ts" />
var chitu;
(function (chitu) {
    var e = chitu.Errors;
    var Utility = (function () {
        function Utility() {
        }
        Utility.isType = function (targetType, obj) {
            for (var key in targetType.prototype) {
                if (obj[key] === undefined)
                    return false;
            }
            return true;
        };
        Utility.isDeferred = function (obj) {
            if (obj == null)
                return false;
            if (obj.pipe != null && obj.always != null && obj.done != null)
                return true;
            return false;
        };
        Utility.format = function (source, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
            var params = [arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10];
            for (var i = 0; i < params.length; i++) {
                if (params[i] == null)
                    break;
                source = source.replace(new RegExp("\\{" + i + "\\}", "g"), function () {
                    return params[i];
                });
            }
            return source;
        };
        Utility.fileName = function (url, withExt) {
            /// <summary>获取 URL 链接中的文件名</summary>
            /// <param name="url" type="String">URL 链接</param>
            /// <param name="withExt" type="Boolean" canBeNull="true">
            /// 表示返回的文件名是否包含扩展名，true表示包含，false表示不包含。默认值为true。
            /// </param>
            /// <returns>返回 URL 链接中的文件名</returns>
            if (!url)
                throw e.argumentNull('url');
            withExt = withExt || true;
            url = url.replace('http://', '/');
            var filename = url.replace(/^.*[\\\/]/, '');
            if (withExt === true) {
                var arr = filename.split('.');
                filename = arr[0];
            }
            return filename;
        };
        Utility.log = function (msg, args) {
            if (args === void 0) { args = []; }
            if (!window.console)
                return;
            if (args == null) {
                console.log(msg);
                return;
            }
            var txt = this.format.apply(this, arguments);
            console.log(txt);
        };
        return Utility;
    })();
    chitu.Utility = Utility;
})(chitu || (chitu = {}));
//# sourceMappingURL=Utility.js.map;var chitu;
(function (chitu) {
    var u = chitu.Utility;
    var Errors = (function () {
        function Errors() {
        }
        Errors.argumentNull = function (paramName) {
            var msg = u.format('The argument "{0}" cannt be null.', paramName);
            return new Error(msg);
        };
        Errors.modelFileExpecteFunction = function (script) {
            var msg = u.format('The eval result of script file "{0}" is expected a function.', script);
            return new Error(msg);
        };
        Errors.paramTypeError = function (paramName, expectedType) {
            /// <param name="paramName" type="String"/>
            /// <param name="expectedType" type="String"/>
            var msg = u.format('The param "{0}" is expected "{1}" type.', paramName, expectedType);
            return new Error(msg);
        };
        Errors.viewNodeNotExists = function (name) {
            var msg = u.format('The view node "{0}" is not exists.', name);
            return new Error(msg);
        };
        Errors.pathPairRequireView = function (index) {
            var msg = u.format('The view value is required for path pair, but the item with index "{0}" is miss it.', index);
            return new Error(msg);
        };
        Errors.notImplemented = function (name) {
            var msg = u.format('The method "{0}" is not implemented.', name);
            return new Error(msg);
        };
        Errors.routeExists = function (name) {
            var msg = u.format('Route named "{0}" is exists.', name);
            return new Error(msg);
        };
        Errors.routeResultRequireController = function (routeName) {
            var msg = u.format('The parse result of route "{0}" does not contains controler.', routeName);
            return new Error(msg);
        };
        Errors.routeResultRequireAction = function (routeName) {
            var msg = u.format('The parse result of route "{0}" does not contains action.', routeName);
            return new Error(msg);
        };
        Errors.ambiguityRouteMatched = function (url, routeName1, routeName2) {
            var msg = u.format('Ambiguity route matched, {0} is match in {1} and {2}.', url, routeName1, routeName2);
            return new Error(msg);
        };
        Errors.noneRouteMatched = function (url) {
            var msg = u.format('None route matched with url "{0}".', url);
            var error = new Error(msg);
            return error;
        };
        Errors.emptyStack = function () {
            return new Error('The stack is empty.');
        };
        Errors.canntParseUrl = function (url) {
            var msg = u.format('Can not parse the url "{0}" to route data.', url);
            return new Error(msg);
        };
        Errors.routeDataRequireController = function () {
            var msg = 'The route data does not contains a "controller" file.';
            return new Error(msg);
        };
        Errors.routeDataRequireAction = function () {
            var msg = 'The route data does not contains a "action" file.';
            return new Error(msg);
        };
        Errors.parameterRequireField = function (fileName, parameterName) {
            var msg = u.format('Parameter {1} does not contains field {0}.', fileName, parameterName);
            return new Error(msg);
        };
        return Errors;
    })();
    chitu.Errors = Errors;
})(chitu || (chitu = {}));
//# sourceMappingURL=Errors.js.map;var chitu;
(function (chitu) {
    var rnotwhite = (/\S+/g);
    // String to Object options format cache
    var optionsCache = {};
    // Convert String-formatted options into Object-formatted ones and store in cache
    function createOptions(options) {
        var object = optionsCache[options] = {};
        jQuery.each(options.match(rnotwhite) || [], function (_, flag) {
            object[flag] = true;
        });
        return object;
    }
    var Callback = (function () {
        function Callback(source) {
            this.source = source;
        }
        Callback.prototype.add = function (func) {
            this.source.add(func);
        };
        Callback.prototype.remove = function (func) {
            this.source.remove(func);
        };
        Callback.prototype.has = function (func) {
            return this.source.has(func);
        };
        Callback.prototype.fireWith = function (context, args) {
            return this.source.fireWith(context, args);
        };
        Callback.prototype.fire = function (arg1, arg2, arg3, arg4) {
            return this.source.fire(arg1, arg2, arg3);
        };
        return Callback;
    })();
    chitu.Callback = Callback;
    function Callbacks(options) {
        if (options === void 0) { options = null; }
        // Convert options from String-formatted to Object-formatted if needed
        // (we check in cache first)
        options = typeof options === "string" ?
            (optionsCache[options] || createOptions(options)) :
            jQuery.extend({}, options);
        var memory, 
        // Flag to know if list was already fired
        fired, 
        // Flag to know if list is currently firing
        firing, 
        // First callback to fire (used internally by add and fireWith)
        firingStart, 
        // End of the loop when firing
        firingLength, 
        // Index of currently firing callback (modified by remove if needed)
        firingIndex, 
        // Actual callback list
        list = [], 
        // Stack of fire calls for repeatable lists
        stack = !options.once && [], 
        // Fire callbacks
        fire = function (data) {
            memory = options.memory && data;
            fired = true;
            firingIndex = firingStart || 0;
            firingStart = 0;
            firingLength = list.length;
            firing = true;
            for (; list && firingIndex < firingLength; firingIndex++) {
                var result = list[firingIndex].apply(data[0], data[1]);
                //==============================================
                // MY CODE
                if (result != null) {
                    data[0].results.push(result);
                }
                //==============================================
                if (result === false && options.stopOnFalse) {
                    memory = false; // To prevent further calls using add
                    break;
                }
            }
            firing = false;
            if (list) {
                if (stack) {
                    if (stack.length) {
                        fire(stack.shift());
                    }
                }
                else if (memory) {
                    list = [];
                }
                else {
                    self.disable();
                }
            }
        }, 
        // Actual Callbacks object
        self = {
            results: [],
            // Add a callback or a collection of callbacks to the list
            add: function () {
                if (list) {
                    // First, we save the current length
                    var start = list.length;
                    (function add(args) {
                        jQuery.each(args, function (_, arg) {
                            var type = jQuery.type(arg);
                            if (type === "function") {
                                if (!options.unique || !self.has(arg)) {
                                    list.push(arg);
                                }
                            }
                            else if (arg && arg.length && type !== "string") {
                                // Inspect recursively
                                add(arg);
                            }
                        });
                    })(arguments);
                    // Do we need to add the callbacks to the
                    // current firing batch?
                    if (firing) {
                        firingLength = list.length;
                    }
                    else if (memory) {
                        firingStart = start;
                        fire(memory);
                    }
                }
                return this;
            },
            // Remove a callback from the list
            remove: function () {
                if (list) {
                    jQuery.each(arguments, function (_, arg) {
                        var index;
                        while ((index = jQuery.inArray(arg, list, index)) > -1) {
                            list.splice(index, 1);
                            // Handle firing indexes
                            if (firing) {
                                if (index <= firingLength) {
                                    firingLength--;
                                }
                                if (index <= firingIndex) {
                                    firingIndex--;
                                }
                            }
                        }
                    });
                }
                return this;
            },
            // Check if a given callback is in the list.
            // If no argument is given, return whether or not list has callbacks attached.
            has: function (fn) {
                return fn ? jQuery.inArray(fn, list) > -1 : !!(list && list.length);
            },
            // Remove all callbacks from the list
            empty: function () {
                list = [];
                firingLength = 0;
                return this;
            },
            // Have the list do nothing anymore
            disable: function () {
                list = stack = memory = undefined;
                return this;
            },
            // Is it disabled?
            disabled: function () {
                return !list;
            },
            // Lock the list in its current state
            lock: function () {
                stack = undefined;
                if (!memory) {
                    self.disable();
                }
                return this;
            },
            // Is it locked?
            locked: function () {
                return !stack;
            },
            // Call all callbacks with the given context and arguments
            fireWith: function (context, args) {
                context.results = [];
                if (list && (!fired || stack)) {
                    args = args || [];
                    args = [context, args.slice ? args.slice() : args];
                    if (firing) {
                        stack.push(args);
                    }
                    else {
                        fire(args);
                    }
                }
                return context.results;
            },
            // Call all the callbacks with the given arguments
            fire: function () {
                return self.fireWith(this, arguments);
            },
            // To know if the callbacks have already been called at least once
            fired: function () {
                return !!fired;
            },
            count: function () {
                return list.length;
            }
        };
        return new chitu.Callback(self);
    }
    chitu.Callbacks = Callbacks;
    function fireCallback(callback, args) {
        var results = callback.fire.apply(callback, args);
        var deferreds = [];
        for (var i = 0; i < results.length; i++) {
            if (chitu.Utility.isDeferred(results[i]))
                deferreds.push(results[i]);
        }
        if (deferreds.length == 0)
            return $.Deferred().resolve();
        return $.when.apply($, deferreds);
    }
    chitu.fireCallback = fireCallback;
    var crossroads = window['crossroads'];
    $.extend(crossroads, {
        _create: crossroads.create,
        create: function () {
            /// <returns type="Crossroads"/>
            var obj = this._create();
            obj.getRouteData = function (request, defaultArgs) {
                request = request || '';
                defaultArgs = defaultArgs || [];
                // should only care about different requests if ignoreState isn't true
                if (!this.ignoreState &&
                    (request === this._prevMatchedRequest ||
                        request === this._prevBypassedRequest)) {
                    return;
                }
                var routes = this._getMatchedRoutes(request), i = 0, n = routes.length, cur;
                if (n == 0)
                    return null;
                if (n > 1) {
                    throw chitu.Errors.ambiguityRouteMatched(request, 'route1', 'route2');
                }
                return routes[0];
            };
            return obj;
        }
    });
})(chitu || (chitu = {}));
//# sourceMappingURL=Extends.js.map;var chitu;
(function (chitu) {
    var ns = chitu;
    var e = chitu.Errors;
    var PageContainer = (function () {
        function PageContainer(app, node) {
            this.pageCreating = ns.Callbacks();
            this.pageCreated = ns.Callbacks();
            this.pageShowing = ns.Callbacks();
            this.pageShown = ns.Callbacks();
            this.init(app, node);
        }
        PageContainer.prototype.init = function (app, node) {
            this._app = app;
            this._node = node;
            this._pageStack = [];
        };
        PageContainer.prototype.on_pageCreating = function (context) {
            return ns.fireCallback(this.pageCreating, [this, context]);
        };
        PageContainer.prototype.on_pageCreated = function (page) {
            //this.pageCreated.fire(this, page);
            return ns.fireCallback(this.pageCreated, [this, page]);
        };
        PageContainer.prototype.on_pageShowing = function (page, args) {
            //this.pageShowing.fire(this, page, args);
            return ns.fireCallback(this.pageShowing, [this, page, args]);
        };
        PageContainer.prototype.on_pageShown = function (page, args) {
            //this.pageShown.fire(this, page, args);
            return ns.fireCallback(this.pageShown, [this, page, args]);
        };
        PageContainer.prototype.application = function () {
            /// <returns type="chitu.Application"/>
            return this._app;
        };
        PageContainer.prototype.node = function () {
            /// <returns type="HTMLElement"/>
            return this._node;
        };
        PageContainer.prototype.currentPage = function () {
            /// <returns type="chitu.Page"/>
            return this._currentPage;
        };
        PageContainer.prototype._createPage = function (url, element) {
            if (!url)
                throw e.argumentNull('url');
            if (typeof url != 'string')
                throw e.paramTypeError('url', 'String');
            if (!element) {
                element = document.createElement('div');
                document.body.appendChild(element);
            }
            var routeData = this.application().routes().getRouteData(url);
            if (routeData == null) {
                throw e.noneRouteMatched(url);
            }
            var controllerName = routeData.values().controller;
            var actionName = routeData.values().action;
            var controller = this.application().controller(routeData);
            var view_deferred = this.application().viewFactory.view(routeData); //this.application().viewEngineFactory.getViewEngine(controllerName).view(actionName, routeData.viewPath);
            var context = new ns.ControllerContext(controller, view_deferred, routeData);
            this.on_pageCreating(context);
            var page = new ns.Page(context, element);
            this.on_pageCreated(page);
            return page;
        };
        PageContainer.prototype.showPage = function (url, args) {
            /// <param name="container" type="HTMLElement" canBeNull="false"/>
            /// <param name="url" type="String" canBeNull="false"/>
            /// <param name="args" type="object" canBeNull="true"/>
            /// <returns type="jQuery.Deferred"/>
            args = args || {};
            if (!url)
                throw e.argumentNull('url');
            var routeData = this.application().routes().getRouteData(url);
            if (routeData == null) {
                throw e.noneRouteMatched(url);
            }
            var container = this.node();
            var controllerName = routeData.values().controller;
            var actionName = routeData.values().action;
            var name = chitu.Page.getPageName(routeData);
            var pages = $(container).data('pages');
            if (!pages) {
                pages = {};
                $(container).data('pages', pages);
            }
            var self = this;
            var page = pages[name];
            if (page == null) {
                var element = $('<div>').appendTo(container)[0];
                page = this._createPage(url, element);
                pages[name] = page;
            }
            this._currentPage = page;
            for (var key in pages) {
                if (pages[key] != this._currentPage) {
                    pages[key].visible(false);
                }
            }
            $.extend(args, routeData.values());
            //this.on_pageShowing(page, args);
            var self = this;
            var result = $.Deferred();
            this.on_pageShowing(page, args).pipe(function () {
                return page.open(args);
            })
                .done($.proxy(function () {
                self._pageStack.push({ page: this.page, url: this.url });
                //=======================================================
                // 说明：由于只能显示一个页面，只有为 currentPage 才显示
                if (this.page != self.currentPage())
                    this.page.visible(false);
                //=======================================================
                this.result.resolve(this.page);
                self.on_pageShown(this.page, args);
            }, { page: page, result: result, url: url }))
                .fail($.proxy(function (error) {
                this.result.reject(this.page, error);
            }, { page: page, result: result, url: url }));
            return result;
        };
        PageContainer.prototype.back = function (args) {
            /// <param name="args" type="Object"/>
            /// <returns type="jQuery.Deferred"/>
            var stack = this._pageStack;
            var current = this.currentPage();
            if (stack.length == 0 || current == null) {
                return $.Deferred().reject();
            }
            stack.pop();
            var item = stack[stack.length - 1];
            if (item == null)
                return $.Deferred().reject();
            var hash = '#' + item.url.toLowerCase();
            if (hash.localeCompare(window.location.hash.toLowerCase()) != 0) {
                window.location.hash = item.url;
                window.location['skip'] = true;
            }
            current.visible(false);
            if (args)
                item.page.open(args);
            else
                item.page.visible(true);
            //new chitu.Page().open
            //document.body.scrollTop = item.page.scrollTop || '0px';
            this._currentPage = item.page;
            return $.Deferred().resolve();
        };
        return PageContainer;
    })();
    chitu.PageContainer = PageContainer;
})(chitu || (chitu = {}));
//# sourceMappingURL=PageContainer.js.map;var chitu;
(function (chitu) {
    var ns = chitu;
    var u = chitu.Utility;
    var e = chitu.Errors;
    function eventDeferred(callback, sender, args) {
        if (args === void 0) { args = {}; }
        return chitu.fireCallback(callback, [sender, args]);
    }
    ;
    var Page = (function () {
        function Page(context, node) {
            this._node = HTMLElement;
            this._visible = true;
            this._loadViewModelResult = null;
            this._showResult = null;
            this._hideResult = null;
            this.created = ns.Callbacks();
            this.creating = ns.Callbacks();
            this.preLoad = ns.Callbacks();
            this.load = ns.Callbacks();
            this.closing = ns.Callbacks();
            this.closed = ns.Callbacks();
            this.scroll = ns.Callbacks();
            this.showing = ns.Callbacks();
            this.shown = ns.Callbacks();
            this.hiding = ns.Callbacks();
            this.hidden = ns.Callbacks();
            this._type = 'Page';
            if (!context)
                throw e.argumentNull('context');
            //if (context['_type'] != 'ControllerContext') throw e.paramTypeError('context', 'ControllerContext');
            if (!node)
                throw e.argumentNull('node');
            this._context = context;
            var controllerName = context.routeData().values().controller;
            var actionName = context.routeData().values().action;
            var name = Page.getPageName(context.routeData());
            var viewDeferred = context.view(); //app.viewEngineFactory.getViewEngine(controllerName).view(actionName);
            var actionDeferred = context.controller().action(context.routeData());
            this.init(name, viewDeferred, actionDeferred, node);
        }
        Page.getPageName = function (routeData) {
            var name;
            if (routeData.pageName()) {
                var route = window['crossroads'].addRoute(routeData.pageName());
                name = route.interpolate(routeData.values());
            }
            else {
                name = routeData.values().controller + '.' + routeData.values().action;
            }
            return name;
        };
        Page.prototype.context = function () {
            /// <returns type="chitu.ControllerContext"/>
            return this._context;
        };
        Page.prototype.name = function () {
            return this._name;
        };
        Page.prototype.node = function () {
            /// <returns type="HTMLElement"/>
            return this._node;
        };
        Page.prototype.parent = function () {
            /// <returns type="chitu.Page"/>
            return this._parent;
        };
        Page.prototype.visible = function (value) {
            var is_visible = $(this.node()).is(':visible');
            if (value === undefined)
                return is_visible; //this._visible;
            if (value == is_visible)
                return;
            if (!value) {
                this.on_hiding({});
                $(this.node()).hide();
                this.on_hidden({});
            }
            else {
                this.on_showing({});
                $(this.node()).show();
                this.on_shown({});
            }
            this._visible = value;
        };
        Page.prototype.init = function (name, viewDeferred, actionDeferred, node) {
            if (!name)
                throw e.argumentNull('name');
            if (!viewDeferred)
                throw e.argumentNull('viewDeferred');
            if (!actionDeferred)
                throw e.argumentNull('actionDeferred');
            if (!node)
                throw e.argumentNull('node');
            this._name = name;
            this._viewDeferred = viewDeferred;
            this._actionDeferred = actionDeferred;
            this._parent;
            this._node = node;
            this._visible = true;
            $(this._node).hide();
        };
        Page.prototype.on_creating = function (context) {
            return eventDeferred(this.creating, this, context);
        };
        Page.prototype.on_created = function () {
            return eventDeferred(this.created, this);
        };
        Page.prototype.on_preLoad = function (args) {
            return eventDeferred(this.preLoad, this, args);
        };
        Page.prototype.on_load = function (args) {
            return eventDeferred(this.load, this, args);
        };
        Page.prototype.on_closing = function (args) {
            return eventDeferred(this.closing, this, args);
        };
        Page.prototype.on_closed = function (args) {
            return eventDeferred(this.closed, this, args);
        };
        Page.prototype.on_scroll = function (event) {
            return eventDeferred(this.scroll, this, event);
        };
        Page.prototype.on_showing = function (args) {
            return eventDeferred(this.showing, this, args);
        };
        Page.prototype.on_shown = function (args) {
            return eventDeferred(this.shown, this, args);
        };
        Page.prototype.on_hiding = function (args) {
            return eventDeferred(this.hiding, this, args);
        };
        Page.prototype.on_hidden = function (args) {
            return eventDeferred(this.hidden, this, args);
        };
        Page.prototype._appendNode = function (childNode) {
            /// <param name="childNode" type="HTMLElement"/>
            if (childNode == null)
                throw e.argumentNull('childNode');
            $(this._node).append(childNode);
        };
        Page.prototype._loadViewModel = function () {
            if (this._loadViewModelResult)
                return this._loadViewModelResult;
            var page = this;
            this._loadViewModelResult = this._viewDeferred.pipe(function (html) {
                u.log('Load view success, page:{0}.', [page['_name']]);
                $(page.node()).append(html);
                return page._actionDeferred;
            })
                .pipe(function (action) {
                /// <param name="action" type="chitu.Action"/>
                var result = action.execute(page);
                page.on_created();
                if (u.isDeferred(result))
                    return result;
                return $.Deferred().resolve();
            })
                .fail(function () {
                page._loadViewModelResult = null;
                u.log('Load view or action fail, page：{0}.', [page['_name']]);
            });
            return this._loadViewModelResult;
        };
        Page.prototype.open = function (args) {
            /// <summary>
            /// Show the page.
            /// </summary>
            /// <param name="args" type="Object">
            /// The value passed to the show event functions.
            /// </param>
            /// <returns type="jQuery.Deferred"/>
            var self = this;
            this._showResult = this.on_preLoad(args).pipe(function () {
                return self._loadViewModel();
            })
                .pipe(function () {
                self.on_showing(args);
                return self.on_load(args);
            });
            this._showResult.done($.proxy(function () {
                self._hideResult = null;
                $(self.node()).show();
                self.on_shown(this.args);
            }, { args: args }));
            return this._showResult;
        };
        Page.prototype.close = function (args) {
            /// <summary>
            /// Hide the page.
            /// </summary>
            /// <param name="args" type="Object" canBeNull="true">
            /// The value passed to the hide event functions.
            /// </param>
            /// <returns type="jQuery.Deferred"/>
            var self = this;
            if (!this._hideResult) {
                this._hideResult = self.on_closing(args).pipe(function () {
                    self.visible(false);
                    return self.on_closed(args);
                });
            }
            return this._hideResult.always(function () {
                self._hideResult = null;
            });
        };
        return Page;
    })();
    chitu.Page = Page;
})(chitu || (chitu = {}));
//# sourceMappingURL=Page.js.map;/// <reference path="scripts/typings/requirejs/require.d.ts" />
var chitu;
(function (chitu) {
    var ns = chitu;
    var e = ns.Errors;
    var u = ns.Utility;
    var crossroads = window['crossroads'];
    function interpolate(pattern, data) {
        var http_prefix = 'http://'.toLowerCase();
        if (pattern.substr(0, http_prefix.length).toLowerCase() == http_prefix) {
            var link = document.createElement('a');
            //  set href to any path
            link.setAttribute('href', pattern);
            pattern = decodeURI(link.pathname); //pattern.substr(http_prefix.length);
            var route = crossroads.addRoute(pattern);
            return http_prefix + link.host + route.interpolate(data);
        }
        var route = crossroads.addRoute(pattern);
        return route.interpolate(data);
    }
    var Controller = (function () {
        function Controller(name) {
            //if (!routeData) throw e.argumentNull('routeData');
            ////if (typeof routeData !== 'object') throw e.paramTypeError('routeData', 'object');
            //_routeData: RouteData;
            this._actions = {};
            //if (!routeData.values().controller)
            //    throw e.routeDataRequireController();
            this._name = name;
            //this._routeData = routeData;
            this._actions = {};
            this.actionCreated = chitu.Callbacks();
        }
        Controller.prototype.name = function () {
            return this._name;
        };
        //public getLocation(routeData: RouteData) {
        //    /// <param name="actionName" type="String"/>
        //    /// <returns type="String"/>
        //    //if (!actionName) throw e.argumentNull('actionName');
        //    //if (typeof actionName != 'string') throw e.paramTypeError('actionName', 'String');
        //    var data = $.extend(RouteData.values(), { action: actionName });
        //    return interpolate(this._routeData.actionPath(), data);
        //}
        Controller.prototype.action = function (routeData) {
            /// <param name="value" type="chitu.Action" />
            /// <returns type="jQuery.Deferred" />
            var controller = routeData.values().controller;
            ;
            if (!controller)
                throw e.routeDataRequireController();
            if (this._name != controller) {
                throw new Error('Not same a controller.');
            }
            var name = routeData.values().action;
            if (!name)
                throw e.routeDataRequireAction();
            var self = this;
            if (!this._actions[name]) {
                this._actions[name] = this._createAction(routeData).fail($.proxy(function () {
                    self._actions[this.actionName] = null;
                }, { actionName: routeData }));
            }
            return this._actions[name];
        };
        Controller.prototype._createAction = function (routeData) {
            /// <param name="actionName" type="String"/>
            /// <returns type="jQuery.Deferred"/>
            var actionName = routeData.values().action;
            if (!actionName)
                throw e.routeDataRequireAction();
            var self = this;
            var url = interpolate(routeData.actionPath(), routeData.values()); //this.getLocation(actionName);
            var result = $.Deferred();
            require([url], $.proxy(function (obj) {
                //加载脚本失败
                if (!obj) {
                    console.warn(u.format('加载活动“{1}.{0}”失败，为该活动提供默认的值。', this.actionName, self.name()));
                    obj = { func: function () { } };
                }
                var func = obj.func || obj;
                if (!$.isFunction(func))
                    throw ns.Errors.modelFileExpecteFunction(this.actionName);
                var action = new Action(self, this.actionName, func);
                self.actionCreated.fire(self, action);
                this.result.resolve(action);
            }, { actionName: actionName, result: result }), $.proxy(function (err) {
                console.warn(u.format('加载活动“{1}.{0}”失败，为该活动提供默认的值。', this.actionName, self.name()));
                var action = new Action(self, this.actionName, function () { });
                self.actionCreated.fire(self, action);
                this.result.resolve(action);
                //this.result.reject(err);
            }, { actionName: actionName, result: result }));
            return result;
        };
        return Controller;
    })();
    chitu.Controller = Controller;
    var Action = (function () {
        function Action(controller, name, handle) {
            /// <param name="controller" type="chitu.Controller"/>
            /// <param name="name" type="String">Name of the action.</param>
            /// <param name="handle" type="Function"/>
            if (!controller)
                throw e.argumentNull('controller');
            if (!name)
                throw e.argumentNull('name');
            if (!handle)
                throw e.argumentNull('handle');
            if (!$.isFunction(handle))
                throw e.paramTypeError('handle', 'Function');
            this._name = name;
            this._handle = handle;
        }
        Action.prototype.name = function () {
            return this._name;
        };
        Action.prototype.execute = function (page) {
            /// <param name="page" type="chitu.Page"/>
            /// <returns type="jQuery.Deferred"/>
            if (!page)
                throw e.argumentNull('page');
            if (page._type != 'Page')
                throw e.paramTypeError('page', 'Page');
            var result = this._handle.apply({}, [page]);
            return u.isDeferred(result) ? result : $.Deferred().resolve();
        };
        return Action;
    })();
    function action(deps, filters, func) {
        /// <param name="deps" type="Array" canBeNull="true"/>
        /// <param name="filters" type="Array" canBeNull="true"/>
        /// <param name="func" type="Function" canBeNull="false"/>
        switch (arguments.length) {
            case 0:
                throw e.argumentNull('func');
            case 1:
                if (typeof arguments[0] != 'function')
                    throw e.paramTypeError('arguments[0]', 'Function');
                func = deps;
                filters = deps = [];
                break;
            case 2:
                func = filters;
                if (typeof func != 'function')
                    throw e.paramTypeError('func', 'Function');
                if (!$.isArray(deps))
                    throw e.paramTypeError('deps', 'Array');
                if (deps.length == 0) {
                    deps = filters = [];
                }
                else if (typeof deps[0] == 'function') {
                    filters = deps;
                    deps = [];
                }
                else {
                    filters = [];
                }
                break;
        }
        for (var i = 0; i < deps.length; i++) {
            if (typeof deps[i] != 'string')
                throw e.paramTypeError('deps[' + i + ']', 'string');
        }
        for (var i = 0; i < filters.length; i++) {
            if (typeof filters[i] != 'function')
                throw e.paramTypeError('filters[' + i + ']', 'function');
        }
        if (!$.isFunction(func))
            throw e.paramTypeError('func', 'function');
        define(deps, $.proxy(function () {
            var args = Array.prototype.slice.call(arguments, 0);
            var func = this.func;
            var filters = this.filters;
            return {
                func: function (page) {
                    args.unshift(page);
                    return func.apply(func, args);
                },
                filters: filters
            };
        }, { func: func, filters: filters }));
        return func;
    }
    chitu.action = action;
    ;
})(chitu || (chitu = {}));
//# sourceMappingURL=Controller.js.map;var chitu;
(function (chitu) {
    var ControllerContext = (function () {
        function ControllerContext(controller, view, routeData) {
            this._routeData = new chitu.RouteData();
            this._controller = controller;
            this._view = view;
            this._routeData = routeData;
        }
        ControllerContext.prototype.controller = function () {
            /// <returns type="chitu.Controller"/>
            return this._controller;
        };
        ControllerContext.prototype.view = function () {
            /// <returns type="jQuery.Deferred"/>
            return this._view;
        };
        ControllerContext.prototype.routeData = function () {
            /// <returns type="chitu.RouteData"/>
            return this._routeData;
        };
        return ControllerContext;
    })();
    chitu.ControllerContext = ControllerContext;
})(chitu || (chitu = {}));
//# sourceMappingURL=ControllerContext.js.map;var chitu;
(function (chitu) {
    var e = chitu.Errors;
    var ns = chitu;
    var ControllerFactory = (function () {
        function ControllerFactory() {
            //if (!actionLocationFormater)
            //    throw e.argumentNull('actionLocationFormater');
            this._controllers = {};
            this._controllers = {};
            //this._actionLocationFormater = actionLocationFormater;
        }
        ControllerFactory.prototype.controllers = function () {
            return this._controllers;
        };
        ControllerFactory.prototype.createController = function (name) {
            /// <param name="routeData" type="Object"/>
            /// <returns type="ns.Controller"/>
            //if (!routeData.values().controller)
            //    throw e.routeDataRequireController();
            return new ns.Controller(name);
        };
        ControllerFactory.prototype.actionLocationFormater = function () {
            return this._actionLocationFormater;
        };
        ControllerFactory.prototype.getController = function (routeData) {
            /// <summary>Gets the controller by routeData.</summary>
            /// <param name="routeData" type="Object"/>
            /// <returns type="chitu.Controller"/>
            //if (typeof routeData !== 'object')
            //    throw e.paramTypeError('routeData', 'object');
            if (!routeData.values().controller)
                throw e.routeDataRequireController();
            if (!this._controllers[routeData.values().controller])
                this._controllers[routeData.values().controller] = this.createController(routeData.values().controller);
            return this._controllers[routeData.values().controller];
        };
        return ControllerFactory;
    })();
    chitu.ControllerFactory = ControllerFactory;
})(chitu || (chitu = {}));
//# sourceMappingURL=ControllerFactory.js.map;var chitu;
(function (chitu) {
    var Route = (function () {
        function Route(name, pattern, defaults) {
            this._name = name;
            this._pattern = pattern;
            this._defaults = defaults;
        }
        Route.prototype.name = function () {
            return this._name;
        };
        Route.prototype.defaults = function () {
            return this._defaults;
        };
        Route.prototype.url = function () {
            return this._pattern;
        };
        return Route;
    })();
    chitu.Route = Route;
})(chitu || (chitu = {}));
//# sourceMappingURL=Route.js.map;var chitu;
(function (chitu) {
    var ns = chitu;
    var e = chitu.Errors;
    var RouteCollection = (function () {
        function RouteCollection() {
            this._init();
        }
        RouteCollection.prototype._init = function () {
            var crossroads = window['crossroads'];
            this._source = crossroads.create();
            this._source.ignoreCase = true;
            this._source.normalizeFn = crossroads.NORM_AS_OBJECT;
            this._priority = 0;
        };
        RouteCollection.prototype.count = function () {
            return this._source.getNumRoutes();
        };
        RouteCollection.prototype.mapRoute = function (args) {
            /// <param name="args" type="Objecct"/>
            args = args || {};
            var name = args.name;
            var url = args.url;
            var defaults = args.defaults;
            var rules = args.rules || {};
            if (!name)
                throw e.argumentNull('name');
            if (!url)
                throw e.argumentNull('url');
            this._priority = this._priority + 1;
            var route = new chitu.Route(name, url, defaults);
            route.viewPath = args.viewPath;
            route.actionPath = args.actionPath;
            route.pageName = args.pageName;
            var originalRoute = this._source.addRoute(url, function (args) {
                //var values = $.extend(defaults, args);
                //self.routeMatched.fire([name, values]);
            }, this._priority);
            originalRoute.rules = rules;
            originalRoute.newRoute = route;
            if (this._defaultRoute == null) {
                this._defaultRoute = route;
                if (this._defaultRoute.viewPath == null)
                    throw new Error('default route require view path.');
                if (this._defaultRoute.actionPath == null)
                    throw new Error('default route require action path.');
            }
            route.viewPath = route.viewPath || this._defaultRoute.viewPath;
            route.actionPath = route.actionPath || this._defaultRoute.actionPath;
            return route;
        };
        RouteCollection.prototype.getRouteData = function (url) {
            /// <returns type="Object"/>
            var data = this._source.getRouteData(url);
            if (data == null)
                throw e.canntParseUrl(url);
            var values = {};
            var paramNames = data.route._paramsIds || [];
            for (var i = 0; i < paramNames.length; i++) {
                var key = paramNames[i];
                values[key] = data.params[0][key];
            }
            var routeData = new chitu.RouteData();
            routeData.values(values);
            routeData.actionPath(data.route.newRoute.actionPath);
            routeData.viewPath(data.route.newRoute.viewPath);
            routeData.pageName(data.route.newRoute.pageName);
            return routeData;
        };
        RouteCollection.defaultRouteName = 'default';
        return RouteCollection;
    })();
    chitu.RouteCollection = RouteCollection;
})(chitu || (chitu = {}));
//# sourceMappingURL=RouteCollection.js.map;var chitu;
(function (chitu) {
    var RouteData = (function () {
        function RouteData() {
        }
        RouteData.prototype.values = function (value) {
            if (value === void 0) { value = undefined; }
            if (value !== undefined)
                this._values = value;
            return this._values;
        };
        RouteData.prototype.viewPath = function (value) {
            if (value === void 0) { value = undefined; }
            if (value !== undefined)
                this._viewPath = value;
            return this._viewPath;
        };
        RouteData.prototype.actionPath = function (value) {
            if (value === void 0) { value = undefined; }
            if (value !== undefined)
                this._actionPath = value;
            return this._actionPath;
        };
        RouteData.prototype.pageName = function (value) {
            if (value === void 0) { value = undefined; }
            if (value !== undefined)
                this._pageName = value;
            return this._pageName;
        };
        return RouteData;
    })();
    chitu.RouteData = RouteData;
})(chitu || (chitu = {}));
//# sourceMappingURL=RouteData.js.map;var chitu;
(function (chitu) {
    var e = chitu.Errors;
    var crossroads = window['crossroads'];
    function interpolate(pattern, data) {
        var http_prefix = 'http://'.toLowerCase();
        if (pattern.substr(0, http_prefix.length).toLowerCase() == http_prefix) {
            var link = document.createElement('a');
            link.setAttribute('href', pattern);
            pattern = decodeURI(link.pathname);
            var route = crossroads.addRoute(pattern);
            return http_prefix + link.host + route.interpolate(data);
        }
        var route = crossroads.addRoute(pattern);
        return route.interpolate(data);
    }
    var ViewFactory = (function () {
        function ViewFactory() {
            this._views = [];
        }
        ViewFactory.prototype.view = function (routeData) {
            /// <param name="routeData" type="Object"/>
            /// <returns type="jQuery.Deferred"/>
            //if (typeof routeData !== 'object')
            //    throw e.paramTypeError('routeData', 'object');
            if (!routeData.values().controller)
                throw e.routeDataRequireController();
            if (!routeData.values().action)
                throw e.routeDataRequireAction();
            //var viewLocationFormater = routeData.viewPath;
            //if (!viewLocationFormater)
            //    return $.Deferred().resolve('');
            var url = interpolate(routeData.viewPath(), routeData.values());
            var self = this;
            var viewName = routeData.values().controller + '_' + routeData.values().action;
            if (!this._views[viewName]) {
                this._views[viewName] = $.Deferred();
                var http = 'http://';
                if (url.substr(0, http.length).toLowerCase() == http) {
                    //=======================================================
                    // 说明：不使用 require text 是因为加载远的 html 文件，会作
                    // 为 script 去解释而导致错误 
                    $.ajax({ url: url })
                        .done($.proxy(function (html) {
                        if (html != null)
                            this.deferred.resolve(html);
                        else
                            this.deferred.reject();
                    }, { deferred: this._views[viewName] }))
                        .fail($.proxy(function (err) {
                        this.deferred.reject(err);
                    }, { deferred: this._views[viewName] }));
                }
                else {
                    require(['text!' + url], $.proxy(function (html) {
                        if (html != null)
                            this.deferred.resolve(html);
                        else
                            this.deferred.reject();
                    }, { deferred: this._views[viewName] }), $.proxy(function (err) {
                        this.deferred.reject(err);
                    }, { deferred: this._views[viewName] }));
                }
            }
            return this._views[viewName];
        };
        return ViewFactory;
    })();
    chitu.ViewFactory = ViewFactory;
})(chitu || (chitu = {}));
//# sourceMappingURL=ViewFactory.js.map;var chitu;
(function (chitu) {
    var ns = chitu;
    var u = chitu.Utility;
    var e = chitu.Errors;
    var ACTION_LOCATION_FORMATER = '{controller}/{action}';
    var VIEW_LOCATION_FORMATER = '{controller}/{action}';
    var Application = (function () {
        function Application(container) {
            this.pageCreating = ns.Callbacks();
            this.pageCreated = ns.Callbacks();
            this.pageShowing = ns.Callbacks();
            this.pageShown = ns.Callbacks();
            this._pages = {};
            this._runned = false;
            if (container == null)
                throw e.argumentNull('container');
            if (!container.tagName)
                throw new Error('Parameter container is not a html element.');
            //if (!func) throw e.argumentNull('func');
            //if (!$.isFunction(func)) throw e.paramTypeError('func', 'Function');
            //var options = {
            //    container: document.body,
            //    routes: new ns.RouteCollection()
            //};
            //$.proxy(func, this)(options);
            this.controllerFactory = new ns.ControllerFactory();
            this.viewFactory = new ns.ViewFactory();
            this._pages = {};
            this._stack = [];
            this._routes = new chitu.RouteCollection();
            this._container = container;
        }
        ;
        Application.prototype.on_pageCreating = function (context) {
            this.pageCreating.fire(this, context);
        };
        Application.prototype.on_pageCreated = function (page) {
            this.pageCreated.fire(this, page);
        };
        Application.prototype.on_pageShowing = function (page, args) {
            this.pageShowing.fire(this, page, args);
        };
        Application.prototype.on_pageShown = function (page, args) {
            this.pageShown.fire(page, args);
        };
        Application.prototype.routes = function () {
            return this._routes;
        };
        Application.prototype.controller = function (routeData) {
            /// <param name="routeData" type="Object"/>
            /// <returns type="chitu.Controller"/>
            if (typeof routeData !== 'object')
                throw e.paramTypeError('routeData', 'object');
            if (!routeData)
                throw e.argumentNull('routeData');
            return this.controllerFactory.getController(routeData);
        };
        Application.prototype.action = function (routeData) {
            /// <param name="routeData" type="Object"/>
            if (typeof routeData !== 'object')
                throw e.paramTypeError('routeData', 'object');
            if (!routeData)
                throw e.argumentNull('routeData');
            var controllerName = routeData.controller;
            if (!controllerName)
                throw e.argumentNull('name');
            if (typeof controllerName != 'string')
                throw e.routeDataRequireController();
            var actionName = routeData.action;
            if (!actionName)
                throw e.argumentNull('name');
            if (typeof actionName != 'string')
                throw e.routeDataRequireAction();
            var controller = this.controller(routeData);
            return controller.action(actionName);
        };
        Application.prototype.run = function () {
            if (this._runned)
                return;
            var app = this;
            var hashchange = function (event) {
                var hash = window.location.hash;
                if (!hash) {
                    u.log('The url is not contains hash.');
                    return;
                }
                var args = window.location['arguments'] || {};
                var container = window.location['container'] || app._container;
                window.location['arguments'] = null;
                window.location['container'] = null;
                if (window.location['skip'] == null || window.location['skip'] == false)
                    app.showPageAt(container, hash.substr(1), args);
                window.location['skip'] = false;
            };
            $.proxy(hashchange, this)();
            $(window).bind('hashchange', $.proxy(hashchange, this));
            this._runned = true;
        };
        Application.prototype.showPageAt = function (element, url, args) {
            /// <param name="element" type="HTMLElement" canBeNull="false"/>
            /// <param name="url" type="String" canBeNull="false"/>
            /// <param name="args" type="object" canBeNull="true"/>
            /// <returns type="jQuery.Deferred"/>
            args = args || {};
            if (!element)
                throw e.argumentNull('element');
            if (!url)
                throw e.argumentNull('url');
            var self = this;
            var pc = $(element).data('PageContainer');
            if (pc == null) {
                pc = new ns.PageContainer(this, element);
                pc.pageCreating.add(function (sender, context) {
                    self.on_pageCreating(context);
                });
                pc.pageCreated.add(function (sender, page) {
                    self.on_pageCreated(page);
                });
                pc.pageShowing.add(function (sender, page, args) {
                    self.on_pageShowing(page, args);
                });
                pc.pageShown.add(function (sender, page, args) {
                    self.on_pageShown(page, args);
                });
                $(element).data('PageContainer', pc);
            }
            var self = this;
            return pc.showPage(url, args);
        };
        Application.prototype.showPage = function (url, args) {
            /// <param name="url" type="String" canBeNull="true"/>
            /// <param name="args" type="object" canBeNull="true"/>
            /// <returns type="jQuery.Deferred"/>
            return this.showPageAt(this._container, url, args);
        };
        Application.prototype.redirect = function (url, args) {
            window.location['arguments'] = args;
            window.location.hash = url;
        };
        Application.prototype.back = function (args) {
            /// <returns type="jQuery.Deferred"/>
            var pc = $(this._container).data('PageContainer');
            if (pc == null)
                return $.Deferred().reject();
            return pc.back(args);
        };
        return Application;
    })();
    chitu.Application = Application;
})(chitu || (chitu = {}));
//# sourceMappingURL=Application.js.map;    //
    window['chitu'] = chitu;
    return chitu;
});;
(function (factory) {
    if (typeof define === 'function')
        define(['chitu'], factory);
    else
        factory();

})(function () {
    var app = new chitu.Application(document.getElementById('main'));

    var viewPath = '../App/Module/{controller}/{action}.html';
    var actionPath = '../App/Module/{controller}/{action}';

    var guidRule = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    var actionRule = /^[a-z]+$/i;
    var controllerRule = /^[a-z]+$/i;

    app.routes().mapRoute({
        name: 'User_Recharge',
        url: '{controller}_{action}',
        rules: {
            controller: controllerRule,
            action: actionRule
        },
        viewPath: viewPath,
        actionPath: actionPath
    });

    app.routes().mapRoute({
        name: 'Shopping_Purchase',
        url: '{controller}_{action}_{id}',
        rules: {
            controller: controllerRule,
            action: actionRule,
            id: guidRule
        }
    });

    app.routes().mapRoute({
        name: 'OrderList',
        url: '{controller}_{action}_{status}',
        rules: {
            controller: ['Shopping'],
            action: ['OrderList']
        }
    });

    app.routes().mapRoute({
        name: 'ProductList',
        url: '{controller}_{action}_{type}_{name}',
        rules: {
            controller: controllerRule,
            action: actionRule,
            type: ['category', 'brand', 'search']
        }
    });

    app.routes().mapRoute({
        name: 'UserIndex',
        url: '{controller}_{action}_{type}',
        rules: {
            controller: ['User'],
            action: ['Index'],
        }
    });

    var pages = [];
    var display_page_zIndex = 81932759;
    var hidden_page_zIndex = 0;

    app.back = $.proxy(function () {

        if (window.history.length == 0)
            return $.Deferred().reject();


        window.history.back();
        return $.Deferred().resolve();

    }, app);

    app.pageCreated.add(function (sender, page) {
        sender.currentPage = page;
    });


    window.app = app;
    return app;
});
(function (factory) {
    if (typeof define === 'function') {
        define(['jquery.cookie'], factory);
    }
    else {
        factory();
    }

})(function () {

    window.site = window.site || {};

    site.config = {
        storeName: '零食有约',
        pageSize: 10,
        defaultUrl: 'Index',
        purchaseUrlFormat: 'pay/Purchase.html#{0}'
    };

    site.cookies = {
        sourceOpenId: function (value) {
            var name = this.get_cookieName('sourceOpenId');
            if (value === undefined)
                return $.cookie(name);

            if (!$.cookie(name))
                $.cookie(name, value, { expires: 7 });
        },
        returnUrl: function (value) {
            var name = this.get_cookieName('returnUrl');
            if (value === undefined)
                return this.get_value(name);

            this.set_value(name, value);
        },
        returnUrl_name: function () {
            return names.returnUrl;
        },
        appToken: function (value) {
            var name = this.get_cookieName('appToken');
            if (value === undefined)
                return $.cookie(name);

            $.cookie(name, value);
        },
        token: function (value) {
            var name = this.get_cookieName('token');
            if (value === undefined)
                return $.cookie(name);

            $.cookie(name, value);
        },
        set_value: function (name, value) {
            var cookieName = this.get_cookieName(name);
            $.cookie(cookieName, value);
        },
        get_value: function (name) {
            var cookieName = this.get_cookieName(name);
            return $.cookie(cookieName);
        },
        get_cookieName: function (name) {
            return site.config.cookiePrefix + "_" + name;
        }
    }

    site.getAppToken = function () {
        /// <returns type="jQuery.Deferred"/>
        //debugger;
        if (site.cookies.appToken())
            return $.Deferred().resolve(site.cookies.appToken());

        return $.ajax({
            url: 'Account/GetAppToken'
        })
        .then(function (data) {
            site.cookies.appToken(data.AppToken);//DA4A5B44C12F4E9D8E0872C4FDA8A6ABA2C0334CDB81CF84F12E29F7FB129F72F6EA604995785165
            return data.AppToken;
        });
    }

    return site;
});




;
(function (factory) {
    var references = ['knockout', 'Application'];
    if (typeof define === 'function') {
        define(references, factory);
    } else {
        factory();
    }
})(function () {
    if (!window['ko'])
        window.ko = arguments[0];

    Number.prototype.toFormattedString = function (format) {
        var reg = new RegExp('^C[0-9]+');
        if (reg.test(format)) {
            var num = format.substr(1);
            return this.toFixed(num);
        }
        return this;
    };

    Date.prototype.toFormattedString = function (format) {
        switch (format) {
            case 'd':
                return chitu.Utility.format("{0}-{1}-{2}", this.getFullYear(), this.getMonth() + 1, this.getDate());
            case 'g':
                return chitu.Utility.format("{0}-{1}-{2} {3}:{4}", this.getFullYear(), this.getMonth() + 1, this.getDate(), this.getHours(), this.getMinutes());
            case 'G':
                return chitu.Utility.format("{0}-{1}-{2} {3}:{4}:{5}", this.getFullYear(), this.getMonth() + 1, this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds());
            case 't':
                return chitu.Utility.format("{0}:{1}", this.getHours(), this.getMinutes());
            case 'T':
                return chitu.Utility.format("{0}:{1}:{2}", this.getHours(), this.getMinutes(), this.getSeconds());
        }

        if (format != null && $.datepicker != null)
            return $.datepicker.formatDate(format, this)

        return this.toString();
    };

    var formatString = function (useLocale, args) {
        //TODO: 验证数组
        for (var i = 1; i < args.length; i++) {
            args[i] = ko.unwrap(args[i]);
        }
        var result = '';
        var format = args[0];

        for (var i = 0; ;) {
            var open = format.indexOf('{', i);
            var close = format.indexOf('}', i);
            if ((open < 0) && (close < 0)) {
                result += format.slice(i);
                break;
            }
            if ((close > 0) && ((close < open) || (open < 0))) {
                if (format.charAt(close + 1) !== '}') {
                    throw Error.argument('format', 'Sys.Res.stringFormatBraceMismatch');
                }
                result += format.slice(i, close + 1);
                i = close + 2;
                continue;
            }

            result += format.slice(i, open);
            i = open + 1;

            if (format.charAt(i) === '{') {
                result += '{';
                i++;
                continue;
            }

            if (close < 0)
                throw Error.argument('format', 'Sys.Res.stringFormatBraceMismatch');


            var brace = format.substring(i, close);
            var colonIndex = brace.indexOf(':');
            var argNumber = parseInt((colonIndex < 0) ? brace : brace.substring(0, colonIndex), 10) + 1;
            if (isNaN(argNumber)) throw Error.argument('format', 'Sys.Res.stringFormatInvalid');
            var argFormat = (colonIndex < 0) ? '' : brace.substring(colonIndex + 1);
            var arg = args[argNumber];
            if (typeof (arg) === "undefined" || arg === null) {
                arg = '';
            }

            if (arg.toFormattedString) {
                result += arg.toFormattedString(argFormat);
            }
            else if (useLocale && arg.localeFormat) {
                result += arg.localeFormat(argFormat);
            }
            else if (arg.format) {
                result += arg.format(argFormat);
            }
            else
                result += arg.toString();

            i = close + 1;
        }

        return result;
    }

    var money = function (element, valueAccessor) {
        var str = formatString(true, ['￥{0:C2}', valueAccessor()]);
        element.innerHTML = str;
    };
    ko.bindingHandlers.money = {
        init: function (element, valueAccessor) {
            money(element, valueAccessor);
        },
        update: function (element, valueAccessor) {
            money(element, valueAccessor);
        }
    };

    var href = function (element, valueAccessor) {
        var value = valueAccessor();
        if ($.isArray(value)) {
            var str = formatString(true, value);
            $(element).attr('href', str);
        }
        else {
            $(element).attr('href', value);
        }
    };
    ko.bindingHandlers.href = {
        init: function (element, valueAccessor) {
            href(element, valueAccessor);
        },
        update: function (element, valueAccessor) {
            href(element, valueAccessor);
        }
    };

    var text = function (element, valueAccessor) {
        var value = valueAccessor();
        var str = $.isArray(value) ? formatString(true, value) : value;
        ko.utils.setTextContent(element, str);
    }
    ko.bindingHandlers.text = {
        init: function (element, valueAccessor) {
            return text(element, valueAccessor);
        },
        update: function (element, valueAccessor) {
            return text(element, valueAccessor);
        }
    };

    function getConfig(element, name) {
        var dlg = $(element).attr(name);

        var config;
        if (dlg) {
            config = eval('(function(){return {' + dlg + '};})()');
        }
        else {
            config = {};
        }

        return config;

    }

    function translateClickAccessor(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = ko.unwrap(valueAccessor());
        if (value == null) {
            return valueAccessor;
        }

        return $.proxy(function () {
            var element = this._element;
            var valueAccessor = this._valueAccessor;
            var allBindings = this._allBindings;
            var viewModel = this._viewModel;
            var bindingContext = this._bindingContext;
            var value = this._value;

            return function (viewModel) {

                var deferred = $.Deferred();
                deferred.resolve();



                //if (dlg_config) {
                var config = getConfig(element, 'data-dialog');
                var content = config.content;
                if (config.type == 'confirm') {
                    deferred = deferred.pipe(function () {
                        var result = $.Deferred();

                        require(['text!ko.ext/ComfirmDialog.html'], function (html) {
                            var node = $(html).appendTo(document.body).modal()[0];

                            var model = {
                                text: content,
                                ok: function () {
                                    $(node).modal('hide');
                                    result.resolve();
                                },
                                cancel: function () {
                                    result.reject();
                                }
                            }

                            ko.applyBindings(model, node);
                        });

                        return result;
                    });
                }
                //}

                deferred = deferred.pipe(function () {
                    var result = $.isFunction(value) ? value(viewModel, event) : value;

                    if (result && $.isFunction(result.always)) {
                        $(element).attr('disabled', 'disabled');
                        $(element).addClass('disabled');

                        result.always(function () {
                            $(element).removeAttr('disabled');
                            $(element).removeClass('disabled');
                        });

                        //===============================================
                        // 超时去掉按钮禁用，防止 always 不起作用。 
                        setTimeout($.proxy(function () {
                            $(this._element).removeAttr('disabled');
                            $(this._element).removeClass('disabled');
                        }, { _element: element }), 1000 * 20);
                        //===============================================

                        result.done(function () {
                            if (config && config.type == 'toast') {
                                require(['text!ko.ext/FlashDialog.html'], function (html) {
                                    var node = $(html).appendTo(document.body).modal()[0];

                                    var model = {
                                        text: content
                                    }

                                    window.setTimeout(function () {
                                        $(node).modal('hide');
                                        $(node).remove();
                                    }, 1000);

                                    ko.applyBindings(model, node);
                                });
                            }

                        });
                    }
                    return result;
                });

                return deferred;
            };
        },
        { _element: element, _valueAccessor: valueAccessor, _allBindings: allBindings, _viewModel: viewModel, _bindingContext: bindingContext, _value: value });
    }

    var _click = ko.bindingHandlers.click;
    ko.bindingHandlers.click = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            //var value = ko.unwrap(valueAccessor());
            //if (value != null) {
            valueAccessor = translateClickAccessor(element, valueAccessor, allBindings, viewModel, bindingContext);
            //}
            return _click.init(element, valueAccessor, allBindings, viewModel, bindingContext);
        }
    };


    //===============================================================================
    // 说明：处理图片的懒加载。
    function getImageUrl(src) {
        /// <param name="src" type="String"/>
        // 说明：替换图片路径
        if (src.substr(0, 1) == '/') {
            src = site.config.imageBaseUrl + src;
        }
        //else if (src.length > org_site.length && src.substr(0, org_site.length) == org_site) {
        //    src = site.config.imageBaseUrl + src.substr(org_site.length);
        //}

        return src;
    }

    var ImageLoader = (function () {
        var MAX_THREAD = 200;
        var thread_count = 0;
        var items = [];
        var imageLoaded = $.Callbacks();

        window.setInterval(function () {
            if (items.length <= 0)
                return;

            if (thread_count >= MAX_THREAD)
                return;


            var item = items.shift();
            var element = item.element;
            var src = item.src;

            element.image = new Image();
            element.image.element = element;

            element.image.src = getImageUrl(src);
            thread_count = thread_count + 1;

            element.image.onload = function () {
                this.element.src = this.src;
                thread_count = thread_count - 1;
                imageLoaded.fire(this.element);
            };
            element.image.onerror = function () {
                thread_count = thread_count - 1;
                //TODO:显示图片加载失败
            };

        }, 100);

        return {
            load: function (element, src) {
                items.push({ element: element, src: src });
            },
            imageLoaded: imageLoaded
        };
    })();

    function getLogoImage(img_width, img_height) {

        var scale = (img_height / img_width).toFixed(2);
        var img_name = 'img_log' + scale;
        var img_src = localStorage.getItem(img_name);
        if (img_src)
            return img_src;

        var MAX_WIDTH = 320;
        var width = MAX_WIDTH;
        var height = width * new Number(scale);

        var canvas = document.createElement('canvas');
        canvas.width = width; //img_width;
        canvas.height = height; //img_height;

        var ctx = canvas.getContext('2d');
        ctx.fillStyle = 'whitesmoke';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
       
        // 设置字体
        ctx.font = "Bold 40px Arial";
        // 设置对齐方式
        ctx.textAlign = "left";
        // 设置填充颜色
        ctx.fillStyle = "#999";
        // 设置字体内容，以及在画布上的位置
        ctx.fillText(site.config.storeName, canvas.width / 2 - 75, canvas.height / 2);

        img_src = canvas.toDataURL('image/png');
        localStorage.setItem(img_name, img_src);
        return img_src;
    }

    var _attr = ko.bindingHandlers.attr;
    ko.bindingHandlers.attr = (function () {
        return {
            'update': function (element, valueAccessor, allBindings) {
                if (element.tagName == 'IMG') {

                    var config = getConfig(element, 'data-image');

                    var value = ko.utils.unwrapObservable(valueAccessor()) || {};
                    ko.utils.objectForEach(value, function (attrName, attrValue) {
                        var src = ko.unwrap(attrValue);
                        if (attrName != 'src' || !src)
                            return true;

                        //==========================================================
                        // 说明：替换图片路径
                        var match = src.match(/_\d+_\d+/);
                        if (match && match.length > 0) {
                            var arr = match[0].split('_');
                            var img_width = new Number(arr[1]).valueOf();
                            var img_height = new Number(arr[2]).valueOf();

                            $(element).attr('width', img_width + 'px');
                            $(element).attr('height', img_height + 'px');

                            var src_replace
                            if (config.showLogo == null || config.showLogo == true)
                                src_replace = getLogoImage(img_width, img_height);

                            valueAccessor = $.proxy(function () {
                                var obj = ko.utils.unwrapObservable(this._source());
                                var src = ko.unwrap(obj.src);
                                obj.src = this._src;

                                var img_node = this._element;
                                var image = new Image();
                                image.onload = function () {
                                    img_node.src = this.src;
                                }
                                image.src = getImageUrl(src);

                                return obj;

                            }, { _source: valueAccessor, _src: src_replace, _element: element });
                        }
                        else {
                            value.src = src;
                            valueAccessor = $.proxy(function () {
                                return this._value;
                            }, { _value: value });
                        }
                    });
                }
                return _attr.update(element, valueAccessor, allBindings);
            }
        }
    })();

    var _html = ko.bindingHandlers.html;
    ko.bindingHandlers.html = {
        'update': function (element, valueAccessor, allBindings) {

            var result = _html.update(element, valueAccessor, allBindings);

            var $img = $(element).find('img');
            $img.each(function () {
                var org_site = 'http://weixinmanage.lanfans.com';
                var src = $(this).attr('src');

                $(this).addClass('img-full');

                var match = src.match(/_\d+_\d+/);
                if (match && match.length > 0) {
                    var arr = match[0].split('_');
                    var img_width = new Number(arr[1]).valueOf();
                    var img_height = new Number(arr[2]).valueOf();

                    $(this).attr('width', img_width + 'px');
                    $(this).attr('height', img_height + 'px');

                    var src_replace = getLogoImage(img_width, img_height);
                    $(this).attr('src', src_replace);

                    var image = new Image();
                    image['element'] = this;
                    image.onload = function () {
                        $(this['element']).attr('src', this.src);
                    };
                    image.src = getImageUrl(src);
                }
                else {
                    $(this).attr('src', getImageUrl(src));
                }


            });

            return result;
        }
    }

    //if (app) {


    //    function loadVisibleImages(sender, args) {
    //        if (!sender.visible())
    //            return;

    //        if (sender._$imgs == null) {
    //            sender._$imgs = $(sender.node()).find('img');
    //        }

    //        var imgs = sender._$imgs;
    //        var i = 0;
    //        for (; i < imgs.length; i++) {
    //            var img = imgs[i];
    //            if (img.original_image == null)
    //                continue;

    //            var $img_wrapper = $(img).parents('li, div').first();
    //            var img_pos = $img_wrapper.position();
    //            var img_height = $img_wrapper.height();
    //            if (img_pos.top < args.scrollTop + args.clientHeight && img_pos.top + img_height > args.scrollTop) {
    //                //==================================
    //                // 说明：一个元素对应一个 Image 对象，如果有多个，
    //                // 则为多线程加载图片，不能确定最终显示哪一张图（应为最后一张图）
    //                var element = img;
    //                if (!element.image) {
    //                    element.image = new Image();
    //                    element.image.element = element;
    //                }

    //                if (element.original_image && element.image.src != element.original_image) {
    //                    element.image.src = element.original_image;
    //                    element.image.onload = function () {
    //                        this.element.src = this.src;
    //                        this.element.original_image = null;
    //                    };
    //                }
    //                //==================================
    //            }
    //        }
    //    };

    //    var pages = [];
    //    app.pageCreated.add(function (sender, page) {
    //        /// <param name="page" type="chitu.Page"/>
    //        page.shown.add(function (sender, args) {
    //            if ($.inArray(page, pages) >= 0 || page.scrollCompleted == null)
    //                return;

    //            sender.scrollCompleted.add(loadVisibleImages);


    //            if (!sender.loadCompleted) {
    //                return;
    //            }

    //            sender.loadCompleted.add(function (sender) {
    //                sender._$imgs = $(sender.node()).find('img');
    //                if (sender.visible()) {
    //                    loadVisibleImages(sender, { scrollTop: 0, clientHeight: $(window).height() });
    //                }
    //                else {
    //                    window.setTimeout(function () {
    //                        loadVisibleImages(sender, { scrollTop: 0, clientHeight: $(window).height() });
    //                    }, 100);
    //                }

    //            });

    //        });
    //    });
    //}

    ko.bindingHandlers.tap = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            valueAccessor = translateClickAccessor(element, valueAccessor, allBindings, viewModel, bindingContext);
            $(element).on("tap", $.proxy(function (event) {

                this._valueAccessor()(viewModel, event);

            }, { _valueAccessor: valueAccessor }));
        }
    }

    return ko;

});
//===============================================
// 说明：用来显现加载状态的窗口
(function (factory) {
    if (typeof define === 'function')
        define(['jquery', 'app/Application'], factory);
    else
        factory();

})(function ($) {
    //var $loadingForm = $('<div>').insertAfter($('#main'));
    //$loadingForm.html('<div id="loadingForm" class="text-center" style="padding-top:100px;">  <i class="icon-spinner icon-3x icon-spin"></i><h5>加载中...</h5></div>')

    var $loadingForm = $('#loadingForm');

    function on_shown() {
        $loadingForm.hide();
        $('#main').show();
    }

    app.pageCreated.add(function (sender, page) {
        /// <param name="page" type="chitu.Page"/>
        page.showing.add(function (sender) {
            if (window['bootbox'])
                bootbox.hideAll();

            $('#main').hide();
            $loadingForm.show();
        });

        page.shown.add(on_shown);

    });

    if (app.currentPage != null) {
        app.currentPage.shown.add(on_shown);
        if (app.currentPage.visible()) {
            on_shown();
        }
    }

    //$.ajax('App/UI/Loading.html').done(function (html) {
    //    $loadingForm.html(html);
    //})

});



;
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['knockout', 'jquery.cookie', 'knockout.mapping', 'app/Rewrite', 'app/Site'], factory);
    }
    else {
        factory();
    }
})(function () {

    if (arguments.length > 0) {
        window.ko = arguments[0];
        ko.mapping = arguments[2];
    };

    var token_name = 'token';
    var user_name = 'username';

    function log(message) {
        if (console && console.log)
            console.log(message);
    }

    window.models = {};

    var services = {
        error: $.Callbacks(),
        callRemoteMethod: function (method, data) {
            /// <param name="method" type="String"/>
            /// <param name="data" type="Object"/>
            /// <param name="translate" type="Function"/>

            data = data || {};
            var service_url = site.config.serviceUrl;
            if (service_url == null)
                throw new Error('The service url is not setted.');

            //return site.getAppToken().pipe($.proxy(function (appToken) {
            var url = service_url + method;
            var result = $.Deferred();
            var data = $.extend({
                '$token': site.cookies.token(),
                '$appToken': site.cookies.appToken(),
            }, data);

            var options = {
                url: url,
                data: data,
                method: 'post',
                dataType: 'json',
                traditional: true
            };

            return $.ajax(options);

            //}, { _method: method, _data: data }));
        }
    };
    window.services = window.services || services;

    return services;
});
;
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        var references = [];
        if (!window['services']) references.push('sv/Services');

        define(references, factory);
    }
    else {
        factory();
    }
})(function () {

    function call(method, data) {
        /// <returns type="jQuery.Deferred"/>

        data = data || {};
        var url = site.config.memberServiceUrl + method
        return site.getAppToken().pipe($.proxy(function (appToken) {
            this._data.$appToken = appToken;
            this._data.$token = site.cookies.token();
            return $.ajax({
                url: url,
                data: this._data,
                method: 'get',
                dataType: 'json'
            });

        }, { _data: data }));
    };


    var token_name = 'token';
    var user_name = 'username';

    window.services.member = {
        logouted: $.Callbacks(),
        logined: $.Callbacks(),
        login: function (username, password) {
            return call('Member/Login', { username: username, password: password }).then(function (data) {
                site.cookies.token(data.UserToken);
                return data;
            })
            .done($.proxy(function (data) {
                $.extend(data, { UserName: this._username, Password: this._password });
                services.member.logined.fire(data);

            }, { _username: username, _password: password }));
        },
        isLogined: function () {
            /// <returns type="jQuery.Deferred"/>
            var value = site.cookies.token() != null && site.cookies.token() != '';

            return $.Deferred().resolve(value);
        },
        sendRegisterVerifyCode: function (mobile) {
            return call('Member/SendVerifyCode', { mobile: mobile, type: 'Register' }).then(function (data) {
                return data.SmsId;
            });
        },
        register: function (user, verifyCode, smsId) {
            /// <param name="user" type="models.user"/>
            /// <returns type="jQuery.Deferred"/>

            if (user == null)
                throw Error.argumentNull('user');

            var data = ko.mapping.toJS(user);
            data.verifyCode = verifyCode;
            data.smsId = smsId;

            return call('Member/Register', data);
        },
        getUserInfo: function () {
            /// <returns type="jQuery.Deferred"/>
            return call('UserInfo/Get').then(function (data) {
                data = data || {};
                data.HeadImageUrl = data.HeadImageUrl || 'Content/images/nophoto.png';
                data.NickName;// = data.NickName || '(未填写)';

                return data;
            });
        },
        setUserInfo: function (userInfo) {
            return call('UserInfo/Set', userInfo);
        },
        changePassword: function (password) {
            return call('Member/ChangePassword', { password: password });
        }
    };    
});;
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        var references = [];
        if (!window['services']) references.push('sv/Services');

        define(references, factory);
    }
    else {
        factory();
    }
})(function () {

    var translateShoppingCartItem = function (source) {
        var item = {};
        for (var name in source) {
            item[name] = ko.observable(source[name]);
        }
        item.Amount = ko.computed(function () {
            return ko.unwrap(this.Price) * ko.unwrap(this.Count);
        }, item);

        return item;
    };

    services.shoppingCart = {
        _items: [],
        itemAdded: $.Callbacks(),
        itemRemoved: $.Callbacks(),
        itemUpdated: $.Callbacks(),
        getItem: function (productId) {
            /// <param name="productId">产品编号</param>
            /// <returns type="jQuery.Deferred"/>

            var result = $.Deferred();
            for (var i = 0; i < this._items.length; i++) {
                if (ko.unwrap(this._items[i].ProductId) == productId) {
                    return result.resolve(this._items[i]);
                }
            }
            return result.reject();
        },
        addItem: function (product, count) {
            /// <param name="product" type="models.product">
            /// 添加到购物车的产品
            /// </param>
            /// <param name="count" type="Number">
            /// 产品的数量
            /// </param>
            /// <returns type="jQuery.Deferred"/>

            var self = this;
            var productId = ko.unwrap(product.Id);

            var result = services.callRemoteMethod('ShoppingCart/AddItem', { productId: productId, count: count });
            //.then($.proxy(function (data) {
            //    var _count = this._count;
            //    var _productId = this._productId;

            //    var item = translateShoppingCartItem(data);
            //    self.getItem(_productId)
            //        .done(function (data) {
            //            data.Count(data.Count() + _count);
            //            self.itemUpdated.fire(item)
            //        })
            //        .fail(function () {
            //            self._items.unshift(item);
            //            self.itemAdded.fire(item)
            //        });

            //    return item;
            //}, { _productId: productId, _count: count }))

            return result;
        },
        updateItem: function (item) {
            /// <summary>
            /// 更新购物车产品的数量
            /// </summary>
            /// <param name="item">
            /// 购物车中的项
            /// </param>
            /// <returns type="jQuery.Deferred"/>

            var self = this;
            var productId = ko.unwrap(item.ProductId);
            var count = ko.unwrap(item.Count);
            var selected = ko.unwrap(item.Selected);
            var result = services.callRemoteMethod('ShoppingCart/UpdateItem', { productId: productId, count: count, selected: selected })
                .done($.proxy(
                    function (data) {
                        self.getItem(this._productId).done(function (data) {
                            self.itemUpdated.fire(data);
                        });

                        return data;
                    },
                    { _productId: productId, _count: count, _selected: selected })
                );
            return result;
        },
        removeItem: function (item) {
            /// <summary>
            /// 移除购物车中的产品
            /// </summary>
            /// <param name="item" type="models.shoppingCartItem">
            /// 购物车中的项
            /// </param>
            /// <returns type="jQuery.Deferred"/>
            var productId = ko.unwrap(item.ProductId);
            return this.removeItems([productId]);
        },
        removeItems: function (productIds) {
            /// <summary>
            /// 移除购物车中的多个产品
            /// </summary>
            /// <param name="productIds" type="Array">
            /// 要移除产品的编号
            /// </param>

            var self = this;
            var result = services.callRemoteMethod('ShoppingCart/RemoveItems', { productIds: productIds })
                .done($.proxy(
                    function () {
                        var items = [];
                        for (var i = 0; i < this._productIds.length; i++) {
                            for (var j = 0; j < self._items.length; j++) {
                                if (this._productIds[i] == ko.unwrap(self._items[j].ProductId)) {
                                    items.push(self._items[j]);
                                }
                            }
                        }
                        var arr = $.grep(self._items, function (value) {
                            for (var i = 0; i < items.length; i++) {
                                if (ko.unwrap(items[i].Id) == ko.unwrap(value.Id))
                                    return false;
                            }
                            return true;
                            //return !$.inArray(items, value);
                        });

                        self._items = arr;

                        for (var i = 0; i < items.length; i++)
                            self.itemRemoved.fire(items[i]);

                    },
                    { _productIds: productIds })
                );
            return result;
        },
        getItems: function () {
            /// <summary>
            /// 获取购物车中的产品
            /// done callback arguments: 
            /// items: models.orderDetail[]
            /// </summary>
            /// <returns type="jQuery.Deferred"/>

            if (this._loaded) {
                return $.Deferred().resolve(this._items);
            }

            if (this._getItemsResult)
                return this._getItemsResult;

            var self = this;
            this._getItemsResult = services.callRemoteMethod('ShoppingCart/GetItems', {});
                //.then(function (items) {
                //    var result = [];
                //    for (var i = 0; i < items.length; i++) {
                //        result[i] = translateShoppingCartItem(items[i]);
                //    }
                //    self._loaded = true;
                //    self._items = result;
                //    return result;
                //});
            this._getItemsResult.always(function () {
                self._getItemsResult = null;
            });
            return this._getItemsResult;
        },
        getProductsCount: function () {
            /// <summary>
            /// 获取购物车中产品的总数
            /// done callback arguments:
            /// count: number, 产品总数
            /// </summary>
            /// <returns type="jQuery.Deferred"/>

            var result = $.Deferred();
            this.getItems().done(function (items) {
                var count = 0;
                for (var i = 0; i < items.length; i++) {
                    //if (ko.unwrap(items[i].Selected))
                    count = count + new Number(ko.unwrap(items[i].Count));
                }
                result.resolve(count);
            });

            return result;
        },
        clear: function () {
            var result = services.callRemoteMethod('ShoppingCart/ClearItems');
            return result;
        }
    };

    return services;
});
;
(function (factory) {
    if (typeof requirejs === 'function' && define.amd) {
        var references = [];
        if (!window['services']) references.push('sv/Services');
        requirejs(references, factory);
    }
    else {
        factory();
    }
})(function () {
    //===========================================================================
    // jquery ajax 扩展

    var _ajax = $.ajax;
    $.extend($, {
        ajax: function (options) {
            options.data = options.data || {};
            var result = $.Deferred();
            _ajax(options).done($.proxy(function (data, textStatus, jqXHR) {
                if (data.Type == 'ErrorObject') {
                    if (data.Code == 'Success') {
                        this._result.resolve(data, textStatus, jqXHR);
                        return;
                    }

                    services.error.fire(data,textStatus,jqXHR);
                    this._result.reject(data, textStatus, jqXHR);

                    return;
                }

                this._result.resolve(data, textStatus, jqXHR);
            }, { _result: result }))
            .fail($.proxy(function (jqXHR, textStatus) {
                //
                var err = { Code: textStatus };
                services.error.fire(err);
                this._result.reject(err);
            }, { _result: result }));



            return result;
        }
    });

    //============================================================
    //这一部份可能需要移入 JData
    //var parseStringToDate
    (function () {
        var prefix = '/Date(';
        function parseStringToDate(value) {
            var star = prefix.length;
            var len = value.length - prefix.length - ')/'.length;
            var str = value.substr(star, len);
            var num = parseInt(str);
            var date = new Date(num);
            return date;
        }

        $.ajaxSettings.converters['text json'] = function (json) {
            var result = $.parseJSON(json);
            if (typeof result === 'string') {
                if (result.substr(0, prefix.length) == prefix)
                    result = parseStringToDate(result);

                return result;
            }

            var stack = new Array();
            stack.push(result);
            while (stack.length > 0) {
                var item = stack.pop();
                //Sys.Debug.assert(item != null);

                for (var key in item) {
                    var value = item[key];
                    if (value == null)
                        continue;

                    if ($.isArray(value)) {
                        for (var i = 0; i < value.length; i++) {
                            stack.push(value[i]);
                        }
                        continue;
                    }

                    if ($.isPlainObject(value)) {
                        stack.push(value);
                        continue;
                    }

                    if (typeof value == 'string' && value.substr(0, prefix.length) == prefix) {
                        item[key] = parseStringToDate(value);
                    }
                }
            }
            return result;
        };
    })();
    //================================================================
});;
(function (factory) {
    if (typeof define === 'function') {
        var references = [];//'text!ui/Menu.html'
        define(['jquery', 'app/Site', 'app/Application'], factory);
    }
    else {
        factory();
    }

})(function ($) {
    /// <param name="app" type="chitu.Application"/>

    site.menu = {
        isVisible: function () {
            return $('.menu').is(':visible');
        },
        visibleChanged: $.Callbacks(),
        height: function () {
            return $('.menu').height();
        }
    };

    site.buttonBar = {
        element: function () {
            return $('#footer').find('[name="bttonBar"]')[0];
        },
        isVisible: function () {
            return $('#footer').find('[name="bttonBar"]').is(':visible');
        },
        back: $.Callbacks()
    }

    //=================================================================
    function hideMenu() {
        var $menu = $('.menu');
        if (!$menu.is(':visible')) {
            return;
        }
        $('.menu').hide();
        site.menu.visibleChanged.fire({ menu: $menu[0], visible: false });
    };

    function showMenu() {
        var $menu = $('.menu');
        if ($menu.is(':visible')) {
            return;
        }

        $menu.show();
        site.menu.visibleChanged.fire({ menu: $menu[0], visible: true });
    }


    var on_pageShowing = function (sender, args) {
        /// <param name="sender" type="chitu.Page"/>
        var page = sender;
        hideButtonBar();
        var $menu = $('.menu');
        // 说明：将菜单中的项高亮
        //var args = sender.context().routeData();
        var $tab = $(document.getElementById(args.controller + '_' + args.action))
        if ($tab.length > 0) {
            $menu.find('a').removeClass('active');
            $tab.addClass('active');
        }

        var pageName = page.name();
        if (pageName == 'Home.Index' || pageName == 'Home.Class' || pageName == 'Home.NewsList' || pageName == 'Shopping.ShoppingCart' || pageName == 'User.Index') {
            showMenu(pageName);
            page.node().style.marginBottom = site.menu.height + 'px';
        }
        else {
            //(pageName == 'Home.ProductList' || pageName == 'Home.Product' || pageName == 'Home.News' || (args.controller == 'User' && args.action != 'Index')) {
            hideMenu(pageName);
            showButtonBar(pageName);
            page.node().style.marginBottom = '0px';
        }
    };

    app.pageCreated.add(function (sender, page) {
        /// <param name="page" type="chitu.Page"/>
        page.showing.add(on_pageShowing);
    });



    var model = {
        productsCount: ko.observable(0),
        visible: ko.observable(true),
        shoppingCart: function () {
            if (!site.cookies.token()) {
                return app.redirect('User_Login', { redirectUrl: 'Shopping_ShoppingCart' })
            }
            return app.redirect('Shopping_ShoppingCart');
        },
        userIndex: function () {
            if (!site.cookies.token()) {
                return app.redirect('User_Login', { redirectUrl: 'User_Index' })
            }
            return app.redirect('User_Index');
        }

    };



    (function (factory) {
        if (typeof requirejs === 'function') {
            var references = [];
            if (!window['services'] || !services['member']) references.push('sv/Member');
            if (!window['services'] || !services['shoppingCart']) references.push('sv/ShoppingCart');

            requirejs(references, factory);
        }
        else {
            factory();
        }
    })(function () {
        services.member.logined.add(function () {
            services.shoppingCart.getProductsCount().done(function (result) {
                model.productsCount(result);
            });
        });

        services.member.logouted.add(function () {
            model.productsCount(0);
        });

        //=======================================================
        // 设置购物车中的产品数据
        services.member.isLogined().pipe(function (data) {

            if (!data)
                return $.Deferred().reject();

            return services.shoppingCart.getProductsCount();
        })
        .done(function (data) {
            model.productsCount(data);
        });
        //=======================================================

        var updateProudctsCount = function () {
            services.shoppingCart.getProductsCount().done(function (data) {
                model.productsCount(data);
            });
        };

        services.shoppingCart.itemAdded.add(updateProudctsCount);
        services.shoppingCart.itemRemoved.add(updateProudctsCount);
        services.shoppingCart.itemUpdated.add(updateProudctsCount);
    });

    var node = document.createElement('div');
    $(node).insertAfter($('#main'));

    var html_load = $.ajax('App/UI/Menu.html').done(function (html) {
        //factory(html);
        node.innerHTML = html;
        $(site.buttonBar.element()).find('.glyphicon-menu-left').on('click', function () {
            site.buttonBar.back.fire({});
        });

        $(site.buttonBar.element()).find('.glyphicon-home').on('click', function () {
            app.redirect('Home_Index');
        });

        $(site.buttonBar.element()).find('.glyphicon-shopping-cart').on('click', function () {
            app.redirect('Shopping_ShoppingCart');
        });

        ko.applyBindings(model, node);
    });

    html_load.done(function () {
        if (app.currentPage != null) {
            app.currentPage.showing.add(on_pageShowing);
            on_pageShowing(app.currentPage, app.currentPage.context().routeData().values());
        }
    });

    function showButtonBar(pageName) {
        html_load.done(function () {
            $(site.buttonBar.element()).find('.glyphicon-shopping-cart, .glyphicon-home, .glyphicon-menu-left').parent().hide();
            switch (pageName) {
                case 'Home.Product':
                    $(site.buttonBar.element()).find('.glyphicon-shopping-cart').parent().show();
                    $(site.buttonBar.element()).show();
                    break;
            }
        });
    }

    function hideButtonBar(pageName) {
        $(site.buttonBar.element()).hide();
    }


});;
define(['sv/Services', 'app/Application'], function () {

    services.error.add(function (error) {
        if (error.Code == 'NotLogin' || error.Code == 'TokenRequired') {
            var return_url = '';
            if (location.hash.length > 1)
                return_url = location.hash.substr(1);

            return app.redirect('User_Login', { redirectUrl: return_url });
        };
        showError(error);
    });

    require(['bootbox'], function (bootbox) {
        window.bootbox = bootbox;
    });

    function alert(msg) {
        if (window['bootbox'])
            bootbox.alert(msg);
        else
            window.alert(msg);
    }

    function showError(data) {
        var msg;
        if (data.Code) {
            switch (data.Code) {
                case 'PasswordIncorect':
                    msg = '用户名或密码不正确';
                    break;
                case 'NotLogin':
                    msg = '尚未登录';
                    break;
                case 'AllCouponsReceived':
                    msg = '优惠券已经领取完毕';
                    break;
                case 'MemberExists':
                    msg = '该会员已经存在';
                    break;
                case 'MemberNotExists':
                    msg = '该会员不存在';
                    break;
                case 'EmailExists':
                    msg = '该邮箱已经注册';
                    break;
                case 'User':
                    msg = '提示：' + data.Message;
                    break;
                default:
                    if (!data.Message)
                        msg = chitu.Utility.format('未知的错误(Code:{0},{1})', data.Code, data.Message || '');
                    else
                        msg = data.Message;
                    break;
            }

        }
        else if (data.status) {
            switch (data.status) {
                case 404:
                    msg = '您的网络不佳，请稍后再试';
                    //msg = '找不到页面(status:' + data.status + ',url:' + data.url + ')';
                    return;
                default:
                    if (!data.Message)
                        msg = chitu.Utility.format('未知的错误(Code:{0},{1})', data.Code, data.Message || '');
                    else
                        msg = data.Message;
                    break;
            }
        }
        else {
            msg = '未知的错误(' + data.url + ')';
        }

        alert(msg);

        return;
    }
});


;
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        var references = [];
        if (!window['services']) references.push('sv/Services');

        define(references, factory);
    }
    else {
        factory();
    }
})(function () {
    function translateOrder(source) {
        //source.OrderDate = services.fixJsonDates(source.OrderDate);
        var order = ko.mapping.fromJS(source);
        var orderDetails = order.OrderDetails();
        order.OrderDetails = ko.observableArray();
        for (var i = 0; i < orderDetails.length; i++) {
            orderDetails[i].Amount = ko.computed(function () {
                return this.Price() * this.Quantity();
            }, orderDetails[i]);
            order.OrderDetails.push(orderDetails[i]);
        }

        order.ProductsAmount = ko.computed(function () {
            var amount = 0;
            for (var i = 0; i < orderDetails.length; i++) {
                amount = amount + orderDetails[i].Amount();
            }
            return amount;
        }, order);

        order.StatusText = ko.computed(function () {
            var status = this.Status();
            switch (status) {
                case 'WaitingForPayment':
                    return '待付款';
                case 'Paid':
                    return '已付款';
                case 'Send':
                    return '已发货';
                case 'Canceled':
                    return '已取消';
                case 'Finish':
                    return '已完成'
                case 'Received':
                    return '已收货';
                default:
                    //
                    return '';
            }
        }, order);

        order.ReceiptInfoId = ko.observable();
        order.ReceiptAddress.extend({ required: { message: '请填写收货信息' } });

        return order;
    };

    services.shopping = {
        getCategories: function (parentName) {
            var result = services.callRemoteMethod('Product/GetCategories', { parentName: parentName });
            return result;
        },
        getCategory: function (categoryId) {
            var result = services.callRemoteMethod('Product/GetCategory', { categoryId: categoryId });
            return result;
        },
        getProductsByCategory: function (categoryName) {
            var result = services.callRemoteMethod('Product/GetProducts',
                                          { categoryName: categoryName }, translators.product);
            return result;
        },
        getProductsByBrand: function (brand) {
            var result = services.callRemoteMethod('Product/GetProducts',
                                         { brand: brand }, translators.product);
            return result;
        },
        getProduct: function (productId) {
            var result = services.callRemoteMethod('Product/GetProduct', { productId: productId }).then(function (data) {

                data.ImageUrls = (data.ImageUrl || '').split(',');
                data.ImageUrl = data.ImageUrls[0];

                return data;
            });
            return result;
        },
        getProducts: function (args) {
            var result = $.Deferred();
            services.callRemoteMethod('Product/GetProducts', args).then($.proxy(function (args) {
                //for (var i = 0; i < args.Products.length; i++) {
                //    args.Products[i].ImageUrl = site.config.imageServer + args.Products[i].ImageUrl;
                //}
                this._result.loadCompleted = args.Products.length < site.config.pageSize;
                return args;

            }, { _result: result }))
            .fail($.proxy(function (args) {
                this._result.reject(args);

            }, { _result: result }))
            .done($.proxy(function (args) {
                var products = args.Products;
                var filters = args.Filters;
                this._result.resolve(products, filters);


            }, { _result: result }));

            return result;
        },
        findProductsByName: function (name) {
            var result = services.callRemoteMethod('Product/FindProducts', { name: name }, translators.product);
            return result;
        },
        createOrder: function (productIds, quantities) {
            /// <param name="productids" type="Array">所购买产品的编号</param>
            /// <param name="quantities" type="Array"></param>
            var result = services.callRemoteMethod('Order/CreateOrder', { productIds: productIds, quantities: quantities })
                            .then(function (order) {
                                return translateOrder(order);
                            });
            return result;
        },
        getOrder: function (orderId) {
            /// <param name="orderId">订单编号</param>
            /// <returns type="models.order"/>
            var result = services.callRemoteMethod('Order/GetOrder', { orderId: orderId }).then(function (order) {
                return translateOrder(order);
            });
            return result;
        },
        confirmOrder: function (args) {//orderId, couponCode
            var result = services.callRemoteMethod('Order/ConfirmOrder', args);
            return result;
        },
        useCoupon: function (orderId, couponCode) {
            return services.callRemoteMethod('Order/UseCoupon', { orderId: orderId, couponCode: couponCode });
        },
        getMyOrders: function (status, pageIndex, lastDateTime) {
            /// <summary>获取当前登录用户的订单</summary>
            /// <param name="lastDateTime" type="Date"/>

            var filters = [];
            if (status) {
                //filter = 'it.Status=="' + status + '"';
                filters.push('Status=="' + status + '"');
            }

            if (lastDateTime) {
                var m = lastDateTime.getMilliseconds();
                var d = lastDateTime.toFormattedString('G') + '.' + m;

                filters.push('CreateDateTime < #' + d + '#');
            }

            var filter = filters.join(' && ');
            var args = { filter: filter, StartRowIndex: pageIndex * site.config.pageSize, MaximumRows: site.config.pageSize };
            var result = services.callRemoteMethod('Order/GetMyOrders', args)
                                 .then(function (orders) {
                                     for (var i = 0; i < orders.length; i++) {
                                         orders[i] = translateOrder(orders[i]);
                                     }
                                     return orders;
                                 });


            result.done($.proxy(function (orders) {
                this._result.loadCompleted = orders.length < site.config.pageSize;
            }, { _result: result }));


            return result;
        },
        getMyLastestOrders: function (status, dateTime) {
            /// <param name="dateTime" type="Date"/>
            var d;
            if(dateTime){
                var m = dateTime.getMilliseconds();
                dateTime = dateTime.toFormattedString('G') + '.' + m;
            }
           
            //debugger;
            return services.callRemoteMethod('Order/GetMyLastestOrders', { dateTime: d, status: status })
                           .then(function (orders) {
                               for (var i = 0; i < orders.length; i++) {
                                   orders[i] = translateOrder(orders[i]);
                               }
                               return orders;
                           });
        },
        getBrands: function (args) {
            var result = services.callRemoteMethod('Product/GetBrands', args).then(function (data) {
                return data;
            });
            return result;
        },
        getBrand: function (itemId) {
            var result = services.callRemoteMethod('Product/GetBrand', { brandId: itemId });
            return result;
        },
        getShippingInfo: function (orderId) {
            var result = services.callRemoteMethod('Product/GetShippingInfo', { orderId: orderId });
            return result;
        },
        changeReceipt: function (orderId, receiptId) {

            var result = services.callRemoteMethod('Order/ChangeReceipt', { orderId: orderId, receiptId: receiptId });
            return result;
        },
        getPrepayId: function (total_fee, openid, notify_url, out_trade_no, title) {
            /// <returns type="jQuery.Deferred"/>
            return services.weixin.getPrepayId(total_fee, openid, notify_url, out_trade_no, title);
        },
        allowPurchase: function (orderId) {
            /// <returns type="jQuery.Deferred"/>

            var result = services.callRemoteMethod('Order/AllowPurchase', { orderId: orderId });
            return result;
        },
        getProductStock: function (productId) {
            /// <returns type="jQuery.Deferred"/>
            return services.callRemoteMethod('Stock/GetProductStock', { productId: productId });
        },
        balancePay: function (orderId, amount) {
            /// <returns type="jQuery.Deferred"/>
            return services.callRemoteMethod('Order/BalancePay', { orderId: orderId, amount: amount });
        }
    };

    return services;
});
;
/* ========================================================================
 * Bootstrap: modal.js v3.3.5
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
    'use strict';

    // MODAL CLASS DEFINITION
    // ======================

    var Modal = function (element, options) {
        this.options = options
        this.$body = $(document.body)
        this.$element = $(element)
        this.$dialog = this.$element.find('.modal-dialog')
        this.$backdrop = null
        this.isShown = null
        this.originalBodyPad = null
        this.scrollbarWidth = 0
        this.ignoreBackdropClick = false

        if (this.options.remote) {
            this.$element
              .find('.modal-content')
              .load(this.options.remote, $.proxy(function () {
                  this.$element.trigger('loaded.bs.modal')
              }, this))
        }
    }

    Modal.VERSION = '3.3.5'

    Modal.TRANSITION_DURATION = 300
    Modal.BACKDROP_TRANSITION_DURATION = 150

    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    }

    Modal.prototype.toggle = function (_relatedTarget) {
        return this.isShown ? this.hide() : this.show(_relatedTarget)
    }

    Modal.prototype.show = function (_relatedTarget) {
        var that = this
        var e = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

        this.$element.trigger(e)

        if (this.isShown || e.isDefaultPrevented()) return

        this.isShown = true

        this.checkScrollbar()
        this.setScrollbar()
        this.$body.addClass('modal-open')

        this.escape()
        this.resize()

        this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

        this.$dialog.on('mousedown.dismiss.bs.modal', function () {
            that.$element.one('mouseup.dismiss.bs.modal', function (e) {
                if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
            })
        })

        this.backdrop(function () {
            var transition = $.support.transition && that.$element.hasClass('fade')

            if (!that.$element.parent().length) {
                that.$element.appendTo(that.$body) // don't move modals dom position
            }

            that.$element
              .show()
              .scrollTop(0)

            that.adjustDialog()

            if (transition) {
                that.$element[0].offsetWidth // force reflow
            }

            that.$element.addClass('in')

            that.enforceFocus()

            var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

            transition ?
              that.$dialog // wait for modal to slide in
                .one('bsTransitionEnd', function () {
                    that.$element.trigger('focus').trigger(e)
                })
                .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
              that.$element.trigger('focus').trigger(e)
        })
    }

    Modal.prototype.hide = function (e) {
        if (e) e.preventDefault()

        e = $.Event('hide.bs.modal')

        this.$element.trigger(e)

        if (!this.isShown || e.isDefaultPrevented()) return

        this.isShown = false

        this.escape()
        this.resize()

        $(document).off('focusin.bs.modal')

        this.$element
          .removeClass('in')
          .off('click.dismiss.bs.modal')
          .off('mouseup.dismiss.bs.modal')

        this.$dialog.off('mousedown.dismiss.bs.modal')

        $.support.transition && this.$element.hasClass('fade') ?
          this.$element
            .one('bsTransitionEnd', $.proxy(this.hideModal, this))
            .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
          this.hideModal()
    }

    Modal.prototype.enforceFocus = function () {
        $(document)
          .off('focusin.bs.modal') // guard against infinite focus loop
          .on('focusin.bs.modal', $.proxy(function (e) {
              if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                  this.$element.trigger('focus')
              }
          }, this))
    }

    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
                e.which == 27 && this.hide()
            }, this))
        } else if (!this.isShown) {
            this.$element.off('keydown.dismiss.bs.modal')
        }
    }

    Modal.prototype.resize = function () {
        if (this.isShown) {
            $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
        } else {
            $(window).off('resize.bs.modal')
        }
    }

    Modal.prototype.hideModal = function () {
        var that = this
        this.$element.hide()
        this.backdrop(function () {
            that.$body.removeClass('modal-open')
            that.resetAdjustments()
            that.resetScrollbar()
            that.$element.trigger('hidden.bs.modal')
        })
    }

    Modal.prototype.removeBackdrop = function () {
        this.$backdrop && this.$backdrop.remove()
        this.$backdrop = null
    }

    Modal.prototype.backdrop = function (callback) {
        var that = this
        var animate = this.$element.hasClass('fade') ? 'fade' : ''

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate

            this.$backdrop = $(document.createElement('div'))
              .addClass('modal-backdrop ' + animate)
              .appendTo(this.$body)

            this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
                if (this.ignoreBackdropClick) {
                    this.ignoreBackdropClick = false
                    return
                }
                if (e.target !== e.currentTarget) return
                this.options.backdrop == 'static'
                  ? this.$element[0].focus()
                  : this.hide()
            }, this))

            if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

            this.$backdrop.addClass('in')

            if (!callback) return

            doAnimate ?
              this.$backdrop
                .one('bsTransitionEnd', callback)
                .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
              callback()

        } else if (!this.isShown && this.$backdrop) {
            this.$backdrop.removeClass('in')

            var callbackRemove = function () {
                that.removeBackdrop()
                callback && callback()
            }
            $.support.transition && this.$element.hasClass('fade') ?
              this.$backdrop
                .one('bsTransitionEnd', callbackRemove)
                .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
              callbackRemove()

        } else if (callback) {
            callback()
        }
    }

    // these following methods are used to handle overflowing modals

    Modal.prototype.handleUpdate = function () {
        this.adjustDialog()
    }

    Modal.prototype.adjustDialog = function () {
        var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

        this.$element.css({
            paddingLeft: !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
            paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
        })
    }

    Modal.prototype.resetAdjustments = function () {
        this.$element.css({
            paddingLeft: '',
            paddingRight: ''
        })
    }

    Modal.prototype.checkScrollbar = function () {
        var fullWindowWidth = window.innerWidth
        if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
            var documentElementRect = document.documentElement.getBoundingClientRect()
            fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
        }
        this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
        this.scrollbarWidth = this.measureScrollbar()
    }

    Modal.prototype.setScrollbar = function () {
        var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
        this.originalBodyPad = document.body.style.paddingRight || ''
        if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
    }

    Modal.prototype.resetScrollbar = function () {
        this.$body.css('padding-right', this.originalBodyPad)
    }

    Modal.prototype.measureScrollbar = function () { // thx walsh
        var scrollDiv = document.createElement('div')
        scrollDiv.className = 'modal-scrollbar-measure'
        this.$body.append(scrollDiv)
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
        this.$body[0].removeChild(scrollDiv)
        return scrollbarWidth
    }


    // MODAL PLUGIN DEFINITION
    // =======================

    function Plugin(option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.modal')
            var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

            if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
            if (typeof option == 'string') data[option](_relatedTarget)
            else if (options.show) data.show(_relatedTarget)
        })
    }

    var old = $.fn.modal

    $.fn.modal = Plugin
    $.fn.modal.Constructor = Modal


    // MODAL NO CONFLICT
    // =================

    $.fn.modal.noConflict = function () {
        $.fn.modal = old
        return this
    }


    // MODAL DATA-API
    // ==============

    $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
        var $this = $(this)
        var href = $this.attr('href')
        var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
        var option = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

        if ($this.is('a')) e.preventDefault()

        $target.one('show.bs.modal', function (showEvent) {
            if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
            $target.one('hidden.bs.modal', function () {
                $this.is(':visible') && $this.trigger('focus')
            })
        })
        Plugin.call($target, option, this)
    })

}(jQuery);;
/**
 * bootbox.js [v4.2.0]
 *
 * http://bootboxjs.com/license.txt
 */

// @see https://github.com/makeusabrew/bootbox/issues/180
// @see https://github.com/makeusabrew/bootbox/issues/186
(function (root, factory) {

  "use strict";
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define(["jquery"], factory);
  } else if (typeof exports === "object") {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require("jquery"));
  } else {
    // Browser globals (root is window)
    root.bootbox = factory(root.jQuery);
  }

}(this, function init($, undefined) {

  "use strict";

  // the base DOM structure needed to create a modal
  var templates = {
    dialog:
      "<div class='bootbox modal' tabindex='-1' role='dialog'>" +
        "<div class='modal-dialog'>" +
          "<div class='modal-content'>" +
            "<div class='modal-body'><div class='bootbox-body'></div></div>" +
          "</div>" +
        "</div>" +
      "</div>",
    header:
      "<div class='modal-header'>" +
        "<h4 class='modal-title'></h4>" +
      "</div>",
    footer:
      "<div class='modal-footer'></div>",
    closeButton:
      "<button type='button' class='bootbox-close-button close' data-dismiss='modal' aria-hidden='true'>&times;</button>",
    form:
      "<form class='bootbox-form'></form>",
    inputs: {
      text:
        "<input class='bootbox-input bootbox-input-text form-control' autocomplete=off type=text />",
      textarea:
        "<textarea class='bootbox-input bootbox-input-textarea form-control'></textarea>",
      email:
        "<input class='bootbox-input bootbox-input-email form-control' autocomplete='off' type='email' />",
      select:
        "<select class='bootbox-input bootbox-input-select form-control'></select>",
      checkbox:
        "<div class='checkbox'><label><input class='bootbox-input bootbox-input-checkbox' type='checkbox' /></label></div>",
      date:
        "<input class='bootbox-input bootbox-input-date form-control' autocomplete=off type='date' />",
      time:
        "<input class='bootbox-input bootbox-input-time form-control' autocomplete=off type='time' />",
      number:
        "<input class='bootbox-input bootbox-input-number form-control' autocomplete=off type='number' />",
      password:
        "<input class='bootbox-input bootbox-input-password form-control' autocomplete='off' type='password' />"
    }
  };

  var defaults = {
    // default language
    locale: "en",
    // show backdrop or not
    backdrop: true,
    // animate the modal in/out
    animate: true,
    // additional class string applied to the top level dialog
    className: null,
    // whether or not to include a close button
    closeButton: true,
    // show the dialog immediately by default
    show: true,
    // dialog container
    container: "body"
  };

  // our public object; augmented after our private API
  var exports = {};

  /**
   * @private
   */
  function _t(key) {
    var locale = locales[defaults.locale];
    return locale ? locale[key] : locales.en[key];
  }

  function processCallback(e, dialog, callback) {
    e.stopPropagation();
    e.preventDefault();

    // by default we assume a callback will get rid of the dialog,
    // although it is given the opportunity to override this

    // so, if the callback can be invoked and it *explicitly returns false*
    // then we'll set a flag to keep the dialog active...
    var preserveDialog = $.isFunction(callback) && callback(e) === false;

    // ... otherwise we'll bin it
    if (!preserveDialog) {
      dialog.modal("hide");
    }
  }

  function getKeyLength(obj) {
    // @TODO defer to Object.keys(x).length if available?
    var k, t = 0;
    for (k in obj) {
      t ++;
    }
    return t;
  }

  function each(collection, iterator) {
    var index = 0;
    $.each(collection, function(key, value) {
      iterator(key, value, index++);
    });
  }

  function sanitize(options) {
    var buttons;
    var total;

    if (typeof options !== "object") {
      throw new Error("Please supply an object of options");
    }

    if (!options.message) {
      throw new Error("Please specify a message");
    }

    // make sure any supplied options take precedence over defaults
    options = $.extend({}, defaults, options);

    if (!options.buttons) {
      options.buttons = {};
    }

    // we only support Bootstrap's "static" and false backdrop args
    // supporting true would mean you could dismiss the dialog without
    // explicitly interacting with it
    options.backdrop = options.backdrop ? "static" : false;

    buttons = options.buttons;

    total = getKeyLength(buttons);

    each(buttons, function(key, button, index) {

      if ($.isFunction(button)) {
        // short form, assume value is our callback. Since button
        // isn't an object it isn't a reference either so re-assign it
        button = buttons[key] = {
          callback: button
        };
      }

      // before any further checks make sure by now button is the correct type
      if ($.type(button) !== "object") {
        throw new Error("button with key " + key + " must be an object");
      }

      if (!button.label) {
        // the lack of an explicit label means we'll assume the key is good enough
        button.label = key;
      }

      if (!button.className) {
        if (total <= 2 && index === total-1) {
          // always add a primary to the main option in a two-button dialog
          button.className = "btn-primary";
        } else {
          button.className = "btn-default";
        }
      }
    });

    return options;
  }

  /**
   * map a flexible set of arguments into a single returned object
   * if args.length is already one just return it, otherwise
   * use the properties argument to map the unnamed args to
   * object properties
   * so in the latter case:
   * mapArguments(["foo", $.noop], ["message", "callback"])
   * -> { message: "foo", callback: $.noop }
   */
  function mapArguments(args, properties) {
    var argn = args.length;
    var options = {};

    if (argn < 1 || argn > 2) {
      throw new Error("Invalid argument length");
    }

    if (argn === 2 || typeof args[0] === "string") {
      options[properties[0]] = args[0];
      options[properties[1]] = args[1];
    } else {
      options = args[0];
    }

    return options;
  }

  /**
   * merge a set of default dialog options with user supplied arguments
   */
  function mergeArguments(defaults, args, properties) {
    return $.extend(
      // deep merge
      true,
      // ensure the target is an empty, unreferenced object
      {},
      // the base options object for this type of dialog (often just buttons)
      defaults,
      // args could be an object or array; if it's an array properties will
      // map it to a proper options object
      mapArguments(
        args,
        properties
      )
    );
  }

  /**
   * this entry-level method makes heavy use of composition to take a simple
   * range of inputs and return valid options suitable for passing to bootbox.dialog
   */
  function mergeDialogOptions(className, labels, properties, args) {
    //  build up a base set of dialog properties
    var baseOptions = {
      className: "bootbox-" + className,
      buttons: createLabels.apply(null, labels)
    };

    // ensure the buttons properties generated, *after* merging
    // with user args are still valid against the supplied labels
    return validateButtons(
      // merge the generated base properties with user supplied arguments
      mergeArguments(
        baseOptions,
        args,
        // if args.length > 1, properties specify how each arg maps to an object key
        properties
      ),
      labels
    );
  }

  /**
   * from a given list of arguments return a suitable object of button labels
   * all this does is normalise the given labels and translate them where possible
   * e.g. "ok", "confirm" -> { ok: "OK, cancel: "Annuleren" }
   */
  function createLabels() {
    var buttons = {};

    for (var i = 0, j = arguments.length; i < j; i++) {
      var argument = arguments[i];
      var key = argument.toLowerCase();
      var value = argument.toUpperCase();

      buttons[key] = {
        label: _t(value)
      };
    }

    return buttons;
  }

  function validateButtons(options, buttons) {
    var allowedButtons = {};
    each(buttons, function(key, value) {
      allowedButtons[value] = true;
    });

    each(options.buttons, function(key) {
      if (allowedButtons[key] === undefined) {
        throw new Error("button key " + key + " is not allowed (options are " + buttons.join("\n") + ")");
      }
    });

    return options;
  }

  exports.alert = function() {
    var options;

    options = mergeDialogOptions("alert", ["ok"], ["message", "callback"], arguments);

    if (options.callback && !$.isFunction(options.callback)) {
      throw new Error("alert requires callback property to be a function when provided");
    }

    /**
     * overrides
     */
    options.buttons.ok.callback = options.onEscape = function() {
      if ($.isFunction(options.callback)) {
        return options.callback();
      }
      return true;
    };

    return exports.dialog(options);
  };

  exports.confirm = function() {
    var options;

    options = mergeDialogOptions("confirm", ["cancel", "confirm"], ["message", "callback"], arguments);

    /**
     * overrides; undo anything the user tried to set they shouldn't have
     */
    options.buttons.cancel.callback = options.onEscape = function() {
      return options.callback(false);
    };

    options.buttons.confirm.callback = function() {
      return options.callback(true);
    };

    // confirm specific validation
    if (!$.isFunction(options.callback)) {
      throw new Error("confirm requires a callback");
    }

    return exports.dialog(options);
  };

  exports.prompt = function() {
    var options;
    var defaults;
    var dialog;
    var form;
    var input;
    var shouldShow;
    var inputOptions;

    // we have to create our form first otherwise
    // its value is undefined when gearing up our options
    // @TODO this could be solved by allowing message to
    // be a function instead...
    form = $(templates.form);

    // prompt defaults are more complex than others in that
    // users can override more defaults
    // @TODO I don't like that prompt has to do a lot of heavy
    // lifting which mergeDialogOptions can *almost* support already
    // just because of 'value' and 'inputType' - can we refactor?
    defaults = {
      className: "bootbox-prompt",
      buttons: createLabels("cancel", "confirm"),
      value: "",
      inputType: "text"
    };

    options = validateButtons(
      mergeArguments(defaults, arguments, ["title", "callback"]),
      ["cancel", "confirm"]
    );

    // capture the user's show value; we always set this to false before
    // spawning the dialog to give us a chance to attach some handlers to
    // it, but we need to make sure we respect a preference not to show it
    shouldShow = (options.show === undefined) ? true : options.show;

    // check if the browser supports the option.inputType
    var html5inputs = ["date","time","number"];
    var i = document.createElement("input");
    i.setAttribute("type", options.inputType);
    if(html5inputs[options.inputType]){
      options.inputType = i.type;
    }

    /**
     * overrides; undo anything the user tried to set they shouldn't have
     */
    options.message = form;

    options.buttons.cancel.callback = options.onEscape = function() {
      return options.callback(null);
    };

    options.buttons.confirm.callback = function() {
      var value;

      switch (options.inputType) {
        case "text":
        case "textarea":
        case "email":
        case "select":
        case "date":
        case "time":
        case "number":
        case "password":
          value = input.val();
          break;

        case "checkbox":
          var checkedItems = input.find("input:checked");

          // we assume that checkboxes are always multiple,
          // hence we default to an empty array
          value = [];

          each(checkedItems, function(_, item) {
            value.push($(item).val());
          });
          break;
      }

      return options.callback(value);
    };

    options.show = false;

    // prompt specific validation
    if (!options.title) {
      throw new Error("prompt requires a title");
    }

    if (!$.isFunction(options.callback)) {
      throw new Error("prompt requires a callback");
    }

    if (!templates.inputs[options.inputType]) {
      throw new Error("invalid prompt type");
    }

    // create the input based on the supplied type
    input = $(templates.inputs[options.inputType]);

    switch (options.inputType) {
      case "text":
      case "textarea":
      case "email":
      case "date":
      case "time":
      case "number":
      case "password":
        input.val(options.value);
        break;

      case "select":
        var groups = {};
        inputOptions = options.inputOptions || [];

        if (!inputOptions.length) {
          throw new Error("prompt with select requires options");
        }

        each(inputOptions, function(_, option) {

          // assume the element to attach to is the input...
          var elem = input;

          if (option.value === undefined || option.text === undefined) {
            throw new Error("given options in wrong format");
          }


          // ... but override that element if this option sits in a group

          if (option.group) {
            // initialise group if necessary
            if (!groups[option.group]) {
              groups[option.group] = $("<optgroup/>").attr("label", option.group);
            }

            elem = groups[option.group];
          }

          elem.append("<option value='" + option.value + "'>" + option.text + "</option>");
        });

        each(groups, function(_, group) {
          input.append(group);
        });

        // safe to set a select's value as per a normal input
        input.val(options.value);
        break;

      case "checkbox":
        var values   = $.isArray(options.value) ? options.value : [options.value];
        inputOptions = options.inputOptions || [];

        if (!inputOptions.length) {
          throw new Error("prompt with checkbox requires options");
        }

        if (!inputOptions[0].value || !inputOptions[0].text) {
          throw new Error("given options in wrong format");
        }

        // checkboxes have to nest within a containing element, so
        // they break the rules a bit and we end up re-assigning
        // our 'input' element to this container instead
        input = $("<div/>");

        each(inputOptions, function(_, option) {
          var checkbox = $(templates.inputs[options.inputType]);

          checkbox.find("input").attr("value", option.value);
          checkbox.find("label").append(option.text);

          // we've ensured values is an array so we can always iterate over it
          each(values, function(_, value) {
            if (value === option.value) {
              checkbox.find("input").prop("checked", true);
            }
          });

          input.append(checkbox);
        });
        break;
    }

    if (options.placeholder) {
      input.attr("placeholder", options.placeholder);
    }

    if(options.pattern){
      input.attr("pattern", options.pattern);
    }

    // now place it in our form
    form.append(input);

    form.on("submit", function(e) {
      e.preventDefault();
      // @TODO can we actually click *the* button object instead?
      // e.g. buttons.confirm.click() or similar
      dialog.find(".btn-primary").click();
    });

    dialog = exports.dialog(options);

    // clear the existing handler focusing the submit button...
    dialog.off("shown.bs.modal");

    // ...and replace it with one focusing our input, if possible
    dialog.on("shown.bs.modal", function() {
      input.focus();
    });

    if (shouldShow === true) {
      dialog.modal("show");
    }

    return dialog;
  };

  exports.dialog = function(options) {
    options = sanitize(options);

    var dialog = $(templates.dialog);
    var body = dialog.find(".modal-body");
    var buttons = options.buttons;
    var buttonStr = "";
    var callbacks = {
      onEscape: options.onEscape
    };

    each(buttons, function(key, button) {

      // @TODO I don't like this string appending to itself; bit dirty. Needs reworking
      // can we just build up button elements instead? slower but neater. Then button
      // can just become a template too
      buttonStr += "<button data-bb-handler='" + key + "' type='button' class='btn " + button.className + "'>" + button.label + "</button>";
      callbacks[key] = button.callback;
    });

    body.find(".bootbox-body").html(options.message);

    if (options.animate === true) {
      dialog.addClass("fade");
    }

    if (options.className) {
      dialog.addClass(options.className);
    }

    if (options.title) {
      body.before(templates.header);
    }

    if (options.closeButton) {
      var closeButton = $(templates.closeButton);

      if (options.title) {
        dialog.find(".modal-header").prepend(closeButton);
      } else {
        closeButton.css("margin-top", "-10px").prependTo(body);
      }
    }

    if (options.title) {
      dialog.find(".modal-title").html(options.title);
    }

    if (buttonStr.length) {
      body.after(templates.footer);
      dialog.find(".modal-footer").html(buttonStr);
    }


    /**
     * Bootstrap event listeners; used handle extra
     * setup & teardown required after the underlying
     * modal has performed certain actions
     */

    dialog.on("hidden.bs.modal", function(e) {
      // ensure we don't accidentally intercept hidden events triggered
      // by children of the current dialog. We shouldn't anymore now BS
      // namespaces its events; but still worth doing
      if (e.target === this) {
        dialog.remove();
      }
    });

    /*
    dialog.on("show.bs.modal", function() {
      // sadly this doesn't work; show is called *just* before
      // the backdrop is added so we'd need a setTimeout hack or
      // otherwise... leaving in as would be nice
      if (options.backdrop) {
        dialog.next(".modal-backdrop").addClass("bootbox-backdrop");
      }
    });
    */

    dialog.on("shown.bs.modal", function() {
      dialog.find(".btn-primary:first").focus();
    });

    /**
     * Bootbox event listeners; experimental and may not last
     * just an attempt to decouple some behaviours from their
     * respective triggers
     */

    dialog.on("escape.close.bb", function(e) {
      if (callbacks.onEscape) {
        processCallback(e, dialog, callbacks.onEscape);
      }
    });

    /**
     * Standard jQuery event listeners; used to handle user
     * interaction with our dialog
     */

    dialog.on("click", ".modal-footer button", function(e) {
      var callbackKey = $(this).data("bb-handler");

      processCallback(e, dialog, callbacks[callbackKey]);

    });

    dialog.on("click", ".bootbox-close-button", function(e) {
      // onEscape might be falsy but that's fine; the fact is
      // if the user has managed to click the close button we
      // have to close the dialog, callback or not
      processCallback(e, dialog, callbacks.onEscape);
    });

    dialog.on("keyup", function(e) {
      if (e.which === 27) {
        dialog.trigger("escape.close.bb");
      }
    });

    // the remainder of this method simply deals with adding our
    // dialogent to the DOM, augmenting it with Bootstrap's modal
    // functionality and then giving the resulting object back
    // to our caller

    $(options.container).append(dialog);

    dialog.modal({
      backdrop: options.backdrop,
      keyboard: false,
      show: false
    });

    if (options.show) {
      dialog.modal("show");
    }

    // @TODO should we return the raw element here or should
    // we wrap it in an object on which we can expose some neater
    // methods, e.g. var d = bootbox.alert(); d.hide(); instead
    // of d.modal("hide");

   /*
    function BBDialog(elem) {
      this.elem = elem;
    }

    BBDialog.prototype = {
      hide: function() {
        return this.elem.modal("hide");
      },
      show: function() {
        return this.elem.modal("show");
      }
    };
    */

    return dialog;

  };

  exports.setDefaults = function() {
    var values = {};

    if (arguments.length === 2) {
      // allow passing of single key/value...
      values[arguments[0]] = arguments[1];
    } else {
      // ... and as an object too
      values = arguments[0];
    }

    $.extend(defaults, values);
  };

  exports.hideAll = function() {
    $(".bootbox").modal("hide");
  };


  /**
   * standard locales. Please add more according to ISO 639-1 standard. Multiple language variants are
   * unlikely to be required. If this gets too large it can be split out into separate JS files.
   */
  var locales = {
    br : {
      OK      : "OK",
      CANCEL  : "Cancelar",
      CONFIRM : "Sim"
    },
    da : {
      OK      : "OK",
      CANCEL  : "Annuller",
      CONFIRM : "Accepter"
    },
    de : {
      OK      : "OK",
      CANCEL  : "Abbrechen",
      CONFIRM : "Akzeptieren"
    },
    en : {
      OK      : "OK",
      CANCEL  : "Cancel",
      CONFIRM : "OK"
    },
    es : {
      OK      : "OK",
      CANCEL  : "Cancelar",
      CONFIRM : "Aceptar"
    },
    fi : {
      OK      : "OK",
      CANCEL  : "Peruuta",
      CONFIRM : "OK"
    },
    fr : {
      OK      : "OK",
      CANCEL  : "Annuler",
      CONFIRM : "D'accord"
    },
    he : {
      OK      : "אישור",
      CANCEL  : "ביטול",
      CONFIRM : "אישור"
    },
    it : {
      OK      : "OK",
      CANCEL  : "Annulla",
      CONFIRM : "Conferma"
    },
    lt : {
      OK      : "Gerai",
      CANCEL  : "Atšaukti",
      CONFIRM : "Patvirtinti"
    },
    lv : {
      OK      : "Labi",
      CANCEL  : "Atcelt",
      CONFIRM : "Apstiprināt"
    },
    nl : {
      OK      : "OK",
      CANCEL  : "Annuleren",
      CONFIRM : "Accepteren"
    },
    no : {
      OK      : "OK",
      CANCEL  : "Avbryt",
      CONFIRM : "OK"
    },
    pl : {
      OK      : "OK",
      CANCEL  : "Anuluj",
      CONFIRM : "Potwierdź"
    },
    ru : {
      OK      : "OK",
      CANCEL  : "Отмена",
      CONFIRM : "Применить"
    },
    sv : {
      OK      : "OK",
      CANCEL  : "Avbryt",
      CONFIRM : "OK"
    },
    tr : {
      OK      : "Tamam",
      CANCEL  : "İptal",
      CONFIRM : "Onayla"
    },
    zh_CN : {
      OK      : "OK",
      CANCEL  : "取消",
      CONFIRM : "确认"
    },
    zh_TW : {
      OK      : "OK",
      CANCEL  : "取消",
      CONFIRM : "確認"
    }
  };

  exports.init = function(_$) {
    return init(_$ || $);
  };

  return exports;
}));
;
(function (factory) {
    if (typeof define === 'function' && define.amd)
        define(['bootbox'], factory);
    else
        factory(window['bootbox']);

})(function (bootbox) {
    bootbox.setDefaults({ locale: 'zh_CN' });
    window['bootbox'] = bootbox;
   
    return bootbox;
});;
define.amd = _amd;