define(["require", "exports", 'Services/Shopping', 'knockout.mapping'], function (require, exports, shopping, mapping) {
    return function (page) {
        var model;
        page.load.add(function (sender, args) {
            var productId = args.id;
            return shopping.getProductIntroduce(productId).done(function (data) {
                if (model == null) {
                    model = mapping.fromJS(data);
                    ko.applyBindings(model, sender.node);
                }
                else {
                    mapping.fromJS(data, {}, model);
                }
            });
        });
        page.closing.add(function () {
            var iscroll = page['iscroller'];
            if (iscroll) {
                iscroll.scrollTo(0, 0, 0, null);
            }
        });
    };
});
