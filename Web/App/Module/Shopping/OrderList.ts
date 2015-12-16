import account = require('Services/Account');
import shopping = require('Services/Shopping');
import app = require('Application');
import mapping = require('knockout.mapping');
import site = require('Site');

//==================================================
// 说明：不能直接引入 Services/WeiXin 因为环境不一定是微信
import services = require('Services/Service');
var weixin = services['weixin'];
//==================================================

requirejs(['css!content/Shopping/OrderList']);

import CreateOrderDetailPage = require('Module/Shopping/OrderDetail');
//import CreateImagePreview = require('UI/ImagePreview')

var page_args: chitu.PageLoadArguments = { loadType: chitu.PageLoadType.scroll };
class Model {
    constructor(page: chitu.Page) {
        this.page = page;
        this.page.closed.add(() => {
            //this.orderDetail.close();
            //this.orderEvaluate.close();
        })

        try {
            //var imagePreview = CreateImagePreview();
            //imagePreview.open({ imageUrls: ['http://shop.alinq.cn/AdminServices/Shop/Images/Editor/6dd1f30a4db845eea8f01372014bd7f2_640_640.jpeg','http://shop.alinq.cn/AdminServices/Shop/Images/Editor/4a7bde56506b46d485e34b975900c325_640_640.jpeg'] });
        }
        catch (e) {
            debugger;
        }
    }

    lastDateTime = null;
    pageIndex = 0
    page: chitu.Page
    status = ko.observable<string>('')
    orders = ko.observableArray<any>()
    //orderDetail = CreateOrderDetailPage()
    confirmReceived = (item, event) => {
        debugger;
        return account.confirmReceived(ko.unwrap(item.Id)).done((data) => {
            mapping.fromJS(data, {}, item);
        });
    }
    pay = (item, event) => {
        debugger;
        return account.purchaseOrder(ko.unwrap(item.Id), ko.unwrap(item.Sum)).done((data) => {
            //ko.mapping.fromJS(data, {}, item);
        })
    }
    cancelOrder = (item) => {
        return account.cancelOrder(item.Id()).done(function (data) {
            item.Status(data.Status);
        });
    }
    loadOrders = () => {
        $($(this.page.node())).find('a').removeClass('active');
        if (this.status())
            $(this.page.node()).find('.tabs').find('[name="' + this.status() + '"]').addClass('active');
        else {
            $(this.page.node()).find('.tabs').find('a').first().addClass('active');
        }

        this.isLoading(true);
        return shopping.getMyOrderList(this.status(), this.pageIndex, this.lastDateTime).done((orders) => {
            for (var i = 0; i < orders.length; i++) {
                orders[i] = mapping.fromJS(orders[i]);
            }
            if (this.pageIndex == 0 && orders.length > 0) {
                this.lastDateTime = ko.unwrap(orders[0].CreateDateTime);
            }
            this.pageIndex = this.pageIndex + 1;
            this.isLoading(false);
            for (var i = 0; i < orders.length; i++) {
                this.orders.push(orders[i]);
            }

            if (this.page['iscroller']) {
                this.page['iscroller'].refresh();
            }
        });
    }
    loadOrdersByStatus = (order_status): Function=> {
        return (item, event) => {
            this.status(order_status);
            this.pageIndex = 0;
            this.lastDateTime = null;
            this.orders.removeAll();

            return this.page.on_load(page_args); //this.page['scrollLoad']();
        }
    }
    isLoading = ko.observable(false)
    showOrder = (item) => {
        app.redirect('Shopping_OrderDetail', { order: item });
        //return this.orderDetail.open({ order: item });
    }
    showProduct = (item) => {
        debugger;
        var productId = ko.unwrap(item.ProductId);
        if (!productId) {
            productId = ko.unwrap(item.OrderDetails()[0].ProductId);
        }
        return app.redirect('Home_Product_' + productId);
    }
    //evaluate = (item) => {
    //    this.orderEvaluate.open({ order: item });
    //}
}


export = function (page: chitu.Page) {

    page.load.add(function (sender: chitu.Page, args: any) {
        model.status(args.status || '');
        return model.loadOrders().done((items) => items.length < site.config.pageSize);
    });

    var model = new Model(page);
    page.viewChanged.add(() => ko.applyBindings(model, page.node()));
    //model.orderEvaluate.open({});
    //return c.scrollLoad(page,);
}