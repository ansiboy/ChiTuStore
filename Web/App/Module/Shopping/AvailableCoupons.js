chitu.action((function () {
    var references = [];
    return references;

})(), function (page) {
    /// <param name="page" type="chitu.Page"/>

    var parentModel;
    var model = {
        coupons: ko.observableArray(),
        selectCoupon: function (item) {
            var orderId = ko.unwrap(parentModel.order.Id);
            var couponCode = item.Code;
            services.shopping.useCoupon(orderId, couponCode).done(function (data) {
                //parentModel.order.Sum(data.Sum);
                //parentModel.order.CouponDiscount(data.CouponDiscount);
                parentModel.couponTitle(item.Title);
                ko.mapping.fromJS(data, {}, parentModel.order);
                app.back();
            });
        }
    };

    ko.applyBindings(model, page.node());

    page.load.add(function (sender, args) {
        parentModel = args.parentModel;
        model.coupons(args.coupons || []);
    });

});