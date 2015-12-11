import site = require('Site');

export module extend {
    //===========================================================================
    // jquery ajax 扩展

    var _ajax = $.ajax;
    $.extend($, {
        ajax: function (options) {
            options.data = options.data || {};
            var result = $.Deferred();
            _ajax(options).done($.proxy(function (data, textStatus, jqXHR) {
                //if (site.env.is_iis() == undefined) {
                //    var is_iis = jqXHR.getResponseHeader('X-Powered-By') == 'ASP.NET';
                //    site.env.is_iis(true);
                //}
              
                if (data.Type == 'ErrorObject') {
                    if (data.Code == 'Success') {
                        this._result.resolve(data, textStatus, jqXHR);
                        return;
                    }

                    if ($.isFunction(this._result.element)) {
                        data.element = this._result.element();
                    }

                    site.error.fire(data, textStatus, jqXHR);
                    this._result.reject(data, textStatus, jqXHR);

                    return;
                }

                this._result.resolve(data, textStatus, jqXHR);
            }, { _result: result }))
                .fail($.proxy(function (jqXHR, textStatus) {

                    var err = { Code: textStatus, status: jqXHR.status, Message: jqXHR.statusText };
                    if ($.isFunction(this._result.element)) {
                        err['element'] = this._result.element();
                    }

                    site.error.fire(err);
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
}


