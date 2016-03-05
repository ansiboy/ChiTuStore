define(["require", "exports", 'Services/Shopping', 'knockout.mapping'], function (require, exports, shopping, mapping) {
    return function (page) {
        var model;
        var productId = page.routeData.values().id;
        var result = shopping.getProductIntroduce(productId).done(function (data) {
            if (model == null) {
                model = mapping.fromJS(data);
                ko.applyBindings(model, page.element);
            }
            else {
                mapping.fromJS(data, {}, model);
            }
        });
        page.viewChanged.add(function () {
            page.findControl('introduce').load.add(function () { return result; });
        });
    };
});
