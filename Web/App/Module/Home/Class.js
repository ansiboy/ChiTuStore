define(["require", "exports", 'Services/Shopping'], function (require, exports, shopping) {
    requirejs(['css!content/Home/Class']);
    return function (page) {
        /// <param name="page" type="chitu.Page"/>
        $(page.node()).find('[name="search_box"]').on('tap, click', function () {
            window.location.href = '#Home_Search';
        });
        var model = {
            categories: ko.observableArray(),
            brands: ko.observableArray(),
            loadRecommends: function () {
                return shopping.getBrands({ shoutaoRecommend: true }).done(function (items) {
                    model.brands.removeAll();
                    for (var i = 0; i < items.length; i++) {
                        model.brands.push(items[i]);
                    }
                });
            },
            loadCategories: function () {
            }
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
        page.viewChanged.add(function () { return ko.applyBindings(model, page.nodes().content); });
    };
});
