
import account = require('Services/Account');
import shopping = require('Services/Shopping');
import mapping = require('knockout.mapping');
import app = require('Application');


requirejs(['css!content/User/ReceiptList']);
class PageModel {
    status = ko.observable('none');
    receipt = {};
    receipts = ko.observableArray<any>();
    selectedItemId = ko.observable();
    allowSelect = ko.observable(false);  //允许选择某个地址
    noSelect = ko.observable(true);
    page: chitu.Page;

    constructor(page) {
        this.page = page;
    }

    deleteReceipt(item, event) {
        var self = this;
        return account.deleteReceiptInfo(item.Id()).done(function () {
            self.receipts.remove(item);
        });
    }
    modifyReceipt(item, event) {
        app.redirect('#User_ReceiptEdit', { receipt: item });
    }
    newReceipt(model: PageModel, event) {
        app.redirect('#User_ReceiptEdit', { receipts: model.receipts });
    }
    setAddress(item, event) {
        debugger;
        var order = this.page['order'];
        if (order) {
            order.ReceiptAddress(item.Detail());
            order.ReceiptInfoId(item.Id());
            order.ReceiptRegionId(item.CountyId());
            shopping.changeReceipt(order.Id(), item.Id())
                .done(function (data) {
                    //page.order.Freight(data.Freight);
                    mapping.fromJS(data, {}, order);
                });
        }


        this.selectedItemId(item.Id());
        app.back();
    }
    setDefaultReceipt(item) {
        return account.setDefaultReceipt(ko.unwrap(item.Id)).done(function () {
            var receipts = this.receipts();
            for (var i = 0; i < receipts.length; i++) {
                receipts[i].IsDefault(false);
            }
            item.IsDefault(true);
        });
    }
    back() {
        app.back().fail(function () {
            app.redirect('User_Index');
        });
    }
}

class ReceiptListPage extends chitu.Page {
    private model: PageModel;
    constructor() {
        super();
        this.model = new PageModel(this);
        this.load.add(this.page_load);
    }

    private page_load(sender: ReceiptListPage, args: any) {
        if (args.order) {
            sender['order'] = args.order;
        }
        
        ko.applyBindings(sender.model, sender.element);
        return account.getReceiptInfos().done(function (receipts) {
            mapping.fromJS(receipts, {}, sender.model.receipts);
        });
    }
}

export = ReceiptListPage;

// var func = function (page: chitu.Page) {

//     var status_none = 'none';
//     var status_modify = 'modify';
//     var status_new = 'new';

//     var on_receiptUpdated = function (item) {

//         if (ko.unwrap(item.IsDefault)) {
//             var receipts = model.receipts();
//             for (var i = 0; i < receipts.length; i++) {
//                 if (ko.unwrap(receipts[i].Id) != ko.unwrap(item.Id))
//                     receipts[i].IsDefault(false);
//             }
//         }

//     };

//     var on_receiptInserted = function (item) {

//         var receipts = model.receipts();
//         for (var i = 0; i < receipts.length; i++) {
//             if (ko.unwrap(receipts[i].Id) == ko.unwrap(item.Id)) {
//                 receipts[i].Display(ko.unwrap(item.Detail));
//                 break;
//             }
//         }
//     };

//     var model = {
//         status: ko.observable('none'),
//         receipt: {},
//         receipts: ko.observableArray<any>(),
//         selectedItemId: ko.observable(),
//         allowSelect: ko.observable(false),  //允许选择某个地址
//         noSelect: ko.observable(true),
//         deleteReceipt: function (item, event) {
//             return account.deleteReceiptInfo(item.Id()).done(function () {
//                 model.receipts.remove(item);
//             });
//         },
//         modifyReceipt: function (item, event) {
//             app.redirect('User_ReceiptEdit', { receipt: item });
//         },
//         newReceipt: function (item, event) {
//             app.redirect('User_ReceiptEdit', { receipts: model.receipts });
//         },
//         setAddress: function (item, event) {
//             debugger;
//             var order = page['order'];
//             if (order) {
//                 order.ReceiptAddress(item.Detail());
//                 order.ReceiptInfoId(item.Id());
//                 order.ReceiptRegionId(item.CountyId());
//                 shopping.changeReceipt(order.Id(), item.Id())
//                     .done(function (data) {
//                         //page.order.Freight(data.Freight);
//                         mapping.fromJS(data, {}, order);
//                     });
//             }


//             model.selectedItemId(item.Id());
//             app.back();
//         },
//         setDefaultReceipt: function (item) {
//             return account.setDefaultReceipt(ko.unwrap(item.Id)).done(function () {
//                 var receipts = model.receipts();
//                 for (var i = 0; i < receipts.length; i++) {
//                     receipts[i].IsDefault(false);
//                 }
//                 item.IsDefault(true);
//             });
//         },
//         back: function () {
//             app.back().fail(function () {
//                 app.redirect('User_Index');
//             });
//         }
//     };


//     page.load.add(function (sender, args) {
//         if (args.order) {
//             page['order'] = args.order;
//         }

//         return account.getReceiptInfos().done(function (receipts) {
//             mapping.fromJS(receipts, {}, model.receipts);
//         });
//     });

//     account.receiptInfoUpdated.add(on_receiptUpdated);
//     account.receiptInfoInserted.add(on_receiptInserted);

//     page.viewChanged.add(() => ko.applyBindings(model, page.element));

// }

// //export = { func };