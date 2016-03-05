define(["require", "exports", 'Services/Shopping'], function (require, exports, shopping) {
    return function (page) {
        var model = {
            comments: ko.observableArray()
        };
        page.load.add(function () {
            return shopping.getProductComments(page.routeData.values().id, 10).done(function (comments) {
                return model.comments(comments);
            });
        });
        page.viewChanged.add(function () { return ko.applyBindings(model, page.element); });
    };
});
