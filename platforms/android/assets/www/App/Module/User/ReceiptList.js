/// <reference path='../../../Scripts/typings/require.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.validation.d.ts' />
define(["require", "exports", 'Services/Account', 'Services/Shopping', 'knockout.mapping', 'Application'], function (require, exports, account, shopping, mapping, app) {
    requirejs(['css!content/User/ReceiptList']);
    var func = function (page) {
        var status_none = 'none';
        var status_modify = 'modify';
        var status_new = 'new';
        var on_receiptUpdated = function (item) {
            if (ko.unwrap(item.IsDefault)) {
                var receipts = model.receipts();
                for (var i = 0; i < receipts.length; i++) {
                    if (ko.unwrap(receipts[i].Id) != ko.unwrap(item.Id))
                        receipts[i].IsDefault(false);
                }
            }
        };
        var on_receiptInserted = function (item) {
            var receipts = model.receipts();
            for (var i = 0; i < receipts.length; i++) {
                if (ko.unwrap(receipts[i].Id) == ko.unwrap(item.Id)) {
                    receipts[i].Display(ko.unwrap(item.Detail));
                    break;
                }
            }
        };
        var model = {
            status: ko.observable('none'),
            receipt: {},
            receipts: ko.observableArray(),
            selectedItemId: ko.observable(),
            allowSelect: ko.observable(false),
            noSelect: ko.observable(true),
            deleteReceipt: function (item, event) {
                return account.deleteReceiptInfo(item.Id()).done(function () {
                    model.receipts.remove(item);
                });
            },
            modifyReceipt: function (item, event) {
                app.redirect('User_ReceiptEdit', { receipt: item });
            },
            newReceipt: function (item, event) {
                app.redirect('User_ReceiptEdit', { receipts: model.receipts });
            },
            setAddress: function (item, event) {
                debugger;
                var order = page['order'];
                if (order) {
                    order.ReceiptAddress(item.Detail());
                    order.ReceiptInfoId(item.Id());
                    order.ReceiptRegionId(item.CountyId());
                    shopping.changeReceipt(order.Id(), item.Id())
                        .done(function (data) {
                        mapping.fromJS(data, {}, order);
                    });
                }
                model.selectedItemId(item.Id());
                app.back();
            },
            setDefaultReceipt: function (item) {
                return account.setDefaultReceipt(ko.unwrap(item.Id)).done(function () {
                    var receipts = model.receipts();
                    for (var i = 0; i < receipts.length; i++) {
                        receipts[i].IsDefault(false);
                    }
                    item.IsDefault(true);
                });
            },
            back: function () {
                app.back().fail(function () {
                    app.redirect('User_Index');
                });
            }
        };
        page.load.add(function (sender, args) {
            if (args.order) {
                page['order'] = args.order;
            }
            return account.getReceiptInfos().done(function (receipts) {
                mapping.fromJS(receipts, {}, model.receipts);
            });
        });
        account.receiptInfoUpdated.add(on_receiptUpdated);
        account.receiptInfoInserted.add(on_receiptInserted);
        page.viewChanged.add(function () { return ko.applyBindings(model, page.element); });
    };
    return { func: func };
});
