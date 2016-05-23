var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'Services/Account', 'Services/Shopping', 'knockout.mapping', 'Application'], function (require, exports, account, shopping, mapping, app) {
    requirejs(['css!content/User/ReceiptList']);
    var PageModel = (function () {
        function PageModel(page) {
            this.status = ko.observable('none');
            this.receipt = {};
            this.receipts = ko.observableArray();
            this.selectedItemId = ko.observable();
            this.allowSelect = ko.observable(false);
            this.noSelect = ko.observable(true);
            this.page = page;
        }
        PageModel.prototype.deleteReceipt = function (item, event) {
            var self = this;
            return account.deleteReceiptInfo(item.Id()).done(function () {
                self.receipts.remove(item);
            });
        };
        PageModel.prototype.modifyReceipt = function (item, event) {
            app.redirect('#User_ReceiptEdit', { receipt: item });
        };
        PageModel.prototype.newReceipt = function (model, event) {
            app.redirect('#User_ReceiptEdit', { receipts: model.receipts });
        };
        PageModel.prototype.setAddress = function (item, event) {
            debugger;
            var order = this.page['order'];
            if (order) {
                order.ReceiptAddress(item.Detail());
                order.ReceiptInfoId(item.Id());
                order.ReceiptRegionId(item.CountyId());
                shopping.changeReceipt(order.Id(), item.Id())
                    .done(function (data) {
                    mapping.fromJS(data, {}, order);
                });
            }
            this.selectedItemId(item.Id());
            app.back();
        };
        PageModel.prototype.setDefaultReceipt = function (item) {
            return account.setDefaultReceipt(ko.unwrap(item.Id)).done(function () {
                var receipts = this.receipts();
                for (var i = 0; i < receipts.length; i++) {
                    receipts[i].IsDefault(false);
                }
                item.IsDefault(true);
            });
        };
        PageModel.prototype.back = function () {
            app.back().fail(function () {
                app.redirect('User_Index');
            });
        };
        return PageModel;
    })();
    var ReceiptListPage = (function (_super) {
        __extends(ReceiptListPage, _super);
        function ReceiptListPage() {
            _super.call(this);
            this.model = new PageModel(this);
            this.load.add(this.page_load);
        }
        ReceiptListPage.prototype.page_load = function (sender, args) {
            if (args.order) {
                sender['order'] = args.order;
            }
            ko.applyBindings(sender.model, sender.element);
            return account.getReceiptInfos().done(function (receipts) {
                mapping.fromJS(receipts, {}, sender.model.receipts);
            });
        };
        return ReceiptListPage;
    })(chitu.Page);
    return ReceiptListPage;
});
