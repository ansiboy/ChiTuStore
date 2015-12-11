import app = require('Application');
import ko_val = require('knockout.validation');

requirejs(['css!content/Shopping/Invoice']);

export = function (page: chitu.Page) {
    /// <param name="page" type="chitu.Page"/>

    var validation: KnockoutValidationErrors;
    var model = {
        invoice: {
            type: ko.observable('个人'),
            title: ko.observable('').extend({ required: true })
        },
        confirm: function () {
            validation = ko_val.group(model.invoice);
            if (!(<any>model.invoice).isValid()) {
                validation.showAllMessages();
                return;
            }
            var text = chitu.Utility.format('类型：{0}，抬头：{1}', model.invoice.type(), model.invoice.title());
            (<any>page).params.order.Invoice(text);
            app.back();
        },
        back: function () {
            app.back();
        }
    };

    page.load.add(function (sender, args) {
        (<any>page).params = args;
    });

    page.showing.add(function () {
        if (validation)
            validation.showAllMessages(false);
    });

    page.viewChanged.add(() => ko.applyBindings(model, page.node()));
}