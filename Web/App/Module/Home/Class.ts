import shopping = require('Services/Shopping');
import c = require('ui/ScrollLoad');

requirejs(['css!content/Home/Class']);

export = function (page: chitu.Page) {

    var model = {
        categories: ko.observableArray(),
    }

    page.load.add(function (sender, args: chitu.PageLoadArguments) {

        return shopping.getCategories().done(function (items) {
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

