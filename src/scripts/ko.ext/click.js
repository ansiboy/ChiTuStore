(function (factory) {
    var references = ['knockout', 'jquery', 'bootstrap'];
    if (typeof define === 'function' && define.amd) {
        define(references, factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require(references));
    } else {
        window.chitu = factory(ko);
    }
})(function () {

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
                            deferred = deferred.pipe($.proxy(function () {
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
                            { confirm_text: confirm_text }));
                        };

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

});