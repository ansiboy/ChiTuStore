
import shopping = require('Services/Shopping');
import mapping = require('knockout.mapping');
import account = require('Services/Account');

requirejs(['css!content/Shopping/OrderDetail']);

class Model {
    private page: OrderDetailPage

    constructor(page: OrderDetailPage) {
        this.page = page;
    }

    order = null
    //expressCompany = {
    expressCompany = ko.observable()
    expressBillNo = ko.observable()
    //}
    confirmReceived = () => {
        return account.confirmReceived(this.order.Id()).done((data) => {
            this.order.Status(data.Status);
            mapping.fromJS(data, {}, this.order);
            this.page.orderUpdated.fire(data);
        });
    }
    purchase = () => {
        return account.purchaseOrder(ko.unwrap(this.order.Id), ko.unwrap(this.order.Amount)).done(() => {
            this.page.orderUpdated.fire({ Status: 'Paid' });
            this.order.Status('Paid');
        })
    }
    cancelOrder = () => {
        var self = this;
        return account.cancelOrder(this.order.Id()).done((data) => {
            mapping.fromJS(data, {}, this.order);
            this.page.orderUpdated.fire(data);
        });
    }
    back = () => {
        this.page.hide()
    }
}

class OrderDetailPage {
    orderUpdated = $.Callbacks()
    sorce: chitu.Page

    constructor(source: chitu.Page) {
        this.sorce = source;
    }

    hide() {
        this.sorce.hide();
    }
}

export = function (page: chitu.Page) {
    page.load.add(page_load);

    var model = new Model(new OrderDetailPage(page));

    function page_load(sender, args) {
        return shopping.getOrder(ko.unwrap(args.order.Id)).done(order_loaded);//$.when(, deferred);
    }

    function order_loaded(order) {
        if (model.order == null) {
            model.order = order;
            ko.applyBindings(model, page.element);
        }

        var js_data = mapping.toJS(order);
        mapping.fromJS(js_data, {}, model.order);
    }
}

//class OrderDetailPage extends Page {
//    private model = new Model(this)

//    orderUpdated = $.Callbacks()

//    constructor(element: HTMLElement) {
//        super(element);

//        this.load.add(this.page_load);

//        requirejs(['text!Module/Shopping/OrderDetail.html'], (html) => {
//            this.content.element.innerHTML = html;

//            var q = this.content.element.querySelector('[ch-part="header"]');
//            if (q) this.header.element.appendChild(q);

//            q = this.content.element.querySelector('[ch-part="footer"]');
//            if (q) this.footer.element.appendChild(q);

//        })
//    }

//    private page_load = (sender, args) => {
//        //=====================================================
//        // 让转圈保持显示至少 400 毫秒，如果太短，会有闪烁感。
//        //var deferred = $.Deferred();
//        //window.setTimeout(() => deferred.resolve(), 400);
//        //=====================================================
//        return shopping.getOrder(ko.unwrap(args.order.Id)).done(this.order_loaded);//$.when(, deferred);
//    }

//    private order_loaded = (order) => {
//        if (this.model.order == null) {
//            this.model.order = order;
//            ko.applyBindings(this.model, this.element);
//        }

//        var js_data = mapping.toJS(order);
//        mapping.fromJS(js_data, {}, this.model.order);
//    }
//}

//export = function () {
//    var element = document.createElement('div');
//    document.body.appendChild(element);
//    var od = new OrderDetailPage(element);
//    element.className = element.className + ' Shopping-OrderDetail';
//    return od;
//};