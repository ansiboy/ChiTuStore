var durandal = {};
durandal.app = function () {
    /// <field name="title" type="String">
    /// The title of your application.
    /// </field>
};
durandal.app.prototype = {
    title: '',
    configurePlugins: function (config, baseUrl) {
        /// <summary>
        /// Configures one or more plugins to be loaded and installed into the application.
        /// </summary>
        /// <param name="config" type="Object">
        /// Keys are plugin names. Values can be truthy, to simply install the plugin, or a configuration object to pass to the plugin.
        /// </param>
        /// <param name="baseUrl" type="String" canBeNull="true">
        /// The base url to load the plugins from.
        /// </param>
    },
    start: function () {
        /// <summary>
        /// Starts the application.
        /// </summary>
        /// <returns type="promise">
        /// </returns>
    },
    setRoot: function (root, transition, applicationHost) {
        /// <summary>
        /// Sets the root module/view for the application.
        /// </summary>
        /// <param name="root" type="String">
        /// root The root view or module.
        /// </param>
        /// <param name="transition" type="String" canBeNull="true">
        /// The transition to use from the previous root (or splash screen) into the new root.
        /// </param>
        /// <param name="applicationHost" type="String" canBeNull="true">
        /// The application host element or id. By default the id 'applicationHost' will be used.
        /// </param>
    }
};

durandal.system = function () {
    /// <field name="version" >
    /// Durandal's version.
    /// </field>
    /// <field name="noop" >
    /// A noop function.
    /// </field>
};
durandal.system.prototype = {
    version: '',
    noop: noop,
    getModuleId: function (obj) {
        /// <summary>
        /// Gets the module id for the specified object.
        /// </summary>
        /// <param name="obj" type="Object">
        /// The object whose module id you wish to determine.
        /// </param>
        /// <returns type="String">
        /// The module id.
        /// </returns>
    },
    setModuleId: function (obj, id) {
        /// <summary>
        /// Sets the module id for the specified object.
        /// </summary>
        /// <param name="obj" type="Object">
        /// obj The object whose module id you wish to set.
        /// </param>
        /// <param name="id" type="String">
        /// id The id to set for the specified object.
        /// </param>
    },
    resolveObject: function (module) {
        /// <summary>
        /// Resolves the default object instance for a module. If the module is an object, the module is returned. If the module is a function, that function is called with `new` and it's result is returned.
        /// </summary>
        /// <param name="module" type="Object">
        /// module The module to use to get/create the default object for.
        /// </param>
        /// <returns type="Object">
        /// The default object for the module.
        /// </returns>
    },
    debug: function (enable) {
        /// <summary>
        /// Gets/Sets whether or not Durandal is in debug mode.
        /// </summary>
        /// <param name="enable" type="Boolean">
        /// Turns on/off debugging.
        /// </param>
        /// <returns type="Boolean">
        /// Whether or not Durandal is current debugging.
        /// </returns>
    },
    log: function (info) {
        /// <summary>
        /// Logs data to the console. Pass any number of parameters to be logged. Log output is not processed if the framework is not running in debug mode.
        /// </summary>
        /// <param name="info" type="Object">
        /// The objects to log.
        /// </param>
    },
    error: function (obj) {
        /// <summary>
        /// Logs an error.
        /// </summary>
        /// <param name="" type="string|Error">
        /// The error to report.
        /// </param>
    },
    assert: function (condition, message) {
        /// <summary>
        /// Asserts a condition by throwing an error if the condition fails.
        /// </summary>
        /// <param name="condition" type="Boolean">
        /// The condition to check.
        /// </param>
        /// <param name="message" type="String">
        /// The message to report in the error if the condition check fails.
        /// </param>
    },
    defer: function (action) {
        /// <summary>
        /// Creates a deferred object which can be used to create a promise. Optionally pass a function action to perform which will be passed an object used in resolving the promise.
        /// </summary>
        /// <param name="action" type="Function">
        /// The action to defer. You will be passed the deferred object as a paramter.
        /// </param>
        /// <returns type="Deferred">
        /// The deferred object.
        /// </returns>
    },
    guid: function () {
        /// <summary>
        /// Creates a simple V4 UUID. This should not be used as a PK in your database. It can be used to generate internal, unique ids. For a more robust solution see [node-uuid](https://github.com/broofa/node-uuid).
        /// </summary>
        /// <returns type="String">
        /// The guid.
        /// </returns>
    },
    acquire: function (moduleId) {
        /// <summary>
        /// Uses require.js to obtain a module. This function returns a promise which resolves with the module instance. You can pass more than one module id to this function or an array of ids. If more than one or an array is passed, then the promise will resolve with an array of module instances.
        /// </summary>
        /// <param name="moduleId" type="string|string[]">
        /// The id(s) of the modules to load.
        /// </param>
        /// <returns type="Promise">
        /// A promise for the loaded module(s).
        /// </returns>
    },
    extend: function (obj, extension) {
        /// <summary>
        /// Extends the first object with the properties of the following objects.
        /// </summary>
        /// <param name="obj" type="Object">
        /// The target object to extend.
        /// </param>
        /// <param name="extension" type="Object">
        /// Uses to extend the target object.
        /// </param>
    },
    wait: function (milliseconds) {
        /// <summary>
        /// Uses a setTimeout to wait the specified milliseconds.
        /// </summary>
        /// <param name="milliseconds" type="Number">
        /// The number of milliseconds to wait.
        /// </param>
        /// <returns type="Promise">
        /// </returns>
    },
    keys: function (obj) {
        /// <summary>
        /// Gets all the owned keys of the specified object.
        /// </summary>
        /// <param name="obj" type="Object">
        /// The object whose owned keys should be returned.
        /// </param>
        /// <returns type="String[]">
        /// The keys.
        /// </returns>
    },
    isElement: function (obj) {
        /// <summary>
        /// Determines if the specified object is an html element.
        /// </summary>
        /// <param name="obj" type="Object">
        /// The object to check.
        /// </param>
        /// <returns type="Boolean">
        /// True if matches the type, false otherwise.
        /// </returns>
    },
    isArray: function (obj) {
        /// <summary>
        /// Determines if the specified object is an array.
        /// </summary>
        /// <param name="obj" type="Object">
        /// The object to check.
        /// </param>
        /// <returns type="Boolean">
        /// True if matches the type, false otherwise.
        /// </returns>
    },
    isObject: function (obj) {
        /// <summary>
        /// Determines if the specified object is...an object. ie. Not an array, string, etc.
        /// </summary>
        /// <param name="obj" type="Object">
        /// The object to check.
        /// </param>
        /// <returns>
        /// True if matches the type, false otherwise.
        /// </returns>
    },
    isBoolean: function (obj) {
        /// <summary>
        /// Determines if the specified object is a boolean.
        /// </summary>
        /// <param name="obj" type="Object">
        /// The object to check.
        /// </param>
        /// <returns>
        /// True if matches the type, false otherwise.
        /// </returns>
    },
    isPromise: function (obj) {
        /// <summary>
        /// Determines if the specified object is a promise.
        /// </summary>
        /// <param name="obj">
        /// object The object to check.
        /// </param>
        /// 
    },
    isArguments: function (obj) {
        /// <summary>
        /// Determines if the specified object is a function arguments object.
        /// </summary>
        /// <param name="obj">
        /// The object to check.
        /// </param>
        /// <returns type="Boolean">
        /// True if matches the type, false otherwise.
        /// </returns>
    },
    isFunction: function (obj) {
        /// <summary>
        /// Determines if the specified object is a function.
        /// </summary>
        /// <param name="obj">
        /// The object to check.
        /// </param>
        /// <returns>
        /// True if matches the type, false otherwise.
        /// </returns>
    },
    isString: function (obj) {
        /// <summary>
        /// etermines if the specified object is a string.
        /// </summary>
        /// <param name="obj" type="Object">
        /// The object to check.
        /// </param>
        /// <returns type="Boolean">
        /// True if matches the type, false otherwise.
        /// </returns>
    },
    isNumber: function (obj) {
        /// <summary>
        /// Determines if the specified object is a number.
        /// </summary>
        /// <param name="obj" type="Object">
        /// The object to check.
        /// </param>
        /// <returns type="Boolean">
        /// True if matches the type, false otherwise.
        /// </returns>
    },
    isDate: function (obj) {
        /// <summary>
        /// Determines if the specified object is a date.
        /// </summary>
        /// <param name="obj" type="Object">
        /// The object to check.
        /// </param>
        /// <returns type="Boolean">
        /// True if matches the type, false otherwise.
        /// </returns>
    },
    isBoolean: function (obj) {
        /// <summary>
        /// Determines if the specified object is a boolean.
        /// </summary>
        /// <param name="obj" type="Object">
        /// The object to check.
        /// </param>
        /// <returns type="Boolean">
        /// True if matches the type, false otherwise.
        /// </returns>
    }
};

jquery = function () {
    /// <returns type="jquery">
    /// </returns>
};

(function () {
    jquery.prototype = {
        'ajax': function () {
            /// <signature>
            ///   <summary>Perform an asynchronous HTTP (Ajax) request.</summary>
            ///   <param name="url" type="String">A string containing the URL to which the request is sent.</param>
            ///   <param name="settings" type="PlainObject">A set of key/value pairs that configure the Ajax request. All settings are optional. A default can be set for any option with $.ajaxSetup(). See jQuery.ajax( settings ) below for a complete list of all settings.</param>
            ///   <returns type="jqXHR" />
            /// </signature>
            /// <signature>
            ///   <summary>Perform an asynchronous HTTP (Ajax) request.</summary>
            ///   <param name="settings" type="PlainObject">A set of key/value pairs that configure the Ajax request. All settings are optional. A default can be set for any option with $.ajaxSetup().</param>
            ///   <returns type="jqXHR" />
            /// </signature>
        },
        'ajaxPrefilter': function () {
            /// <signature>
            ///   <summary>Handle custom Ajax options or modify existing options before each request is sent and before they are processed by $.ajax().</summary>
            ///   <param name="dataTypes" type="String">An optional string containing one or more space-separated dataTypes</param>
            ///   <param name="handler(options, originalOptions, jqXHR)" type="Function">A handler to set default values for future Ajax requests.</param>
            /// </signature>
        },
        'ajaxSetup': function () {
            /// <signature>
            ///   <summary>Set default values for future Ajax requests.</summary>
            ///   <param name="options" type="PlainObject">A set of key/value pairs that configure the default Ajax request. All options are optional.</param>
            /// </signature>
        },
        'ajaxTransport': function () {
            /// <signature>
            ///   <summary>Creates an object that handles the actual transmission of Ajax data.</summary>
            ///   <param name="dataType" type="String">A string identifying the data type to use</param>
            ///   <param name="handler(options, originalOptions, jqXHR)" type="Function">A handler to return the new transport object to use with the data type provided in the first argument.</param>
            /// </signature>
        },
        'boxModel': function () {
            /// <summary>Deprecated in jQuery 1.3 (see jQuery.support). States if the current page, in the user's browser, is being rendered using the W3C CSS Box Model.</summary>
            /// <returns type="Boolean" />
        },
        'browser': function () {
            /// <summary>Contains flags for the useragent, read from navigator.userAgent. We recommend against using this property; please try to use feature detection instead (see jQuery.support). jQuery.browser may be moved to a plugin in a future release of jQuery.</summary>
            /// <returns type="PlainObject" />
        },
        'browser.version': function () {
            /// <summary>The version number of the rendering engine for the user's browser.</summary>
            /// <returns type="String" />
        },
        'Callbacks': function () {
            /// <signature>
            ///   <summary>A multi-purpose callbacks list object that provides a powerful way to manage callback lists.</summary>
            ///   <param name="flags" type="String">An optional list of space-separated flags that change how the callback list behaves.</param>
            ///   <returns type="Callbacks" />
            /// </signature>
        },
        'contains': function () {
            /// <signature>
            ///   <summary>Check to see if a DOM element is a descendant of another DOM element.</summary>
            ///   <param name="container" type="Element">The DOM element that may contain the other element.</param>
            ///   <param name="contained" type="Element">The DOM element that may be contained by (a descendant of) the other element.</param>
            ///   <returns type="Boolean" />
            /// </signature>
        },
        'cssHooks': function () {
            /// <summary>Hook directly into jQuery to override how particular CSS properties are retrieved or set, normalize CSS property naming, or create custom properties.</summary>
            /// <returns type="Object" />
        },
        'data': function () {
            /// <signature>
            ///   <summary>Returns value at named data store for the element, as set by jQuery.data(element, name, value), or the full data store for the element.</summary>
            ///   <param name="element" type="Element">The DOM element to query for the data.</param>
            ///   <param name="key" type="String">Name of the data stored.</param>
            ///   <returns type="Object" />
            /// </signature>
            /// <signature>
            ///   <summary>Returns value at named data store for the element, as set by jQuery.data(element, name, value), or the full data store for the element.</summary>
            ///   <param name="element" type="Element">The DOM element to query for the data.</param>
            ///   <returns type="Object" />
            /// </signature>
        },
        'Deferred': function () {
            /// <signature>
            ///   <summary>A constructor function that returns a chainable utility object with methods to register multiple callbacks into callback queues, invoke callback queues, and relay the success or failure state of any synchronous or asynchronous function.</summary>
            ///   <param name="beforeStart" type="Function">A function that is called just before the constructor returns.</param>
            ///   <returns type="Deferred" />
            /// </signature>
        },
        'dequeue': function () {
            /// <signature>
            ///   <summary>Execute the next function on the queue for the matched element.</summary>
            ///   <param name="element" type="Element">A DOM element from which to remove and execute a queued function.</param>
            ///   <param name="queueName" type="String">A string containing the name of the queue. Defaults to fx, the standard effects queue.</param>
            /// </signature>
        },
        'each': function () {
            /// <signature>
            ///   <summary>A generic iterator function, which can be used to seamlessly iterate over both objects and arrays. Arrays and array-like objects with a length property (such as a function's arguments object) are iterated by numeric index, from 0 to length-1. Other objects are iterated via their named properties.</summary>
            ///   <param name="collection" type="Object">The object or array to iterate over.</param>
            ///   <param name="callback(indexInArray, valueOfElement)" type="Function">The function that will be executed on every object.</param>
            ///   <returns type="Object" />
            /// </signature>
        },
        'error': function () {
            /// <signature>
            ///   <summary>Takes a string and throws an exception containing it.</summary>
            ///   <param name="message" type="String">The message to send out.</param>
            /// </signature>
        },
        'extend': function () {
            /// <signature>
            ///   <summary>Merge the contents of two or more objects together into the first object.</summary>
            ///   <param name="target" type="Object">An object that will receive the new properties if additional objects are passed in or that will extend the jQuery namespace if it is the sole argument.</param>
            ///   <param name="object1" type="Object">An object containing additional properties to merge in.</param>
            ///   <param name="objectN" type="Object">Additional objects containing properties to merge in.</param>
            ///   <returns type="Object" />
            /// </signature>
            /// <signature>
            ///   <summary>Merge the contents of two or more objects together into the first object.</summary>
            ///   <param name="deep" type="Boolean">If true, the merge becomes recursive (aka. deep copy).</param>
            ///   <param name="target" type="Object">The object to extend. It will receive the new properties.</param>
            ///   <param name="object1" type="Object">An object containing additional properties to merge in.</param>
            ///   <param name="objectN" type="Object">Additional objects containing properties to merge in.</param>
            ///   <returns type="Object" />
            /// </signature>
        },
        'get': function () {
            /// <signature>
            ///   <summary>Load data from the server using a HTTP GET request.</summary>
            ///   <param name="url" type="String">A string containing the URL to which the request is sent.</param>
            ///   <param name="data" type="String">A plain object or string that is sent to the server with the request.</param>
            ///   <param name="success(data, textStatus, jqXHR)" type="Function">A callback function that is executed if the request succeeds.</param>
            ///   <param name="dataType" type="String">The type of data expected from the server. Default: Intelligent Guess (xml, json, script, or html).</param>
            ///   <returns type="jqXHR" />
            /// </signature>
        },
        'getJSON': function () {
            /// <signature>
            ///   <summary>Load JSON-encoded data from the server using a GET HTTP request.</summary>
            ///   <param name="url" type="String">A string containing the URL to which the request is sent.</param>
            ///   <param name="data" type="PlainObject">A plain object or string that is sent to the server with the request.</param>
            ///   <param name="success(data, textStatus, jqXHR)" type="Function">A callback function that is executed if the request succeeds.</param>
            ///   <returns type="jqXHR" />
            /// </signature>
        },
        'getScript': function () {
            /// <signature>
            ///   <summary>Load a JavaScript file from the server using a GET HTTP request, then execute it.</summary>
            ///   <param name="url" type="String">A string containing the URL to which the request is sent.</param>
            ///   <param name="success(script, textStatus, jqXHR)" type="Function">A callback function that is executed if the request succeeds.</param>
            ///   <returns type="jqXHR" />
            /// </signature>
        },
        'globalEval': function () {
            /// <signature>
            ///   <summary>Execute some JavaScript code globally.</summary>
            ///   <param name="code" type="String">The JavaScript code to execute.</param>
            /// </signature>
        },
        'grep': function () {
            /// <signature>
            ///   <summary>Finds the elements of an array which satisfy a filter function. The original array is not affected.</summary>
            ///   <param name="array" type="Array">The array to search through.</param>
            ///   <param name="function(elementOfArray, indexInArray)" type="Function">The function to process each item against.  The first argument to the function is the item, and the second argument is the index.  The function should return a Boolean value.  this will be the global window object.</param>
            ///   <param name="invert" type="Boolean">If "invert" is false, or not provided, then the function returns an array consisting of all elements for which "callback" returns true.  If "invert" is true, then the function returns an array consisting of all elements for which "callback" returns false.</param>
            ///   <returns type="Array" />
            /// </signature>
        },
        'hasData': function () {
            /// <signature>
            ///   <summary>Determine whether an element has any jQuery data associated with it.</summary>
            ///   <param name="element" type="Element">A DOM element to be checked for data.</param>
            ///   <returns type="Boolean" />
            /// </signature>
        },
        'holdReady': function () {
            /// <signature>
            ///   <summary>Holds or releases the execution of jQuery's ready event.</summary>
            ///   <param name="hold" type="Boolean">Indicates whether the ready hold is being requested or released</param>
            /// </signature>
        },
        'inArray': function () {
            /// <signature>
            ///   <summary>Search for a specified value within an array and return its index (or -1 if not found).</summary>
            ///   <param name="value" type="Anything">The value to search for.</param>
            ///   <param name="array" type="Array">An array through which to search.</param>
            ///   <param name="fromIndex" type="Number">The index of the array at which to begin the search. The default is 0, which will search the whole array.</param>
            ///   <returns type="Number" />
            /// </signature>
        },
        'isArray': function () {
            /// <signature>
            ///   <summary>Determine whether the argument is an array.</summary>
            ///   <param name="obj" type="Object">Object to test whether or not it is an array.</param>
            ///   <returns type="boolean" />
            /// </signature>
        },
        'isEmptyObject': function () {
            /// <signature>
            ///   <summary>Check to see if an object is empty (contains no enumerable properties).</summary>
            ///   <param name="object" type="Object">The object that will be checked to see if it's empty.</param>
            ///   <returns type="Boolean" />
            /// </signature>
        },
        'isFunction': function () {
            /// <signature>
            ///   <summary>Determine if the argument passed is a Javascript function object.</summary>
            ///   <param name="obj" type="PlainObject">Object to test whether or not it is a function.</param>
            ///   <returns type="boolean" />
            /// </signature>
        },
        'isNumeric': function () {
            /// <signature>
            ///   <summary>Determines whether its argument is a number.</summary>
            ///   <param name="value" type="PlainObject">The value to be tested.</param>
            ///   <returns type="Boolean" />
            /// </signature>
        },
        'isPlainObject': function () {
            /// <signature>
            ///   <summary>Check to see if an object is a plain object (created using "{}" or "new Object").</summary>
            ///   <param name="object" type="PlainObject">The object that will be checked to see if it's a plain object.</param>
            ///   <returns type="Boolean" />
            /// </signature>
        },
        'isWindow': function () {
            /// <signature>
            ///   <summary>Determine whether the argument is a window.</summary>
            ///   <param name="obj" type="PlainObject">Object to test whether or not it is a window.</param>
            ///   <returns type="boolean" />
            /// </signature>
        },
        'isXMLDoc': function () {
            /// <signature>
            ///   <summary>Check to see if a DOM node is within an XML document (or is an XML document).</summary>
            ///   <param name="node" type="Element">The DOM node that will be checked to see if it's in an XML document.</param>
            ///   <returns type="Boolean" />
            /// </signature>
        },
        'makeArray': function () {
            /// <signature>
            ///   <summary>Convert an array-like object into a true JavaScript array.</summary>
            ///   <param name="obj" type="PlainObject">Any object to turn into a native Array.</param>
            ///   <returns type="Array" />
            /// </signature>
        },
        'map': function () {
            /// <signature>
            ///   <summary>Translate all items in an array or object to new array of items.</summary>
            ///   <param name="array" type="Array">The Array to translate.</param>
            ///   <param name="callback(elementOfArray, indexInArray)" type="Function">The function to process each item against.  The first argument to the function is the array item, the second argument is the index in array The function can return any value. Within the function, this refers to the global (window) object.</param>
            ///   <returns type="Array" />
            /// </signature>
            /// <signature>
            ///   <summary>Translate all items in an array or object to new array of items.</summary>
            ///   <param name="arrayOrObject" type="Object">The Array or Object to translate.</param>
            ///   <param name="callback( value, indexOrKey )" type="Function">The function to process each item against.  The first argument to the function is the value; the second argument is the index or key of the array or object property. The function can return any value to add to the array. A returned array will be flattened into the resulting array. Within the function, this refers to the global (window) object.</param>
            ///   <returns type="Array" />
            /// </signature>
        },
        'merge': function () {
            /// <signature>
            ///   <summary>Merge the contents of two arrays together into the first array.</summary>
            ///   <param name="first" type="Array">The first array to merge, the elements of second added.</param>
            ///   <param name="second" type="Array">The second array to merge into the first, unaltered.</param>
            ///   <returns type="Array" />
            /// </signature>
        },
        'noConflict': function () {
            /// <signature>
            ///   <summary>Relinquish jQuery's control of the $ variable.</summary>
            ///   <param name="removeAll" type="Boolean">A Boolean indicating whether to remove all jQuery variables from the global scope (including jQuery itself).</param>
            ///   <returns type="Object" />
            /// </signature>
        },
        'noop': function () {
            /// <summary>An empty function.</summary>
        },
        'now': function () {
            /// <summary>Return a number representing the current time.</summary>
            /// <returns type="Number" />
        },
        'param': function () {
            /// <signature>
            ///   <summary>Create a serialized representation of an array or object, suitable for use in a URL query string or Ajax request.</summary>
            ///   <param name="obj" type="Object">An array or object to serialize.</param>
            ///   <returns type="String" />
            /// </signature>
            /// <signature>
            ///   <summary>Create a serialized representation of an array or object, suitable for use in a URL query string or Ajax request.</summary>
            ///   <param name="obj" type="Object">An array or object to serialize.</param>
            ///   <param name="traditional" type="Boolean">A Boolean indicating whether to perform a traditional "shallow" serialization.</param>
            ///   <returns type="String" />
            /// </signature>
        },
        'parseHTML': function () {
            /// <signature>
            ///   <summary>Parses a string into an array of DOM nodes.</summary>
            ///   <param name="data" type="String">HTML string to be parsed</param>
            ///   <param name="context" type="Element">DOM element to serve as the context in which the HTML fragment will be created</param>
            ///   <param name="keepScripts" type="Boolean">A Boolean indicating whether to include scripts passed in the HTML string</param>
            ///   <returns type="Array" />
            /// </signature>
        },
        'parseJSON': function () {
            /// <signature>
            ///   <summary>Takes a well-formed JSON string and returns the resulting JavaScript object.</summary>
            ///   <param name="json" type="String">The JSON string to parse.</param>
            ///   <returns type="Object" />
            /// </signature>
        },
        'parseXML': function () {
            /// <signature>
            ///   <summary>Parses a string into an XML document.</summary>
            ///   <param name="data" type="String">a well-formed XML string to be parsed</param>
            ///   <returns type="XMLDocument" />
            /// </signature>
        },
        'post': function () {
            /// <signature>
            ///   <summary>Load data from the server using a HTTP POST request.</summary>
            ///   <param name="url" type="String">A string containing the URL to which the request is sent.</param>
            ///   <param name="data" type="String">A plain object or string that is sent to the server with the request.</param>
            ///   <param name="success(data, textStatus, jqXHR)" type="Function">A callback function that is executed if the request succeeds.</param>
            ///   <param name="dataType" type="String">The type of data expected from the server. Default: Intelligent Guess (xml, json, script, text, html).</param>
            ///   <returns type="jqXHR" />
            /// </signature>
        },
        'proxy': function () {
            /// <signature>
            ///   <summary>Takes a function and returns a new one that will always have a particular context.</summary>
            ///   <param name="function" type="Function">The function whose context will be changed.</param>
            ///   <param name="context" type="PlainObject">The object to which the context (this) of the function should be set.</param>
            ///   <returns type="Function" />
            /// </signature>
            /// <signature>
            ///   <summary>Takes a function and returns a new one that will always have a particular context.</summary>
            ///   <param name="context" type="PlainObject">The object to which the context of the function should be set.</param>
            ///   <param name="name" type="String">The name of the function whose context will be changed (should be a property of the context object).</param>
            ///   <returns type="Function" />
            /// </signature>
            /// <signature>
            ///   <summary>Takes a function and returns a new one that will always have a particular context.</summary>
            ///   <param name="function" type="Function">The function whose context will be changed.</param>
            ///   <param name="context" type="PlainObject">The object to which the context (this) of the function should be set.</param>
            ///   <param name="additionalArguments" type="Anything">Any number of arguments to be passed to the function referenced in the function argument.</param>
            ///   <returns type="Function" />
            /// </signature>
            /// <signature>
            ///   <summary>Takes a function and returns a new one that will always have a particular context.</summary>
            ///   <param name="context" type="PlainObject">The object to which the context of the function should be set.</param>
            ///   <param name="name" type="String">The name of the function whose context will be changed (should be a property of the context object).</param>
            ///   <param name="additionalArguments" type="Anything">Any number of arguments to be passed to the function named in the name argument.</param>
            ///   <returns type="Function" />
            /// </signature>
        },
        'queue': function () {
            /// <signature>
            ///   <summary>Manipulate the queue of functions to be executed on the matched element.</summary>
            ///   <param name="element" type="Element">A DOM element where the array of queued functions is attached.</param>
            ///   <param name="queueName" type="String">A string containing the name of the queue. Defaults to fx, the standard effects queue.</param>
            ///   <param name="newQueue" type="Array">An array of functions to replace the current queue contents.</param>
            ///   <returns type="jQuery" />
            /// </signature>
            /// <signature>
            ///   <summary>Manipulate the queue of functions to be executed on the matched element.</summary>
            ///   <param name="element" type="Element">A DOM element on which to add a queued function.</param>
            ///   <param name="queueName" type="String">A string containing the name of the queue. Defaults to fx, the standard effects queue.</param>
            ///   <param name="callback()" type="Function">The new function to add to the queue.</param>
            ///   <returns type="jQuery" />
            /// </signature>
        },
        'removeData': function () {
            /// <signature>
            ///   <summary>Remove a previously-stored piece of data.</summary>
            ///   <param name="element" type="Element">A DOM element from which to remove data.</param>
            ///   <param name="name" type="String">A string naming the piece of data to remove.</param>
            ///   <returns type="jQuery" />
            /// </signature>
        },
        'sub': function () {
            /// <summary>Creates a new copy of jQuery whose properties and methods can be modified without affecting the original jQuery object.</summary>
            /// <returns type="jQuery" />
        },
        'support': function () {
            /// <summary>A collection of properties that represent the presence of different browser features or bugs. Primarily intended for jQuery's internal use; specific properties may be removed when they are no longer needed internally to improve page startup performance.</summary>
            /// <returns type="Object" />
        },
        'trim': function () {
            /// <signature>
            ///   <summary>Remove the whitespace from the beginning and end of a string.</summary>
            ///   <param name="str" type="String">The string to trim.</param>
            ///   <returns type="String" />
            /// </signature>
        },
        'type': function () {
            /// <signature>
            ///   <summary>Determine the internal JavaScript [[Class]] of an object.</summary>
            ///   <param name="obj" type="PlainObject">Object to get the internal JavaScript [[Class]] of.</param>
            ///   <returns type="String" />
            /// </signature>
        },
        'unique': function () {
            /// <signature>
            ///   <summary>Sorts an array of DOM elements, in place, with the duplicates removed. Note that this only works on arrays of DOM elements, not strings or numbers.</summary>
            ///   <param name="array" type="Array">The Array of DOM elements.</param>
            ///   <returns type="Array" />
            /// </signature>
        },
        'when': function () {
            /// <signature>
            ///   <summary>Provides a way to execute callback functions based on one or more objects, usually Deferred objects that represent asynchronous events.</summary>
            ///   <param name="deferreds" type="Deferred">One or more Deferred objects, or plain JavaScript objects.</param>
            ///   <returns type="Promise" />
            /// </signature>
        }
    }

})();





