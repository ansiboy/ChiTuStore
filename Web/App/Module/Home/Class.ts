import shopping = require('Services/Shopping');
import c = require('ui/ScrollLoad');

requirejs(['css!content/Home/Class']);

export = function (page: chitu.Page) {
    /// <param name="page" type="chitu.Page"/>

    //====================================
    //c.scrollLoad(page);
    //====================================
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
    }

    page.load.add(function (sender, args: chitu.PageLoadArguments) {

        return shopping.getCategories().done(function (items) {
            //model.categories.removeAll();
            for (var i = 0; i < items.length; i++) {
                if (!items[i].ImagePath) {
                    items[i].ImagePath = 'content/images/icon_01.png';
                }
            }
            model.categories(items);

        });
    });

    page.viewChanged.add(() => ko.applyBindings(model, page.nodes().content));
};

