import ko = require('knockout');
import $ = require('jquery');
import site = require('Site');

var ToastDialogHtml =
    '<div class="modal fade"> \
    <div class="modal-dialog"> \
        <div class="modal-content"> \
            <div class="modal-body"> \
                <h5 data-bind="html:text"></h5> \
            </div> \
        </div> \
    </div> \
</div>';
var ComfirmDialogHtml =
    '<div class="modal fade"> \
    <div class="modal-dialog"> \
        <div class="modal-content"> \
            <div class="modal-body"> \
                <h5 data-bind="html:text"></h5> \
            </div> \
            <div class="modal-footer"> \
                <button data-bind="click:cancel" type="button" class="btn btn-default" data-dismiss="modal">取消</button> \
                <button data-bind="click:ok" type="button" class="btn btn-primary">确认</button> \
            </div> \
        </div> \
    </div> \
</div>';

Number.prototype['toFormattedString'] = function (format) {
    var reg = new RegExp('^C[0-9]+');
    if (reg.test(format)) {
        var num = format.substr(1);
        return this.toFixed(num);
    }
    return this;
};

Date.prototype['toFormattedString'] = function (format) {
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
                throw new Error('format,Sys.Res.stringFormatBraceMismatch');
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
            throw new Error('format,Sys.Res.stringFormatBraceMismatch');


        var brace = format.substring(i, close);
        var colonIndex = brace.indexOf(':');
        var argNumber = parseInt((colonIndex < 0) ? brace : brace.substring(0, colonIndex), 10) + 1;
        if (isNaN(argNumber)) throw new Error('format,Sys.Res.stringFormatInvalid');
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
    var str;
    var value = valueAccessor();
    if (value < 0) {
        str = formatString(true, ['-￥{0:C2}', Math.abs(value)]);
    }
    else {
        str = formatString(true, ['￥{0:C2}', value]);
    }
    element.innerHTML = str;
};
ko.bindingHandlers['money'] = {
    init: function (element, valueAccessor) {
        money(element, valueAccessor);
    },
    update: function (element, valueAccessor) {
        money(element, valueAccessor);
    }
};
var text = function (element: HTMLElement, valueAccessor) {
    var value = valueAccessor();
    var str = $.isArray(value) ? formatString(true, value) : ko.unwrap(value);
    //debugger;
    element.innerText = str;
    //ko.utils.setTextContent(element, str);
}
ko.bindingHandlers.text = {
    init: function (element, valueAccessor) {
        return text(element, valueAccessor);
    },
    update: function (element, valueAccessor) {
        return text(element, valueAccessor);
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
ko.bindingHandlers['href'] = {
    init: function (element, valueAccessor) {
        href(element, valueAccessor);
    },
    update: function (element, valueAccessor) {
        href(element, valueAccessor);
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

            var deferred: JQueryPromise<any> = $.Deferred<any>().resolve();

            //if (dlg_config) {
            var config = getConfig(element, 'data-dialog');
            var content = config.content;
            var dialog_type;
            if ($.isFunction(config.type) && config.type.name != null) {
                dialog_type = config.type.name;
            }
            else {
                dialog_type = config.type;
            }

            if (dialog_type == 'confirm') {
                deferred = deferred.pipe(function () {
                    var result = $.Deferred();

                    //require(['text!ko.ext/ComfirmDialog.html'], function (html) {
                    var html = ComfirmDialogHtml;
                    var node = $(html).appendTo(document.body)['modal']()[0];

                    var model = {
                        text: content,
                        ok: function () {
                            $(node)['modal']('hide');
                            result.resolve();
                        },
                        cancel: function () {
                            result.reject();
                        }
                    }

                    ko.applyBindings(model, node);
                    //});

                    return result;
                });
            }
            //}

            deferred = deferred.pipe(function () {
                var result = $.isFunction(value) ? value(viewModel, event) : value;
                if (result && $.isFunction(result.always)) {
                    $(element).attr('disabled', 'disabled');
                    $(element).addClass('disabled');
                    result.element = element;

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
                        if (config && dialog_type == 'toast') {
                            //require(['text!ko.ext/ToastDialog.html'], function (html) 
                            var html = ToastDialogHtml;
                            var node = $(html).appendTo(document.body)['modal']()[0];

                            var model = {
                                text: content
                            }

                            window.setTimeout(function () {
                                $(node)['modal']('hide');
                                $(node).remove();
                            }, 1000);

                            ko.applyBindings(model, node);
                            //});
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
// TODO：在窗口内的图片才显示，使用 getClientRects 或 getBoundingClientRect 可以获得图片的位置。
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
    var height = width * new Number(scale).valueOf();

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
                ko.utils['objectForEach'](value, function (attrName, attrValue) {
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

ko.bindingHandlers['tap'] = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        valueAccessor = translateClickAccessor(element, valueAccessor, allBindings, viewModel, bindingContext);
        $(element).on("tap", $.proxy(function (event) {

            this._valueAccessor()(viewModel, event);

        }, { _valueAccessor: valueAccessor }));
    }
}

//    return ko;

//})

window['ko'] = ko;
export = ko;