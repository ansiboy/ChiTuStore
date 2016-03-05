define(["require", "exports", 'Services/Shopping'], function (require, exports, shopping) {
    return function (page) {
        var model = {
            categories: ko.observableArray(),
        };
        page.load.add(function (sender, args) {
            return shopping.getCategories().done(function (items) {
                for (var i = 0; i < items.length; i++) {
                    if (!items[i].ImagePath) {
                        items[i].ImagePath = 'content/images/icon_01.png';
                    }
                }
                model.categories(items);
            });
        });
        var page_view = page.view;
        page.view = $.when(page_view, chitu.Utility.loadjs(['css!content/Home/Class']));
        page.viewChanged.add(function () { return ko.applyBindings(model, page.element); });
    };
});
