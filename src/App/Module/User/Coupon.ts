import services = require('Services/Service');
import coupon = require('Services/Coupon');
import ScrollBottomLoad = require('Core/ScrollBottomLoad');

requirejs(['UI/CouponListItem', 'css!content/User/Coupon']);

class PageModel {
    public queryArguments = {
        pageIndex: 0,
        status: 'available'
    };
    private page: CouponPage;
    constructor(page: CouponPage) {
        this.page = page;
    }

    coupons = ko.observableArray();
    loading = ko.observable(false);
    firstLoad = undefined;
    status = ko.observable(this.queryArguments.status);
    loadAvailable(model: PageModel) {
        model.queryArguments.status = 'available';
        model.queryArguments.pageIndex = 0;
        model.status(model.queryArguments.status);
        model.coupons.removeAll();
        return model.page.on_load({ loadType: chitu.PageLoadType.scroll });
    }
    loadUsed(model: PageModel) {
        model.queryArguments.status = 'used';
        model.queryArguments.pageIndex = 0;
        model.status(model.queryArguments.status);
        model.coupons.removeAll();
        return model.page.on_load({ loadType: chitu.PageLoadType.scroll });
    }
    loadExprired(model: PageModel) {
        model.queryArguments.status = 'exprired';
        model.queryArguments.pageIndex = 0;
        model.status(model.queryArguments.status);
        model.coupons.removeAll();
        return model.page.on_load({ loadType: chitu.PageLoadType.scroll });
    }
}

class CouponPage extends chitu.Page {
    private model: PageModel;
    private scrollBottomLoad: ScrollBottomLoad;

    constructor(args) {
        super(args);

        this.model = new PageModel(this);
        this.load.add(this.page_load);
        ko.applyBindings(this.model, this.element);
    }

    private page_load(sender: CouponPage, args) {
        sender.model.loading(true)
        var view = <chitu.ScrollView>sender.findControl('coupons');
        this.scrollBottomLoad = new ScrollBottomLoad(view, () => sender.loadCoupons());
        return sender.loadCoupons();
    }

    private loadCoupons() {
        var sender = this;
        var result = coupon.getMyCoupons(this.model.queryArguments).done(function (data) {
            $(data).each(function () {
                sender.model.coupons.push(this)
            });

            sender.model.loading(false);
            sender.model.queryArguments.pageIndex = sender.model.queryArguments.pageIndex + 1;
             sender.scrollBottomLoad.enableScrollLoad = (data.length == services.defaultPageSize);
        });
        return result;
    }
}

export = CouponPage;

