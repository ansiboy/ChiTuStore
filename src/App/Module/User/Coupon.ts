
import coupon = require('Services/Coupon');

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
    loadAvailable(model:PageModel) {
        model.queryArguments.status = 'available';
        model.queryArguments.pageIndex = 0;
        model.status(model.queryArguments.status);
        model.coupons.removeAll();
        return model.page.on_load({ loadType: chitu.PageLoadType.scroll });
    }
    loadUsed(model:PageModel) {
        model.queryArguments.status = 'used';
        model.queryArguments.pageIndex = 0;
        model.status(model.queryArguments.status);
        model.coupons.removeAll();
        return model.page.on_load({ loadType: chitu.PageLoadType.scroll });
    }
    loadExprired(model:PageModel) {
        model.queryArguments.status = 'exprired';
        model.queryArguments.pageIndex = 0;
        model.status(model.queryArguments.status);
        model.coupons.removeAll();
        return model.page.on_load({ loadType: chitu.PageLoadType.scroll });
    }
}

class CouponPage extends chitu.Page {
    private model: PageModel;

    constructor(html) {
        super(html);
        this.model = new PageModel(this);
        this.load.add(this.page_load);
    }

    private page_load(sender: CouponPage, args) {
        ko.applyBindings(sender.model, sender.element);
        sender.findControl('coupons').load.add(() => {
            sender.model.loading(true)
            var result = coupon.getMyCoupons(sender.model.queryArguments).done(function (data) {
                $(data).each(function () {
                    sender.model.coupons.push(this)
                });

                sender.model.loading(false);
                sender.model.queryArguments.pageIndex = sender.model.queryArguments.pageIndex + 1;
            });
            return result;
        });
    }
}

export = CouponPage;

// function (page: chitu.Page) {

//     var loadjsDeferred = $.Deferred();
//     requirejs(['UI/CouponListItem', 'css!content/User/Coupon'], () => loadjsDeferred.resolve());
//     //var viewDeferred = page.view;
//     //page.view = $.when(viewDeferred, loadjsDeferred);

//     //ko.applyBindings(model, page.node());
//     page.viewChanged.add(() => ko.applyBindings(model, page.element));

//     var queryArguments = {
//         pageIndex: 0,
//         status: 'available'
//     };

//     var model = {
//         coupons: ko.observableArray(),
//         loading: ko.observable(false),
//         firstLoad: undefined,
//         status: ko.observable(queryArguments.status),
//         loadAvailable: function () {
//             queryArguments.status = 'available';
//             queryArguments.pageIndex = 0;
//             model.status(queryArguments.status);
//             model.coupons.removeAll();
//             return page.on_load({ loadType: chitu.PageLoadType.scroll });
//         },
//         loadUsed: function () {
//             queryArguments.status = 'used';
//             queryArguments.pageIndex = 0;
//             model.status(queryArguments.status);
//             model.coupons.removeAll();
//             return page.on_load({ loadType: chitu.PageLoadType.scroll });
//         },
//         loadExprired: function () {
//             queryArguments.status = 'exprired';
//             queryArguments.pageIndex = 0;
//             model.status(queryArguments.status);
//             model.coupons.removeAll();
//             return page.on_load({ loadType: chitu.PageLoadType.scroll });
//         }
//     };

//     model.coupons.removeAll();
//     queryArguments.pageIndex = 0;

//     page.viewChanged.add(() => {
//         page.findControl('coupons').load.add(() => {
//             model.loading(true)
//             var result = coupon.getMyCoupons(queryArguments).done(function (data) {
//                 $(data).each(function () {
//                     model.coupons.push(this)
//                 });

//                 model.loading(false);
//                 queryArguments.pageIndex = queryArguments.pageIndex + 1;
//             });
//             return result;
//         });
//     });
// }