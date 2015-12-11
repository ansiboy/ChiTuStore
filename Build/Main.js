/*!
* jQuery Cookie Plugin v1.4.0
* https://github.com/carhartl/jquery-cookie
*
* Copyright 2013 Klaus Hartl
* Released under the MIT license
*/
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define('jquery.cookie',['jquery'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var pluses = /\+/g;

    function encode(s) {
        return config.raw ? s : encodeURIComponent(s);
    }

    function decode(s) {
        return config.raw ? s : decodeURIComponent(s);
    }

    function stringifyCookieValue(value) {
        return encode(config.json ? JSON.stringify(value) : String(value));
    }

    function parseCookieValue(s) {
        if (s.indexOf('"') === 0) {
            // This is a quoted cookie as according to RFC2068, unescape...
            s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }

        try {
            // Replace server-side written pluses with spaces.
            // If we can't decode the cookie, ignore it, it's unusable.
            // If we can't parse the cookie, ignore it, it's unusable.
            s = decodeURIComponent(s.replace(pluses, ' '));
            return config.json ? JSON.parse(s) : s;
        } catch (e) { }
    }

    function read(s, converter) {
        var value = config.raw ? s : parseCookieValue(s);
        return $.isFunction(converter) ? converter(value) : value;
    }

    var config = $.cookie = function (key, value, options) {

        // Write

        if (value !== undefined && !$.isFunction(value)) {
            options = $.extend({}, config.defaults, options);

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setTime(+t + days * 864e+5);
            }

            return (document.cookie = [
            encode(key), '=', stringifyCookieValue(value),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
            ].join(''));
        }

        // Read

        var result = key ? undefined : {};

        // To prevent the for loop in the first place assign an empty array
        // in case there are no cookies at all. Also prevents odd result when
        // calling $.cookie().
        var cookies = document.cookie ? document.cookie.split('; ') : [];

        for (var i = 0, l = cookies.length; i < l; i++) {
            var parts = cookies[i].split('=');
            var name = decode(parts.shift());
            var cookie = parts.join('=');

            if (key && key === name) {
                // If second argument (value) is a function it's a converter...
                result = read(cookie, value);
                break;
            }

            // Prevent storing a cookie that we couldn't decode.
            if (!key && (cookie = read(cookie)) !== undefined) {
                result[name] = cookie;
            }
        }

        return result;
    };

    config.defaults = {};

    $.removeCookie = function (key, options) {
        if ($.cookie(key) === undefined) {
            return false;
        }

        // Must not alter options, thus extending a fresh object...
        $.cookie(key, '', $.extend({}, options, { expires: -1 }));
        return !$.cookie(key);
    };

}));
(function (factory) {
    var references = ['knockout', 'app/Application'];
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
                            if (config && config.type == 'flash') {
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
        var org_site = 'http://weixinmanage.lanfans.com';
        if (src.substr(0, 1) == '/') {
            src = site.config.imageServer + src;
        }
        else if (src.length > org_site.length && src.substr(0, org_site.length) == org_site) {
            src = site.config.imageServer + src.substr(org_site.length);
        }

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
define("ko.ext/knockout.extentions", function(){});

(function (factory) {
    if (typeof define === 'function') {
        define('app/Site',['jquery.cookie'], factory);
    }
    else {
        factory();
    }

})(function () {

    window.site = window.site || {};

    site.config = {
        storeName: '零食有约',
        pageSize: 10,
        serviceUrl: 'http://shop.alinq.cn/UserServices/Shop/',//
        memberServiceUrl: 'http://shop.alinq.cn/UserServices/Member/',//
        weixinServiceUrl: 'http://shop.alinq.cn/UserServices/WeiXin/',//
        defaultUrl: 'Index',
        purchaseUrlFormat: 'pay/Purchase.html#{0}',
        imageServer: 'http://a.alinq.cn/LSYY/'//'http://weixinmanage.lanfans.com',//
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





(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('chitu',['jquery'], factory);
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
                $(page.node()).html(html);
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
});
(function (factory) {
    if (typeof define === 'function')
        define('app/Application',['chitu'], factory);
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
requirejs.config({
    urlArgs: "bust=32",
    shim: {
        chitu: {
            deps: ['jquery'],
            exports: 'chitu'
        },
        bootstrap: {
            deps: ['jquery']
        },
        bootbox: {
            deps: ['bootstrap']
        },
        'ko.val': {
            deps: ['knockout.validation']
        },
        'ko.mapping': {
            deps: ['knockout']
        },
        'ko.ext': {
            deps: ['knockout']
        },
        backtop: {
            deps: ['jquery']
        },
        //swiper: {
        //    deps: ['css!http://cdn.bootcss.com/Swiper/3.0.8/css/swiper.min']
        //},
        'CryptoJS/md5': {
            deps: ['CryptoJS/core']
        },
        //'prequire': {
        //    deps: ['jquery', 'jquery.cookie', 'knockout']
        //},
        //'app/Custom': {
        //    deps: ['prequire'],//说明：'sv/Member' 已经合并到 prequire 文件中去了。
        //},
        //'ui/ScrollLoad': {
        //    deps: ['prequire']
        //},
        //'sv/WeiXin': {
        //    deps: ['prequire']
        //},
    },
    baseUrl: 'Scripts',
    //paths: {
    //    text: 'require.text',
    //    jquery: 'jquery-2.1.0',
    //    'jquery.cookie': 'jquery.cookie',
    //    chitu: 'ChiTu',
    //    knockout: 'knockout-3.2.0.debug',
    //    'ko.ext': 'knockout.extentions',
    //    'ko.val': 'knockout.validation.cn',
    //    'ko.mapping': 'knockout.mapping',
    //    crossroads: 'crossroads',
    //    bootstrap: 'bootstrap.min',
    //    bootbox: 'bootbox.cn',
    //    sv: '../App/Services',
    //    app: '../App',
    //    ui: '../App/UI',
    //    swiper: 'swiper.jquery',
    //    content: '../Content'
    //}
    paths: {
        css: ['http://cdn.bootcss.com/require-css/0.1.8/css.min', 'css'],
        text: ['http://cdn.bootcss.com/require-text/2.0.12/text.min', 'text'],
        jquery: ['http://libs.baidu.com/jquery/2.0.0/jquery.min', 'jquery-2.1.0'],// 
        'jquery.cookie': ['http://cdn.bootcss.com/jquery-cookie/1.4.0/jquery.cookie.min', 'jquery.cookie'],
        unslider: 'unslider',
        chitu: 'ChiTu',
        knockout: ['http://cdn.bootcss.com/knockout/3.3.0/knockout-min', 'knockout-3.2.0.debug'],
        'ko.ext': 'knockout.extentions',
        'ko.val': 'knockout.validation.cn',
        'ko.mapping': ['http://cdn.bootcss.com/knockout.mapping/2.4.1/knockout.mapping.min', 'knockout.mapping'],
        bootstrap: ['http://cdn.bootcss.com/bootstrap/3.3.4/js/bootstrap.min', 'bootstrap.min'],
        sv: '../App/Services',
        app: '../App',
        ui: '../App/UI',
        swiper: ['http://cdn.bootcss.com/Swiper/3.0.8/js/swiper.jquery.min', 'swiper.jquery'],
        content: '../Content',
        //prequire: '../App/Core/prequire',
        'app/Custom': 'http://p.alinq.cn/LSYY/App/WebClient/StoreToken'
    }
});

define('../App/Main',['jquery', 'jquery.cookie', 'ko.ext/knockout.extentions', 'app/Site', 'app/Application'], function () {

    window['ko'] = arguments[2];

    var getSiteConfig = $.ajax('Home/GetSiteConfig');

    //====================================================
    // 说明：如果是微信环境，则加载微信模块
    var weiXinChecked = $.Deferred();
    var ua = navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
        requirejs(['sv/WeiXin'], function () {
            weiXinChecked.resolve();
        });
    }
    else {
        weiXinChecked.resolve();
    }
    //====================================================
    $.when(getSiteConfig, weiXinChecked).done(function (data) {
        //==================================================
        // 说明：必须设置好 config 才能执行 app.run
        var config = data[0];
        site.config.cookiePrefix = config.CookiePrefix;
        site.config.serviceUrl = site.cookies.get_value('shopServiceUrl');
        site.config.memberServiceUrl = site.cookies.get_value('memberServiceUrl');
        site.config.weixinServiceUrl = site.cookies.get_value('weixinServiceUrl');
        //==================================================
        app.run();
        //==================================================
    });

    require(['ui/Menu', 'app/ErrorHandler', 'ui/Loading', 'ui/TopBar']);
});

//});



