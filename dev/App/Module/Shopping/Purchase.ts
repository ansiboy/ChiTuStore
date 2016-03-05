//import weixin = require('Services/WeiXin');
import shopping = require('Services/Shopping');
import services = require('Services/Service');
import account = require('Services/Account');
import site = require('Site');

export = function (page) {
    /// <param name="page" type="chitu.Page"/>

    var model = {
        order: null,
        purchase: function () {
            var orderId = ko.unwrap(model.order.Id);
            var amount = ko.unwrap(model.order.Amount);
            return account.purchaseOrder(orderId, amount).done(() => {
                model.order.Status('Paid');
            });
        }
    }

    page.load.add(function (sender, args) {
        return shopping.getOrder(args.id).pipe(function (order) {
            if (!model.order) {
                model.order = order;
                ko.applyBindings(model, page.element);
            }
            else {
                ko.mapping.fromJS(order, {}, model.order);
            }

            return shopping.allowPurchase(order.Id);
        });
    });

}