(function (factory) {
    if (typeof define === 'function')
        define(['knockout'], factory);
    else
        factory(ko);

})(function () {
    if (!window['ko'])
        window['ko'] = arguments[0];

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
                return chitu.utility.format("{0}-{1}-{2}", this.getFullYear(), this.getMonth() + 1, this.getDate());
            case 'g':
                return chitu.utility.format("{0}-{1}-{2} {3}:{4}", this.getFullYear(), this.getMonth() + 1, this.getDate(), this.getHours(), this.getMinutes());
            case 'G':
                return chitu.utility.format("{0}-{1}-{2} {3}:{4}:{5}", this.getFullYear(), this.getMonth() + 1, this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds());
            case 't':
                return chitu.utility.format("{0}:{1}", this.getHours(), this.getMinutes());
            case 'T':
                return chitu.utility.format("{0}:{1}:{2}", this.getHours(), this.getMinutes(), this.getSeconds());
        }

        if (format != null && $.datepicker != null)
            return $.datepicker.formatDate(format, this)

        return this.toString();
    };

    function formatString(useLocale, args) {
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
    };

    function money(element, valueAccessor) {
        var str = formatString(true, ['￥{0:C2}', valueAccessor()]);
        $(element).html(str);
    };

    ko.bindingHandlers.money = {
        init: function (element, valueAccessor) {
            money(element, valueAccessor);
        },
        update: function (element, valueAccessor) {
            money(element, valueAccessor);
        }
    };
});