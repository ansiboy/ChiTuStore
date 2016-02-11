/// <reference path='../../../Scripts/typings/require.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.validation.d.ts' />
define(["require", "exports", 'Application', 'knockout.validation'], function (require, exports, app, ko_val) {
    requirejs(['css!content/Shopping/Invoice']);
    return function (page) {
        /// <param name="page" type="chitu.Page"/>
        var validation;
        var model = {
            invoice: {
                type: ko.observable('个人'),
                title: ko.observable('').extend({ required: true })
            },
            confirm: function () {
                validation = ko_val.group(model.invoice);
                if (!model.invoice.isValid()) {
                    validation.showAllMessages();
                    return;
                }
                var text = chitu.Utility.format('类型：{0}，抬头：{1}', model.invoice.type(), model.invoice.title());
                page.params.order.Invoice(text);
                app.back();
            },
            back: function () {
                app.back();
            }
        };
        page.load.add(function (sender, args) {
            page.params = args;
        });
        page.showing.add(function () {
            if (validation)
                validation.showAllMessages(false);
        });
        page.viewChanged.add(function () { return ko.applyBindings(model, page.node); });
    };
});
