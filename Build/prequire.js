(function (factory) {
    if (typeof define === 'function')
        define(['chitu', 'ui/ScrollLoad'], factory);
    else
        factory();

})(function () {
    var app = new chitu.Application(document.getElementById('main'));

    var viewPath = '../App/Module/{controller}/{action}.html';
    var actionPath = '../App/Module/{controller}/{action}';

    var sourceOpenIdRule = /^[o1Ux1u|o4mqUj]\S+/;   //正式账号的openid以o1Ux1u开始，测试账号以o4mqUj开始
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
            type: ['category', 'brand', 'search'],
            sourceOpenId: sourceOpenIdRule
        }
    });


    var pages = [];
    var display_page_zIndex = 81932759;
    var hidden_page_zIndex = 0;

    //app.back = $.proxy(function () {

    //    if (window.history.length == 0)
    //        return $.Deferred().reject();


    //    window.history.back();
    //    return $.Deferred().resolve();

    //}, app);



    window.app = app;
    return app;
})
(function (factory) {
    if (typeof define === 'function') {
        define(['jquery.cookie', 'CryptoJS/md5'], factory);
    }
    else {
        factory();
    }

})(function () {

    window.site = window.site || {};

    site.config = {
        storeName: '蓝微手淘',
        pageSize: 20,
        //serviceUrl: 'http://localhost:4383/',//
        //memberServiceUrl: 'http://localhost:12881/',//
        //weixinServiceUrl: 'http://localhost:7208/',//
        //serviceUrl: 'http://temp.alinq.cn/userservice/',//
        //memberServiceUrl: 'http://temp.alinq.cn/userservice/',//
        //weixinServiceUrl: 'http://temp.alinq.cn/userservice/',//
        serviceUrl: 'http://shop.alinq.cn/UserServices/',
        memberServiceUrl: 'http://shop.alinq.cn/UserServices/',
        weixinServiceUrl: 'http://shop.alinq.cn/UserServices/',
        customServiceUrl: 'http://localhost:63778/',
        appid: 'wxf0bb634c8352c4f3',//'wxe621f4e5e90b13cd',// //
        defaultUrl: 'Index',
        mainNodeId: 'main',
        purchaseUrlFormat: 'pay/Purchase.html#{0}',
        imageServer: 'http://admin.alinq.cn'//'http://weixinmanage.lanfans.com',//
    };

    site.config.weixin = {
        appid: 'wxf0bb634c8352c4f3',
        key: 'e6ce53f5054c4d6c0dacd2360996a98b',//'a312b8e09667d4b9c25fae66c5822d6e'
    };

    var cookie_prefix = 'LSYY';

    site.cookies = {
        sourceOpenId: function (value) {
            if (value === undefined)
                return $.cookie(cookie_prefix + '_SourceOpenId');

            if (!$.cookie(cookie_prefix + '_SourceOpenId'))
                $.cookie(cookie_prefix + '_SourceOpenId', value, { expires: 7 });
        },
        returnUrl: function (value) {
            if (value === undefined)
                return $.cookie(cookie_prefix + '_ReturnUrl');

            $.cookie(cookie_prefix + '_ReturnUrl', value);
        },
        openId: function (value) {

            $.cookie(cookie_prefix + '_OpenId', 'oOjaNt34NrbKUt98jSWwKDo87yDw');//'o1Ux1uHZkxsST2_8Fiy_dJfziqbQ');oOjaNt34NrbKUt98jSWwKDo87yDw

            if (value === undefined)
                return $.cookie(cookie_prefix + '_OpenId');

            $.cookie(cookie_prefix + '_OpenId', value);
        },
        appToken: function (value) {
            if (value === undefined)
                return $.cookie(cookie_prefix + '_AppToken');

            $.cookie(cookie_prefix + '_AppToken', value);
        },
        token: function (value) {
            if (value === undefined)
                return $.cookie(cookie_prefix + '_Token');

            $.cookie(cookie_prefix + '_Token', value);
        },
        set_value: function (name, value) {
            $.cookie(cookie_prefix + "_" + name, value);
        },
        get_value: function (name) {
            return $.cookie(cookie_prefix + "_" + name);
        }
    }

    site.getAppToken = function () {
        /// <returns type="jQuery.Deferred"/>
        if (site.cookies.appToken())
            return $.Deferred().resolve(site.cookies.appToken());

        var appId = '7bbfa36c-8115-47ad-8d47-9e52b58e7efd';//'7bbfa36c-8115-47ad-8d47-9e52b58e7efd';
        var appSecret = 'Ymt7uwVe';// 'Ymt7uwVe';

        return $.ajax({
            url: site.config.memberServiceUrl + 'Auth/GetAppToken',
            data: { appId: appId, appSecret: appSecret }
        })
        .then(function (data) {

            site.cookies.appToken(data.AppToken);//DA4A5B44C12F4E9D8E0872C4FDA8A6ABA2C0334CDB81CF84F12E29F7FB129F72F6EA604995785165
            return data.AppToken;
        });
    }
    //site.cookies.token('');

});





(function (factory) {
    var references = ['knockout', 'app/Application'];
    if (typeof define === 'function' && define.amd) {
        define(references, factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require(references));
    } else {
        window.chitu = factory($, ko);
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

    var _click = ko.bindingHandlers.click;
    ko.bindingHandlers.click = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = ko.unwrap(valueAccessor());
            if (value != null) {
                valueAccessor = function () {
                    return function (viewModel, argsForHandler) {
                        var confirm_text = $(element).attr('data-confirm');

                        var deferred = $.Deferred();
                        deferred.resolve();

                        if (confirm_text) {
                            deferred = deferred.pipe($.proxy(
                                function () {
                                    var result = $.Deferred();
                                    var confirm_text = this.confirm_text;

                                    require(['text!ko.ext/ComfirmDialog.html'], function (html) {
                                        var node = $(html).appendTo(document.body).modal()[0];

                                        var model = {
                                            text: confirm_text,
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
                                },
                                { confirm_text: confirm_text })
                            );
                        }

                        deferred = deferred.pipe(function () {

                            var result = $.isFunction(value) ? value(viewModel, argsForHandler) : value;

                            if (result && $.isFunction(result.always)) {
                                $(element).attr('disabled', 'disabled');
                                $(element).addClass('disabled');

                                result.always(function () {
                                    $(element).removeAttr('disabled');
                                    $(element).removeClass('disabled');
                                });
                            }
                            return result;
                        });

                        return deferred;
                    };
                };
            }
            return _click.init(element, valueAccessor, allBindings, viewModel, bindingContext);
        }
    };


    //===============================================================================
    // 说明：处理图片的懒加载。
    function getImageUrl(src) {
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
                //debugger;
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

    var _attr = ko.bindingHandlers.attr;
    ko.bindingHandlers.attr = (function () {

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

        return {
            'update': function (element, valueAccessor, allBindings) {
                if (element.tagName == 'IMG') {
                    var value = ko.utils.unwrapObservable(valueAccessor()) || {};
                    ko.utils.objectForEach(value, function (attrName, attrValue) {
                        var src = ko.unwrap(attrValue);
                        if (attrName != 'src' || !src)
                            return true;

                        //==========================================================
                        // 说明：替换图片路径


                        //==========================================================

                        var match = src.match(/_\d+_\d+/);
                        if (match && match.length > 0) {
                            var arr = match[0].split('_');
                            var img_width = new Number(arr[1]).valueOf();
                            var img_height = new Number(arr[2]).valueOf();

                            //debugger;
                            $(element).attr('width', img_width + 'px');
                            $(element).attr('height', img_height + 'px');

                            //================================================
                            // 为了便于绘制文字，固定宽度

                            //================================================

                            var src_replace = getLogoImage(img_width, img_height);

                            valueAccessor = $.proxy(function () {
                                var obj = ko.utils.unwrapObservable(this._source());
                                var src = ko.unwrap(obj.src);
                                obj.src = this._src;

                                var img_node = this._element;
                                var image = new Image();
                                image.onload = function(){
                                    img_node.src = this.src;
                                }
                                image.src = getImageUrl(src);

                                return obj;

                            }, { _source: valueAccessor, _src: src_replace, _element: element });
                        }
                        else {
                            debugger;
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
            var value = ko.utils.unwrapObservable(valueAccessor()) || {};
            var div = document.createElement('div');
            div.innerHTML = value;
            var $img = $(div).find('img');
            if ($img.length == 0)
                return _html.update(element, valueAccessor, allBindings);

            $img.each(function () {
                var org_site = 'http://weixinmanage.lanfans.com';
                var src = $(this).attr('src');
                if (src.substr(0, 1) == '/') {
                    $(this).attr('src', site.config.imageServer + src);
                }
                else if (src.length > org_site.length && src.substr(0, org_site.length) == org_site) {
                    src = site.config.imageServer + src.substr(org_site.length);
                    $(this).attr('src', src);
                }
                $(this).addClass('img-full');
            });
            value = div.innerHTML;
            valueAccessor = $.proxy(function () {
                return this._value;
            }, { _valueAccessor: valueAccessor, _value: value });
            return _html.update(element, valueAccessor, allBindings);
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
            $(element).on("tap", $.proxy(function (event) {

                this._valueAccessor()(viewModel, event);

            }, { _valueAccessor: valueAccessor }));
        }
    }

})
//===============================================
// 说明：用来显现加载状态的窗口
define(['app/Application', 'text!ui/Loading.html'], function (app, html) {
    var $loadingForm = $(html).insertAfter($('#main'));
    app.pageCreated.add(function (sender, page) {
        /// <param name="page" type="chitu.Page"/>
        page.showing.add(function (sender) {
            if (window['bootbox'])
                bootbox.hideAll();

            $('#main').hide();
            $loadingForm.show();
        });

        page.shown.add(function (sender) {
            /// <param name="sender" type="chitu.Page"/>
            $loadingForm.hide();
            $('#main').show();
        });

    });

})



define(['app/Application', 'text!ui/Menu.html', 'app/Site', 'knockout'], function (app, html) {
    /// <param name="app" type="chitu.Application"/>
    if (arguments.length > 0) {
        window['ko'] = arguments[3];
    }
    var node = document.createElement('div');
    node.innerHTML = html;
    $(node).insertAfter($('#main'));

    app.pageCreated.add(function (sender, page) {
        /// <param name="page" type="chitu.Page"/>

        //=================================================================
        function hideMenu() {
            var $menu = $('.menu');
            if (!$menu.is(':visible')) {
                return;
            }

            //showButtonBar(pageName);
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



        page.shown.add(function (sender) {
            /// <param name="sender" type="chitu.Page"/>

            hideButtonBar();
            var $menu = $('.menu');
            // 说明：将菜单中的项高亮
            var args = sender.context().routeData();
            var $tab = $(document.getElementById(args.controller + '_' + args.action))
            if ($tab.length > 0) {
                $menu.find('a').removeClass('active');
                $tab.addClass('active');
            }
            //else {

            //}

            var pageName = page.name();
            if (pageName == 'Home.ProductList' || pageName == 'Home.Product' || pageName == 'Home.News') {
                hideMenu(pageName);
                page.node().style.marginBottom = '0px';
            }
            else {
                showMenu(pageName);
                page.node().style.marginBottom = site.menu.height + 'px';
            }
        });


        //=================================================================
        // 在底部菜单在点击文本框架的时候，隐藏菜部，以避免菜单会把输入框档住。
        page.shown.add(function (sender, args) {
            /// <param name="sender" type="chitu.Page"/>
            //debugger;
            if (sender.name() != 'User.Login' && sender.name() != 'User.Register') {
                return;
            }

            var showFootMenu;
            if (!sender._setfocust) {
                sender._setfocust = true;
                var $input = $(sender.node()).find('input');
                $input.focusin(function () {
                    //model.visible(false);
                    showFootMenu = false;
                    hideMenu();
                });
                $input.focusout(function () {
                    showFootMenu = true;
                    //==============================================
                    // 为了修正手机键盘弹出来，底部的菜单显示位不正确
                    window.setTimeout(function () {
                        $(document).scrollTop(document.body.scrollTop);
                        if (showFootMenu) {
                            showMenu();
                        }
                        //model.visible(true);
                    }, 10);
                    //==============================================
                });
            }
        });
        //=================================================================
        page.shown.add(function (sender, args) {
            /// <param name="sender" type="chitu.Page"/>

            var pageName = sender.name();
            if (pageName == 'Home.ProductList' || pageName == 'Home.Product' || pageName == 'Home.News') {
                showButtonBar(pageName);
            }
        });
    });

    var model = {
        productsCount: ko.observable(0),
        visible: ko.observable(true)
    };

    ko.applyBindings(model, node);

    requirejs(['sv/Account', 'sv/ShoppingCart'], function () {
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
            debugger;
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

    site.menu = {
        isVisible: function () {
            return $('.menu').is(':visible');
        },
        visibleChanged: $.Callbacks(),
        height: $('.menu').height()
    };

    site.buttonBar = {
        element: $('#footer').find('[name="bttonBar"]')[0],
        isVisible: function () {
            return $('#footer').find('[name="bttonBar"]').is(':visible');
        },
        back: $.Callbacks()
    }

    function showButtonBar(pageName) {

        $(site.buttonBar.element).find('.glyphicon-shopping-cart, .glyphicon-home').parent().hide();
        switch (pageName) {
            case 'Home.Product':
                $(site.buttonBar.element).find('.glyphicon-shopping-cart').parent().show();
                break;
            case 'Home.News':
            case 'Home.ProductList':
                $(site.buttonBar.element).find('.glyphicon-home').parent().show();
                break;
        }

        $(site.buttonBar.element).show();
    }

    function hideButtonBar(pageName) {
        $(site.buttonBar.element).hide();
    }

    $(site.buttonBar.element).find('.glyphicon-menu-left').on('click', function () {
        site.buttonBar.back.fire({});
    });

    $(site.buttonBar.element).find('.glyphicon-home').on('click', function () {
        app.redirect('Home_Index');
    });

    $(site.buttonBar.element).find('.glyphicon-shopping-cart').on('click', function () {
        app.redirect('Shopping_ShoppingCart');
    });


});
(function (factory) {
    if (typeof define === 'function') {
        define(['sv/Services'], factory);
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
            _ajax(options).done($.proxy(function (data) {
                if (data.Type == 'ErrorObject') {
                    if (data.Code == 'Success') {
                        this._result.resolve(data);
                        return;
                    }

                    services.error.fire(data);
                    this._result.reject(data);

                    return;
                }

                this._result.resolve(data);
            }, { _result: result }))
            .fail($.proxy(function (jqXHR, textStatus) {
                //debugger;
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
    (function() {
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
});
define(['bootbox', 'sv/Services', 'app/Application'], function () {
    if (arguments.length > 0) {
        window['bootbox'] = arguments[0];
        window['bootbox'].setDefaults({ locale: 'zh_CN' });
    }


    services.error.add(function (error) {
        if (error.Code == 'NotLogin' || error.Code == 'TokenRequired') {
            var return_url = '';
            if (location.hash.length > 1)
                return_url = location.hash.substr(1);

            return app.showPage('User_Login', { redirectUrl: return_url });
        };
        showError(error);
    });

    function showError(data) {
        require(['bootbox'], function () {
            if (arguments.length > 0) {
                window.bootbox = arguments[0];
            }
            var alert = bootbox.alert;
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
                            msg = chitu.Utility.format('未知的错误(Code:{0},{1})', data.Code, data.Message);
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
                            msg = chitu.Utility.format('未知的错误(Code:{0},{1})', data.Code, data.Message);
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
        });
    }
});