import account = require('services/Account');
import shopping = require('services/Shopping');
import app = require('Application');
import mapping = require('knockout.mapping');
import site = require('Site');
import ScrollBottomLoad = require('core/ScrollBottomLoad');

//==================================================
// 说明：不能直接引入 services/WeiXin 因为环境不一定是微信
import services = require('services/Service');
var weixin = services['weixin'];
//==================================================

class Model {
    constructor(page: chitu.Page) {
        this.page = page;
        this.page.closed.add(() => {
            //this.orderDetail.close();
            //this.orderEvaluate.close();
        })

        try {
            //var imagePreview = CreateImagePreview();
            //imagePreview.open({ imageUrls: ['http://shop.alinq.cn/AdminServices/Shop//Editor/6dd1f30a4db845eea8f01372014bd7f2_640_640.jpeg','http://shop.alinq.cn/AdminServices/Shop//Editor/4a7bde56506b46d485e34b975900c325_640_640.jpeg'] });
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
        $($(this.page.element)).find('a').removeClass('active');
        if (this.status())
            $(this.page.element).find('.tabs').find('[name="' + this.status() + '"]').addClass('active');
        else {
            $(this.page.element).find('.tabs').find('a').first().addClass('active');
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
        });
    }
    loadOrdersByStatus = (order_status): Function => {
        return (item, event) => {
            this.status(order_status);
            this.pageIndex = 0;
            this.lastDateTime = null;
            this.orders.removeAll();

            return this.page.on_load({ loadType: chitu.PageLoadType.scroll }); //this.page['scrollLoad']();
        }
    }
    isLoading = ko.observable(false)
    showOrder = (item) => {
        app.redirect('#Shopping_OrderDetail', { order: item });
        //return this.orderDetail.open({ order: item });
    }
    showProduct = (item) => {
        debugger;
        var productId = ko.unwrap(item.ProductId);
        if (!productId) {
            productId = ko.unwrap(item.OrderDetails()[0].ProductId);
        }
        return app.redirect('#Home_Product_' + productId);
    }
    //evaluate = (item) => {
    //    this.orderEvaluate.open({ order: item });
    //}
}

class OrderListPage extends chitu.Page {
    private model: Model;
    private scrollBottomLoad: ScrollBottomLoad;
    constructor(html) {
        super(html);
        this.model = new Model(this);
        this.load.add(this.page_load);
        ko.applyBindings(this.model, this.element);
        var view = this.findControl<chitu.ScrollView>('order-list');
        this.scrollBottomLoad = new ScrollBottomLoad(view, (s, a) => {
            return this.model.loadOrders().done((items) => {
                this.scrollBottomLoad.enableScrollLoad = items.length < services.defaultPageSize;
            });
        });
    }

    private page_load(sender: OrderListPage, args: any) {
        //this.model.status(args.status || '');
        return this.model.loadOrders();
    }
}

export = OrderListPage;

