var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'Application', 'knockout.validation'], function (require, exports, app, ko_val) {
    requirejs(['css!content/Shopping/Invoice']);
    var PageModel = (function () {
        function PageModel(page) {
            this.invoice = {
                type: ko.observable('个人'),
                title: ko.observable('').extend({ required: true })
            };
            this.page = page;
        }
        PageModel.prototype.confirm = function (model) {
            model.validation = ko_val.group(model.invoice);
            if (!model.invoice.isValid()) {
                model.validation.showAllMessages();
                return;
            }
            var text = chitu.Utility.format('类型：{0}，抬头：{1}', model.invoice.type(), model.invoice.title());
            model.order.Invoice(text);
            app.back();
        };
        PageModel.prototype.back = function () {
            app.back();
        };
        return PageModel;
    })();
    var InvoicePage = (function (_super) {
        __extends(InvoicePage, _super);
        function InvoicePage(html) {
            _super.call(this, html);
            this.model = new PageModel(this);
            this.load.add(function (sender, args) {
                ko.applyBindings(sender.model, sender.element);
            });
            this.showing.add(function (sender, args) {
                if (sender.model.validation)
                    sender.model.validation.showAllMessages(false);
            });
        }
        InvoicePage.prototype.page_load = function (sender, args) {
        };
        return InvoicePage;
    })(chitu.Page);
});
